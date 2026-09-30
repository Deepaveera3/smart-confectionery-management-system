import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ContactForm({ onClose }) {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setResult('');

    try {
      const formData = new FormData(event.target);
      formData.append('access_key', '431a9fb6-4abe-4943-a487-c954dfa174a0');
      formData.append('subject', '🍰 New Message from Sweet Haven Customer');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setResult('Thank you! Your message has been sent successfully. We will get back to you shortly.');
        event.target.reset();
      } else {
        setStatus('error');
        setResult(data.message || 'Error sending message. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setResult('Network error. Please try again later.');
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          Your Name
        </label>
        <input 
          type="text" 
          name="name" 
          placeholder="e.g. Eleanor Vance" 
          required 
          className="form-input" 
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          Email Address
        </label>
        <input 
          type="email" 
          name="email" 
          placeholder="you@example.com" 
          required 
          className="form-input" 
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          Message / Special Request
        </label>
        <textarea 
          name="message" 
          rows={4} 
          placeholder="Tell us about your catering query, custom order, or feedback..." 
          required 
          className="form-input" 
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', resize: 'vertical' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={status === 'loading'}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          padding: '0.85rem 1.5rem', 
          borderRadius: '12px', 
          fontWeight: 700, 
          fontSize: '0.95rem',
          marginTop: '0.5rem',
          background: 'linear-gradient(135deg, var(--burgundy-royal, #5C1329) 0%, #831843 100%)',
          color: '#FDF9F3',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 4px 15px rgba(92, 19, 41, 0.25)',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          if (status !== 'loading') e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          if (status !== 'loading') e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {status === 'loading' ? (
          <>
            <Loader size={18} className="animate-spin" />
            Sending Message...
          </>
        ) : (
          <>
            <Send size={18} />
            Send to Sweet Haven
          </>
        )}
      </button>

      {result && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          backgroundColor: status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: status === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${status === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{result}</span>
        </div>
      )}
    </form>
  );
}
