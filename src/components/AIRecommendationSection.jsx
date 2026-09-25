import React, { useState, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, TrendingUp, ShoppingBag, Layers, Flame } from 'lucide-react';
import { apiService } from '../services/api';
import ProductCard from './ProductCard';

export default function AIRecommendationSection({ onQuickView, onAddToCart }) {
  const [flavorPreference, setFlavorPreference] = useState('Chocolate');
  const [occasion, setOccasion] = useState('Birthday');
  const [budget, setBudget] = useState(1200);

  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'trending' | 'frequently' | 'similar'
  const [loading, setLoading] = useState(false);

  const [recommendations, setRecommendations] = useState({
    recommendedForYou: [],
    trendingProducts: [],
    frequentlyBoughtTogether: [],
    similarProducts: []
  });

  useEffect(() => {
    fetchRecommendations();
  }, [flavorPreference, occasion, budget]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRecommendations(flavorPreference, occasion, budget);
      if (res && res.success && res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveProducts = () => {
    switch (activeTab) {
      case 'trending':
        return recommendations.trendingProducts || [];
      case 'frequently':
        return recommendations.frequentlyBoughtTogether || [];
      case 'similar':
        return recommendations.similarProducts || [];
      default:
        return recommendations.recommendedForYou || [];
    }
  };

  const activeProducts = getActiveProducts();

  return (
    <section className="ai-recommendation-section">
      <div className="container">
        <div className="ai-box" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 15px 35px -10px rgba(0,0,0,0.05)' }}>
          
          {/* Header */}
          <div className="ai-box-header" style={{ marginBottom: '25px' }}>
            <div>
              <span className="ai-badge" style={{ backgroundColor: '#fdf2f8', color: '#be185d', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Smart Recommendation Engine
              </span>
              <h2 className="ai-title" style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '10px 0 4px 0' }}>
                AI-Curated Confectionery Pairings
              </h2>
              <p className="ai-subtitle" style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Personalized recommendations based on taste preferences, dietary filters, budget & popularity trends.
              </p>
            </div>
          </div>

          {/* Interactive Filters Grid */}
          <div className="ai-filters-grid" style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
            <div className="filter-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>1. Flavor Preference</label>
              <div className="chip-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Chocolate', 'Red Velvet', 'Truffle', 'Caramel', 'All'].map((flavor) => (
                  <button
                    key={flavor}
                    className={`filter-chip ${flavorPreference === flavor ? 'active' : ''}`}
                    onClick={() => setFlavorPreference(flavor)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: flavorPreference === flavor ? '2px solid #be185d' : '1px solid #cbd5e1',
                      backgroundColor: flavorPreference === flavor ? '#be185d' : '#ffffff',
                      color: flavorPreference === flavor ? '#ffffff' : '#475569',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group" style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>2. Occasion Theme</label>
              <div className="chip-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Birthday', 'Anniversary', 'Celebration', 'Gifting', 'All'].map((occ) => (
                  <button
                    key={occ}
                    className={`filter-chip ${occasion === occ ? 'active' : ''}`}
                    onClick={() => setOccasion(occ)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: occasion === occ ? '2px solid #be185d' : '1px solid #cbd5e1',
                      backgroundColor: occasion === occ ? '#be185d' : '#ffffff',
                      color: occasion === occ ? '#ffffff' : '#475569',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>3. Max Budget Filter</label>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#be185d' }}>Up to ₹{budget}</span>
              </div>
              <input
                type="range"
                min="300"
                max="2000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#be185d', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Recommendation Mode Tabs */}
          <div className="ai-tabs-row" style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('recommended')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'recommended' ? '#fdf2f8' : 'transparent',
                color: activeTab === 'recommended' ? '#be185d' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={15} /> Recommended For You
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'trending' ? '#fdf2f8' : 'transparent',
                color: activeTab === 'trending' ? '#be185d' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Flame size={15} /> Trending Delights
            </button>
            <button
              onClick={() => setActiveTab('frequently')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'frequently' ? '#fdf2f8' : 'transparent',
                color: activeTab === 'frequently' ? '#be185d' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShoppingBag size={15} /> Perfect Combos
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'similar' ? '#fdf2f8' : 'transparent',
                color: activeTab === 'similar' ? '#be185d' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={15} /> Top Rated Matches
            </button>
          </div>

          {/* Recommended Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Sparkles className="animate-spin" size={24} style={{ margin: '0 auto 10px' }} />
              <p>Analyzing flavor matrix and calculating optimal pairings...</p>
            </div>
          ) : activeProducts.length > 0 ? (
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {activeProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <p>No recommendations match your exact criteria. Try broadening your budget or flavor filter!</p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
