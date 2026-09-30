import React, { useState } from 'react';
import { Cake, Phone, Mail, MapPin, Award, Heart } from 'lucide-react';
import ContactModal from './ContactModal';

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="brand-logo" style={{ color: '#FFF' }}>
              <div className="brand-icon">
                <Cake size={24} />
              </div>
              <span style={{ color: 'var(--gold-primary)' }}>Sweet</span> Haven
            </div>
            <p>
              Smart Confectionery Management System — Crafted with royal elegance, premium ingredients, and intelligent customer recommendations for special celebrations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/products">Cakes & Desserts</a></li>
              <li><a href="/custom-cake">Custom Cake Studio</a></li>
              <li><a href="/loyalty">Digital Loyalty Club</a></li>
              <li><a href="/track">Live Food Order Tracking</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              <li><a href="/products?cat=cakes">Royal Belgian Cakes</a></li>
              <li><a href="/products?cat=chocolates">Cocoa Truffles</a></li>
              <li><a href="/products?cat=cupcakes">Velvet Cupcakes</a></li>
              <li><a href="/products?cat=brownies">Fudge Brownies</a></li>
              <li><a href="/products?cat=gift-boxes">Festival Gift Hampers</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="footer-title">Contact & Support</h4>
            <ul className="footer-links" style={{ gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--gold-primary)' }} />
                <span>Sweet Haven Bakery Suite, Heritage Plaza</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--gold-primary)' }} />
                <span>+91 98765 43210</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--gold-primary)' }} />
                <button
                  onClick={() => setContactOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  orders@sweethaven.com (Send Message)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="footer-contact-btn"
                  style={{
                    marginTop: '0.6rem',
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F3E0A3 50%, #B8860B 100%)',
                    color: '#2A1710',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ✉️ Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Sweet Haven — Smart Confectionery Management System. Final Year Academic Project.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Crafted with</span> <Heart size={14} fill="var(--gold-primary)" color="var(--gold-primary)" /> <span>for Academic Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
