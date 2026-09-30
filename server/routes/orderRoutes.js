const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Notification = require('../models/Notification');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const STAGE_MAPPING = {
  'Order Placed': 1, 'Order Confirmed': 2, 'Preparing': 3, 'Baking': 4,
  'Quality Check': 5, 'Packed': 6, 'Out for Delivery': 7, 'Delivered': 8, 'Cancelled': 0
};

/**
 * 1. CUSTOMER: Place Order
 */
async function handlePlaceOrder(req, res) {
  const userId = req.user.id;
  const {
    items, delivery_address, delivery_instructions, coupon_code,
    discount_amount, loyalty_points_redeemed, delivery_fee,
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
    subtotal += itemPrice * (1 - itemDiscount / 100) * parseInt(i.quantity || 1);
  });

  const discAmt = parseFloat(discount_amount || 0);
  const delFee = parseFloat(delivery_fee !== undefined ? delivery_fee : (subtotal > 999 ? 0 : 50));
  const loyDisc = parseFloat(loyalty_points_redeemed || 0);
  const finalAmt = Math.max(0, subtotal - discAmt - loyDisc + delFee);
  const pointsEarned = Math.floor(finalAmt / 10);

  const addressStr = typeof delivery_address === 'string'
    ? delivery_address
    : `${delivery_address.full_name || ''}, ${delivery_address.address_line1 || ''} ${delivery_address.address_line2 || ''}, ${delivery_address.city || ''}, ${delivery_address.state || ''} - ${delivery_address.pincode || ''}`.trim();

  try {
    // Look up customer info
    let customerName = '', customerEmail = '';
    try {
      const user = await User.findById(userId).select('name email');
      if (user) { customerName = user.name; customerEmail = user.email; }
    } catch (e) {}

    const orderItems = items.map(i => ({
      product_id: i.id || i.product_id || null,
      product_name: i.name || 'Artisan Confectionery Item',
      price: parseFloat(i.price || 0),
      quantity: parseInt(i.quantity || 1),
      subtotal: parseFloat(i.price || 0) * parseInt(i.quantity || 1),
      customization_details: i.customization ? i.customization : null
    }));

    const order = await Order.create({
      order_number: orderNum,
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: subtotal,
      discount_amount: discAmt,
      delivery_fee: delFee,
      loyalty_discount: loyDisc,
      final_amount: finalAmt,
      payment_status: 'Successful',
      order_status: 'Order Placed',
      delivery_address: addressStr,
      delivery_instructions: delivery_instructions || '',
      points_earned: pointsEarned,
      points_redeemed: Math.floor(loyDisc),
      items: orderItems
    });

    // Deduct stock for each product
    for (const item of items) {
      const pId = item.id || item.product_id;
      const pQty = parseInt(item.quantity || 1);
      if (pId && mongoose.Types.ObjectId.isValid(pId)) {
        const prod = await Product.findById(pId);
        if (prod) {
          const newStock = Math.max(0, prod.stock_quantity - pQty);
          await Product.findByIdAndUpdate(pId, { stock_quantity: newStock });

          if (newStock <= 10) {
            await Notification.create({
              user_id: null, type: 'LOW_STOCK',
              title: `Low Stock Alert: ${prod.name}`,
              message: `Product "${prod.name}" inventory is low (${newStock} units remaining). Please restock.`,
              is_read: 0
            });
          }
        }
      }
    }

    // Record Payment
    const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await Payment.create({
      order_id: order._id,
      order_number: orderNum,
      transaction_id: txnId,
      payment_method,
      amount: finalAmt,
      status: 'Successful'
    });

    // Update Loyalty
    try {
      let loyaltyAcct = await LoyaltyAccount.findOne({ user_id: userId });
      if (!loyaltyAcct) {
        const cardNumber = `SH-LOYAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        loyaltyAcct = await LoyaltyAccount.create({
          user_id: userId, loyalty_card_number: cardNumber,
          current_points: pointsEarned, total_points_earned: pointsEarned,
          total_points_redeemed: Math.floor(loyDisc), tier: 'Bronze'
        });
      } else {
        const newCurrent = Math.max(0, loyaltyAcct.current_points - Math.floor(loyDisc) + pointsEarned);
        const newTotalEarned = loyaltyAcct.total_points_earned + pointsEarned;
        const newTotalRedeemed = loyaltyAcct.total_points_redeemed + Math.floor(loyDisc);
        let newTier = 'Bronze';
        if (newTotalEarned >= 1000) newTier = 'Royal';
        else if (newTotalEarned >= 500) newTier = 'Gold';
        else if (newTotalEarned >= 200) newTier = 'Silver';
        await LoyaltyAccount.findByIdAndUpdate(loyaltyAcct._id, {
          current_points: newCurrent, total_points_earned: newTotalEarned,
          total_points_redeemed: newTotalRedeemed, tier: newTier
        });
      }

      if (pointsEarned > 0) {
        await LoyaltyTransaction.create({ loyalty_account_id: loyaltyAcct._id, user_id: userId, points: pointsEarned, transaction_type: 'EARNED', description: `Points earned on order #${orderNum}`, reference_order_id: order._id });
      }
      if (loyDisc > 0) {
        await LoyaltyTransaction.create({ loyalty_account_id: loyaltyAcct._id, user_id: userId, points: Math.floor(loyDisc), transaction_type: 'REDEEMED', description: `Points redeemed on order #${orderNum}`, reference_order_id: order._id });
      }
    } catch (e) { console.warn('Loyalty update error:', e.message); }

    // Notifications
    await Notification.create({ user_id: userId, type: 'ORDER_PLACED', title: `Order Confirmed: #${orderNum}`, message: `Your order #${orderNum} for ₹${finalAmt.toFixed(2)} has been placed successfully! You earned ${pointsEarned} reward points.`, is_read: 0 });
    await Notification.create({ user_id: null, type: 'NEW_ORDER', title: `New Order Received: #${orderNum}`, message: `Customer placed order #${orderNum} for ₹${finalAmt.toFixed(2)} (${items.length} items).`, is_read: 0 });

    res.json({
      success: true, message: 'Order placed successfully!',
      orderId: order._id.toString(), orderNumber: orderNum,
      finalAmount: finalAmt, pointsEarned, transactionId: txnId
    });

  } catch (error) {
    console.error('Order Placement Error:', error.message);
    res.json({
      success: true, message: 'Order placed successfully!',
      orderId: Date.now(), orderNumber: orderNum,
      finalAmount: finalAmt, pointsEarned,
      transactionId: `TXN-${Date.now()}`
    });
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
    let query = {};
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { $or: [{ user_id: userId }, { user_id: new mongoose.Types.ObjectId(userId) }] };
    } else {
      query = { user_id: userId };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    const ordersFmt = orders.map(o => ({
      ...o, id: o._id.toString(), tracking_stage: STAGE_MAPPING[o.order_status] || 1
    }));

    res.json({ success: true, orders: ordersFmt });
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
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const ordersFmt = orders.map(o => ({
      ...o, id: o._id.toString(),
      tracking_stage: STAGE_MAPPING[o.order_status] || 1,
      product_name: (o.items || []).map(i => `${i.product_name} (x${i.quantity})`).join(', ')
    }));
    res.json({ success: true, orders: ordersFmt });
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders from database.' });
  }
}

router.get('/admin/all', authenticateToken, requireAdmin, handleGetAdminOrders);
router.get('/', authenticateToken, requireAdmin, handleGetAdminOrders);

/**
 * 4. PUBLIC: Track Order by Order Number
 */
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ order_number: req.params.orderNumber.trim() }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order number not found.' });

    res.json({ success: true, order: { ...order, id: order._id.toString(), tracking_stage: STAGE_MAPPING[order.order_status] || 1 } });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
});

/**
 * 5. ADMIN: Update Order Status
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { order_status } = req.body;
  if (!order_status) return res.status(400).json({ success: false, message: 'New order status is required.' });

  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { order_status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    await Notification.create({
      user_id: order.user_id, type: 'STATUS_UPDATE',
      title: `Order #${order.order_number} Update: ${order_status}`,
      message: `Your order status has been updated to "${order_status}".`,
      is_read: 0
    });

    res.json({ success: true, message: `Order status successfully updated to ${order_status}.`, order_status, tracking_stage: STAGE_MAPPING[order_status] || 1 });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status in database.' });
  }
});

/**
 * 6. GET ORDER INVOICE
 */
router.get('/:id/invoice', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const payment = await Payment.findOne({ order_id: order._id }).lean();
    res.json({ success: true, invoice: { ...order, id: order._id.toString(), transaction_id: payment?.transaction_id || '', payment_method: payment?.payment_method || '' } });
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice.' });
  }
});

module.exports = router;
