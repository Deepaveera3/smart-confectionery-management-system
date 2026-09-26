import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Cake, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X,
  Search,
  Package,
  LogOut,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ onOpenSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { cartItems, wishlistItems, customerUser, setCustomerUser } = useCart();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const handleLogout = () => {
    localStorage.removeItem('sweet_haven_token');
    localStorage.removeItem('sweet_haven_user');
    setCustomerUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Cake size={24} />
          </div>
          <div>
            <span style={{ color: 'var(--burgundy-royal)' }}>Sweet</span>
            <span style={{ color: 'var(--chocolate-dark)', fontWeight: 400 }}>Haven</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/offers" className={`nav-link ${isActive('/offers') ? 'active' : ''}`}>
                Offers
              </Link>
            </li>
            <li>
              <Link to="/recommendations" className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} style={{ color: 'var(--gold-primary)' }} /> AI Picks
                </span>
              </Link>
            </li>
            <li>
              <Link to="/custom-cake" className={`nav-link ${isActive('/custom-cake') ? 'active' : ''}`}>
                Custom Cake
              </Link>
            </li>
            <li>
              <Link to="/loyalty" className={`nav-link ${isActive('/loyalty') ? 'active' : ''}`}>
                Loyalty
              </Link>
            </li>
            <li>
              <Link to="/track" className={`nav-link ${isActive('/track') ? 'active' : ''}`}>
                Track Order
              </Link>
            </li>
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          {onOpenSearch && (
            <button className="icon-btn" onClick={onOpenSearch} title="Search Products">
              <Search size={18} />
            </button>
          )}

          {/* Customer / Admin Notification Center */}
          <NotificationCenter isAdmin={false} />

          <Link to="/wishlist" className="icon-btn" title="Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="icon-btn" title="Shopping Cart">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {customerUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link to="/profile" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserCheck size={15} /> {customerUser.name?.split(' ')[0] || 'Profile'}
              </Link>
              <Link to="/my-orders" className="icon-btn" title="My Orders">
                <Package size={18} />
              </Link>
              <Link to="/payment-history" className="icon-btn" title="Payment History">
                <CreditCard size={18} />
              </Link>
              <button onClick={handleLogout} className="icon-btn" title="Sign Out">
                <LogOut size={16} style={{ color: '#c0392b' }} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="icon-btn" title="Sign In">
              <User size={18} />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="icon-btn mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <ul className="mobile-nav-list">
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><Link to="/products" onClick={() => setMobileMenuOpen(false)}>Products Catalog</Link></li>
            <li><Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Shopping Cart ({cartCount})</Link></li>
            <li><Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist ({wishlistCount})</Link></li>
            {customerUser && <li><Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link></li>}
            {customerUser && <li><Link to="/payment-history" onClick={() => setMobileMenuOpen(false)}>Payment History</Link></li>}
            {customerUser && <li><Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Customer Profile</Link></li>}
            <li><Link to="/offers" onClick={() => setMobileMenuOpen(false)}>Special Offers</Link></li>
            <li><Link to="/track" onClick={() => setMobileMenuOpen(false)}>Live Order Tracking</Link></li>
            {!customerUser ? (
              <li><Link to="/login" onClick={() => setMobileMenuOpen(false)}>Customer Sign In / Sign Up</Link></li>
            ) : (
              <li><button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ border: 'none', background: 'transparent', color: '#c0392b', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Sign Out ({customerUser.name})</button></li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
