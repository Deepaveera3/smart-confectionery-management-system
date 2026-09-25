import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Play, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function PaymentCancelledPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const orderNumber = location.state?.orderNumber || `SH-${orderId || '84920'}`;
  const amount = location.state?.amount || 899.00;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '520px',
        width: '100%',
        padding: '40px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#fffbe6',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          border: '2px solid #ffe58f'
        }}>
          <AlertTriangle size={38} />
        </div>

        <span style={{
          backgroundColor: '#fffbe6',
          color: '#d97706',
          fontSize: '12px',
          fontWeight: '800',
          padding: '4px 14px',
          borderRadius: '12px',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          PAYMENT CANCELLED
        </span>

        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
          Payment Process Cancelled
        </h1>

        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 25px 0', lineHeight: '1.5' }}>
          You have cancelled the payment session for order <strong>{orderNumber}</strong>. Your cart items are still safe.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate(`/payment/${orderId || 1}`)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px -5px rgba(190, 24, 93, 0.4)'
            }}
          >
            <Play size={18} />
            <span>Resume Payment (₹{parseFloat(amount).toFixed(2)})</span>
          </button>

          <Link
            to="/cart"
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShoppingBag size={18} />
            <span>Return to Shopping Cart</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
