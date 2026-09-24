import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, CreditCard, QrCode, Building2, Wallet, Lock, CheckCircle2, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'credit', 'debit', 'netbanking', 'wallet'
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');

  // Form Inputs
  const [vpa, setVpa] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  const amount = location.state?.finalAmount || order?.final_amount || 899.00;
  const orderNumber = location.state?.orderNumber || order?.order_number || `SH-${orderId || '84920'}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProcessPayment = async (simulateStatus = 'Successful') => {
    setLoading(true);
    setError('');

    try {
      // 1. Initiate Payment Session
      const initRes = await apiService.initiatePayment(orderId || 1, amount, activeTab.toUpperCase());
      if (!initRes.success) {
        setError(initRes.message || 'Failed to initiate payment.');
        setLoading(false);
        return;
      }

      const transactionId = initRes.transactionId;

      // 2. Verify Payment (Sandbox Mode Simulation)
      const verifyRes = await apiService.verifyPayment(transactionId, orderId || 1, activeTab.toUpperCase(), simulateStatus);

      if (simulateStatus === 'Successful' && verifyRes.success) {
        navigate(`/payment/success/${orderId || 1}`, {
          state: {
            transactionId,
            orderNumber,
            amount,
            paymentMethod: activeTab.toUpperCase()
          }
        });
      } else if (simulateStatus === 'Cancelled') {
        await apiService.cancelPayment(transactionId, orderId || 1);
        navigate(`/payment/cancelled/${orderId || 1}`, {
          state: { transactionId, orderNumber, amount }
        });
      } else {
        navigate(`/payment/failure/${orderId || 1}`, {
          state: {
            transactionId,
            orderNumber,
            amount,
            reason: 'Card verification timeout or bank authorization rejected in sandbox mode.'
          }
        });
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('An unexpected error occurred during payment processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fdf2f8',
            color: '#be185d',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '10px'
          }}>
            <ShieldCheck size={16} />
            256-Bit SSL Encrypted Payment Portal (Sandbox Mode)
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Complete Your Payment
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Order Number: <strong style={{ color: '#be185d' }}>{orderNumber}</strong> | Total Payable: <strong style={{ color: '#0f172a' }}>₹{parseFloat(amount).toFixed(2)}</strong>
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
          
          {/* Main Payment Options */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              Select Payment Method
            </h3>

            {/* Payment Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '25px' }}>
              {[
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'credit', label: 'Credit Card', icon: CreditCard },
                { id: 'debit', label: 'Debit Card', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                { id: 'wallet', label: 'Wallets', icon: Wallet }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: '12px',
                      border: active ? '2px solid #be185d' : '1px solid #e2e8f0',
                      backgroundColor: active ? '#fdf2f8' : '#ffffff',
                      color: active ? '#be185d' : '#64748b',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === 'upi' && (
              <div>
                <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 15px 0' }}>
                  Pay via Google Pay, PhonePe, Paytm, or BHIM UPI ID.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mobile@upi, username@okaxis"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <QrCode size={48} style={{ margin: '0 auto 8px auto', color: '#be185d' }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Scan QR code with any UPI app to pay <strong>₹{parseFloat(amount).toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            )}

            {(activeTab === 'credit' || activeTab === 'debit') && (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8921"
                    maxLength="19"
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as printed on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      CVV Code
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength="4"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'netbanking' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Select Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="HDFC Bank">HDFC Bank Net Banking</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank Internet Banking</option>
                  <option value="Axis Bank">Axis Bank Net Banking</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                </select>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Select Wallet Provider
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: selectedWallet === w ? '2px solid #be185d' : '1px solid #cbd5e1',
                        backgroundColor: selectedWallet === w ? '#fdf2f8' : '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: selectedWallet === w ? '#be185d' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sandbox Simulation Action Controls */}
            <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{
                backgroundColor: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '15px',
                fontSize: '12px',
                color: '#8c6b00'
              }}>
                ⚡ <strong>Sandbox Simulation Mode:</strong> Select an outcome button below to test the payment engine:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => handleProcessPayment('Successful')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 16px -4px rgba(22, 163, 74, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{loading ? 'Processing...' : `Pay ₹${parseFloat(amount).toFixed(2)} (Simulate Success)`}</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => handleProcessPayment('Failed')}
                    disabled={loading}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <XCircle size={15} />
                    Simulate Failure
                  </button>

                  <button
                    onClick={() => handleProcessPayment('Cancelled')}
                    disabled={loading}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#64748b',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    Simulate Cancel
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Summary Sidebar */}
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
                Payment Summary
              </h3>

              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                  <span>Order Number:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{orderNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                  <span>Status:</span>
                  <span style={{ color: '#d97706', fontWeight: '700' }}>Pending Payment</span>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                  <span>Taxes (GST 5%):</span>
                  <span>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                  <span>Delivery Fee:</span>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#be185d', marginTop: '15px' }}>
                <span>Total Amount:</span>
                <span>₹{parseFloat(amount).toFixed(2)}</span>
              </div>

              <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Lock size={14} color="#be185d" />
                <span>Your payment details are processed through high security 256-bit encrypted gateway.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
