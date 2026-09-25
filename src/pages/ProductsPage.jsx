import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchBar from '../components/SearchBar';
import { SlidersHorizontal } from 'lucide-react';
import { apiService } from '../services/api';
import { PRODUCTS, CATEGORIES } from '../data/mockData';

export default function ProductsPage({ onAddToCart }) {
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  useEffect(() => {
    fetchLiveCatalog();
  }, []);

  const fetchLiveCatalog = async () => {
    try {
      const res = await apiService.getPublicProducts();
      if (res && res.success && Array.isArray(res.products) && res.products.length > 0) {
        setProductsList(res.products);
      } else {
        setProductsList(PRODUCTS);
      }

      const catRes = await apiService.getCategories();
      if (catRes && catRes.success && Array.isArray(catRes.categories) && catRes.categories.length > 0) {
        const activeCats = catRes.categories.filter(c => c.is_active === 1 || c.is_active === true || c.is_active === undefined);
        setCategoriesList(activeCats.length > 0 ? activeCats : CATEGORIES);
      } else {
        setCategoriesList(CATEGORIES);
      }
    } catch (err) {
      console.warn('API catalog fetch fallback to mock data:', err);
      setProductsList(PRODUCTS);
      setCategoriesList(CATEGORIES);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = productsList.filter(p => {
    // Only show available products
    const isAvailable = p.is_available !== undefined 
      ? (p.is_available === 1 || p.is_available === true)
      : (p.isAvailable !== false);
    if (!isAvailable) return false;

    const matchCat = selectedCategory === 'All' || p.category === selectedCategory || p.category_slug === selectedCategory;
    const price = parseFloat(p.price) || 0;
    const matchPrice = price <= maxPrice;
    return matchCat && matchPrice;
  }).sort((a, b) => {
    const priceA = parseFloat(a.price) || 0;
    const priceB = parseFloat(b.price) || 0;
    const ratingA = parseFloat(a.rating) || 0;
    const ratingB = parseFloat(b.rating) || 0;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return ratingB - ratingA;
    return 0; // default featured
  });

  const availableCount = productsList.filter(p => {
    return p.is_available !== undefined 
      ? (p.is_available === 1 || p.is_available === true)
      : (p.isAvailable !== false);
  }).length;

  return (
    <div className="products-page container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-subtitle">Handcrafted Royal Bakery</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--chocolate-dark)' }}>
          Explore Our Confectionery Catalog
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse artisan cakes, dark cocoa truffles, brownies & luxury gift hampers.
        </p>
      </div>

      <SearchBar productsList={productsList} categoriesList={categoriesList} onSelectProduct={(p) => setSelectedProductModal(p)} />

      {/* Filter & Sort Control Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        background: 'var(--bg-surface)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-gold)',
        marginBottom: '2rem'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <button 
            className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All ({availableCount})
          </button>
          {categoriesList.map(cat => (
            <button
              key={cat.id || cat.slug || cat.name}
              className={`filter-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Price Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <SlidersHorizontal size={16} style={{ color: 'var(--burgundy-royal)' }} />
            <span>Max Price: <strong>₹{maxPrice}</strong></span>
            <input 
              type="range"
              min="300"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100px', accentColor: 'var(--burgundy-royal)' }}
            />
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: '0.45rem 1rem', 
              borderRadius: 'var(--radius-full)', 
              border: '1px solid var(--border-light)',
              background: 'var(--bg-cream-soft)',
              fontWeight: 600,
              color: 'var(--chocolate-dark)',
              cursor: 'pointer'
            }}
          >
            <option value="featured">Sort by Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProductModal(p)}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-gold)' }}>
          <h3>No products match your current filters</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try adjusting your category selection or max price filter.</p>
          <button 
            className="btn btn-outline"
            style={{ marginTop: '1.5rem' }}
            onClick={() => { setSelectedCategory('All'); setMaxPrice(2000); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProductModal && (
        <ProductDetailModal 
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}
