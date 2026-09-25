import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShoppingBag, 
  Award, 
  Cake, 
  CheckCircle, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';
import SearchBar from '../components/SearchBar';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import AIRecommendationSection from '../components/AIRecommendationSection';
import LoyaltyPreviewSection from '../components/LoyaltyPreviewSection';
import OrderTrackingPreview from '../components/OrderTrackingPreview';
import OffersSection from '../components/OffersSection';
import CustomCakeCTA from '../components/CustomCakeCTA';
import SweetHavenLocation from '../components/SweetHavenLocation';

export default function HomePage({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        apiService.getPublicProducts(),
        apiService.getCategories()
      ]);

      if (prodRes && prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (catRes && catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by selected category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory || p.category_slug === activeCategory);

  const heroProduct = products.length > 0 ? products[0] : {
    name: 'Belgian Dark Truffle Cake',
    description: '70% Dark Ganache • Signature Artisan Cake',
    price: 899,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Column: Heading, Description & CTAs */}
            <div className="hero-content">
              <div className="hero-tag">
                <Sparkles size={16} />
                <span>Smart Confectionery Management System</span>
              </div>

              <h1 className="hero-title">
                Crafted Royal Delights & <span>Intelligent Flavours</span>
              </h1>

              <p className="hero-subtitle">
                Fresh Cakes • Premium Chocolates • Bakery Delights • Smart Recommendations. Experience luxury confectionery ordering powered by intelligent suggestion algorithms.
              </p>

              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary">
                  <ShoppingBag size={18} />
                  Shop Now
                </Link>
                <a href="#recommendations-section" className="btn btn-gold">
                  <Sparkles size={18} />
                  AI Recommendation
                </a>
                <Link to="/custom-cake" className="btn btn-outline">
                  <Cake size={18} />
                  Custom Cake Studio
                </Link>
              </div>

              {/* Quick Feature Badges */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <Award size={16} style={{ color: 'var(--gold-primary)' }} /> 100% Belgian Cocoa
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <CheckCircle size={16} style={{ color: 'var(--gold-primary)' }} /> Express Temperature Delivery
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="hero-card">
              <div className="hero-img-wrap">
                <img 
                  src="/hero_cake.jpg" 
                  alt={heroProduct.name || "Belgian Dark Truffle Cake"} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = heroProduct.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&q=80';
                  }}
                />
              </div>
              <div className="hero-card-footer">
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#FFFFFF', margin: 0 }}>
                    {heroProduct.name || 'Belgian Dark Truffle Cake'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>
                    {heroProduct.description || 'Rich 70% Dark Belgian Cocoa Ganache'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24' }}>
                    ₹{heroProduct.price || 899}
                  </span>
                  {heroProduct.discount > 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', textDecoration: 'line-through' }}>
                      ₹{Math.round((heroProduct.price || 899) * (1 + heroProduct.discount / 100))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Search Bar */}
          <SearchBar 
            productsList={products} 
            categoriesList={categories}
            onSelectProduct={(product) => setSelectedProductModal(product)} 
          />
        </div>
      </section>

      {/* Digital Loyalty Card Section */}
      <LoyaltyPreviewSection />

      {/* Category Section */}
      <CategorySection 
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Featured Products Catalog Grid */}
      <section className="container" style={{ padding: '3rem 0' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-subtitle">Freshly Baked Today</span>
            <h2 className="section-title">
              {activeCategory === 'All' ? 'Featured Confectionery Delights' : `${activeCategory} Collection`}
            </h2>
          </div>
          <Link to="/products" className="btn btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

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
      </section>

      {/* AI Recommendation Section */}
      <div id="recommendations-section">
        <AIRecommendationSection 
          onQuickView={(p) => setSelectedProductModal(p)}
          onAddToCart={onAddToCart}
        />
      </div>

      {/* Custom Cake CTA Banner */}
      <CustomCakeCTA />

      {/* Live Order Tracking Timeline Preview */}
      <OrderTrackingPreview />

      {/* Special Offers & Coupons Section */}
      <OffersSection />

      {/* Sweet Haven Storefront & Google Map Location */}
      <SweetHavenLocation />

      {/* Product Quick View Modal */}
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
