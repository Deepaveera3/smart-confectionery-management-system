import React, { useState, useEffect } from 'react';
import { User, MapPin, Lock, Award, Package, Plus, Trash2, Edit3, CheckCircle, ShieldAlert, Check, Truck, Tag, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';
import AIRecommendationSection from '../components/AIRecommendationSection';

export default function ProfilePage() {
  const { customerUser, setCustomerUser, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'details' | 'orders' | 'addresses' | 'password' | 'loyalty'
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
  const [loyaltyData, setLoyaltyData] = useState({ current_points: 150, tier: 'Silver', loyalty_card_number: 'SH-ROYAL-9842-2026' });
  const [myOrders, setMyOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Form States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Add Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    is_default: 1
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchProfile = async () => {
    try {
      const res = await apiService.getCustomerProfile();
      if (res && res.success) {
        if (res.user) {
          setProfileData(res.user);
          setEditName(res.user.name || '');
          setEditPhone(res.user.phone || '');
        }
        if (res.loyalty) setLoyaltyData(res.loyalty);
        if (res.addresses) setAddresses(res.addresses);
      }
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await apiService.getMyOrders();
      if (res && res.success) {
        setMyOrders(res.orders || []);
      }
    } catch (err) {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.updateCustomerProfile({ name: editName, phone: editPhone });
      if (res.success) {
        showMsg('Profile details updated successfully!');
        setCustomerUser(prev => prev ? { ...prev, name: editName, phone: editPhone } : null);
        fetchProfile();
      } else {
        showMsg(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showMsg('Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showMsg('New passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.changePassword({ oldPassword, newPassword });
      if (res.success) {
        showMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        showMsg(res.message || 'Failed to change password.', 'error');
      }
    } catch (err) {
      showMsg('Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.addCustomerAddress(newAddress);
      if (res.success) {
        showMsg('New delivery address saved!');
        setShowAddressModal(false);
        fetchProfile();
      } else {
        showMsg(res.message || 'Failed to save address.', 'error');
      }
    } catch (err) {
      showMsg('Failed to save address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await apiService.deleteCustomerAddress(id);
      if (res.success) {
        showMsg('Address deleted.');
        fetchProfile();
      }
    } catch (err) {
      showMsg('Failed to delete address.', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="section-subtitle">Customer Account Portal</span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--chocolate-dark)', margin: 0 }}>
          My Sweet Haven Dashboard
        </h1>
      </div>

      {message && (
        <div style={{
          background: message.type === 'error' ? '#f8d7da' : '#d4edda',
          color: message.type === 'error' ? '#721c24' : '#155724',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          {message.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
        {/* Sidebar Tabs */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', height: 'fit-content' }}>
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <User size={18} /> Overview Hub
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} /> My Orders ({myOrders.length})
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <User size={18} /> Personal Details
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={18} /> Delivery Address Book
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={18} /> Security & Password
          </button>
          <Link 
            to="/loyalty"
            className="admin-nav-item"
            style={{ textDecoration: 'none' }}
          >
            <Award size={18} /> Loyalty Club ({loyaltyData.current_points || 150} pts)
          </Link>
        </div>

        {/* Content Area */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
          
          {/* TAB 0: CUSTOMER OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Customer Profile & Digital Loyalty Card Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#be185d', textTransform: 'uppercase' }}>Profile Summary</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 8px 0' }}>{profileData.name || customerUser?.name || 'Valued Customer'}</h3>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>✉️ {profileData.email || customerUser?.email}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>📱 {profileData.phone || '+91 98765 43210'}</p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', padding: '20px', borderRadius: '16px', color: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase' }}>Digital Loyalty Card</span>
                    <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>{loyaltyData.tier || 'Silver'} Member</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', margin: '8px 0 2px 0' }}>{loyaltyData.current_points || 150} Points</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Card: {loyaltyData.loyalty_card_number || 'SH-ROYAL-9842-2026'}</div>
                  <Link to="/loyalty" style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
                    View Full Loyalty Perks & History <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Active Coupons List */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={18} color="#be185d" /> Available Discount Coupons
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { code: 'WELCOME100', disc: '₹100 OFF', desc: 'Min order ₹799' },
                    { code: 'ROYAL50', disc: '₹50 OFF', desc: 'Min order ₹399' },
                    { code: 'SWEET10', disc: '10% OFF', desc: 'Min order ₹499' }
                  ].map(c => (
                    <div key={c.code} style={{ backgroundColor: '#fdf2f8', border: '1px dashed #be185d', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#be185d', display: 'block' }}>{c.code}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{c.disc}</span>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Shortcut Table */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Orders</h4>
                  <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }} onClick={() => setActiveTab('orders')}>View All</button>
                </div>

                {myOrders.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>No recent orders found.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Order #</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.slice(0, 3).map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{o.order_number}</td>
                          <td style={{ padding: '10px', fontSize: '13px', fontWeight: '700', color: '#be185d' }}>₹{o.final_amount}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                              {o.order_status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <Link to={`/track?order=${o.order_number}`} style={{ fontSize: '12px', fontWeight: '700', color: '#be185d', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={14} /> Track
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'details' && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', marginBottom: '1.5rem' }}>Personal Information</h3>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Full Name</label>
                  <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Email Address (Read Only)</label>
                  <input type="email" readOnly value={profileData.email} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--bg-cream-soft)', color: 'var(--text-muted)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.95rem' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content', padding: '0.7rem 1.5rem', marginTop: '0.5rem' }}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS LIST */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', marginBottom: '1.5rem' }}>My Complete Order History</h3>
              {myOrders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No order history found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {myOrders.map(o => (
                    <div key={o.id} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Order #{o.order_number}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{o.product_name || 'Confectionery Items'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Placed on: {new Date(o.created_at || Date.now()).toLocaleDateString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#be185d' }}>₹{o.final_amount}</div>
                        <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'inline-block', margin: '4px 0' }}>
                          {o.order_status}
                        </span>
                        <div>
                          <Link to={`/track?order=${o.order_number}`} style={{ fontSize: '12px', fontWeight: '700', color: '#be185d', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Truck size={14} /> Track Order
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DELIVERY ADDRESS BOOK */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', margin: 0 }}>Saved Delivery Addresses</h3>
                <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowAddressModal(true)}>
                  <Plus size={16} /> Add Address
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {addresses.map(a => (
                  <div key={a.id} style={{ background: 'var(--bg-cream-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', padding: '1.25rem', position: 'relative' }}>
                    {a.is_default === 1 && (
                      <span style={{ background: 'var(--burgundy-royal)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700, position: 'absolute', top: '12px', right: '12px' }}>
                        Default
                      </span>
                    )}
                    <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)', marginBottom: '0.25rem' }}>{a.full_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{a.phone}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>{a.address_line1} {a.address_line2}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{a.city}, {a.state} - {a.pincode}</div>

                    <button 
                      className="btn btn-outline"
                      style={{ marginTop: '1rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: '#c0392b', borderColor: '#c0392b' }}
                      onClick={() => handleDeleteAddress(a.id)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', marginBottom: '1.5rem' }}>Change Security Password</h3>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '450px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Current Password</label>
                  <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.95rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>Confirm New Password</label>
                  <input type="password" required value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.95rem' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content', padding: '0.7rem 1.5rem', marginTop: '0.5rem' }}>
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '480px', width: '100%', border: '1px solid var(--border-gold)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', marginBottom: '1.25rem' }}>Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" required value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} placeholder="Full Recipient Name" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              <input type="tel" required value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="Contact Phone Number" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              <input type="text" required value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} placeholder="House / Flat / Street Address" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              <input type="text" value={newAddress.address_line2} onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })} placeholder="Landmark / Area (Optional)" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="City" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                <input type="text" required value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} placeholder="Pincode" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Address</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddressModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
