const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

/**
 * GET /api/recommendations
 * Query params: flavor, occasion, maxPrice
 */
router.get('/', async (req, res) => {
  const { flavor = 'All', occasion = 'All', maxPrice = 2000 } = req.query;

  try {
    const [allProducts] = await pool.query(
      `SELECT p.*, c.name as category 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.is_available = 1 AND c.is_active = 1`
    );

    const priceLimit = parseFloat(maxPrice) || 2000;
    const budgetFiltered = allProducts.filter(p => parseFloat(p.price) <= priceLimit);

    // 1. Recommended For You
    let recommendedForYou = budgetFiltered;
    if (flavor !== 'All') {
      const flavorLower = flavor.toLowerCase();
      recommendedForYou = budgetFiltered.filter(p => 
        p.name.toLowerCase().includes(flavorLower) || 
        (p.description && p.description.toLowerCase().includes(flavorLower)) ||
        (p.ingredients && p.ingredients.toLowerCase().includes(flavorLower)) ||
        (p.category && p.category.toLowerCase().includes(flavorLower))
      );
    }
    if (recommendedForYou.length === 0) recommendedForYou = budgetFiltered;

    // 2. Trending Products (Best sellers & Featured)
    const trendingProducts = budgetFiltered
      .filter(p => p.is_best_seller || p.is_featured || parseFloat(p.rating) >= 4.8)
      .slice(0, 4);

    // 3. Frequently Bought Together
    const cakeItems = budgetFiltered.filter(p => p.category === 'Cakes' || p.name.includes('Cake'));
    const pairingItems = budgetFiltered.filter(p => p.category !== 'Cakes' && !p.name.includes('Cake'));
    
    const frequentlyBoughtTogether = [];
    if (cakeItems.length > 0) frequentlyBoughtTogether.push(cakeItems[0]);
    if (pairingItems.length > 0) frequentlyBoughtTogether.push(pairingItems[0]);
    if (pairingItems.length > 1) frequentlyBoughtTogether.push(pairingItems[1]);

    // 4. Similar Products
    const similarProducts = budgetFiltered
      .slice()
      .sort((a, b) => parseFloat(b.rating || 4.5) - parseFloat(a.rating || 4.5))
      .slice(0, 4);

    res.json({
      success: true,
      recommendations: {
        recommendedForYou: recommendedForYou.slice(0, 4),
        trendingProducts: trendingProducts.length > 0 ? trendingProducts : budgetFiltered.slice(0, 4),
        frequentlyBoughtTogether: frequentlyBoughtTogether.length > 0 ? frequentlyBoughtTogether : budgetFiltered.slice(0, 3),
        similarProducts: similarProducts.length > 0 ? similarProducts : budgetFiltered.slice(0, 4)
      }
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations from database.' });
  }
});

module.exports = router;
