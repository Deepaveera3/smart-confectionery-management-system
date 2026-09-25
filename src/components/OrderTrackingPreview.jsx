import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  ChefHat, 
  Flame, 
  Sparkles, 
  Box, 
  Truck, 
  Gift,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import { apiService } from '../services/api';

const TRACKING_STAGES = [
  { stage: 1, title: 'Order Placed', time: 'Just now', icon: 'FileText', desc: 'Order received and registered in database.' },
  { stage: 2, title: 'Order Confirmed', time: '+2 mins', icon: 'CheckCircle', desc: 'Payment verified & kitchen team notified.' },
  { stage: 3, title: 'Preparing Ingredients', time: '+10 mins', icon: 'ChefHat', desc: 'Fresh Belgian cocoa & ingredients weighed.' },
  { stage: 4, title: 'Baking in Oven', time: '+25 mins', icon: 'Flame', desc: 'Fresh cake layers baking at optimal temperature.' },
  { stage: 5, title: 'Quality Check & Frosting', time: '+45 mins', icon: 'Sparkles', desc: 'Chef icing cream & quality inspection.' },
  { stage: 6, title: 'Packed in Gold Box', time: '+60 mins', icon: 'Box', desc: 'Hygienically packaged with temperature control.' },
  { stage: 7, title: 'Out for Delivery', time: '+75 mins', icon: 'Truck', desc: 'Delivery partner assigned and en route to address.' },
  { stage: 8, title: 'Delivered', time: '+90 mins', icon: 'Gift', desc: 'Delivered! Enjoy your fresh confectionery!' }
];

const STAGE_NUMBERS = {
  'Order Placed': 1,
  'Order Confirmed': 2,
  'Confirmed': 2,
  'Preparing': 3,
  'Preparing Ingredients': 3,
  'Baking': 4,
  'Baking in Oven': 4,
  'Quality Check': 5,
  'Quality Check & Frosting': 5,
  'Packed': 6,
  'Packed in Gold Box': 6,
  'Out for Delivery': 7,
  'Delivered': 8
};

export default function OrderTrackingPreview({ initialOrderNumber = 'SH-84920' }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchOrderTracking(orderNumber);
    // Auto-polling every 5 seconds for live status updates from Admin
    const interval = setInterval(() => {
      fetchOrderTracking(orderNumber, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderNumber]);

  const fetchOrderTracking = async (num, isPoll = false) => {
    if (!isPoll) setLoading(true);
    try {
      const res = await apiService.trackOrder(num);
      if (res && res.success && res.order) {
        setOrder(res.order);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Tracking poll error:', err);
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const currentStage = order ? (STAGE_NUMBERS[order.order_status] || order.tracking_stage || 1) : 4;
  const activeStageData = TRACKING_STAGES[Math.min(currentStage - 1, 7)] || TRACKING_STAGES[0];

  const getStageIcon = (iconName) => {
    switch (iconName) {
      case 'FileText': return <FileText size={18} />;
      case 'CheckCircle': return <CheckCircle size={18} />;
      case 'ChefHat': return <ChefHat size={18} />;
      case 'Flame': return <Flame size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      case 'Box': return <Box size={18} />;
      case 'Truck': return <Truck size={18} />;
      case 'Gift': return <Gift size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getEstimatedArrival = (stage) => {
    switch (stage) {
      case 1: return '45 - 60 mins';
      case 2: return '40 - 50 mins';
      case 3: return '30 - 40 mins';
      case 4: return '20 - 30 mins';
      case 5: return '15 - 20 mins';
      case 6: return '10 - 15 mins';
      case 7: return '5 - 10 mins (Out for Delivery)';
      case 8: return 'Delivered!';
      default: return '30 mins';
    }
  };

  const progressPercent = Math.min(100, Math.max(12, (currentStage / 8) * 100));

  return (
    <section className="tracking-section">
      <div className="container">
        
        <div className="tracking-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '30px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          
          {/* Header Row */}
          <div className="tracking-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="order-no-tag" style={{
                  backgroundColor: '#fdf2f8',
                  color: '#be185d',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800'
                }}>
                  Order #{order?.order_number || orderNumber}
                </span>
                <span style={{
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  Live Syncing • Auto updates
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0f172a', margin: '0 0 6px 0', fontSize: '22px' }}>
                {order?.product_name || 'Belgian Dark Truffle Cake (1 Kg)'}
              </h3>
              
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={15} style={{ color: '#be185d' }} />
                <span>Delivery Address: <strong>{order?.delivery_address || 'Heritage Plaza, Suite 402'}</strong></span>
              </p>
            </div>

            <div className="estimated-time-box" style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px 20px',
              borderRadius: '16px',
              textAlign: 'right'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be185d', justifyContent: 'flex-end', fontSize: '12px', fontWeight: '700' }}>
                <Clock size={15} />
                <span>ESTIMATED DELIVERY</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                {getEstimatedArrival(currentStage)}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Live Progress Bar Container */}
          <div style={{ margin: '25px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
              <span>Preparation Progress ({currentStage}/8 Stages)</span>
              <span style={{ color: '#be185d' }}>{Math.round(progressPercent)}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #be185d 0%, #f43f5e 100%)',
                borderRadius: '10px',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
          </div>

          {/* Current Live Stage Banner */}
          <div className="tracking-live-alert" style={{
            backgroundColor: '#fdf2f8',
            borderLeft: '5px solid #be185d',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <Flame className="pulse-icon" size={28} style={{ color: '#be185d', flexShrink: 0 }} />
            <div>
              <h4 style={{ color: '#be185d', margin: '0 0 2px 0', fontSize: '16px', fontWeight: '800' }}>
                Current Stage: {activeStageData.title} 🍰
              </h4>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                {activeStageData.desc}
              </p>
            </div>
          </div>

          {/* 8-Stage Timeline */}
          <div className="timeline-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '8px',
            position: 'relative'
          }}>
            {TRACKING_STAGES.map((s) => {
              const isCompleted = s.stage < currentStage;
              const isCurrent = s.stage === currentStage;
              return (
                <div 
                  key={s.stage}
                  className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    opacity: isCompleted || isCurrent ? 1 : 0.45
                  }}
                  title={`Stage ${s.stage}: ${s.title}`}
                >
                  <div className="step-circle" style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? '#be185d' : isCompleted ? '#16a34a' : '#f1f5f9',
                    color: isCurrent || isCompleted ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    boxShadow: isCurrent ? '0 0 0 4px #fbcfe8' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {getStageIcon(s.icon)}
                  </div>
                  <span className="step-title" style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: isCurrent ? '800' : '600',
                    color: isCurrent ? '#be185d' : '#334155',
                    lineHeight: '1.2'
                  }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Customer Support Action Row */}
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Need help with your order? Our kitchen hotline is active.
            </div>

            <a
              href="tel:+919876543210"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PhoneCall size={14} color="#be185d" />
              <span>Call Bakery Helpline (+91 98765 43210)</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
