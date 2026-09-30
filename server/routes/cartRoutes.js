const express = require('express');
const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 1. Get Cart Items
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const cartItems = await CartItem.find({ user_id: userId }).lean();
    const enriched = [];
    for (const ci of cartItems) {
      let prod = null;
      try {
        if (mongoose.Types.ObjectId.isValid(ci.product_id)) {
          prod = await Product.findById(ci.product_id).lean();
        } else {
          prod = await Product.findOne({ legacy_id: parseInt(ci.product_id) }).lean();
        }
      } catch (e) {}
      if (prod) {
        enriched.push({
          ...prod, id: prod._id.toString(),
          cart_id: ci._id.toString(),
          quantity: ci.quantity,
          discounted_price: prod.price * (1 - prod.discount / 100)
        });
      }
    }
    res.json({ success: true, cartItems: enriched });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart items.' });
  }
});

// 2. Add Item to Cart
router.post('/add', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required.' });
  const qty = parseInt(quantity || 1);

  try {
    let prod = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      prod = await Product.findById(productId);
    } else {
      prod = await Product.findOne({ legacy_id: parseInt(productId) });
    }

    if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (!prod.is_available) return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });
    if (prod.stock_quantity < qty) return res.status(400).json({ success: false, message: `Only ${prod.stock_quantity} units available in stock.` });

    const existing = await CartItem.findOne({ user_id: userId, product_id: prod._id.toString() });
    if (existing) {
      existing.quantity = existing.quantity + qty;
      await existing.save();
    } else {
      await CartItem.create({ user_id: userId, product_id: prod._id.toString(), quantity: qty });
    }

    res.json({ success: true, message: `Added ${prod.name} to cart successfully!` });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// 3. Update Cart Item Quantity
router.put('/update', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);
  if (qty <= 0) return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });

  try {
    let pId = productId;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const prod = await Product.findOne({ legacy_id: parseInt(productId) });
      if (prod) pId = prod._id.toString();
    }
    const prod = await Product.findById(pId);
    if (prod && prod.stock_quantity < qty) {
      return res.status(400).json({ success: false, message: `Only ${prod.stock_quantity} units available in stock.` });
    }
    await CartItem.findOneAndUpdate({ user_id: userId, product_id: pId }, { quantity: qty });
    res.json({ success: true, message: 'Cart updated successfully.' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart item quantity.' });
  }
});

// 4. Remove Item from Cart
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  let pId = req.params.productId;
  try {
    if (!mongoose.Types.ObjectId.isValid(pId)) {
      const prod = await Product.findOne({ legacy_id: parseInt(pId) });
      if (prod) pId = prod._id.toString();
    }
    await CartItem.findOneAndDelete({ user_id: userId, product_id: pId });
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
});

// 5. Clear Cart
router.delete('/clear', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await CartItem.deleteMany({ user_id: userId });
    res.json({ success: true, message: 'Cart cleared successfully.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

module.exports = router;
