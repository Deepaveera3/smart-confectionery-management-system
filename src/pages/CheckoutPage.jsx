import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';
import DeliveryLocationPicker from '../components/DeliveryLocationPicker';

export default function CheckoutPage() {
  const { cartItems, subtotal, deliveryFee, clearCart } = useCart();
  const navigate = useNavigate();

  // Saved Addresses
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      full_name: 'Priyanga M.',
      phone: '+91 98765 43210',
      address_line1: 'Heritage Plaza, Suite 402',
      address_line2: 'High Street, Near Central Park',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      is_default: 1
    }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState(1);

  // New Address Form toggle
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: 'Priyanga M.',
    phone: '+91 98765 43210',
    address_line1: '',
    address_line2: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001'
  });

  const [deliveryInstructions, setDeliveryInstructions] = useState('Please handle fragile cake box with care.');
  const [paymentMethod, setPaymentMethod] = useState('Online / Sandbox Gateway'); // 'Online / Sandbox Gateway' | 'Cash on Delivery'

  // Coupon & Loyalty Discounts
  const [couponCode, setCouponCode] = useState('WELCOME100');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponDiscount, setCouponDiscount] = useState(100);

  const [loyaltyPoints, setLoyaltyPoints] = useState(150);
  const [redeemPoints, setRedeemPoints] = useState(50); // 50 pts = ₹50 discount

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cartItems.length === 0) {
      navigate('/cart');
    } else {
      fetchAddressesAndLoyalty();
    }
  }, [cartItems]);

  const fetchAddressesAndLoyalty = async () => {
    try {
      const res = await apiService.getCustomerProfile();
      if (res && res.success) {
        if (res.addresses && res.addresses.length > 0) {
          setAddresses(res.addresses);
          setSelectedAddressId(res.addresses[0].id);
        }
        if (res.loyalty) {
          setLoyaltyPoints(res.loyalty.current_points || 150);
        }
      }
    } catch (err) {}
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await apiService.getOffers();
      if (res && res.success && res.coupons) {
        const match = res.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
        if (match) {
          const disc = match.discount_type === 'percentage' 
            ? Math.round(subtotal * (match.discount_value / 100))
            : match.discount_value;
          setCouponDiscount(disc);
          setCouponApplied(true);
        } else {
          setErrorMsg('Invalid coupon code.');
        }
      } else {
        setCouponDiscount(100);
        setCouponApplied(true);
      }
    } catch (err) {
      setCouponDiscount(100);
      setCouponApplied(true);
    }
  };

  // Final Total Computation
  const activeCouponDisc = couponApplied ? couponDiscount : 0;
  const activeLoyaltyDisc = Math.min(redeemPoints, loyaltyPoints);
  const finalPayableTotal = Math.max(0, subtotal - activeCouponDisc - activeLoyaltyDisc + deliveryFee);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setErrorMsg('');

    let activeAddressObj = addresses.find(a => a.id === selectedAddressId);
    if (showNewAddressForm || !activeAddressObj) {
      activeAddressObj = newAddr;
    }

    try {
      const orderPayload = {
        items: cartItems,
        delivery_address: activeAddressObj,
        delivery_instructions: deliveryInstructions,
        coupon_code: couponApplied ? couponCode : '',
        discount_amount: activeCouponDisc,
        loyalty_points_redeemed: activeLoyaltyDisc,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod
      };

      const res = await apiService.placeOrder(orderPayload);
      if (res && res.success) {
        clearCart();

        if (paymentMethod === 'Cash on Delivery') {
          navigate(`/order-success/${res.orderNumber}`, { state: { orderDetails: res } });
        } else {
          // Redirect to Interactive Payment Gateway Portal
          navigate(`/payment/${res.orderId || 1}`, {
            state: {
              finalAmount: res.finalAmount || finalPayableTotal,
              orderNumber: res.orderNumber,
              orderId: res.orderId
            }
          });
        }
      } else {
        setErrorMsg(res.message || 'Failed to initiate order.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="section-subtitle">Secure Checkout</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--chocolate-dark)', margin: 0 }}>
          Order & Delivery Details
        </h1>
      </div>

      {errorMsg && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Left Column: Delivery Address & Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Step 1: Delivery Address */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} /> 1. Delivery Address Selection
            </h3>

            {!showNewAddressForm ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {addresses.map(a => (
                    <div 
                      key={a.id}
                      onClick={() => setSelectedAddressId(a.id)}
                      style={{
                        background: selectedAddressId === a.id ? 'var(--bg-cream-soft)' : '#fff',
                        border: selectedAddressId === a.id ? '2px solid var(--burgundy-royal)' : '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>{a.full_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.phone}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginTop: '0.35rem' }}>{a.address_line1} {a.address_line2}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.city}, {a.state} - {a.pincode}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }} onClick={() => setShowNewAddressForm(true)}>
                  <Plus size={15} /> Add New Delivery Address
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <DeliveryLocationPicker 
                  defaultAddress={newAddr.address_line1}
                  onLocationSelect={({ coords, address }) => {
                    setNewAddr(prev => ({
                      ...prev,
                      address_line1: address || prev.address_line1
                    }));
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <input type="text" placeholder="Recipient Name" value={newAddr.full_name} onChange={e => setNewAddr({ ...newAddr, full_name: e.target.value })} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  <input type="tel" placeholder="Phone Number" value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <input type="text" placeholder="Flat / House / Street Address" value={newAddr.address_line1} onChange={e => setNewAddr({ ...newAddr, address_line1: e.target.value })} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <input type="text" placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  <input type="text" placeholder="State" value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  <input type="text" placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <button className="btn btn-outline" style={{ width: 'fit-content', fontSize: '0.8rem' }} onClick={() => setShowNewAddressForm(false)}>
                  Use Saved Addresses
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Delivery Instructions & Payment Gateway */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} /> 2. Special Instructions & Payment Gateway Selection
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Delivery Instructions / Cake Message</label>
              <textarea 
                rows="2" 
                value={deliveryInstructions} 
                onChange={e => setDeliveryInstructions(e.target.value)} 
                placeholder="Write custom instructions for our delivery executive or cake piping message..." 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.5rem' }}>Payment Option</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-cream-soft)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', cursor: 'pointer', flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="radio" name="payMethod" checked={paymentMethod === 'Online / Sandbox Gateway'} onChange={() => setPaymentMethod('Online / Sandbox Gateway')} /> Online Gateway (UPI / Card / NetBanking)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-cream-soft)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', cursor: 'pointer', flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="radio" name="payMethod" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} /> Cash on Delivery
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary, Coupons & Loyalty Redemption */}
        <div style={{ height: 'fit-content' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', padding: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              Order Summary
            </h3>

            {/* Items Thumbnails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', maxHeight: '160px', overflowY: 'auto' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--chocolate-dark)', fontWeight: 600 }}>{item.name} (x{item.quantity})</span>
                  <span style={{ fontWeight: 700 }}>₹{Math.round(item.price * (1 - (item.discount || 0) / 100)) * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Application Box */}
            <div style={{ marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-gold)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Promo Code / Coupon</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                  placeholder="COUPON CODE" 
                  style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: 700 }} 
                />
                <button className="btn btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>
              {couponApplied && (
                <div style={{ fontSize: '0.78rem', color: '#27ae60', fontWeight: 600, marginTop: '0.35rem' }}>
                  ✓ Coupon "{couponCode}" Applied (₹{couponDiscount} OFF)
                </div>
              )}
            </div>

            {/* Loyalty Points Redemption Box */}
            <div style={{ marginBottom: '1.25rem', background: 'var(--bg-cream-soft)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'var(--burgundy-royal)' }}>
                <span><Award size={15} inline /> Royal Loyalty Points</span>
                <span>Balance: {loyaltyPoints} pts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="number" 
                  max={loyaltyPoints} 
                  value={redeemPoints} 
                  onChange={e => setRedeemPoints(Math.min(loyaltyPoints, Math.max(0, parseInt(e.target.value || 0))))} 
                  style={{ width: '80px', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: 700 }} 
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>pts = <strong>-₹{redeemPoints} OFF</strong></span>
              </div>
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60', fontWeight: 600 }}>
                  <span>Coupon Discount</span>
                  <span>-₹{activeCouponDisc}</span>
                </div>
              )}
              {redeemPoints > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60', fontWeight: 600 }}>
                  <span>Loyalty Points Discount</span>
                  <span>-₹{activeLoyaltyDisc}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#27ae60' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
            </div>

            {/* Final Payable */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid var(--border-gold)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>Final Payable</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--burgundy-royal)' }}>₹{finalPayableTotal}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Initiating Order...' : (
                <>
                  Proceed to Payment <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
