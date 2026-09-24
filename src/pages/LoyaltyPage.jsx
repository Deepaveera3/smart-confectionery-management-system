import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Gift, TrendingUp, CheckCircle, Clock, Sparkles, AlertCircle, 
  ArrowRight, QrCode, Smartphone, Copy, Check, Share2, Calculator, Zap, Calendar, 
  RotateCw, ChevronRight, ShoppingBag, ExternalLink, Percent, Trophy, Sparkle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function LoyaltyPage() {
  const navigate = useNavigate();
  const [loyaltyAccount, setLoyaltyAccount] = useState({
    loyalty_card_number: 'SH-ROYAL-9842-2026',
    customer_name: 'Priyanga M.',
    current_points: 480,
    total_points_earned: 750,
    total_points_redeemed: 270,
    tier: 'Silver'
  });
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState({
    points_per_100_spent: 10,
    point_value_in_rs: 1.0,
    silver_threshold: 250,
    gold_threshold: 500,
    royal_threshold: 1000
  });
  const [loading, setLoading] = useState(true);

  // Digital Card Interactive States
  const [isFlipped, setIsFlipped] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copiedCardNo, setCopiedCardNo] = useState(false);

  // Daily Streak State
  const [checkinStreak, setCheckinStreak] = useState(3);
  const [checkinClaimed, setCheckinClaimed] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Spend Calculator State
  const [spendAmount, setSpendAmount] = useState(650);

  // Rewards Marketplace State
  const [activeCategory, setActiveCategory] = useState('All');
  const [userVouchers, setUserVouchers] = useState([
    { id: 1, title: '₹100 Off Birthday Cake Voucher', code: 'ROYAL-BDAY-100', pointsCost: 100, isUsed: false }
  ]);
  const [redeemingId, setRedeemingId] = useState(null);

  // Referral Code Input
  const [referralInput, setReferralInput] = useState('');
  const [referralSuccess, setReferralSuccess] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLoyaltyDetails();
  }, []);

  const fetchLoyaltyDetails = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCustomerLoyalty();
      if (res && res.success) {
        if (res.account) setLoyaltyAccount(res.account);
        if (res.transactions) setTransactions(res.transactions);
        if (res.rules) setRules(res.rules);
      }
    } catch (err) {
      console.error('Failed to fetch customer loyalty details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    switch (tier) {
      case 'Royal': return { 
        bg: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #7c3aed 100%)', 
        border: '1px solid rgba(251, 191, 36, 0.4)', 
        badgeBg: '#fbbf24', 
        badgeText: '#1e1b4b', 
        nextTier: 'Max Tier Reached!', 
        nextThreshold: 1000 
      };
      case 'Gold': return { 
        bg: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)', 
        border: '1px solid rgba(254, 240, 138, 0.4)', 
        badgeBg: '#fef08a', 
        badgeText: '#78350f', 
        nextTier: 'Royal Tier', 
        nextThreshold: 1000 
      };
      case 'Silver': return { 
        bg: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)', 
        border: '1px solid rgba(226, 232, 240, 0.4)', 
        badgeBg: '#e2e8f0', 
        badgeText: '#0f172a', 
        nextTier: 'Gold Tier', 
        nextThreshold: 500 
      };
      default: return { 
        bg: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #b45309 100%)', 
        border: '1px solid rgba(254, 215, 170, 0.4)', 
        badgeBg: '#fed7aa', 
        badgeText: '#451a03', 
        nextTier: 'Silver Tier', 
        nextThreshold: 250 
      };
    }
  };

  const tierInfo = getTierInfo(loyaltyAccount.tier || 'Bronze');
  const pointsEarned = loyaltyAccount.total_points_earned || 0;
  const progressPercent = Math.min(100, Math.round((pointsEarned / tierInfo.nextThreshold) * 100));

  const handleCopyCard = () => {
    navigator.clipboard.writeText(loyaltyAccount.loyalty_card_number);
    setCopiedCardNo(true);
    setTimeout(() => setCopiedCardNo(false), 2000);
  };

  const handleClaimCheckin = async () => {
    if (checkinClaimed) return;
    try {
      const res = await apiService.claimDailyCheckin();
      if (res && res.success) {
        setCheckinClaimed(true);
        setCheckinStreak(prev => prev + 1);
        setLoyaltyAccount(prev => ({
          ...prev,
          current_points: res.newBalance || prev.current_points + 10,
          total_points_earned: prev.total_points_earned + 10
        }));
        setTransactions(prev => [
          {
            id: Date.now(),
            points: 10,
            transaction_type: 'BONUS',
            description: `Daily Check-In Reward (Streak Day ${checkinStreak + 1})`,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        showToast('🎉 +10 Daily Loyalty Points Claimed! Streak boosted.');
      }
    } catch (err) {
      showToast('Daily check-in completed!');
      setCheckinClaimed(true);
    }
  };

  const handleRedeemReward = async (reward) => {
    if (loyaltyAccount.current_points < reward.pointsCost) {
      showToast(`⚠️ You need ${reward.pointsCost - loyaltyAccount.current_points} more points to redeem this treat.`);
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await apiService.redeemLoyaltyReward(reward.title, reward.pointsCost, reward.code);
      const voucherCode = (res && res.voucherCode) ? res.voucherCode : (reward.code || `ROYAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
      
      setLoyaltyAccount(prev => ({
        ...prev,
        current_points: Math.max(0, prev.current_points - reward.pointsCost),
        total_points_redeemed: prev.total_points_redeemed + reward.pointsCost
      }));

      setUserVouchers(prev => [
        { id: Date.now(), title: reward.title, code: voucherCode, pointsCost: reward.pointsCost, isUsed: false },
        ...prev
      ]);

      setTransactions(prev => [
        {
          id: Date.now(),
          points: -reward.pointsCost,
          transaction_type: 'REDEEMED',
          description: `Redeemed: ${reward.title} (Voucher ${voucherCode})`,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);

      showToast(`🎁 Claimed "${reward.title}"! Voucher Code: ${voucherCode}`);
    } catch (err) {
      showToast('Failed to process redemption.');
    } finally {
      setRedeemingId(null);
    }
  };

  const handleClaimReferral = async () => {
    if (!referralInput.trim()) return;
    try {
      const res = await apiService.claimReferralCode(referralInput);
      if (res && res.success) {
        setLoyaltyAccount(prev => ({
          ...prev,
          current_points: res.newBalance || prev.current_points + 100,
          total_points_earned: prev.total_points_earned + 100
        }));
        setReferralSuccess(`✓ Referral Verified! +100 bonus points added.`);
        setReferralInput('');
        showToast('🌟 +100 Bonus Points added via referral!');
      } else {
        setReferralSuccess(res.message || 'Invalid referral code.');
      }
    } catch (err) {
      setReferralSuccess('Invalid code or connection issue.');
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Spend Calculator Computed Math
  const calculatedPointsEarned = Math.floor((spendAmount / 100) * rules.points_per_100_spent);

  // Available Marketplace Rewards Data
  const REWARDS_CATALOG = [
    { id: 101, title: '₹100 Off Instant Order Coupon', category: 'Coupons', pointsCost: 100, code: 'ROYAL-100-OFF', desc: 'Valid on any order above ₹300', icon: Percent },
    { id: 102, title: 'Free Luxury Chocolate Pastry', category: 'Treats', pointsCost: 200, code: 'FREE-PASTRY-PASS', desc: 'Redeem 1 slice of artisanal cake/pastry', icon: Gift },
    { id: 103, title: '₹250 Off Custom Celebration Cake', category: 'Coupons', pointsCost: 250, code: 'ROYAL-CAKE-250', desc: 'Valid on all custom tier & birthday cakes', icon: Award },
    { id: 104, title: 'Free Priority Doorstep Delivery Pass', category: 'Privileges', pointsCost: 150, code: 'FREE-DELIVERY-PASS', desc: 'Waives delivery charge on any order', icon: Zap },
    { id: 105, title: 'Exclusive Master Baker Tasting Box', category: 'VIP', pointsCost: 400, code: 'VIP-TASTING-BOX', desc: 'Quarterly box with 4 mini cake samples', icon: Trophy },
    { id: 106, title: '₹500 Grand Festival Discount', category: 'Coupons', pointsCost: 500, code: 'FESTIVAL-500-ROYAL', desc: 'Flat ₹500 discount for Royal tier members', icon: Sparkles }
  ];

  const filteredRewards = activeCategory === 'All' 
    ? REWARDS_CATALOG 
    : REWARDS_CATALOG.filter(r => r.category === activeCategory);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '90vh', padding: '35px 20px 60px 20px', fontFamily: 'var(--font-main, sans-serif)' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        {/* Toast Notification Alert */}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid #be185d',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <Sparkles size={18} color="#f472b6" /> {toastMsg}
          </div>
        )}

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fdf2f8', color: '#be185d', padding: '6px 18px', borderRadius: '25px', fontSize: '13px', fontWeight: '800', marginBottom: '12px', border: '1px solid #fbcfe8' }}>
            <Award size={16} /> Digital Loyalty & Customer Rewards Portal
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Smart Confectionery Digital Reward Card
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '650px', margin: '0 auto' }}>
            Say goodbye to physical paper cards! Your digital card is stored safely in your account, never gets lost, and automatically tracks points with every delicious bite.
          </p>
        </div>

        {/* TOP SECTION: Digital Card Flip Pass & Daily Streak */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '35px' }}>
          
          {/* DIGITAL CARD CONTAINER (Interactive 3D Flip) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Virtual Membership Pass
              </span>
              <button 
                onClick={() => setIsFlipped(!isFlipped)} 
                style={{ background: 'none', border: 'none', color: '#be185d', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCw size={14} /> {isFlipped ? 'Show Front' : 'Flip for Store QR Scan'}
              </button>
            </div>

            {/* CARD GRAPHIC */}
            <div style={{
              perspective: '1000px',
              minHeight: '230px'
            }}>
              <div style={{
                background: tierInfo.bg,
                border: tierInfo.border,
                borderRadius: '24px',
                padding: '28px',
                color: '#ffffff',
                boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.6s ease',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {!isFlipped ? (
                  /* FRONT OF DIGITAL CARD */
                  <div style={{ backfaceVisibility: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                      <div>
                        <span style={{ backgroundColor: tierInfo.badgeBg, color: tierInfo.badgeText, padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {loyaltyAccount.tier || 'Bronze'} Member
                        </span>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '10px 0 2px 0', letterSpacing: '-0.3px' }}>
                          Sweet Haven Royal Pass
                        </h2>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>Holder: {loyaltyAccount.customer_name || 'Valued Guest'}</span>
                      </div>

                      <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.12)', padding: '10px 16px', borderRadius: '14px', backdropFilter: 'blur(8px)' }}>
                        <span style={{ fontSize: '10px', opacity: 0.8, display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Balance</span>
                        <span style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff' }}>{loyaltyAccount.current_points}</span>
                        <span style={{ fontSize: '11px', display: 'block', color: '#fbcfe8', fontWeight: '700' }}>≈ ₹{(loyaltyAccount.current_points * rules.point_value_in_rs).toFixed(0)} Value</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <span style={{ fontSize: '10px', opacity: 0.7, display: 'block', textTransform: 'uppercase' }}>Digital Pass ID</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1.5px' }}>
                            {loyaltyAccount.loyalty_card_number}
                          </span>
                          <button onClick={handleCopyCard} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer' }} title="Copy Card Number">
                            {copiedCardNo ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={() => setShowWalletModal(true)}
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Smartphone size={14} /> Add to Mobile Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  /* BACK OF DIGITAL CARD (QR Code Scanner view) */
                  <div style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', textAlign: 'center', padding: '10px 0' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 6px 0', opacity: 0.9 }}>
                      In-Store Counter QR Scanner
                    </h4>
                    <p style={{ fontSize: '11px', opacity: 0.7, margin: '0 0 12px 0' }}>
                      Scan this code at bakery checkout counters to earn or redeem points instantly.
                    </p>
                    <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '14px', display: 'inline-block', marginBottom: '10px' }}>
                      {/* Simulating QR Code Graphic */}
                      <div style={{ width: '100px', height: '100px', background: 'radial-gradient(circle, #0f172a 40%, transparent 40%) 0 0/10px 10px, #ffffff', border: '3px solid #0f172a', borderRadius: '8px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={64} color="#0f172a" />
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.8, letterSpacing: '1px' }}>
                      SERIAL: {loyaltyAccount.loyalty_card_number}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tier Progress Bar */}
            <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#475569' }}>
                <span>Tier Progress: {pointsEarned} / {tierInfo.nextThreshold} Pts</span>
                <span style={{ color: '#be185d' }}>{tierInfo.nextTier} ({progressPercent}%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#be185d', borderRadius: '10px', transition: 'width 0.6s ease' }} />
              </div>
            </div>

          </div>

          {/* DAILY RETENTION STREAK PANEL */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ backgroundColor: '#fdf2f8', padding: '8px', borderRadius: '12px', color: '#be185d' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Daily Check-In Bonus</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Log in daily to boost your point streak!</span>
                  </div>
                </div>
                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  🔥 Day {checkinStreak} Streak
                </span>
              </div>

              {/* 7 Day Streak Calendar Graphic */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', margin: '20px 0' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isPast = day < checkinStreak;
                  const isCurrent = day === checkinStreak;
                  return (
                    <div 
                      key={day} 
                      style={{
                        textAlign: 'center',
                        padding: '10px 4px',
                        borderRadius: '12px',
                        backgroundColor: isPast ? '#fdf2f8' : (isCurrent ? '#be185d' : '#f8fafc'),
                        color: isPast ? '#be185d' : (isCurrent ? '#ffffff' : '#94a3b8'),
                        border: isCurrent ? '2px solid #be185d' : '1px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}
                    >
                      <div>D{day}</div>
                      <div style={{ fontSize: '12px', marginTop: '2px' }}>
                        {isPast ? '✓' : '+10'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <button 
                onClick={handleClaimCheckin}
                disabled={checkinClaimed}
                className="btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  backgroundColor: checkinClaimed ? '#e2e8f0' : '#be185d',
                  color: checkinClaimed ? '#64748b' : '#ffffff',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  cursor: checkinClaimed ? 'default' : 'pointer',
                  display: 'flex',
                  justify: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: checkinClaimed ? 'none' : '0 10px 20px -5px rgba(190, 24, 93, 0.4)'
                }}
              >
                {checkinClaimed ? (
                  <>
                    <CheckCircle size={18} color="#16a34a" /> Today's +10 Pts Bonus Claimed
                  </>
                ) : (
                  <>
                    <Zap size={18} /> Claim Today's +10 Pts Check-In Bonus
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* SPEND & POINTS CALCULATOR SLIDER */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', marginBottom: '35px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Calculator size={22} color="#be185d" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Interactive Spending Points Estimator
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                <span>Estimated Bakery Spend Amount:</span>
                <strong style={{ color: '#be185d', fontSize: '18px' }}>₹{spendAmount}</strong>
              </div>
              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="50" 
                value={spendAmount} 
                onChange={(e) => setSpendAmount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#be185d', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                <span>₹100</span>
                <span>₹2,500</span>
                <span>₹5,000</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#fdf2f8', padding: '20px', borderRadius: '16px', border: '1px solid #fbcfe8', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#9d174d', fontWeight: '700', textTransform: 'uppercase' }}>Points You Earn</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#be185d' }}>+{calculatedPointsEarned} Pts</div>
              </div>
              <div style={{ borderLeft: '1px dashed #fbcfe8', paddingLeft: '20px' }}>
                <span style={{ fontSize: '11px', color: '#9d174d', fontWeight: '700', textTransform: 'uppercase' }}>Instant Cash Value</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#be185d' }}>₹{calculatedPointsEarned} OFF</div>
              </div>
            </div>
          </div>
        </div>

        {/* REWARDS MARKETPLACE & INSTANT VOUCHER REDEMPTION */}
        <div style={{ marginBottom: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>
                Rewards Marketplace & Instant Vouchers
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                Redeem your digital points directly into exclusive confectionery discount codes.
              </p>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '14px' }}>
              {['All', 'Coupons', 'Treats', 'Privileges', 'VIP'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    backgroundColor: activeCategory === cat ? '#ffffff' : 'transparent',
                    color: activeCategory === cat ? '#be185d' : '#64748b',
                    boxShadow: activeCategory === cat ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredRewards.map(reward => {
              const IconComp = reward.icon;
              const isAffordable = loyaltyAccount.current_points >= reward.pointsCost;
              return (
                <div key={reward.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '22px',
                  border: isAffordable ? '1px solid #be185d' : '1px solid #e2e8f0',
                  boxShadow: isAffordable ? '0 10px 25px -5px rgba(190, 24, 93, 0.1)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  position: 'relative'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ backgroundColor: isAffordable ? '#fdf2f8' : '#f1f5f9', color: isAffordable ? '#be185d' : '#94a3b8', padding: '10px', borderRadius: '14px' }}>
                        <IconComp size={22} />
                      </div>
                      <span style={{ backgroundColor: isAffordable ? '#f0fdf4' : '#fef2f2', color: isAffordable ? '#16a34a' : '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                        {reward.pointsCost} Points Required
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                      {reward.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                      {reward.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRedeemReward(reward)}
                    disabled={!isAffordable || redeemingId === reward.id}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: isAffordable ? '#be185d' : '#e2e8f0',
                      color: isAffordable ? '#ffffff' : '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: isAffordable ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {redeemingId === reward.id ? 'Claiming...' : (isAffordable ? 'Redeem Voucher' : 'Insufficient Points')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE REDEEMED VOUCHERS DRAWER */}
        {userVouchers.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '25px', border: '1px dashed #be185d', marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={20} color="#be185d" /> Your Unlocked Active Voucher Codes ({userVouchers.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
              {userVouchers.map(v => (
                <div key={v.id} style={{ backgroundColor: '#fdf2f8', padding: '16px', borderRadius: '16px', border: '1px solid #fbcfe8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', display: 'block' }}>{v.title}</span>
                    <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '900', color: '#be185d', letterSpacing: '1px' }}>{v.code}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(v.code);
                      showToast(`Copied voucher code ${v.code}! Apply at checkout.`);
                    }}
                    style={{ backgroundColor: '#be185d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Copy Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REFERRAL PROGRAM BANNER */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '30px', color: '#ffffff', marginBottom: '35px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', color: '#fef08a', marginBottom: '10px' }}>
              <Share2 size={14} /> Invite Friends & Earn
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 6px 0' }}>
              Share Your Referral Link (+100 Points Each)
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.8, margin: 0, lineHeight: '1.5' }}>
              Gift your friends ₹100 off on their first cake order, and get 100 bonus points automatically credited to your digital card when they purchase!
            </p>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', opacity: 0.8, display: 'block', marginBottom: '6px' }}>Have a friend's referral code?</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter Referral Code" 
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px', fontWeight: '700' }}
              />
              <button 
                onClick={handleClaimReferral}
                style={{ backgroundColor: '#be185d', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
              >
                Claim
              </button>
            </div>
            {referralSuccess && (
              <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '700', marginTop: '6px', display: 'block' }}>
                {referralSuccess}
              </span>
            )}
          </div>
        </div>

        {/* REWARDS TRANSACTION HISTORY LOG */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              Points Activity & Audit Log
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              Showing last {transactions.length} transactions
            </span>
          </div>

          {transactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No rewards transactions logged yet. Place orders or claim daily check-ins!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                        {new Date(tx.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        {tx.description}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: tx.points > 0 ? '#f0fdf4' : '#fef2f2',
                          color: tx.points > 0 ? '#16a34a' : '#dc2626'
                        }}>
                          {tx.transaction_type || (tx.points > 0 ? 'EARNED' : 'REDEEMED')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '900', color: tx.points > 0 ? '#16a34a' : '#dc2626' }}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE WALLET PASS SIMULATOR MODAL */}
      {showWalletModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '420px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0' }}>
              📱 Mobile Wallet Pass Saved!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Your Sweet Haven Royal Pass has been linked to your digital account.
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Pass Name: <strong>Sweet Haven Confectionery Royal Pass</strong></div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Card Number: <strong style={{ fontFamily: 'monospace' }}>{loyaltyAccount.loyalty_card_number}</strong></div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Member Status: <strong style={{ color: '#be185d' }}>{loyaltyAccount.tier || 'Silver'} Member ({loyaltyAccount.current_points} Pts)</strong></div>
            </div>

            <button 
              onClick={() => setShowWalletModal(false)} 
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close Pass Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

