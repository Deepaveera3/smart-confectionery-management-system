const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Belgian Dark Truffle Cake',
    category_id: 1,
    category: 'Cakes',
    category_slug: 'cakes',
    description: 'Rich 70% dark Belgian chocolate ganache layered with moist cocoa sponge cake.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    price: 899.00,
    discount: 10.00,
    stock_quantity: 25,
    weight_size: '1 Kg',
    ingredients: 'Belgian Dark Chocolate, Dutch Cocoa, Butter, Flour, Eggs, Vanilla Extract',
    is_available: 1,
    is_featured: 1,
    is_best_seller: 1,
    rating: 4.9
  },
  {
    id: 2,
    name: 'Royal Red Velvet Cake',
    category_id: 1,
    category: 'Cakes',
    category_slug: 'cakes',
    description: 'Authentic crimson red velvet cake with smooth cream cheese frosting & gold leaf flake garnish.',
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&q=80',
    price: 799.00,
    discount: 5.00,
    stock_quantity: 18,
    weight_size: '1 Kg',
    ingredients: 'Cocoa, Cream Cheese, Pure Vanilla, Buttermilk, Beetroot extract',
    is_available: 1,
    is_featured: 1,
    is_best_seller: 1,
    rating: 4.8
  },
  {
    id: 3,
    name: 'Classic Black Forest Cake',
    category_id: 1,
    category: 'Cakes',
    category_slug: 'cakes',
    description: 'Traditional German layered chocolate sponge cake with dark cherries & fresh whipped cream.',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80',
    price: 699.00,
    discount: 0.00,
    stock_quantity: 30,
    weight_size: '1 Kg',
    ingredients: 'Dark Cherries, Whipped Cream, Chocolate Shavings, Cocoa Sponge',
    is_available: 1,
    is_featured: 0,
    is_best_seller: 1,
    rating: 4.7
  },
  {
    id: 4,
    name: 'Luxury Hazelnut Praline Truffles Box',
    category_id: 2,
    category: 'Chocolates',
    category_slug: 'chocolates',
    description: 'Box of 16 handcrafted pralines filled with roasted Piedmont hazelnuts & smooth milk chocolate.',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80',
    price: 549.00,
    discount: 15.00,
    stock_quantity: 50,
    weight_size: '300g',
    ingredients: 'Roasted Hazelnuts, Cocoa Butter, Milk Solids, Pure Cane Sugar',
    is_available: 1,
    is_featured: 1,
    is_best_seller: 1,
    rating: 4.9
  },
  {
    id: 5,
    name: 'Salted Caramel Walnut Fudge Brownie',
    category_id: 4,
    category: 'Brownies',
    category_slug: 'brownies',
    description: 'Dense gooey dark chocolate brownies drizzled with sea salt caramel & crushed walnuts.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
    price: 399.00,
    discount: 0.00,
    stock_quantity: 40,
    weight_size: '6 Pieces',
    ingredients: '70% Dark Chocolate, Salted Caramel, California Walnuts, Flour',
    is_available: 1,
    is_featured: 1,
    is_best_seller: 0,
    rating: 4.8
  },
  {
    id: 6,
    name: 'Assorted Gourmet Cupcake Box',
    category_id: 3,
    category: 'Cupcakes',
    category_slug: 'cupcakes',
    description: 'Box of 6 cupcakes featuring Red Velvet, Dark Chocolate Truffle, and Vanilla Salted Caramel.',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80',
    price: 449.00,
    discount: 10.00,
    stock_quantity: 35,
    weight_size: '6 Units',
    ingredients: 'Buttercream, Belgian Cocoa, Madagascar Vanilla, Wheat Flour',
    is_available: 1,
    is_featured: 1,
    is_best_seller: 1,
    rating: 4.8
  },
  {
    id: 7,
    name: 'Choco Chunk Butter Cookies',
    category_id: 5,
    category: 'Cookies',
    category_slug: 'cookies',
    description: 'Golden baked butter cookies loaded with rich chocolate chunks.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80',
    price: 299.00,
    discount: 5.00,
    stock_quantity: 60,
    weight_size: '400g Tiffin',
    ingredients: 'Pure French Butter, Dark Choco Chunks, Brown Sugar, Wheat Flour',
    is_available: 1,
    is_featured: 0,
    is_best_seller: 1,
    rating: 4.6
  },
  {
    id: 8,
    name: 'Royal Celebration Hamper Box',
    category_id: 8,
    category: 'Gift Boxes',
    category_slug: 'gift-boxes',
    description: 'Exquisite gold gift box containing Truffle Cake, Assorted Chocolates, & Macarons.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
    price: 1499.00,
    discount: 20.00,
    stock_quantity: 15,
    weight_size: '1.5 Kg',
    ingredients: 'Assorted Premium Confectionery Items',
    is_available: 1,
    is_featured: 1,
    is_best_seller: 1,
    rating: 5.0
  }
];

/**
 * 1. PUBLIC: Get Customer Products Catalog (Active & Available only)
 */
router.get('/', async (req, res) => {
  const { category, search, sort } = req.query;

  try {
    let query = `
      SELECT p.*, c.name as category, c.slug as category_slug
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.is_available = 1 AND c.is_active = 1
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND (c.name = ? OR c.slug = ?)`;
      params.push(category, category);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.ingredients LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (sort === 'price_asc') {
      query += ` ORDER BY (p.price - (p.price * p.discount / 100)) ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY (p.price - (p.price * p.discount / 100)) DESC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY p.rating DESC`;
    } else {
      query += ` ORDER BY p.is_featured DESC, p.id DESC`;
    }

    const [rows] = await pool.query(query, params);
    if (rows && rows.length > 0) {
      return res.json({ success: true, products: rows });
    }

    // Fallback if DB query returned 0 rows
    let filtered = FALLBACK_PRODUCTS.filter(p => p.is_available === 1);
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category || p.category_slug === category);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    res.json({ success: true, products: filtered });
  } catch (error) {
    console.warn('Fetch products DB note, serving fallback catalog:', error.message);
    let filtered = FALLBACK_PRODUCTS.filter(p => p.is_available === 1);
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category || p.category_slug === category);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    res.json({ success: true, products: filtered });
  }
});

/**
 * 2. ADMIN: Get All Products (Including hidden/disabled items + Inventory info)
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category, i.min_threshold, i.last_restocked_at, i.notes as inventory_notes
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       LEFT JOIN inventory i ON p.id = i.product_id
       ORDER BY p.id DESC`
    );
    res.json({ success: true, products: rows });
  } catch (error) {
    console.error('Fetch admin products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin products.' });
  }
});

/**
 * 3. PUBLIC: Get Single Product By ID
 */
router.get('/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product: rows[0] });
  } catch (error) {
    console.error('Fetch single product error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
});

/**
 * 4. ADMIN: Create New Product (Pure MySQL + Inventory Sync)
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { 
    name, category_id, description, image, price, discount, 
    stock_quantity, weight_size, ingredients, is_available, is_featured, is_best_seller,
    min_threshold
  } = req.body;

  if (!name || price === undefined || !category_id) {
    return res.status(400).json({ success: false, message: 'Product name, price, and category are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO products 
       (name, category_id, description, image, price, discount, stock_quantity, weight_size, ingredients, is_available, is_featured, is_best_seller) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(), 
        parseInt(category_id), 
        description || '', 
        image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=80',
        parseFloat(price), 
        parseFloat(discount || 0), 
        parseInt(stock_quantity || 10), 
        weight_size || '500g', 
        ingredients || '',
        is_available !== undefined ? (is_available ? 1 : 0) : 1, 
        is_featured ? 1 : 0, 
        is_best_seller ? 1 : 0
      ]
    );

    const newProductId = result.insertId;

    // Create corresponding entry in inventory table
    await connection.query(
      `INSERT INTO inventory (product_id, min_threshold, notes) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE min_threshold = VALUES(min_threshold)`,
      [newProductId, parseInt(min_threshold || 10), `Initial inventory for ${name.trim()}`]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Product added successfully.',
      productId: newProductId
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to add product in database.' });
  }
});

/**
 * 5. ADMIN: Update Product (Pure MySQL)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);
  const { 
    name, category_id, description, image, price, discount, 
    stock_quantity, weight_size, ingredients, is_available, is_featured, is_best_seller,
    min_threshold
  } = req.body;

  if (!name || price === undefined || !category_id) {
    return res.status(400).json({ success: false, message: 'Product name, price, and category are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE products SET 
       name = ?, category_id = ?, description = ?, image = ?, price = ?, discount = ?, 
       stock_quantity = ?, weight_size = ?, ingredients = ?, is_available = ?, is_featured = ?, is_best_seller = ?
       WHERE id = ?`,
      [
        name.trim(), 
        parseInt(category_id), 
        description || '', 
        image || '', 
        parseFloat(price), 
        parseFloat(discount || 0), 
        parseInt(stock_quantity || 0), 
        weight_size || '500g', 
        ingredients || '', 
        is_available !== undefined ? (is_available ? 1 : 0) : 1, 
        is_featured ? 1 : 0, 
        is_best_seller ? 1 : 0,
        productId
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (min_threshold !== undefined) {
      await connection.query(
        `INSERT INTO inventory (product_id, min_threshold) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE min_threshold = VALUES(min_threshold)`,
        [productId, parseInt(min_threshold)]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Product updated successfully.' });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product in database.' });
  }
});

/**
 * 6. ADMIN: Delete Product (Pure MySQL)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product from database.' });
  }
});

/**
 * 7. ADMIN: Toggle Product Visibility (Show / Hide)
 */
router.patch('/:id/toggle-visibility', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const [result] = await pool.query('UPDATE products SET is_available = NOT is_available WHERE id = ?', [productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product visibility toggled successfully.' });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle visibility.' });
  }
});

/**
 * 8. ADMIN: Update Product Stock Quantity (Pure MySQL)
 */
router.patch('/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);
  const { stock_quantity } = req.body;

  if (stock_quantity === undefined || isNaN(parseInt(stock_quantity))) {
    return res.status(400).json({ success: false, message: 'Valid stock quantity is required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [parseInt(stock_quantity), productId]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Update inventory restock timestamp
    await connection.query(
      `INSERT INTO inventory (product_id, last_restocked_at) VALUES (?, NOW())
       ON DUPLICATE KEY UPDATE last_restocked_at = NOW()`,
      [productId]
    );

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Product stock updated successfully.' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Stock update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product stock.' });
  }
});

module.exports = router;
