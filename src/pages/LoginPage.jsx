import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, CheckCircle, ArrowRight, User, Phone, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';
import OTPModal from '../components/OTPModal';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('customer-login'); // 'customer-login' | 'customer-signup' | 'admin-login'
  const [email, setEmail] = useState('customer@sweethaven.com');
  const [password, setPassword] = useState('Admin@123');

  // Signup fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Verification Modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState('SIGNUP_VERIFICATION');

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const { setCustomerUser, refreshData } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'customer-signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      // Open OTP Verification Modal before finishing signup!
      setOtpPurpose('SIGNUP_VERIFICATION');
      setOtpModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'admin-login') {
        const res = await apiService.adminLogin(email, password);
        if (res.success && res.token) {
          localStorage.setItem('sweet_haven_token', res.token);
          localStorage.setItem('sweet_haven_user', JSON.stringify(res.user));
          setSuccessMsg('Admin Authentication Successful! Redirecting to Admin Portal...');
          setTimeout(() => navigate('/admin'), 1000);
        } else {
          setError(res.message || 'Invalid admin credentials.');
        }
      } else {
        // Customer Login
        const res = await apiService.customerLogin(email, password);
        if (res.success && res.token) {
          localStorage.setItem('sweet_haven_token', res.token);
          localStorage.setItem('sweet_haven_user', JSON.stringify(res.user));
          setCustomerUser(res.user);
          refreshData();
          setSuccessMsg('Welcome back to Sweet Haven!');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError(res.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setError('Connection error. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async (otpToken) => {
    setLoading(true);
    setError('');

    try {
      if (otpPurpose === 'SIGNUP_VERIFICATION') {
        const res = await apiService.customerSignup({
          name,
          email,
          phone,
          password,
          confirmPassword,
          otpCode: otpToken
        });

        if (res.success && res.token) {
          localStorage.setItem('sweet_haven_token', res.token);
          localStorage.setItem('sweet_haven_user', JSON.stringify(res.user));
          setCustomerUser(res.user);
          refreshData();
          setSuccessMsg('Account created & Email verified! Welcome to Sweet Haven.');
          setTimeout(() => navigate('/'), 1200);
        } else {
          setError(res.message || 'Failed to create account.');
        }
      } else if (otpPurpose === 'FORGOT_PASSWORD') {
        setSuccessMsg('Email verified. You can now reset your password.');
      }
    } catch (err) {
      setError('Failed to complete action after OTP verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await apiService.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotModalOpen(false);
        setEmail(forgotEmail);
        setOtpPurpose('FORGOT_PASSWORD');
        setOtpModalOpen(true);
      } else {
        alert(res.message || 'Failed to send reset code.');
      }
    } catch (err) {
      alert('Failed to process reset request.');
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '78vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-gold)',
        boxShadow: 'var(--shadow-card)',
        padding: '2.5rem 2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem' }}>
            {activeTab === 'admin-login' && 'Admin Portal Access'}
            {activeTab === 'customer-signup' && 'Create Verified Account'}
            {activeTab === 'customer-login' && 'Customer Sign In'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {activeTab === 'admin-login' && 'Protected operational management system'}
            {activeTab === 'customer-signup' && 'Sign up with Email OTP verification to earn 50 welcome points'}
            {activeTab === 'customer-login' && 'Sign in to access your orders, cart, wishlist & loyalty rewards'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-cream-soft)', borderRadius: 'var(--radius-full)', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <button 
            className="btn"
            style={{ 
              flex: 1, 
              borderRadius: 'var(--radius-full)', 
              background: activeTab === 'customer-login' ? 'var(--burgundy-royal)' : 'transparent',
              color: activeTab === 'customer-login' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.45rem 0.5rem'
            }}
            onClick={() => { setActiveTab('customer-login'); setEmail('customer@sweethaven.com'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            className="btn"
            style={{ 
              flex: 1, 
              borderRadius: 'var(--radius-full)', 
              background: activeTab === 'customer-signup' ? 'var(--burgundy-royal)' : 'transparent',
              color: activeTab === 'customer-signup' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.45rem 0.5rem'
            }}
            onClick={() => { setActiveTab('customer-signup'); setEmail(''); setError(''); }}
          >
            Register (OTP)
          </button>
          <button 
            className="btn"
            style={{ 
              flex: 1, 
              borderRadius: 'var(--radius-full)', 
              background: activeTab === 'admin-login' ? 'var(--burgundy-royal)' : 'transparent',
              color: activeTab === 'admin-login' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.45rem 0.5rem'
            }}
            onClick={() => { setActiveTab('admin-login'); setEmail('admin@sweethaven.com'); setError(''); }}
          >
            Admin
          </button>
        </div>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeTab === 'customer-signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.25rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.25rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
            </div>
          </div>

          {activeTab === 'customer-signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.25rem' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.25rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
            </div>
          </div>

          {activeTab === 'customer-signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.25rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
              </div>
            </div>
          )}

          {activeTab === 'customer-login' && (
            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={() => setForgotModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--burgundy-royal)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? 'Processing...' : (
              <>
                {activeTab === 'customer-signup' ? 'Verify Email & Create Account' : 'Sign In'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {activeTab === 'admin-login' ? (
            <span>Demo Admin Credentials: <strong>admin@sweethaven.com</strong> / <strong>Admin@123</strong></span>
          ) : (
            <span>Demo Customer Credentials: <strong>customer@sweethaven.com</strong> / <strong>Admin@123</strong></span>
          )}
        </div>
      </div>

      {/* Email OTP Verification Modal */}
      <OTPModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        email={email}
        purpose={otpPurpose}
        onVerified={handleOtpVerified}
        title={otpPurpose === 'SIGNUP_VERIFICATION' ? 'Customer Signup Email OTP' : 'Reset Password Email OTP'}
      />

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '400px', width: '100%', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', margin: 0 }}>Reset Password via OTP</h3>
              <button onClick={() => setForgotModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter your email address to receive a secure 6-digit OTP code.</p>
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="email@example.com" style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Email OTP Code</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
