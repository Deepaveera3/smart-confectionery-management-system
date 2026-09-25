const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const STAGE_MAPPING = {
  'Order Placed': 1,
  'Order Confirmed': 2,
  'Preparing': 3,
  'Baking': 4,
  'Quality Check': 5,
  'Packed': 6,
  'Out for Delivery': 7,
  'Delivered': 8,
  'Cancelled': 0
};

/**
 * 1. CUSTOMER: Place Order (Transaction with automatic inventory update, loyalty rewards, payments & notifications)
 */
async function handlePlaceOrder(req, res) {
  const userId = req.user.id;
  const { 
    items, 
    delivery_address, 
    delivery_instructions, 
    coupon_code, 
    discount_amount, 
    loyalty_points_redeemed,
    delivery_fee,
    payment_method = 'Online / UPI Payment'
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty. Please add items to checkout.' });
  }

  if (!delivery_address) {
    return res.status(400).json({ success: false, message: 'Delivery address is required.' });
  }

  const orderNum = `SH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  let subtotal = 0;
  items.forEach(i => {
    const itemPrice = parseFloat(i.price || 0);
    const itemDiscount = parseFloat(i.discount || 0);
    const effectivePrice = itemPrice * (1 - itemDiscount / 100);
    subtotal += effectivePrice * parseInt(i.quantity || 1);
  });

  const discAmt = parseFloat(discount_amount || 0);
  const delFee = parseFloat(delivery_fee !== undefined ? delivery_fee : (subtotal > 999 ? 0 : 50));
  const loyDisc = parseFloat(loyalty_points_redeemed || 0);
  const finalAmt = Math.max(0, subtotal - discAmt - loyDisc + delFee);
  const pointsEarned = Math.floor(finalAmt / 10);

  const addressStr = typeof delivery_address === 'string' 
    ? delivery_address 
    : `${delivery_address.full_name || ''}, ${delivery_address.address_line1 || ''} ${delivery_address.address_line2 || ''}, ${delivery_address.city || ''}, ${delivery_address.state || ''} - ${delivery_address.pincode || ''}`.trim();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert Order
    const [orderRes] = await connection.query(
      `INSERT INTO orders 
       (order_number, user_id, total_amount, discount_amount, delivery_fee, loyalty_discount, final_amount, payment_status, order_status, delivery_address, delivery_instructions, points_earned, points_redeemed) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Successful', 'Order Placed', ?, ?, ?, ?)`,
      [orderNum, userId, subtotal, discAmt, delFee, loyDisc, finalAmt, addressStr, delivery_instructions || '', pointsEarned, Math.floor(loyDisc)]
    );

    const orderId = orderRes.insertId;

    // 2. Insert Order Items & Automatically Update Inventory/Stock
    for (const item of items) {
      const pId = item.id || item.product_id;
      const pQty = parseInt(item.quantity || 1);
      const pPrice = parseFloat(item.price || 0);
      const pSubtotal = pPrice * pQty;

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal, customization_details) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, pId || null, item.name || 'Artisan Confectionery Item', pPrice, pQty, pSubtotal, item.customization ? JSON.stringify(item.customization) : null]
      );

      if (pId) {
        // Automatic stock deduction
        await connection.query(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [pQty, pId]
        );

        // Check inventory threshold for low stock notification
        const [prodRows] = await connection.query(
          `SELECT p.name, p.stock_quantity, i.min_threshold 
           FROM products p 
           LEFT JOIN inventory i ON p.id = i.product_id 
           WHERE p.id = ?`,
          [pId]
        );

        if (prodRows.length > 0) {
          const { name: prodName, stock_quantity: currentStock, min_threshold } = prodRows[0];
          const threshold = min_threshold || 10;
          if (currentStock <= threshold) {
            await connection.query(
              `INSERT INTO notifications (user_id, type, title, message) 
               VALUES (NULL, 'LOW_STOCK', ?, ?)`,
              [
                `Low Stock Alert: ${prodName}`,
                `Product "${prodName}" inventory is low (${currentStock} units remaining). Minimum threshold is ${threshold}. Please restock.`
              ]
            );
          }
        }
      }
    }

    // 3. Record Payment
    const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await connection.query(
      `INSERT INTO payments (order_id, transaction_id, payment_method, amount, status) 
       VALUES (?, ?, ?, ?, 'Successful')`,
      [orderId, txnId, payment_method, finalAmt]
    );

    // 4. Update Loyalty Account & Rewards
    const [loyaltyRows] = await connection.query('SELECT * FROM loyalty_accounts WHERE user_id = ?', [userId]);
    let loyaltyAccId;

    if (loyaltyRows.length === 0) {
      const cardNumber = `SH-LOYAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const [accRes] = await connection.query(
        `INSERT INTO loyalty_accounts (user_id, loyalty_card_number, current_points, total_points_earned, total_points_redeemed, tier) 
         VALUES (?, ?, ?, ?, ?, 'Bronze')`,
        [userId, cardNumber, pointsEarned, pointsEarned, Math.floor(loyDisc)]
      );
      loyaltyAccId = accRes.insertId;
    } else {
      const acc = loyaltyRows[0];
      loyaltyAccId = acc.id;
      const newCurrent = Math.max(0, acc.current_points - Math.floor(loyDisc) + pointsEarned);
      const newTotalEarned = acc.total_points_earned + pointsEarned;
      const newTotalRedeemed = acc.total_points_redeemed + Math.floor(loyDisc);

      let newTier = 'Bronze';
      if (newTotalEarned >= 1000) newTier = 'Royal';
      else if (newTotalEarned >= 500) newTier = 'Gold';
      else if (newTotalEarned >= 200) newTier = 'Silver';

      await connection.query(
        `UPDATE loyalty_accounts 
         SET current_points = ?, total_points_earned = ?, total_points_redeemed = ?, tier = ? 
         WHERE id = ?`,
        [newCurrent, newTotalEarned, newTotalRedeemed, newTier, loyaltyAccId]
      );
    }

    // Log Loyalty Transactions
    if (pointsEarned > 0) {
      await connection.query(
        `INSERT INTO loyalty_transactions (loyalty_account_id, points, transaction_type, description, reference_order_id) 
         VALUES (?, ?, 'EARNED', ?, ?)`,
        [loyaltyAccId, pointsEarned, `Points earned on order #${orderNum}`, orderId]
      );
    }

    if (loyDisc > 0) {
      await connection.query(
        `INSERT INTO loyalty_transactions (loyalty_account_id, points, transaction_type, description, reference_order_id) 
         VALUES (?, ?, 'REDEEMED', ?, ?)`,
        [loyaltyAccId, Math.floor(loyDisc), `Points redeemed on order #${orderNum}`, orderId]
      );
    }

    // 5. Create System Notifications
    // For Customer:
    await connection.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (?, 'ORDER_PLACED', ?, ?)`,
      [
        userId,
        `Order Confirmed: #${orderNum}`,
        `Your order #${orderNum} for ₹${finalAmt.toFixed(2)} has been placed successfully! You earned ${pointsEarned} reward points.`
      ]
    );

    // For Admin:
    await connection.query(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (NULL, 'NEW_ORDER', ?, ?)`,
      [
        `New Order Received: #${orderNum}`,
        `Customer placed order #${orderNum} for ₹${finalAmt.toFixed(2)} (${items.length} items).`
      ]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      orderNumber: orderNum,
      finalAmount: finalAmt,
      pointsEarned,
      transactionId: txnId
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Order Placement Error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order in database.' });
  }
}

router.post('/place', authenticateToken, handlePlaceOrder);
router.post('/', authenticateToken, handlePlaceOrder);

/**
 * 2. CUSTOMER: Get My Orders
 */
router.get('/my-orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await pool.query(
      `SELECT o.*, p.transaction_id, p.payment_method 
       FROM orders o 
       LEFT JOIN payments p ON o.id = p.order_id 
       WHERE o.user_id = ? 
       ORDER BY o.id DESC`,
      [userId]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, pr.image 
         FROM order_items oi 
         LEFT JOIN products pr ON oi.product_id = pr.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
      order.tracking_stage = STAGE_MAPPING[order.order_status] || 1;
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch my orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your orders.' });
  }
});

/**
 * 3. ADMIN: Get All Orders
 */
async function handleGetAdminOrders(req, res) {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
              p.transaction_id, p.payment_method
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       LEFT JOIN payments p ON o.id = p.order_id 
       ORDER BY o.id DESC`
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, pr.image 
         FROM order_items oi 
         LEFT JOIN products pr ON oi.product_id = pr.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
      order.tracking_stage = STAGE_MAPPING[order.order_status] || 1;
      order.product_name = items.map(i => `${i.product_name} (x${i.quantity})`).join(', ');
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders from database.' });
  }
}

router.get('/admin/all', authenticateToken, requireAdmin, handleGetAdminOrders);
router.get('/', authenticateToken, requireAdmin, handleGetAdminOrders);

/**
 * 4. PUBLIC / CUSTOMER: Track Order by Order Number
 */
router.get('/track/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params;

  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.phone as customer_phone 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.order_number = ?`,
      [orderNumber.trim()]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order number not found.' });
    }

    const order = orders[0];
    const [items] = await pool.query(
      `SELECT oi.*, pr.image 
       FROM order_items oi 
       LEFT JOIN products pr ON oi.product_id = pr.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;
    order.tracking_stage = STAGE_MAPPING[order.order_status] || 1;

    res.json({ success: true, order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
});

/**
 * 5. ADMIN: Update Order Status
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { order_status } = req.body;

  if (!order_status) {
    return res.status(400).json({ success: false, message: 'New order status is required.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [order_status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Fetch order to notify customer
    const [rows] = await pool.query('SELECT order_number, user_id FROM orders WHERE id = ?', [orderId]);
    if (rows.length > 0) {
      const order = rows[0];
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message) 
         VALUES (?, 'STATUS_UPDATE', ?, ?)`,
        [
          order.user_id,
          `Order #${order.order_number} Update: ${order_status}`,
          `Your order status has been updated to "${order_status}".`
        ]
      );
    }

    res.json({
      success: true,
      message: `Order status successfully updated to ${order_status}.`,
      order_status,
      tracking_stage: STAGE_MAPPING[order_status] || 1
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status in database.' });
  }
});

/**
 * 6. GET ORDER INVOICE
 */
router.get('/:id/invoice', authenticateToken, async (req, res) => {
  const orderId = parseInt(req.params.id);

  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
              p.transaction_id, p.payment_method
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       LEFT JOIN payments p ON o.id = p.order_id 
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    order.items = items;

    res.json({ success: true, invoice: order });
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice.' });
  }
});

module.exports = router;
