import React from 'react';
import { Cake, Phone, Mail, MapPin, Award, Heart } from 'lucide-react';

export default function Footer() {
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
              <li><a href="/admin">Admin Control Dashboard</a></li>
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
                <span>orders@sweethaven.com</span>
              </li>
            </ul>
          </div>
        </div>

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
