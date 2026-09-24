import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Truck, Clock, Eye, X, CheckCircle, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      order_number: 'SH-84920',
      customer_name: 'Priyanga M.',
      product_name: 'Belgian Dark Truffle Cake (1 Kg)',
      total_amount: 899.00,
      payment_status: 'Successful',
      order_status: 'Baking',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      order_number: 'SH-84921',
      customer_name: 'Priyanga M.',
      product_name: 'Royal Red Velvet Cake (1 Kg)',
      total_amount: 799.00,
      payment_status: 'Successful',
      order_status: 'Delivered',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiService.getMyOrders();
      if (res && res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Fetch my orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = (o.order_number || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (o.product_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || 
                        (statusFilter === 'Active' && o.order_status !== 'Delivered' && o.order_status !== 'Cancelled') ||
                        (statusFilter === 'Delivered' && o.order_status === 'Delivered') ||
                        (statusFilter === 'Cancelled' && o.order_status === 'Cancelled');
    return matchSearch && matchStatus;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="section-subtitle">Customer Order History</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--chocolate-dark)' }}>
          My Bakery Orders ({orders.length})
        </h1>
      </div>

      {/* Filter & Search Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Active', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by Order # or Product..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.4rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map(o => (
            <div 
              key={o.id}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-gold)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.2rem', color: 'var(--burgundy-royal)' }}>
                    #{o.order_number}
                  </span>
                  <span className={`status-badge status-${(o.order_status || 'placed').toLowerCase().replace(/\s+/g, '-')}`}>
                    {o.order_status}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--chocolate-dark)', fontSize: '1rem' }}>
                  {o.product_name || 'Handcrafted Confectionery Items'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Placed on: {new Date(o.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--chocolate-dark)' }}>
                    ₹{o.total_amount || o.final_amount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#27ae60', fontWeight: 600 }}>
                    {o.payment_status || 'Successful'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => setSelectedOrderModal(o)}>
                    <Eye size={15} /> Details
                  </button>
                  <Link to="/track" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                    <Truck size={15} /> Track
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-gold)', maxWidth: '600px', margin: '0 auto' }}>
          <Package size={56} style={{ color: 'var(--burgundy-royal)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)' }}>No Orders Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>You haven't placed any orders matching this filter yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping Now
          </Link>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '500px', width: '100%', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', margin: 0 }}>
                Order #{selectedOrderModal.order_number}
              </h3>
              <button onClick={() => setSelectedOrderModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div><strong>Items:</strong> {selectedOrderModal.product_name}</div>
              <div><strong>Order Status:</strong> {selectedOrderModal.order_status}</div>
              <div><strong>Payment Status:</strong> {selectedOrderModal.payment_status || 'Successful'}</div>
              <div><strong>Total Amount:</strong> ₹{selectedOrderModal.total_amount || selectedOrderModal.final_amount}</div>
              <div><strong>Delivery Address:</strong> {typeof selectedOrderModal.delivery_address === 'string' ? selectedOrderModal.delivery_address : 'Heritage Plaza, Suite 402, Bangalore'}</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/track" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Track Timeline</Link>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedOrderModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
