// Sweet Haven Centralized REST API Service Helper

const API_BASE_URL = '/api';

// Helper to get Auth Headers
const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const authToken = token || localStorage.getItem('sweet_haven_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const apiService = {
  // Auth APIs
  adminLogin: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  customerLogin: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Products APIs
  getPublicProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    return res.json();
  },

  getAdminProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products/admin/all`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  toggleProductVisibility: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}/toggle-visibility`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  updateStock: async (id, stockQuantity) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stock_quantity: stockQuantity })
    });
    return res.json();
  },

  // Categories APIs
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/categories`);
    return res.json();
  },

  createCategory: async (categoryData) => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  updateCategory: async (id, categoryData) => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Orders APIs
  getAdminOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders()
    });
    return res.json();
  },

  trackOrder: async (orderNumber) => {
    const res = await fetch(`${API_BASE_URL}/orders/track/${orderNumber}`);
    return res.json();
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ order_status: status })
    });
    return res.json();
  },

  // Customers APIs
  getAdminCustomers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/customers`, {
      headers: getHeaders()
    });
    return res.json();
  },

  toggleCustomerStatus: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/customers/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  // Loyalty APIs
  getAdminLoyalty: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty`, {
      headers: getHeaders()
    });
    return res.json();
  },

  adjustLoyaltyPoints: async (accountId, points, description) => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/adjust-points`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ loyaltyAccountId: accountId, points, description })
    });
    return res.json();
  },

  // Offers APIs
  getOffers: async () => {
    const res = await fetch(`${API_BASE_URL}/offers`);
    return res.json();
  },

  getAdminCoupons: async () => {
    const res = await fetch(`${API_BASE_URL}/offers/admin/all`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createCoupon: async (couponData) => {
    const res = await fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(couponData)
    });
    return res.json();
  },

  deleteCoupon: async (id) => {
    const res = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Dashboard Metrics API
  getDashboardMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Notifications APIs
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
      headers: getHeaders()
    });
    return res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // STAGE 4: Customer Auth APIs
  customerSignup: async (signupData) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    return res.json();
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  resetPassword: async (resetData) => {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetData)
    });
    return res.json();
  },

  // Customer Profile APIs
  getCustomerProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/customer/profile`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateCustomerProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  changePassword: async (passwordData) => {
    const res = await fetch(`${API_BASE_URL}/customer/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData)
    });
    return res.json();
  },

  // Delivery Addresses APIs
  getCustomerAddresses: async () => {
    const res = await fetch(`${API_BASE_URL}/customer/addresses`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addCustomerAddress: async (addressData) => {
    const res = await fetch(`${API_BASE_URL}/customer/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addressData)
    });
    return res.json();
  },

  deleteCustomerAddress: async (id) => {
    const res = await fetch(`${API_BASE_URL}/customer/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Cart APIs
  getCart: async () => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addToCart: async (productId, quantity = 1) => {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  updateCartQuantity: async (productId, quantity) => {
    const res = await fetch(`${API_BASE_URL}/cart/update`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  removeFromCart: async (productId) => {
    const res = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  clearCart: async () => {
    const res = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Wishlist APIs
  getWishlist: async () => {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: getHeaders()
    });
    return res.json();
  },

  toggleWishlist: async (productId) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId })
    });
    return res.json();
  },

  removeFromWishlist: async (productId) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Checkout & Customer Orders APIs
  placeOrder: async (orderData) => {
    const res = await fetch(`${API_BASE_URL}/orders/place`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getCustomerNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/customer`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // STAGE 5: OTP APIs
  sendOtp: async (email, purpose = 'SIGNUP_VERIFICATION') => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    });
    return res.json();
  },

  verifyOtp: async (email, otpCode, purpose = 'SIGNUP_VERIFICATION') => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, purpose })
    });
    return res.json();
  },

  // STAGE 5: Payment APIs
  initiatePayment: async (orderId, amount, paymentMethod) => {
    const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, amount, paymentMethod })
    });
    return res.json();
  },

  verifyPayment: async (transactionId, orderId, paymentMethod, simulateStatus = 'Successful') => {
    const res = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId, orderId, paymentMethod, simulateStatus })
    });
    return res.json();
  },

  cancelPayment: async (transactionId, orderId) => {
    const res = await fetch(`${API_BASE_URL}/payments/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId, orderId })
    });
    return res.json();
  },

  retryPayment: async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/payments/retry`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId })
    });
    return res.json();
  },

  getPaymentHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/payments/history`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getOrderInvoice: async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`);
    return res.json();
  },

  // STAGE 6: AI Recommendations
  getRecommendations: async (flavor = 'All', occasion = 'All', maxPrice = 2000) => {
    const res = await fetch(`${API_BASE_URL}/recommendations?flavor=${encodeURIComponent(flavor)}&occasion=${encodeURIComponent(occasion)}&maxPrice=${maxPrice}`);
    return res.json();
  },

  // STAGE 6: Customer & Admin Loyalty APIs
  getCustomerLoyalty: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/customer`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getLoyaltyRules: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/rules`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateLoyaltyRules: async (rulesData) => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/rules`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(rulesData)
    });
    return res.json();
  },

  claimDailyCheckin: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/checkin`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  redeemLoyaltyReward: async (rewardTitle, pointsCost, couponCode) => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/redeem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rewardTitle, pointsCost, couponCode })
    });
    return res.json();
  },

  claimReferralCode: async (referralCode) => {
    const res = await fetch(`${API_BASE_URL}/admin/loyalty/referral`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ referralCode })
    });
    return res.json();
  },

  // STAGE 6: Food Waste Management APIs
  getWasteAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/waste/analytics`, {
      headers: getHeaders()
    });
    return res.json();
  },

  applyFlashDiscount: async (productId, discountPercentage = 30) => {
    const res = await fetch(`${API_BASE_URL}/admin/waste/apply-discount`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, discountPercentage })
    });
    return res.json();
  },

  // STAGE 6: Analytics & Predictions APIs
  getSalesAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/sales-analytics`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getStockPredictions: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/stock-predictions`, {
      headers: getHeaders()
    });
    return res.json();
  }
};
