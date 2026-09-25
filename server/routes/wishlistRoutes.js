const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. CUSTOMER: Get Wishlist Items
 */
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT wi.id as wishlist_item_id, p.* 
       FROM wishlist w 
       JOIN wishlist_items wi ON w.id = wi.wishlist_id 
       JOIN products p ON wi.product_id = p.id 
       WHERE w.user_id = ?
       ORDER BY wi.id DESC`,
      [userId]
    );
    res.json({ success: true, wishlistItems: rows });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist items.' });
  }
});

/**
 * 2. CUSTOMER: Toggle Product Wishlist (Add or Remove)
 */
router.post('/toggle', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  const pId = parseInt(productId);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Ensure Wishlist header exists
    let [wRows] = await connection.query('SELECT id FROM wishlist WHERE user_id = ?', [userId]);
    let wishlistId;
    if (wRows.length === 0) {
      const [wRes] = await connection.query('INSERT INTO wishlist (user_id) VALUES (?)', [userId]);
      wishlistId = wRes.insertId;
    } else {
      wishlistId = wRows[0].id;
    }

    // Check if item exists in wishlist
    const [itemRows] = await connection.query('SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?', [wishlistId, pId]);
    let isWishlisted;
    let message;

    if (itemRows.length > 0) {
      await connection.query('DELETE FROM wishlist_items WHERE id = ?', [itemRows[0].id]);
      isWishlisted = false;
      message = 'Removed from Wishlist.';
    } else {
      await connection.query('INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)', [wishlistId, pId]);
      isWishlisted = true;
      message = 'Added to Wishlist!';
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, isWishlisted, message });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist in database.' });
  }
});

/**
 * 3. CUSTOMER: Delete Wishlist Item
 */
router.delete('/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);

  try {
    const [wRows] = await pool.query('SELECT id FROM wishlist WHERE user_id = ?', [userId]);
    if (wRows.length > 0) {
      await pool.query('DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?', [wRows[0].id, productId]);
    }
    res.json({ success: true, message: 'Removed from Wishlist.' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from wishlist.' });
  }
});

module.exports = router;
