import React from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';
import ContactForm from './ContactForm';

export default function ContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
    >
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.35))',
          borderRadius: '20px',
          maxWidth: '500px',
          width: 'min(500px, 94vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem 1.5rem',
          boxShadow: 'var(--shadow-lg, 0 16px 40px rgba(42, 23, 16, 0.14))',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #6B5952)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%'
          }}
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: 'rgba(92, 19, 41, 0.08)',
            color: 'var(--burgundy-royal, #5C1329)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Mail size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading, serif)', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--chocolate-dark, #2A1710)' }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #6B5952)', margin: 0 }}>
            Have a catering query or custom order? Send us a message powered by Web3Forms.
          </p>
        </div>

        <ContactForm onClose={onClose} />
      </div>
    </div>
  );
}
