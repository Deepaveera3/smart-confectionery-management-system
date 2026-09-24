import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { XCircle, RefreshCw, CreditCard, HelpCircle, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';

export default function PaymentFailurePage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const transactionId = location.state?.transactionId || `TXN-SH-FAIL-${orderId || '0000'}`;
  const orderNumber = location.state?.orderNumber || `SH-${orderId || '84920'}`;
  const amount = location.state?.amount || 899.00;
  const reason = location.state?.reason || 'Transaction declined by issuer bank or authentication failed.';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRetryPayment = async () => {
    try {
      const res = await apiService.retryPayment(orderId || 1);
      if (res.success) {
        navigate(`/payment/${orderId || 1}`, {
          state: {
            finalAmount: amount,
            orderNumber
          }
        });
      } else {
        navigate(`/payment/${orderId || 1}`);
      }
    } catch (err) {
      navigate(`/payment/${orderId || 1}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '540px',
        width: '100%',
        padding: '40px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        border: '1px solid #fee2e2'
      }}>
        
        {/* Failure Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          border: '2px solid #fecaca',
          boxShadow: '0 10px 20px -5px rgba(220, 38, 38, 0.2)'
        }}>
          <XCircle size={48} />
        </div>

        <span style={{
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          fontSize: '12px',
          fontWeight: '800',
          padding: '4px 14px',
          borderRadius: '12px',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          PAYMENT FAILED
        </span>

        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
          Payment Unsuccessful
        </h1>

        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 25px 0', lineHeight: '1.5' }}>
          We could not complete your transaction for order <strong>{orderNumber}</strong>. No money was deducted from your account.
        </p>

        {/* Reason Box */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '16px',
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: '30px'
        }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>
            Reason for Failure:
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', lineHeight: '1.4' }}>
            {reason}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleRetryPayment}
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
            <RefreshCw size={18} />
            <span>Retry Payment</span>
          </button>

          <button
            onClick={handleRetryPayment}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CreditCard size={18} />
            <span>Change Payment Method</span>
          </button>

          <Link
            to="/cart"
            style={{
              marginTop: '5px',
              fontSize: '13px',
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeft size={14} />
            Return to Cart
          </Link>
        </div>

      </div>
    </div>
  );
}
