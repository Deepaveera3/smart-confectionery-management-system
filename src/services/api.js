// Sweet Haven Centralized REST API Service Helper

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api';

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

// Safe Fetch Wrapper to prevent frontend crashes on network/server errors
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    if (res.status === 405) {
      return {
        success: false,
        message: 'HTTP 405 Method Not Allowed: The API request was routed to static frontend instead of Express backend. Please set VITE_API_BASE_URL to your Express backend server URL.'
      };
    }
    return { success: res.ok, message: text || `HTTP Status ${res.status}` };
  } catch (err) {
    console.warn(`API connection note (${url}):`, err.message);
    return { success: false, message: 'Backend service unreachable.' };
  }
};

export const apiService = {
  // Auth APIs
  adminLogin: async (email, password) => {
    return safeFetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  customerLogin: async (email, password) => {
    return safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  getCurrentUser: async () => {
    return safeFetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
  },

  // Products APIs
  getPublicProducts: async () => {
    return safeFetch(`${API_BASE_URL}/products`);
  },

  getAdminProducts: async () => {
    return safeFetch(`${API_BASE_URL}/products/admin/all`, {
      headers: getHeaders()
    });
  },

  createProduct: async (productData) => {
    return safeFetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
  },

  updateProduct: async (id, productData) => {
    return safeFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return safeFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  toggleProductVisibility: async (id) => {
    return safeFetch(`${API_BASE_URL}/products/${id}/toggle-visibility`, {
      method: 'PATCH',
      headers: getHeaders()
    });
  },

  updateStock: async (id, stockQuantity) => {
    return safeFetch(`${API_BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stock_quantity: stockQuantity })
    });
  },

  // Categories APIs
  getCategories: async () => {
    return safeFetch(`${API_BASE_URL}/categories`);
  },

  createCategory: async (categoryData) => {
    return safeFetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
  },

  updateCategory: async (id, categoryData) => {
    return safeFetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });
  },

  deleteCategory: async (id) => {
    return safeFetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Orders APIs
  getAdminOrders: async () => {
    return safeFetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders()
    });
  },

  trackOrder: async (orderNumber) => {
    return safeFetch(`${API_BASE_URL}/orders/track/${orderNumber}`);
  },

  updateOrderStatus: async (id, status) => {
    return safeFetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ order_status: status })
    });
  },

  // Customers APIs
  getAdminCustomers: async () => {
    return safeFetch(`${API_BASE_URL}/admin/customers`, {
      headers: getHeaders()
    });
  },

  toggleCustomerStatus: async (id) => {
    return safeFetch(`${API_BASE_URL}/admin/customers/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders()
    });
  },

  // Loyalty APIs
  getAdminLoyalty: async () => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty`, {
      headers: getHeaders()
    });
  },

  adjustLoyaltyPoints: async (accountId, points, description) => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/adjust-points`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ loyaltyAccountId: accountId, points, description })
    });
  },

  // Offers APIs
  getOffers: async () => {
    return safeFetch(`${API_BASE_URL}/offers`);
  },

  getActiveOffers: async () => {
    return safeFetch(`${API_BASE_URL}/offers`);
  },

  getAdminCoupons: async () => {
    return safeFetch(`${API_BASE_URL}/offers/admin/all`, {
      headers: getHeaders()
    });
  },

  createCoupon: async (couponData) => {
    return safeFetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(couponData)
    });
  },

  deleteCoupon: async (id) => {
    return safeFetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Dashboard Metrics API
  getDashboardMetrics: async () => {
    return safeFetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
      headers: getHeaders()
    });
  },

  // Notifications APIs
  getNotifications: async () => {
    return safeFetch(`${API_BASE_URL}/admin/notifications`, {
      headers: getHeaders()
    });
  },

  markNotificationRead: async (id) => {
    return safeFetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
  },

  markAllNotificationsRead: async () => {
    return safeFetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  // STAGE 4: Customer Auth APIs
  customerSignup: async (signupData) => {
    return safeFetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
  },

  forgotPassword: async (email) => {
    return safeFetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (resetData) => {
    return safeFetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetData)
    });
  },

  // Customer Profile APIs
  getCustomerProfile: async () => {
    return safeFetch(`${API_BASE_URL}/customer/profile`, {
      headers: getHeaders()
    });
  },

  updateCustomerProfile: async (profileData) => {
    return safeFetch(`${API_BASE_URL}/customer/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
  },

  changePassword: async (passwordData) => {
    return safeFetch(`${API_BASE_URL}/customer/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData)
    });
  },

  // Delivery Addresses APIs
  getCustomerAddresses: async () => {
    return safeFetch(`${API_BASE_URL}/customer/addresses`, {
      headers: getHeaders()
    });
  },

  addCustomerAddress: async (addressData) => {
    return safeFetch(`${API_BASE_URL}/customer/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addressData)
    });
  },

  deleteCustomerAddress: async (id) => {
    return safeFetch(`${API_BASE_URL}/customer/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Cart APIs
  getCart: async () => {
    return safeFetch(`${API_BASE_URL}/cart`, {
      headers: getHeaders()
    });
  },

  addToCart: async (productId, quantity = 1) => {
    return safeFetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
  },

  updateCartQuantity: async (productId, quantity) => {
    return safeFetch(`${API_BASE_URL}/cart/update`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
  },

  removeFromCart: async (productId) => {
    return safeFetch(`${API_BASE_URL}/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  clearCart: async () => {
    return safeFetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Wishlist APIs
  getWishlist: async () => {
    return safeFetch(`${API_BASE_URL}/wishlist`, {
      headers: getHeaders()
    });
  },

  toggleWishlist: async (productId) => {
    return safeFetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId })
    });
  },

  removeFromWishlist: async (productId) => {
    return safeFetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Checkout & Customer Orders APIs
  placeOrder: async (orderData) => {
    return safeFetch(`${API_BASE_URL}/orders/place`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
  },

  getMyOrders: async () => {
    return safeFetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: getHeaders()
    });
  },

  getCustomerNotifications: async () => {
    return safeFetch(`${API_BASE_URL}/admin/notifications/customer`, {
      headers: getHeaders()
    });
  },

  // STAGE 5: OTP APIs
  sendOtp: async (email, purpose = 'SIGNUP_VERIFICATION') => {
    return safeFetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    });
  },

  verifyOtp: async (email, otpCode, purpose = 'SIGNUP_VERIFICATION') => {
    return safeFetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, purpose })
    });
  },

  // STAGE 5: Payment APIs
  initiatePayment: async (orderId, amount, paymentMethod) => {
    return safeFetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, amount, paymentMethod })
    });
  },

  verifyPayment: async (transactionId, orderId, paymentMethod, simulateStatus = 'Successful') => {
    return safeFetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId, orderId, paymentMethod, simulateStatus })
    });
  },

  cancelPayment: async (transactionId, orderId) => {
    return safeFetch(`${API_BASE_URL}/payments/cancel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId, orderId })
    });
  },

  retryPayment: async (orderId) => {
    return safeFetch(`${API_BASE_URL}/payments/retry`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId })
    });
  },

  getPaymentHistory: async () => {
    return safeFetch(`${API_BASE_URL}/payments/history`, {
      headers: getHeaders()
    });
  },

  getOrderInvoice: async (orderId) => {
    return safeFetch(`${API_BASE_URL}/orders/${orderId}/invoice`);
  },

  // STAGE 6: AI Recommendations
  getRecommendations: async (flavor = 'All', occasion = 'All', maxPrice = 2000) => {
    return safeFetch(`${API_BASE_URL}/recommendations?flavor=${encodeURIComponent(flavor)}&occasion=${encodeURIComponent(occasion)}&maxPrice=${maxPrice}`);
  },

  // STAGE 6: Customer & Admin Loyalty APIs
  getCustomerLoyalty: async () => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/customer`, {
      headers: getHeaders()
    });
  },

  getMyLoyaltyAccount: async () => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/customer`, {
      headers: getHeaders()
    });
  },

  getLoyaltyRules: async () => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/rules`, {
      headers: getHeaders()
    });
  },

  updateLoyaltyRules: async (rulesData) => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/rules`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(rulesData)
    });
  },

  claimDailyCheckin: async () => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/checkin`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  redeemLoyaltyReward: async (rewardTitle, pointsCost, couponCode) => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/redeem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rewardTitle, pointsCost, couponCode })
    });
  },

  claimReferralCode: async (referralCode) => {
    return safeFetch(`${API_BASE_URL}/admin/loyalty/referral`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ referralCode })
    });
  },

  // STAGE 6: Food Waste Management APIs
  getWasteAnalytics: async () => {
    return safeFetch(`${API_BASE_URL}/admin/waste/analytics`, {
      headers: getHeaders()
    });
  },

  applyFlashDiscount: async (productId, discountPercentage = 30) => {
    return safeFetch(`${API_BASE_URL}/admin/waste/apply-discount`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, discountPercentage })
    });
  },

  // STAGE 6: Analytics & Predictions APIs
  getSalesAnalytics: async () => {
    return safeFetch(`${API_BASE_URL}/admin/dashboard/sales-analytics`, {
      headers: getHeaders()
    });
  },

  getStockPredictions: async () => {
    return safeFetch(`${API_BASE_URL}/admin/dashboard/stock-predictions`, {
      headers: getHeaders()
    });
  }
};
