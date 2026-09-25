const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. CUSTOMER: Get Cart Items
 */
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT c.id as cart_id, c.quantity, p.*, (p.price * (1 - p.discount/100)) as discounted_price
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?
       ORDER BY c.id DESC`,
      [userId]
    );
    res.json({ success: true, cartItems: rows });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart items.' });
  }
});

/**
 * 2. CUSTOMER: Add Item to Cart
 */
router.post('/add', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  const pId = parseInt(productId);
  const qty = parseInt(quantity || 1);

  try {
    // Check product exists and has stock
    const [prods] = await pool.query('SELECT stock_quantity, name, is_available FROM products WHERE id = ?', [pId]);
    if (prods.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prod = prods[0];
    if (!prod.is_available) {
      return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });
    }

    if (prod.stock_quantity < qty) {
      return res.status(400).json({ success: false, message: `Only ${prod.stock_quantity} units available in stock.` });
    }

    // Insert or update on duplicate
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, pId, qty]
    );

    res.json({ success: true, message: `Added ${prod.name} to cart successfully!` });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

/**
 * 3. CUSTOMER: Update Cart Item Quantity
 */
router.put('/update', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const pId = parseInt(productId);
  const qty = parseInt(quantity);

  if (qty <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
  }

  try {
    const [prods] = await pool.query('SELECT stock_quantity FROM products WHERE id = ?', [pId]);
    if (prods.length > 0 && prods[0].stock_quantity < qty) {
      return res.status(400).json({ success: false, message: `Only ${prods[0].stock_quantity} units available in stock.` });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [qty, userId, pId]);
    res.json({ success: true, message: 'Cart updated successfully.' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart item quantity.' });
  }
});

/**
 * 4. CUSTOMER: Remove Item from Cart
 */
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);

  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
});

/**
 * 5. CUSTOMER: Clear Cart
 */
router.delete('/clear', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    res.json({ success: true, message: 'Cart cleared successfully.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

module.exports = router;
