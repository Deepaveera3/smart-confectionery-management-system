import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, moveToCart } = useCart();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="section-subtitle">Saved Favorites</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--chocolate-dark)' }}>
          My Wishlist ({wishlistItems.length})
        </h1>
      </div>

      {wishlistItems.length > 0 ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
            {wishlistItems.map(item => {
              const discountedPrice = Math.round(item.price * (1 - (item.discount || 0) / 100));

              return (
                <div 
                  key={item.id}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-gold)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <button 
                    onClick={() => toggleWishlist(item)}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} style={{ color: '#c0392b' }} />
                  </button>

                  <img 
                    src={item.image || '/hero_cake.jpg'} 
                    alt={item.name} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/hero_cake.jpg';
                    }}
                  />

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--burgundy-royal)', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--chocolate-dark)', margin: '0.3rem 0' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Weight / Size: <strong>{item.weight_size || item.weightSize || '500g'}</strong>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--burgundy-royal)' }}>₹{discountedPrice}</div>
                        {item.discount > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{item.price}</div>}
                      </div>

                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        onClick={() => moveToCart(item)}
                      >
                        <ShoppingBag size={15} /> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--burgundy-royal)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Explore More Products
          </Link>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-gold)', maxWidth: '600px', margin: '0 auto' }}>
          <Heart size={56} style={{ color: 'var(--burgundy-royal)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Save your favorite cakes and chocolates to order later.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Bakery Products
          </Link>
        </div>
      )}
    </div>
  );
}
