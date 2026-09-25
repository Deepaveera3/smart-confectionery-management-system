import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function CategorySection({ categories: propCategories, activeCategory, onSelectCategory }) {
  const [categories, setCategories] = useState(propCategories || []);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      apiService.getCategories().then(res => {
        if (res && res.success && res.categories) {
          setCategories(res.categories);
        }
      }).catch(() => {});
    }
  }, [propCategories]);

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Delightful Selections</span>
          <h2 className="section-title">Explore Confectionery Categories</h2>
          <p className="section-desc">
            Discover artisanal baked treats crafted with Belgian chocolate, pure butter, and royal dedication.
          </p>
        </div>

        <div className="category-grid">
          {/* "All" Category Pill */}
          <div 
            className={`category-card ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => onSelectCategory('All')}
          >
            <div className="category-icon-wrap" style={{ background: 'var(--burgundy-royal)', color: '#FFF' }}>
              ✨
            </div>
            <h4 className="category-title">All Categories</h4>
            <span className="category-count">Explore All</span>
          </div>

          {categories.map((cat) => (
            <div 
              key={cat.id}
              className={`category-card ${activeCategory === cat.name || activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
            >
              <div className="category-img-wrap">
                <img 
                  src={cat.image || '/hero_cake.jpg'} 
                  alt={cat.name} 
                  loading="lazy" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/hero_cake.jpg';
                  }}
                />
              </div>
              <h4 className="category-title">{cat.name}</h4>
              <span className="category-count">{cat.product_count !== undefined ? `${cat.product_count} Items` : 'Fresh Daily'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
