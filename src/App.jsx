import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OffersPage from './pages/OffersPage';
import RecommendationsPage from './pages/RecommendationsPage';
import CustomCakePage from './pages/CustomCakePage';
import LoyaltyPage from './pages/LoyaltyPage';
import TrackPage from './pages/TrackPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// STAGE 5: Payment Pages & History Imports
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';

import { CartProvider, useCart } from './context/CartContext';

function AppContent() {
  const { addToCart } = useCart();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
          <Route path="/products" element={<ProductsPage onAddToCart={addToCart} />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/recommendations" element={<RecommendationsPage onAddToCart={addToCart} />} />
          <Route path="/custom-cake" element={<CustomCakePage />} />
          <Route path="/loyalty" element={<LoyaltyPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* STAGE 5: Payment & Order Tracking Routes */}
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/payment/success/:orderId" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure/:orderId" element={<PaymentFailurePage />} />
          <Route path="/payment/cancelled/:orderId" element={<PaymentCancelledPage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}
