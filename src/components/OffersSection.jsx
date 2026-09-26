import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Gift, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

export default function OffersSection() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const getOffersFn = apiService.getActiveOffers || apiService.getOffers;
      const res = typeof getOffersFn === 'function' ? await getOffersFn() : null;
      if (res && res.success) {
        if (res.coupons) setCoupons(res.coupons);
        if (res.offers) setOffers(res.offers);
      }
    } catch (err) {
      console.error('Fetch offers error:', err);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const displayList = coupons.length > 0 ? coupons : [
    { id: 1, code: 'SWEET10', discount_value: 10, discount_type: 'percentage', min_order_amount: 499, title: 'Sweet 10% Off', description: 'Enjoy 10% off on all artisan cakes & brownies above ₹499.' },
    { id: 2, code: 'ROYAL50', discount_value: 50, discount_type: 'flat', min_order_amount: 399, title: 'Royal ₹50 Off', description: 'Flat ₹50 discount on orders above ₹399.' },
    { id: 3, code: 'WELCOME100', discount_value: 100, discount_type: 'flat', min_order_amount: 799, title: 'Welcome ₹100 Off', description: 'Special ₹100 off on your royal confectionery feast.' }
  ];

  const gradients = [
    'linear-gradient(135deg, #4a1525 0%, #2b0814 100%)',
    'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    'linear-gradient(135deg, #14532d 0%, #052e16 100%)'
  ];

  return (
    <section className="offers-section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Exclusive Savings</span>
          <h2 className="section-title">Special Confectionery Offers & Coupons</h2>
          <p className="section-desc">
            Apply valid offer codes during checkout to enjoy instant royal savings on cakes & gift boxes.
          </p>
        </div>

        <div className="offers-grid">
          {displayList.map((offer, idx) => (
            <div 
              key={offer.id || idx} 
              className="offer-card"
              style={{ background: gradients[idx % gradients.length] }}
            >
              <div className="offer-badge">
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
              </div>

              <div className="offer-discount-title">
                {offer.discount_type === 'percentage' ? `${offer.discount_value}% DISCOUNT` : `FLAT ₹${offer.discount_value} OFF`}
              </div>

              <h3 className="offer-title">{offer.title || `Special Offer: ${offer.code}`}</h3>
              <p className="offer-desc">
                {offer.description || `Valid on orders above ₹${offer.min_order_amount || 0}.`}
              </p>

              <div className="offer-code-row">
                <span className="code-text">{offer.code}</span>
                <button 
                  className="btn btn-gold copy-code-btn"
                  onClick={() => handleCopy(offer.code)}
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check size={14} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
