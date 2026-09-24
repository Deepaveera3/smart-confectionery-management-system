import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Zap, ShieldCheck, Check, Truck } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));
  const totalPrice = discountedPrice * quantity;

  const handleAddToCart = () => {
    setAdded(true);
    if (onAddToCart) onAddToCart({ ...product, selectedQuantity: quantity });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Image Column */}
          <div className="modal-img-col">
            <img src={product.image} alt={product.name} className="modal-product-img" />
            {product.discount > 0 && (
              <span className="badge-discount modal-discount-tag">
                Save {product.discount}%
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="modal-info-col">
            <span className="modal-category-tag">{product.category}</span>
            <h2 className="modal-title">{product.name}</h2>

            <div className="modal-rating-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#D4AF37' }}>
                <Star size={16} fill="#D4AF37" />
                <strong style={{ fontSize: '1rem', color: 'var(--chocolate-dark)' }}>{product.rating}</strong>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ({product.reviewsCount} verified customer reviews)
              </span>
              <span className="stock-badge in-stock">
                <ShieldCheck size={14} /> Freshly Baked & In Stock ({product.stockQuantity})
              </span>
            </div>

            {/* Price Row */}
            <div className="modal-price-row">
              <span className="modal-price-main">₹{discountedPrice}</span>
              {product.discount > 0 && (
                <span className="modal-price-orig">₹{product.price}</span>
              )}
              <span className="modal-price-size">/ {product.weightSize}</span>
            </div>

            <p className="modal-desc">{product.description}</p>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="modal-ingredients-box">
                <strong>Premium Ingredients:</strong>
                <p>{product.ingredients}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="modal-qty-row">
              <span style={{ fontWeight: 600, color: 'var(--chocolate-dark)' }}>Quantity:</span>
              <div className="qty-picker">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Total: <strong>₹{totalPrice}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions-row">
              <button 
                className={`btn ${added ? 'btn-gold' : 'btn-primary'}`} 
                style={{ flex: 1, padding: '0.85rem' }}
                onClick={handleAddToCart}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button 
                className="btn btn-gold" 
                style={{ padding: '0.85rem 1.5rem' }}
                onClick={() => {
                  handleAddToCart();
                  window.location.href = '/checkout';
                }}
              >
                <Zap size={18} /> Buy Now
              </button>

              <button 
                className={`icon-btn ${isWishlisted ? 'active' : ''}`}
                style={{ width: '48px', height: '48px' }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                title="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? '#5C1329' : 'none'} color={isWishlisted ? '#5C1329' : '#444'} />
              </button>
            </div>

            {/* Delivery Assurance */}
            <div className="modal-delivery-info">
              <Truck size={18} style={{ color: 'var(--burgundy-royal)' }} />
              <div>
                <strong>Express Temperature-Controlled Delivery</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders placed today are baked fresh and delivered within 2-4 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
