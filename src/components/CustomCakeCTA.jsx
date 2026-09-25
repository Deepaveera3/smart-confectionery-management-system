import React from 'react';
import { Link } from 'react-router-dom';
import { Cake, Sparkles, ChevronRight, Palette, Layers, Heart } from 'lucide-react';

export default function CustomCakeCTA() {
  return (
    <section className="custom-cake-cta-section">
      <div className="container">
        <div className="custom-cake-card">
          <div className="custom-cake-content">
            <span className="custom-cake-badge">
              <Sparkles size={16} /> Artisan Cake Studio
            </span>

            <h2 className="custom-cake-title">
              Create Your <span>Dream Cake</span>
            </h2>

            <p className="custom-cake-desc">
              Design a unique custom cake tailored to your exact celebration theme! Select your preferred sponge flavor, velvet cream, custom color palette, fruit toppings, and personalized message.
            </p>

            <div className="custom-cake-features">
              <div className="custom-feature-pill">
                <Palette size={16} style={{ color: 'var(--gold-primary)' }} /> 12+ Flavors & Creams
              </div>
              <div className="custom-feature-pill">
                <Layers size={16} style={{ color: 'var(--gold-primary)' }} /> 1 Kg to 5 Kg Tier Sizes
              </div>
              <div className="custom-feature-pill">
                <Heart size={16} style={{ color: 'var(--gold-primary)' }} /> Personalized Inscription
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Link to="/custom-cake" className="btn btn-gold" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                <Cake size={20} /> Open Custom Cake Studio <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="custom-cake-img-wrap">
            <img 
              src="/custom_cake.jpg" 
              alt="Custom Cake Creation Studio" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/hero_cake.jpg';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
