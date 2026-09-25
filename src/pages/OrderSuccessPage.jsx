import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Truck, Package, ArrowRight, Clock, MapPin, Award } from 'lucide-react';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();

  const details = location.state?.orderDetails || {
    orderNumber: orderNumber || 'SH-91042',
    finalAmount: 799,
    pointsEarned: 79
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        maxWidth: '580px',
        width: '100%',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--border-gold)',
        boxShadow: 'var(--shadow-lg)',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        {/* Animated Checkmark Circle */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justify: 'center',
          boxShadow: '0 10px 25px rgba(39, 174, 96, 0.3)',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle size={48} />
        </div>

        <span className="section-subtitle">Order Placed Successfully</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', fontSize: '2.2rem', margin: '0.3rem 0 0.75rem' }}>
          Thank You for Your Order!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Our royal master bakers are preparing your handcrafted confectionery batch with love and precision.
        </p>

        {/* Order Details Banner */}
        <div style={{ background: 'var(--bg-cream-soft)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
              <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--burgundy-royal)' }}>
                #{details.orderNumber}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ESTIMATED ARRIVAL</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--chocolate-dark)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={16} style={{ color: 'var(--burgundy-royal)' }} /> Today by 6:00 PM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <div>
              <span>Amount Paid: <strong>₹{details.finalAmount}</strong></span>
            </div>
            <div style={{ color: 'var(--burgundy-royal)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Award size={16} /> Earned {details.pointsEarned} Points!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/track?order=${details.orderNumber}`} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>
            <Truck size={18} /> Track Live Order Status
          </Link>
          <Link to="/my-orders" className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}>
            <Package size={18} /> View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
