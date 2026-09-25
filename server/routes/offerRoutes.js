const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. PUBLIC: Get Active Offers & Coupons
 */
router.get('/', async (req, res) => {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons WHERE is_active = 1 ORDER BY id DESC');
    const [offers] = await pool.query('SELECT * FROM offers WHERE is_active = 1 ORDER BY id DESC');
    res.json({ success: true, coupons, offers });
  } catch (error) {
    console.error('Fetch offers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers.' });
  }
});

/**
 * 2. ADMIN: Get All Offers & Coupons
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY id DESC');
    const [offers] = await pool.query('SELECT * FROM offers ORDER BY id DESC');
    res.json({ success: true, coupons, offers });
  } catch (error) {
    console.error('Fetch admin offers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers from database.' });
  }
});

/**
 * 3. ADMIN: Add Coupon
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date } = req.body;
  if (!code || !discount_value) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        code.trim().toUpperCase(), 
        discount_type || 'percentage', 
        parseFloat(discount_value), 
        parseFloat(min_order_amount || 0),
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        expiry_date || null
      ]
    );

    res.json({
      success: true,
      message: 'Coupon created successfully.',
      couponId: result.insertId
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coupon in database.' });
  }
});

/**
 * 4. ADMIN: Delete Coupon
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const couponId = parseInt(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM coupons WHERE id = ?', [couponId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

module.exports = router;
