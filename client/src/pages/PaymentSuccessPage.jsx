import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, FileText, Truck, Home, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function PaymentSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const transactionId = location.state?.transactionId || `TXN-SH-2026-${orderId || '9182'}`;
  const orderNumber = location.state?.orderNumber || `SH-${orderId || '84920'}`;
  const amount = location.state?.amount || 899.00;
  const paymentMethod = location.state?.paymentMethod || 'Online Payment Gateway';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        padding: '40px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Success Tick Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#f0fdf4',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          border: '2px solid #bbf7d0',
          boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.3)'
        }}>
          <CheckCircle2 size={48} />
        </div>

        <span style={{
          backgroundColor: '#f0fdf4',
          color: '#16a34a',
          fontSize: '12px',
          fontWeight: '800',
          padding: '4px 14px',
          borderRadius: '12px',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          PAYMENT VERIFIED & CONFIRMED
        </span>

        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
          Payment Successful! 🎉
        </h1>

        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 25px 0', lineHeight: '1.5' }}>
          Thank you! Your payment has been processed successfully. Your delicious order is now confirmed and being prepared by our royal chefs.
        </p>

        {/* Transaction Details Box */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>Order Number:</span>
            <strong style={{ color: '#0f172a' }}>{orderNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>Transaction ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#be185d' }}>{transactionId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>Payment Method:</span>
            <strong style={{ color: '#334155' }}>{paymentMethod}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px' }}>
            <span style={{ fontWeight: '700', color: '#0f172a' }}>Total Amount Paid:</span>
            <strong style={{ fontSize: '16px', color: '#16a34a' }}>₹{parseFloat(amount).toFixed(2)}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <FileText size={18} color="#be185d" />
            <span>View / Print Official Order Invoice</span>
          </button>

          <Link
            to={`/track?order=${orderNumber}`}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '15px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px -5px rgba(190, 24, 93, 0.4)'
            }}
          >
            <Truck size={18} />
            <span>Live Order Tracking</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/"
            style={{
              marginTop: '5px',
              fontSize: '13px',
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Return to Home Page
          </Link>
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          orderId={orderId || 1}
        />

      </div>
    </div>
  );
}
