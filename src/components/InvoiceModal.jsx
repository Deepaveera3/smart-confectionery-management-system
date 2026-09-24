import React, { useState, useEffect } from 'react';
import { Printer, Download, X, CheckCircle, Store, Calendar, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';

export default function InvoiceModal({ isOpen, onClose, orderId }) {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchInvoice();
    }
  }, [isOpen, orderId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await apiService.getOrderInvoice(orderId);
      if (res.success) {
        setInvoiceData(res.invoice);
      }
    } catch (err) {
      console.error('Failed to load invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const order = invoiceData?.order || {};
  const items = invoiceData?.items || [];
  const invoiceNum = invoiceData?.invoice_number || `INV-2026-${orderId}`;
  const invoiceDate = invoiceData?.invoice_date ? new Date(invoiceData.invoice_date).toLocaleDateString() : new Date().toLocaleDateString();

  const subtotal = parseFloat(order.total_amount || 0);
  const discount = parseFloat(order.discount_amount || 0);
  const loyaltyDisc = parseFloat(order.loyalty_discount || 0);
  const deliveryFee = parseFloat(order.delivery_fee || 0);
  const finalAmount = parseFloat(order.final_amount || subtotal - discount - loyaltyDisc + deliveryFee);
  const gstTax = (finalAmount * 0.05).toFixed(2); // 5% GST tax calculation

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="printable-invoice-container" style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Top Action Controls (Hidden during print) */}
        <div className="no-print" style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '20px 20px 0 0'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            Tax Invoice #{invoiceNum}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: '#e2e8f0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Content Body */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            Loading invoice details...
          </div>
        ) : (
          <div style={{ padding: '36px' }}>
            {/* Header / Brand */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #be185d', paddingBottom: '24px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ margin: '0 0 4px 0', color: '#be185d', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  🍰 Sweet Haven
                </h1>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Royal Confectionery & Artisan Bakery Ltd.
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  GSTIN: 33AAACS9182K1Z5 | FSSAI Lic No. 12421999000142
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  backgroundColor: '#fdf2f8',
                  color: '#be185d',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'inline-block',
                  marginBottom: '6px'
                }}>
                  ORIGINAL TAX INVOICE
                </span>
                <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Invoice: {invoiceNum}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Date: {invoiceDate}
                </p>
              </div>
            </div>

            {/* Billed To / Order Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  Billed To:
                </h4>
                <p style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  {order.customer_name || 'Valued Customer'}
                </p>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#475569' }}>
                  {order.customer_email} | {order.customer_phone}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                  {order.delivery_address || 'Customer Shipping Address'}
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  Order Details:
                </h4>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#334155' }}>
                  <strong>Order ID:</strong> #{order.order_number}
                </p>
                <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#334155' }}>
                  <strong>Payment Status:</strong> <span style={{ color: '#16a34a', fontWeight: '700' }}>{order.payment_status || 'PAID'}</span>
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                  <strong>Payment Method:</strong> {order.payment_method || 'Online Payment Gateway'}
                </p>
                {order.transaction_id && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    TXN ID: {order.transaction_id}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569' }}>S.No</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Item Description</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Qty</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Unit Price</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {item.product_name}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '14px', color: '#1e293b' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '14px', color: '#1e293b' }}>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#64748b' }}>1</td>
                    <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {order.product_name || 'Confectionery Items'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '14px', color: '#1e293b' }}>1</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '14px', color: '#1e293b' }}>₹{finalAmount.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>₹{finalAmount.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
              <div style={{ width: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#16a34a' }}>
                    <span>Discount Coupon:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {loyaltyDisc > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#be185d' }}>
                    <span>Loyalty Discount:</span>
                    <span>-₹{loyaltyDisc.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b' }}>
                  <span>GST (5% Included):</span>
                  <span>₹{gstTax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#64748b' }}>
                  <span>Delivery Fee:</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  padding: '10px 0',
                  marginTop: '8px',
                  borderTop: '2px solid #0f172a',
                  borderBottom: '2px solid #0f172a',
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#be185d'
                }}>
                  <span>Total Amount Paid:</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Signature Notice */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#64748b' }}>
                Thank you for ordering with Sweet Haven!
              </p>
              <p style={{ margin: 0 }}>This is a computer generated tax invoice and does not require a physical signature.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
