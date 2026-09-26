import React, { useState, useEffect } from 'react';
import { Award, Crown, Gift, Sparkles, QrCode, ShieldCheck, Zap, Users, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';

export default function LoyaltyPreviewSection() {
  const { customerUser } = useCart();
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (customerUser) {
      const fetchLoyalty = apiService.getMyLoyaltyAccount || apiService.getCustomerLoyalty;
      if (typeof fetchLoyalty === 'function') {
        fetchLoyalty().then(res => {
          if (res && res.success && res.account) {
            setLoyaltyAccount(res.account);
          }
        }).catch(() => {});
      }
    }
  }, [customerUser]);

  const profile = {
    customerName: loyaltyAccount?.name || customerUser?.name || 'Valued Member',
    loyaltyId: loyaltyAccount?.loyalty_card_number || customerUser?.loyaltyCardNumber || 'SH-LOYAL-2026-DEMO',
    currentTier: loyaltyAccount?.tier || customerUser?.tier || 'Silver',
    currentPoints: loyaltyAccount?.current_points !== undefined ? loyaltyAccount.current_points : (customerUser?.currentPoints || 150),
    totalEarned: loyaltyAccount?.total_points_earned || 150,
    nextTier: (loyaltyAccount?.tier === 'Royal' || customerUser?.tier === 'Royal') ? 'Maximum Royal Tier' : 'Gold'
  };

  const pointsToNext = Math.max(0, 500 - profile.currentPoints);
  const progressPct = Math.min(100, Math.round((profile.currentPoints / 500) * 100));

  return (
    <section className="loyalty-preview-section" style={{ padding: '3.5rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fdf2f8', color: '#be185d', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', marginBottom: '10px', border: '1px solid #fbcfe8' }}>
            <Crown size={15} /> Royal Rewards Loyalty Program
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading, sans-serif)', fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Digital Loyalty Pass & Customer Rewards
          </h2>
          <p style={{ maxWidth: '650px', margin: '0 auto', color: '#64748b', fontSize: '0.95rem' }}>
            Ditch lost physical cards! Earn points automatically on every cake purchase, track your tier progress, and redeem instant bakery vouchers.
          </p>
        </div>

        {/* LUXURY DIGITAL LOYALTY CARD GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          
          {/* 1. PREMIUM DIGITAL LOYALTY CARD (Visual Card Component) */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311b92 100%)',
            borderRadius: '24px',
            padding: '28px',
            color: '#ffffff',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Foil Shine Accent */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Card Header: Brand & Membership Tier */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: '900', fontSize: '15px' }}>
                  <Crown size={20} /> Sweet Haven Royal Pass
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>Digital Membership Card</span>
              </div>

              {/* MEMBERSHIP TIER BADGE */}
              <span style={{
                backgroundColor: '#fbbf24',
                color: '#1e1b4b',
                padding: '4px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
              }}>
                {profile.currentTier} Tier
              </span>
            </div>

            {/* Cardholder & Points Display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>CARD HOLDER</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>{profile.customerName}</div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', letterSpacing: '1.5px', marginTop: '2px' }}>
                  {profile.loyaltyId}
                </div>
              </div>

              {/* REWARD POINTS BALANCE */}
              <div style={{ textAlign: 'right', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px 16px', borderRadius: '14px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <span style={{ fontSize: '10px', color: '#fef08a', textTransform: 'uppercase', fontWeight: '800', display: 'block' }}>REWARD POINTS</span>
                <span style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff' }}>{profile.currentPoints} <small style={{ fontSize: '13px' }}>PTS</small></span>
                <span style={{ fontSize: '10px', color: '#cbd5e1', display: 'block' }}>≈ ₹{profile.currentPoints} Cash Discount</span>
              </div>
            </div>

            {/* PROGRESS BAR TO NEXT TIER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                <span>Progress to {profile.nextTier}</span>
                <span style={{ color: '#fbbf24' }}>{profile.currentPoints} / 500 PTS</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* CARD ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowQrModal(true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <QrCode size={16} /> Show In-Store QR
              </button>

              <Link 
                to="/loyalty"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  textDecoration: 'none'
                }}
              >
                Rewards Hub <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 2. REWARDS BENEFITS FEATURE LIST */}
          <div style={{ paddingLeft: '1rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
              How Sweet Haven Loyalty Works
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#fef2f2', color: '#be185d', padding: '10px', borderRadius: '12px' }}>
                  <Gift size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>Earn 1 Point for Every ₹10 Spent</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Points accumulate automatically upon checkout and never expire for active members.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '10px', borderRadius: '12px' }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>Instant 1 Point = ₹1 Cash Value</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Redeem reward points directly as instant discount at checkout with no minimum limit.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '12px' }}>
                  <Crown size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 2px 0' }}>VIP Tier Privileges & Free Delivery</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Reach Silver, Gold, and Royal tiers to unlock complimentary delivery and birthday gifts.</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/loyalty" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}>
                Explore Loyalty Hub
              </Link>
              {!customerUser && (
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}>
                  Sign In to View Card
                </Link>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* QR Code In-Store Modal */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '24px',
            maxWidth: '360px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Scan in Bakery</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Present this QR code to the cashier to earn points or redeem in-store rewards.</p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <QrCode size={180} style={{ color: '#0f172a' }} />
            </div>

            <div style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '15px', color: '#be185d', letterSpacing: '1px', marginBottom: '20px' }}>
              {profile.loyaltyId}
            </div>

            <button 
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowQrModal(false)}
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
