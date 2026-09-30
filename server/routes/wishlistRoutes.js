const express = require('express');
const mongoose = require('mongoose');
const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 1. Get Wishlist
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const items = await WishlistItem.find({ user_id: userId }).lean();
    const enriched = [];
    for (const wi of items) {
      let prod = null;
      try {
        if (mongoose.Types.ObjectId.isValid(wi.product_id)) {
          prod = await Product.findById(wi.product_id).lean();
        } else {
          prod = await Product.findOne({ legacy_id: parseInt(wi.product_id) }).lean();
        }
      } catch (e) {}
      if (prod) {
        enriched.push({ ...prod, id: prod._id.toString(), wishlist_item_id: wi._id.toString() });
      }
    }
    res.json({ success: true, wishlistItems: enriched });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist items.' });
  }
});

// 2. Toggle Wishlist (Add or Remove)
router.post('/toggle', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required.' });

  let pId = productId;
  if (!mongoose.Types.ObjectId.isValid(pId)) {
    try {
      const prod = await Product.findOne({ legacy_id: parseInt(pId) });
      if (prod) pId = prod._id.toString();
    } catch (e) {}
  }

  try {
    const existing = await WishlistItem.findOne({ user_id: userId, product_id: pId });
    if (existing) {
      await WishlistItem.findByIdAndDelete(existing._id);
      res.json({ success: true, isWishlisted: false, message: 'Removed from Wishlist.' });
    } else {
      await WishlistItem.create({ user_id: userId, product_id: pId });
      res.json({ success: true, isWishlisted: true, message: 'Added to Wishlist!' });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist in database.' });
  }
});

// 3. Remove from Wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let pId = req.params.productId;
  if (!mongoose.Types.ObjectId.isValid(pId)) {
    try {
      const prod = await Product.findOne({ legacy_id: parseInt(pId) });
      if (prod) pId = prod._id.toString();
    } catch (e) {}
  }
  try {
    await WishlistItem.findOneAndDelete({ user_id: userId, product_id: pId });
    res.json({ success: true, message: 'Removed from Wishlist.' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from wishlist.' });
  }
});

module.exports = router;
