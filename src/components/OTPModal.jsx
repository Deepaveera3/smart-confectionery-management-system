import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Clock, RefreshCw, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function OTPModal({ 
  isOpen, 
  onClose, 
  email, 
  name = 'Valued Customer',
  purpose = 'SIGNUP_VERIFICATION', 
  onVerified, 
  title = 'Email Verification' 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen && email) {
      sendInitialOtp();
    }
  }, [isOpen, email]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendInitialOtp = async () => {
    setLoading(true);
    setSendingEmail(true);
    setError('');
    setSuccessMsg('Generating verification code...');

    try {
      // 1. Generate & record OTP in backend database
      const res = await apiService.sendOtp(email, purpose);
      if (!res.success) {
        setError(res.message || 'Failed to generate OTP code.');
        setLoading(false);
        setSendingEmail(false);
        return;
      }

      const currentOtp = res.otpCode || res.devOtpHint;

      // 2. Dispatch OTP via Web3Forms directly to the user's email
      const formData = new FormData();
      formData.append("access_key", res.web3FormsAccessKey || "431a9fb6-4abe-4943-a487-c954dfa174a0");
      formData.append("name", name || "Sweet Haven Customer");
      formData.append("email", email);
      formData.append("subject", `🍰 Sweet Haven Verification Code: ${currentOtp}`);
      formData.append(
        "message", 
        `Hello ${name || 'Valued Customer'}!\n\nYour One-Time Password (OTP) verification code for Sweet Haven Bakery is:\n\n${currentOtp}\n\nThis verification code is valid for 10 minutes.\n\nWarm regards,\nSweet Haven Confectionery Team`
      );
      formData.append("otp_code", currentOtp);
      formData.append("purpose", purpose);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`✉️ Verification code sent to ${email}! Please check your email inbox.`);
      } else {
        console.warn("Web3Forms response:", data);
        setSuccessMsg(`OTP sent to ${email}. Please check your inbox.`);
      }
    } catch (err) {
      console.error('OTP send error:', err);
      setError('Connection error while sending OTP.');
    } finally {
      setLoading(false);
      setSendingEmail(false);
    }
  };

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    await sendInitialOtp();
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiService.verifyOtp(email, fullOtp, purpose);
      if (res.success) {
        setSuccessMsg('Email verified successfully!');
        setTimeout(() => {
          onVerified(res.verificationToken || fullOtp);
          onClose();
        }, 1000);
      } else {
        setError(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setError('Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        padding: '32px',
        position: 'relative',
        animation: 'chatSlideIn 0.25s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            border: 'none',
            background: '#f1f5f9',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            color: '#5C1329',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px auto',
            border: '2px solid #D4AF37',
            boxShadow: '0 8px 20px rgba(92, 19, 41, 0.15)'
          }}>
            <ShieldCheck size={36} color="#5C1329" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#2A1710', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Enter the 6-digit code sent to your email <br />
            <strong style={{ color: '#5C1329', wordBreak: 'break-all' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {sendingEmail ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '25px' }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '46px',
                  height: '52px',
                  borderRadius: '12px',
                  border: digit ? '2px solid #5C1329' : '1px solid #cbd5e1',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#2A1710',
                  backgroundColor: digit ? '#fff5f7' : '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #5C1329 0%, #3D0919 100%)',
              color: '#D4AF37',
              fontWeight: '700',
              fontSize: '15px',
              cursor: loading || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
              opacity: loading || otp.join('').length < 6 ? 0.6 : 1,
              boxShadow: '0 8px 20px rgba(92, 19, 41, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Verifying OTP...' : 'Verify & Continue'}
          </button>
        </form>

        <div style={{
          marginTop: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={14} />
            <span>{canResend ? 'Code expired' : `Resend in ${timer}s`}</span>
          </div>

          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            style={{
              border: 'none',
              background: 'none',
              color: canResend ? '#5C1329' : '#94a3b8',
              fontWeight: '700',
              cursor: canResend ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Resend OTP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
