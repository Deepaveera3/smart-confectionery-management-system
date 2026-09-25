import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';
import OrderTrackingPreview from '../components/OrderTrackingPreview';

export default function TrackPage() {
  const [searchParams] = useSearchParams();
  const initialNum = searchParams.get('order') || 'SH-84920';

  const [orderSearch, setOrderSearch] = useState(initialNum);
  const [activeOrderNum, setActiveOrderNum] = useState(initialNum);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (orderSearch.trim()) {
      setActiveOrderNum(orderSearch.trim().toUpperCase());
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="section-subtitle">Real-Time Kitchen Updates</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--chocolate-dark)', margin: '0.25rem 0' }}>
          Live Order Status & Stage Tracking
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enter your Sweet Haven Order Number to view real-time preparation, baking, and delivery progress.
        </p>
      </div>

      {/* Order Lookup Form */}
      <div style={{
        maxWidth: '550px',
        margin: '0 auto 2.5rem',
        background: '#ffffff',
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
      }}>
        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Enter Order Number (e.g. SH-84920)"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.8rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
            Track Live
          </button>
        </form>
      </div>

      {/* Live Tracking Result Component */}
      <OrderTrackingPreview key={activeOrderNum} initialOrderNumber={activeOrderNum} />
    </div>
  );
}
