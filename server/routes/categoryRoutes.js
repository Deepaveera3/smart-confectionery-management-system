const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Cakes', slug: 'cakes', description: 'Handcrafted royal artisan cakes', is_active: 1, product_count: 3 },
  { id: 2, name: 'Chocolates', slug: 'chocolates', description: 'Luxury handcrafted cocoa truffles', is_active: 1, product_count: 1 },
  { id: 3, name: 'Cupcakes', slug: 'cupcakes', description: 'Fluffy gourmet cupcakes', is_active: 1, product_count: 1 },
  { id: 4, name: 'Brownies', slug: 'brownies', description: 'Decadent fudge brownies', is_active: 1, product_count: 1 },
  { id: 5, name: 'Cookies', slug: 'cookies', description: 'Freshly baked butter cookies', is_active: 1, product_count: 1 },
  { id: 6, name: 'Pastries', slug: 'pastries', description: 'Layered French pastries', is_active: 1, product_count: 0 },
  { id: 7, name: 'Donuts', slug: 'donuts', description: 'Glazed artisan donuts', is_active: 1, product_count: 0 },
  { id: 8, name: 'Gift Boxes', slug: 'gift-boxes', description: 'Curated royal confectionery assortments', is_active: 1, product_count: 1 }
];

/**
 * 1. PUBLIC / GENERAL: Get All Categories (with product count)
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_available = 1
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    if (rows && rows.length > 0) {
      return res.json({ success: true, categories: rows });
    }
    res.json({ success: true, categories: FALLBACK_CATEGORIES });
  } catch (error) {
    console.warn('Fetch categories DB note, serving fallback categories:', error.message);
    res.json({ success: true, categories: FALLBACK_CATEGORIES });
  }
});

/**
 * 2. ADMIN: Add Category (Pure MySQL)
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, image, is_active = 1 } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const trimmedName = name.trim();
  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  try {
    const [existing] = await pool.query('SELECT id FROM categories WHERE name = ? OR slug = ?', [trimmedName, slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image, is_active) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, slug, description || '', image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', is_active ? 1 : 0]
    );

    res.json({
      success: true,
      message: 'Category added successfully.',
      categoryId: result.insertId,
      category: {
        id: result.insertId,
        name: trimmedName,
        slug,
        description: description || '',
        image: image || '',
        is_active: is_active ? 1 : 0
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category in database.' });
  }
});

/**
 * 3. ADMIN: Edit Category (Pure MySQL)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const catId = parseInt(req.params.id);
  const { name, description, image, is_active } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const trimmedName = name.trim();
  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  try {
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image = COALESCE(?, image), is_active = ? WHERE id = ?',
      [trimmedName, slug, description !== undefined ? description : '', image, is_active !== undefined ? (is_active ? 1 : 0) : 1, catId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category in database.' });
  }
});

/**
 * 4. ADMIN: Delete Category (Pure MySQL)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const catId = parseInt(req.params.id);
  if (isNaN(catId)) {
    return res.status(400).json({ success: false, message: 'Invalid category ID.' });
  }

  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [catId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category from database.' });
  }
});

module.exports = router;
