import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle2, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';
import InvoiceModal from '../components/InvoiceModal';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPaymentHistory();
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = (orderId) => {
    setSelectedOrderId(orderId);
    setIsInvoiceOpen(true);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be185d', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>
              <ShieldCheck size={16} />
              Secure Payment Ledger
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Payment History & Receipts
            </h1>
          </div>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              Loading payment history...
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <CreditCard size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#475569', margin: '0 0 4px 0' }}>No payment records found.</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Completed order payments will appear here.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Transaction ID</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Order Number</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Payment Mode</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Amount</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay) => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontFamily: 'monospace', fontWeight: '600', color: '#be185d' }}>
                      {pay.transaction_id}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {pay.order_number || `SH-${pay.order_id}`}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155' }}>
                      {pay.payment_method}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{parseFloat(pay.amount || pay.final_amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: pay.status === 'Successful' ? '#f0fdf4' : pay.status === 'Pending' ? '#fffbe6' : '#fef2f2',
                        color: pay.status === 'Successful' ? '#16a34a' : pay.status === 'Pending' ? '#d97706' : '#dc2626'
                      }}>
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenInvoice(pay.order_id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FileText size={14} color="#be185d" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invoice Modal */}
        {selectedOrderId && (
          <InvoiceModal
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            orderId={selectedOrderId}
          />
        )}

      </div>
    </div>
  );
}
