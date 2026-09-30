const express = require('express');
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Offer = require('../models/Offer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. PUBLIC: Get Active Offers & Coupons (MongoDB)
 */
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ is_active: 1 }).sort({ _id: -1 });
    const offers = await Offer.find({ is_active: 1 }).sort({ _id: -1 });
    res.json({ success: true, coupons, offers });
  } catch (error) {
    console.error('Fetch offers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers.' });
  }
});

/**
 * 2. ADMIN: Get All Offers & Coupons (MongoDB)
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ _id: -1 });
    const offers = await Offer.find().sort({ _id: -1 });
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
    const newCoupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discount_type: discount_type || 'percentage',
      discount_value: parseFloat(discount_value),
      min_order_amount: parseFloat(min_order_amount || 0),
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
      expiry_date: expiry_date || null,
      is_active: 1
    });

    res.json({
      success: true,
      message: 'Coupon created successfully.',
      couponId: newCoupon._id.toString()
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
  const couponId = req.params.id;
  try {
    const query = mongoose.isValidObjectId(couponId)
      ? { _id: couponId }
      : { $or: [{ _id: couponId }, { legacy_id: Number(couponId) || null }] };

    const result = await Coupon.findOneAndDelete(query);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

module.exports = router;
