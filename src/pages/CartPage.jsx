import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    rawSubtotal, 
    totalDiscount, 
    subtotal, 
    deliveryFee, 
    grandTotal,
    customerUser 
  } = useCart();

  const navigate = useNavigate();

  const handleProceedCheckout = () => {
    if (cartItems.length === 0) return;
    if (!customerUser) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span className="section-subtitle">Shopping Experience</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--chocolate-dark)', margin: 0 }}>
            Your Confectionery Cart
          </h1>
        </div>
        {cartItems.length > 0 && (
          <button className="btn btn-outline" style={{ color: '#c0392b', borderColor: '#c0392b', fontSize: '0.85rem' }} onClick={clearCart}>
            <Trash2 size={16} /> Clear Cart
          </button>
        )}
      </div>

      {cartItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cartItems.map(item => {
              const discountedPrice = Math.round(item.price * (1 - (item.discount || 0) / 100));
              const itemTotal = discountedPrice * item.quantity;
              const isLowStock = (item.stock_quantity ?? 10) <= 5;

              return (
                <div 
                  key={item.id}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <img 
                    src={item.image || '/hero_cake.jpg'} 
                    alt={item.name} 
                    style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/hero_cake.jpg';
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--burgundy-royal)', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--chocolate-dark)', margin: '0.2rem 0' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Weight / Size: <strong>{item.weight_size || item.weightSize || '500g'}</strong>
                    </div>
                    {isLowStock && (
                      <span style={{ fontSize: '0.75rem', color: '#c0392b', fontWeight: 600 }}>
                        ⚠️ Only {item.stock_quantity} left in stock!
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-cream-soft)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--chocolate-dark)' }}
                    >
                      <Minus size={15} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--chocolate-dark)' }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Item Pricing */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--burgundy-royal)' }}>
                      ₹{itemTotal}
                    </div>
                    {item.discount > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{item.price * item.quantity}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', padding: '0.4rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}

            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--burgundy-royal)', fontWeight: 600, marginTop: '1rem' }}>
              <ArrowLeft size={16} /> Continue Shopping Bakery Products
            </Link>
          </div>

          {/* Cart Order Summary Card */}
          <div style={{ height: 'fit-content' }}>
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-gold)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-card)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>₹{rawSubtotal}</span>
                </div>

                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60', fontWeight: 600 }}>
                    <span>Special Discount</span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: '#27ae60' }}>FREE</strong> : `₹${deliveryFee}`}</span>
                </div>

                {subtotal <= 999 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-cream-soft)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    💡 Add <strong>₹{1000 - subtotal}</strong> more to qualify for <strong>FREE Delivery!</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid var(--border-gold)', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>Grand Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--burgundy-royal)' }}>₹{grandTotal}</span>
              </div>

              <button 
                onClick={handleProceedCheckout}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--gold-primary)' }} />
                100% Freshness & Royal Packaging Guaranteed
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-gold)', maxWidth: '600px', margin: '0 auto' }}>
          <ShoppingBag size={56} style={{ color: 'var(--burgundy-royal)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)' }}>Your Shopping Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Explore our handcrafted Belgian cakes, cocoa truffles, and brownies.</p>
          <Link to="/products" className="btn btn-primary">
            Explore Confectionery Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
