import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';

export default function ProductCard({ product, onQuickView, onAddToCart }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const stock = product.stock_quantity !== undefined ? product.stock_quantity : (product.stockQuantity ?? 10);
  const isOutOfStock = stock <= 0;
  const isBestSeller = product.is_best_seller || product.isBestSeller;
  const weightSize = product.weight_size || product.weightSize || '500g';
  const reviewsCount = product.reviewsCount || 24;

  const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  const handleAddCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setAddedAnim(true);
    if (onAddToCart) onAddToCart(product);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="product-card" onClick={() => onQuickView(product)}>
      {/* Discount & Category Badges */}
      <div className="product-card-badges">
        {product.discount > 0 && (
          <span className="badge-discount">
            {product.discount}% OFF
          </span>
        )}
        {isBestSeller && (
          <span className="badge-bestseller">
            Best Seller
          </span>
        )}
        {isOutOfStock && (
          <span className="badge-discount" style={{ background: '#721c24', color: '#fff' }}>
            Out of Stock
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={toggleWishlist}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart size={18} fill={isWishlisted ? '#5C1329' : 'none'} color={isWishlisted ? '#5C1329' : '#444'} />
      </button>

      {/* Product Image */}
      <div className="product-img-container">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/hero_cake.jpg';
          }}
        />
        <div className="card-quickview-overlay">
          <button className="btn btn-gold" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
            <Eye size={14} /> Quick View
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="product-card-body">
        <div className="product-category-row">
          <span className="product-category-text">{product.category}</span>
          <div className="product-rating">
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
            <span>{product.rating || '4.8'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({reviewsCount})</span>
          </div>
        </div>

        <h3 className="product-title">{product.name}</h3>

        <div className="product-size-text">
          Weight / Size: <strong>{weightSize}</strong>
        </div>

        {/* Pricing & Add to Cart Row */}
        <div className="product-price-row">
          <div>
            <div className="price-main">₹{discountedPrice}</div>
            {product.discount > 0 && (
              <div className="price-original">₹{product.price}</div>
            )}
          </div>

          <button 
            className={`btn ${isOutOfStock ? 'btn-outline' : addedAnim ? 'btn-gold' : 'btn-primary'} card-add-btn`}
            onClick={handleAddCart}
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
          >
            {isOutOfStock ? (
              'Sold Out'
            ) : addedAnim ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
