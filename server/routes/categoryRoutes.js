const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Cakes', slug: 'cakes', description: 'Handcrafted royal artisan cakes', is_active: 1, product_count: 3 },
  { id: '2', name: 'Chocolates', slug: 'chocolates', description: 'Luxury handcrafted cocoa truffles', is_active: 1, product_count: 1 },
  { id: '3', name: 'Cupcakes', slug: 'cupcakes', description: 'Fluffy gourmet cupcakes', is_active: 1, product_count: 1 },
  { id: '4', name: 'Brownies', slug: 'brownies', description: 'Decadent fudge brownies', is_active: 1, product_count: 1 },
  { id: '5', name: 'Cookies', slug: 'cookies', description: 'Freshly baked butter cookies', is_active: 1, product_count: 1 },
  { id: '6', name: 'Pastries', slug: 'pastries', description: 'Layered French pastries', is_active: 1, product_count: 0 },
  { id: '7', name: 'Donuts', slug: 'donuts', description: 'Glazed artisan donuts', is_active: 1, product_count: 0 },
  { id: '8', name: 'Gift Boxes', slug: 'gift-boxes', description: 'Curated royal confectionery assortments', is_active: 1, product_count: 1 }
];

/**
 * 1. PUBLIC: Get All Categories (with product count)
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ is_active: 1 }).lean();
    if (!categories || categories.length === 0) {
      return res.json({ success: true, categories: FALLBACK_CATEGORIES });
    }

    // Add product_count to each category
    const cats = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category_id: cat._id, is_available: 1 });
      return { ...cat, id: cat._id.toString(), product_count: count };
    }));

    res.json({ success: true, categories: cats });
  } catch (error) {
    console.warn('Fetch categories DB note, serving fallback categories:', error.message);
    res.json({ success: true, categories: FALLBACK_CATEGORIES });
  }
});

/**
 * 2. ADMIN: Add Category
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, image, is_active = 1 } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required.' });

  const trimmedName = name.trim();
  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  try {
    const existing = await Category.findOne({ $or: [{ name: trimmedName }, { slug }] });
    if (existing) return res.status(400).json({ success: false, message: 'A category with this name already exists.' });

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
      is_active: is_active ? 1 : 0
    });

    res.json({
      success: true,
      message: 'Category added successfully.',
      categoryId: category._id.toString(),
      category: { id: category._id.toString(), name: category.name, slug: category.slug, description: category.description, image: category.image, is_active: category.is_active }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category in database.' });
  }
});

/**
 * 3. ADMIN: Edit Category
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const catId = req.params.id;
  const { name, description, image, is_active } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Category name is required.' });

  const trimmedName = name.trim();
  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  try {
    const updateData = { name: trimmedName, slug, description: description !== undefined ? description : '' };
    if (image) updateData.image = image;
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    const result = await Category.findByIdAndUpdate(catId, updateData, { new: true });
    if (!result) return res.status(404).json({ success: false, message: 'Category not found.' });

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category in database.' });
  }
});

/**
 * 4. ADMIN: Delete Category
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Category.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Category not found.' });

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category from database.' });
  }
});

module.exports = router;
