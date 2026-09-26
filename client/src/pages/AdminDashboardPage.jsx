import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Folders, 
  Boxes, 
  ShoppingBag, 
  Users, 
  Tag, 
  Award, 
  Bell, 
  LogOut, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  RefreshCw, 
  Filter, 
  Check, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Lock,
  Mail,
  UserCheck,
  Phone,
  PhoneCall,
  Download,
  Sparkles,
  Flame,
  Layers,
  PieChart,
  BarChart2,
  Printer,
  FileText
} from 'lucide-react';
import { apiService } from '../services/api';

export default function AdminDashboardPage() {
  // Authentication State
  const [adminUser, setAdminUser] = useState(null);
  const [authToken, setAuthToken] = useState('');
  const [loginEmail, setLoginEmail] = useState('deepaveera3slm@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'products' | 'categories' | 'inventory' | 'orders' | 'customers' | 'offers' | 'loyalty' | 'notifications'

  // Global Data States
  const [metrics, setMetrics] = useState({
    totalProducts: 10,
    totalOrders: 24,
    totalCustomers: 18,
    todaysSales: 4890.00,
    totalRevenue: 34850.00,
    pendingOrders: 5,
    lowStockCount: 2
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  // STAGE 6: Advanced Analytics & Management States
  const [wasteData, setWasteData] = useState({
    summary: { expiringProductsCount: 3, unsoldProductsCount: 5, wastedQuantity: 18, wastePercentage: 4.2, estimatedLoss: 4850.00 },
    expiringItems: [
      { id: 1, name: 'Royal Red Velvet Cake', stock_quantity: 4, days_to_expiry: 2, price: 799.00, discount: 5, category: 'Cakes', status: 'Expiring Soon' },
      { id: 6, name: 'Assorted Gourmet Cupcake Box', stock_quantity: 6, days_to_expiry: 1, price: 449.00, discount: 10, category: 'Cupcakes', status: 'Near Expiry' },
      { id: 7, name: 'Choco Chunk Butter Cookies', stock_quantity: 8, days_to_expiry: 3, price: 299.00, discount: 5, category: 'Cookies', status: 'Watchlist' }
    ],
    wasteReports: {
      daily: [
        { date: '2026-08-18', wasted_units: 3, loss_amount: 890.00, reason: 'Shelf Life Expiry' },
        { date: '2026-08-17', wasted_units: 4, loss_amount: 1120.00, reason: 'Baking Overproduction' }
      ],
      monthly: [
        { month: 'August 2026', wasted_units: 18, total_loss: 4850.00, waste_rate: '4.2%' }
      ]
    },
    aiRecommendations: [
      { id: 'rec_1', title: 'Apply 30% Flash Discount', description: 'Apply 30% discount to Red Velvet Cake & Cupcake Boxes expiring within 48h to liquidate inventory.', actionType: 'APPLY_DISCOUNT', targetProductId: 2 },
      { id: 'rec_2', title: 'Reduce Daily Production Batch', description: 'Decrease morning baking limit by 20% for slow-moving pastries to avoid overproduction.', actionType: 'REDUCE_PRODUCTION' },
      { id: 'rec_3', title: 'Highlight Fast-Selling Items', description: 'Promote Belgian Truffle Cake on Homepage hero banner to maximize daily turnover.', actionType: 'PROMOTE_BESTSELLER' }
    ]
  });

  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [stockPredictions, setStockPredictions] = useState(null);
  const [loyaltyRules, setLoyaltyRules] = useState({
    points_per_100_spent: 10,
    point_value_in_rs: 1.0,
    welcome_bonus_points: 50,
    silver_threshold: 250,
    gold_threshold: 500,
    royal_threshold: 1000
  });
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  // CSV Exporter Helper Function
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [loyaltyAccounts, setLoyaltyAccounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Toast System State
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Modal Control States
  const [modalType, setModalType] = useState(null); // 'ADD_PRODUCT' | 'EDIT_PRODUCT' | 'DELETE_PRODUCT' | 'ADD_CATEGORY' | 'EDIT_CATEGORY' | 'DELETE_CATEGORY' | 'ORDER_DETAILS' | 'CUSTOMER_PROFILE' | 'ADD_COUPON' | 'DELETE_COUPON' | 'ADJUST_LOYALTY' | 'STOCK_EDIT'
  const [activeItem, setActiveItem] = useState(null);

  // Form Data States
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: 1,
    price: '',
    discount: 0,
    stock_quantity: 10,
    weight_size: '1 Kg',
    description: '',
    ingredients: '',
    image: '',
    is_available: 1,
    is_featured: 0,
    is_best_seller: 0
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    is_active: 1
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 499
  });

  const [loyaltyAdjustForm, setLoyaltyAdjustForm] = useState({
    points: 50,
    description: 'Admin Goodwill Bonus Points'
  });

  const [stockEditQty, setStockEditQty] = useState(10);

  // Filter & Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');

  // Initial Auth Check & Role Protection
  useEffect(() => {
    const savedToken = localStorage.getItem('sweet_haven_token');
    const savedUserStr = localStorage.getItem('sweet_haven_user');
    if (savedToken && savedUserStr) {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser.role === 'admin' && parsedUser.email?.toLowerCase() === 'deepaveera3slm@gmail.com') {
          setAdminUser(parsedUser);
          setAuthToken(savedToken);
        } else {
          setAccessDenied(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      } catch (e) {
        console.error('Invalid saved user data');
      }
    }
  }, []);

  // Fetch Admin Data when Authenticated
  useEffect(() => {
    if (adminUser) {
      loadAllAdminData();
    }
  }, [adminUser, activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllAdminData = async () => {
    setLoadingData(true);
    try {
      const [mRes, pRes, cRes, oRes, custRes, ofrRes, loyRes, notifRes, wasteRes, salesRes, stockRes, rulesRes] = await Promise.all([
        apiService.getDashboardMetrics(),
        apiService.getAdminProducts(),
        apiService.getCategories(),
        apiService.getAdminOrders(),
        apiService.getAdminCustomers(),
        apiService.getAdminCoupons(),
        apiService.getAdminLoyalty(),
        apiService.getNotifications(),
        apiService.getWasteAnalytics(),
        apiService.getSalesAnalytics(),
        apiService.getStockPredictions(),
        apiService.getLoyaltyRules()
      ]);

      if (mRes && mRes.stats) setMetrics(mRes.stats);
      if (pRes && pRes.products) setProducts(pRes.products);
      if (cRes && cRes.categories) setCategories(cRes.categories);
      if (oRes && oRes.orders) setOrders(oRes.orders);
      if (custRes && custRes.customers) setCustomers(custRes.customers);
      if (ofrRes && ofrRes.coupons) setCoupons(ofrRes.coupons);
      if (loyRes && loyRes.loyaltyAccounts) setLoyaltyAccounts(loyRes.loyaltyAccounts);
      if (notifRes && notifRes.notifications) setNotifications(notifRes.notifications);
      if (wasteRes && wasteRes.summary) setWasteData(wasteRes);
      if (salesRes && salesRes.analytics) setSalesAnalytics(salesRes.analytics);
      if (stockRes && stockRes.predictions) setStockPredictions(stockRes.predictions);
      if (rulesRes && rulesRes.rules) setLoyaltyRules(rulesRes.rules);
    } catch (err) {
      console.error('Error loading admin panel data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApplyFlashDiscount = async (productId) => {
    try {
      const res = await apiService.applyFlashDiscount(productId, 30);
      if (res && res.success) {
        showToast('Applied 30% Flash Discount to near-expiry item!', 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Failed to apply discount.', 'error');
    }
  };

  const handleSaveLoyaltyRules = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.updateLoyaltyRules(loyaltyRules);
      if (res && res.success) {
        showToast('Loyalty Rules updated successfully!', 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Failed to update loyalty rules.', 'error');
    }
  };

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await apiService.adminLogin(loginEmail, loginPassword);
      if (res.success && res.token && res.user && res.user.role === 'admin' && res.user.email?.toLowerCase() === 'deepaveera3slm@gmail.com') {
        localStorage.setItem('sweet_haven_token', res.token);
        localStorage.setItem('sweet_haven_user', JSON.stringify(res.user));
        setAdminUser(res.user);
        setAuthToken(res.token);
        showToast('Welcome to Sweet Haven Admin Portal!', 'success');
      } else {
        setLoginError(res.message || 'Access Forbidden: Admin privileges required.');
      }
    } catch (err) {
      setLoginError('Authentication server error.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('sweet_haven_token');
    localStorage.removeItem('sweet_haven_user');
    setAdminUser(null);
    setAuthToken('');
    showToast('Logged out of Admin Portal.', 'success');
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setProductForm({
      name: '',
      category_id: categories[0]?.id || 1,
      price: '',
      discount: 0,
      stock_quantity: 20,
      weight_size: '1 Kg',
      description: '',
      ingredients: '',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=80',
      is_available: 1,
      is_featured: 0,
      is_best_seller: 0
    });
    setModalType('ADD_PRODUCT');
  };

  const handleOpenEditProduct = (prod) => {
    setActiveItem(prod);
    setProductForm({
      name: prod.name,
      category_id: prod.category_id || 1,
      price: prod.price,
      discount: prod.discount || 0,
      stock_quantity: prod.stock_quantity || 0,
      weight_size: prod.weight_size || prod.weightSize || '1 Kg',
      description: prod.description || '',
      ingredients: prod.ingredients || '',
      image: prod.image || '',
      is_available: prod.is_available ?? 1,
      is_featured: prod.is_featured ?? 0,
      is_best_seller: prod.is_best_seller ?? 0
    });
    setModalType('EDIT_PRODUCT');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showToast('Product name and price are required.', 'error');
      return;
    }

    try {
      if (modalType === 'ADD_PRODUCT') {
        const res = await apiService.createProduct(productForm);
        if (res.success) {
          showToast('Product added successfully!');
          loadAllAdminData();
          setModalType(null);
        } else {
          showToast(res.message || 'Failed to add product.', 'error');
        }
      } else if (modalType === 'EDIT_PRODUCT') {
        const res = await apiService.updateProduct(activeItem.id, productForm);
        if (res.success) {
          showToast('Product updated successfully!');
          loadAllAdminData();
          setModalType(null);
        } else {
          showToast(res.message || 'Failed to update product.', 'error');
        }
      }
    } catch (err) {
      showToast('Error saving product.', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!activeItem) return;
    try {
      const res = await apiService.deleteProduct(activeItem.id);
      if (res.success) {
        showToast('Product deleted.');
        loadAllAdminData();
        setModalType(null);
      } else {
        showToast('Failed to delete product.', 'error');
      }
    } catch (err) {
      showToast('Error deleting product.', 'error');
    }
  };

  const handleToggleProductVisibility = async (id) => {
    try {
      const res = await apiService.toggleProductVisibility(id);
      if (res.success) {
        showToast('Product visibility updated.');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Failed to toggle visibility.', 'error');
    }
  };

  const handleQuickStockUpdate = async (id, qty) => {
    try {
      const res = await apiService.updateStock(id, qty);
      if (res.success) {
        showToast('Stock quantity updated!');
        loadAllAdminData();
        setModalType(null);
      }
    } catch (err) {
      showToast('Failed to update stock.', 'error');
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      if (modalType === 'ADD_CATEGORY') {
        const res = await apiService.createCategory(categoryForm);
        if (res.success) {
          showToast('Category created!');
          loadAllAdminData();
          setModalType(null);
        }
      } else if (modalType === 'EDIT_CATEGORY') {
        const res = await apiService.updateCategory(activeItem.id, categoryForm);
        if (res.success) {
          showToast('Category updated!');
          loadAllAdminData();
          setModalType(null);
        }
      }
    } catch (err) {
      showToast('Category operation failed.', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!activeItem) return;
    try {
      const res = await apiService.deleteCategory(activeItem.id);
      if (res.success) {
        showToast('Category deleted.');
        loadAllAdminData();
        setModalType(null);
      }
    } catch (err) {
      showToast('Failed to delete category.', 'error');
    }
  };

  // --- ORDER STATUS HANDLER ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await apiService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order status updated to "${newStatus}".`);
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  // --- CUSTOMER STATUS TOGGLE HANDLER ---
  const handleToggleCustomerStatus = async (cust) => {
    try {
      const res = await apiService.toggleCustomerStatus(cust.id);
      if (res.success) {
        showToast(`Customer account ${cust.status === 'active' ? 'deactivated' : 'activated'}.`);
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Failed to change customer status.', 'error');
    }
  };

  // --- COUPON HANDLERS ---
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discount_value) return;
    try {
      const res = await apiService.createCoupon(couponForm);
      if (res.success) {
        showToast('Offer coupon created!');
        loadAllAdminData();
        setModalType(null);
      }
    } catch (err) {
      showToast('Failed to create coupon.', 'error');
    }
  };

  const handleDeleteCoupon = async () => {
    if (!activeItem) return;
    try {
      const res = await apiService.deleteCoupon(activeItem.id);
      if (res.success) {
        showToast('Coupon deleted.');
        loadAllAdminData();
        setModalType(null);
      }
    } catch (err) {
      showToast('Failed to delete coupon.', 'error');
    }
  };

  // --- LOYALTY ADJUSTMENT HANDLER ---
  const handleAdjustLoyalty = async (e) => {
    e.preventDefault();
    if (!activeItem || !loyaltyAdjustForm.points) return;
    try {
      const res = await apiService.adjustLoyaltyPoints(
        activeItem.id, 
        loyaltyAdjustForm.points, 
        loyaltyAdjustForm.description
      );
      if (res.success) {
        showToast(`Loyalty points updated by ${loyaltyAdjustForm.points}!`);
        loadAllAdminData();
        setModalType(null);
      }
    } catch (err) {
      showToast('Failed to adjust loyalty points.', 'error');
    }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleMarkNotificationRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      loadAllAdminData();
    } catch (err) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      loadAllAdminData();
      showToast('All notifications marked as read.');
    } catch (err) {}
  };

  if (accessDenied) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '2rem', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: 'var(--shadow-md)' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto', color: '#c0392b' }} />
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>Access Forbidden</h2>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Administrator privileges required. Customer accounts cannot access the management dashboard.</p>
          <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '1rem' }}>Redirecting to Home Page...</span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // UNAUTHENTICATED RENDER (ADMIN LOGIN FORM)
  // ----------------------------------------------------
  if (!adminUser) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-modal)',
          padding: '2.5rem 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-cream-soft)', border: '2px solid var(--border-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Lock size={28} style={{ color: 'var(--burgundy-royal)' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem' }}>
              Sweet Haven Admin Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Protected Operational Management System
            </p>
          </div>

          {loginError && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} /> {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>
                Administrator Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="deepaveera3slm@gmail.com"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.6rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', marginBottom: '0.35rem' }}>
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.6rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loginLoading}
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}
            >
              {loginLoading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN LAYOUT & PANELS
  // ----------------------------------------------------
  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ background: '#fdfbf7', minHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification Container */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          background: toast.type === 'error' ? '#721c24' : 'var(--burgundy-royal)',
          color: '#fff',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Top Navigation Header */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-gold)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.4rem' }}>👑</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.3rem', margin: 0 }}>
            Sweet Haven <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', background: 'var(--bg-cream-soft)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-gold)', marginLeft: '0.5rem', color: 'var(--chocolate-dark)' }}>Admin Portal</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Notifications Bell */}
          <button 
            className="btn btn-outline"
            style={{ position: 'relative', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveTab('notifications')}
            title="System Notifications"
          >
            <Bell size={18} style={{ color: 'var(--chocolate-dark)' }} />
            {unreadNotifsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#e74c3c',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}>
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Downloadable Admin Reports Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-outline"
              onClick={() => setShowReportDropdown(!showReportDropdown)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              <Download size={15} /> Reports (CSV/PDF)
            </button>

            {showReportDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, width: '220px', padding: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', padding: '6px 10px', textTransform: 'uppercase' }}>Download CSV Reports</div>
                <button onClick={() => { exportToCSV('SweetHaven_Products_Report', products); setShowReportDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>📄 Products Report</button>
                <button onClick={() => { exportToCSV('SweetHaven_Orders_Report', orders); setShowReportDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>🛒 Orders Report</button>
                <button onClick={() => { exportToCSV('SweetHaven_Customers_Report', customers); setShowReportDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>👥 Customers Report</button>
                <button onClick={() => { exportToCSV('SweetHaven_Inventory_Report', products.map(p => ({ ID: p.id, Name: p.name, Category: p.category, Stock: p.stock_quantity, Price: p.price }))); setShowReportDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>📦 Inventory Report</button>
                <button onClick={() => { exportToCSV('SweetHaven_Food_Waste_Report', wasteData.expiringItems); setShowReportDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>♻️ Food Waste Report</button>
                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                <button onClick={() => { window.print(); setShowReportDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '6px 10px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '700', color: '#be185d', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Printer size={13} /> Print PDF Summary</button>
              </div>
            )}
          </div>

          {/* Admin User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-cream-soft)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
            <UserCheck size={16} style={{ color: 'var(--burgundy-royal)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)' }}>
              {adminUser.name || 'Admin Manager'}
            </span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="btn btn-outline" 
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c0392b' }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content Body) */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-light)',
          padding: '1.25rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard Overview
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} /> Products CRUD
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Folders size={18} /> Categories
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={18} /> Inventory & Stock
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Orders ({metrics.pendingOrders || 0} Pending)
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={18} /> Customers
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <Tag size={18} /> Offers & Coupons
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'loyalty' ? 'active' : ''}`}
            onClick={() => setActiveTab('loyalty')}
          >
            <Award size={18} /> Loyalty Program
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'waste' ? 'active' : ''}`}
            onClick={() => setActiveTab('waste')}
          >
            <Trash2 size={18} /> Food Waste Management
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications {unreadNotifsCount > 0 && `(${unreadNotifsCount})`}
          </button>
        </aside>

        {/* Dynamic Content Panel */}
        <main style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                    Operational Control Center
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time bakery performance, order metrics, & stock status.</p>
                </div>
                <button className="btn btn-outline" onClick={loadAllAdminData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <RefreshCw size={14} className={loadingData ? 'spin' : ''} /> Refresh Data
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Total Products</span>
                    <Package size={20} style={{ color: 'var(--burgundy-royal)' }} />
                  </div>
                  <div className="kpi-value">{metrics.totalProducts}</div>
                  <div style={{ fontSize: '0.8rem', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <TrendingUp size={14} /> Active catalog items
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Total Orders</span>
                    <ShoppingBag size={20} style={{ color: '#2980b9' }} />
                  </div>
                  <div className="kpi-value">{metrics.totalOrders}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {metrics.pendingOrders} pending fulfillment
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Total Revenue</span>
                    <DollarSign size={20} style={{ color: '#d35400' }} />
                  </div>
                  <div className="kpi-value">₹{metrics.totalRevenue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#27ae60' }}>
                    Today: ₹{metrics.todaysSales.toLocaleString()}
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Low Stock Alerts</span>
                    <AlertTriangle size={20} style={{ color: '#c0392b' }} />
                  </div>
                  <div className="kpi-value" style={{ color: metrics.lowStockCount > 0 ? '#c0392b' : 'inherit' }}>
                    {metrics.lowStockCount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Products below threshold
                  </div>
                </div>
              </div>

              {/* Recent Orders & Stock Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Recent Orders Widget */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', margin: 0, fontSize: '1.1rem' }}>
                      Recent Bakery Orders
                    </h3>
                    <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }} onClick={() => setActiveTab('orders')}>
                      View All Orders
                    </button>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                          <td>{o.customer_name || 'Customer'}</td>
                          <td style={{ fontWeight: 600 }}>₹{o.total_amount || o.final_amount}</td>
                          <td>
                            <span className={`status-badge status-${(o.order_status || 'placed').toLowerCase().replace(/\s+/g, '-')}`}>
                              {o.order_status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setActiveItem(o); setModalType('ORDER_DETAILS'); }}>
                              <Eye size={14} /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Best Sellers & Low Stock Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', padding: '1.25rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                      🌟 Best Selling Confectionery
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {products.filter(p => p.is_best_seller || p.isBestSeller).slice(0, 4).map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--chocolate-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{p.price} • Stock: {p.stock_quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT — FULL CRUD */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                    Product Catalog Management
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add, edit, delete, toggle visibility & stock quantities.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddProduct} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={18} /> Add New Product
                </button>
              </div>

              {/* Filters Bar */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder="Search by product name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                </div>

                <select 
                  value={productCatFilter} 
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  style={{ padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem', background: '#fff' }}
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Products Table */}
              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => {
                        const matchQuery = p.name.toLowerCase().includes(productSearch.toLowerCase());
                        const matchCat = productCatFilter === 'All' || p.category === productCatFilter;
                        return matchQuery && matchCat;
                      })
                      .map(p => (
                        <tr key={p.id}>
                          <td>
                            <img src={p.image} alt={p.name} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--chocolate-dark)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size: {p.weight_size || p.weightSize || '500g'}</div>
                          </td>
                          <td>{p.category}</td>
                          <td style={{ fontWeight: 600 }}>₹{p.price}</td>
                          <td>{p.discount > 0 ? `${p.discount}%` : '-'}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: p.stock_quantity <= 5 ? '#c0392b' : 'inherit' }}>
                              {p.stock_quantity} units
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleToggleProductVisibility(p.id)}
                              className={`status-badge ${p.is_available ? 'status-active' : 'status-inactive'}`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              title="Click to toggle visibility"
                            >
                              {p.is_available ? 'Available' : 'Hidden'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleOpenEditProduct(p)} title="Edit Product">
                                <Edit3 size={14} />
                              </button>
                              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#c0392b' }} onClick={() => { setActiveItem(p); setModalType('DELETE_PRODUCT'); }} title="Delete Product">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                    Category Management
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Organize confectionery categories and visibility.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setCategoryForm({ name: '', description: '', image: '', is_active: 1 }); setModalType('ADD_CATEGORY'); }}>
                  <Plus size={18} /> Add Category
                </button>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category Name</th>
                      <th>Slug</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--chocolate-dark)' }}>{c.name}</td>
                        <td><code>{c.slug}</code></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.description || 'No description'}</td>
                        <td>
                          <span className={`status-badge ${c.is_active ? 'status-active' : 'status-inactive'}`}>
                            {c.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setActiveItem(c); setCategoryForm({ name: c.name, description: c.description || '', image: c.image || '', is_active: c.is_active }); setModalType('EDIT_CATEGORY'); }}>
                              <Edit3 size={14} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#c0392b' }} onClick={() => { setActiveItem(c); setModalType('DELETE_CATEGORY'); }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                  Inventory & Stock Monitoring
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track real-time stock thresholds, low-stock warnings, & manual restocks.</p>
              </div>

              {/* Low Stock Banner */}
              {products.filter(p => p.stock_quantity <= 10).length > 0 && (
                <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #ffeeba', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={22} style={{ color: '#d35400' }} />
                  <div>
                    <strong>Low Stock Alert:</strong> {products.filter(p => p.stock_quantity <= 10).length} item(s) are below the minimum safety threshold (10 units).
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Stock Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const isLow = p.stock_quantity <= 10;
                      const isOut = p.stock_quantity <= 0;
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>{p.category}</td>
                          <td style={{ fontSize: '1rem', fontWeight: 700 }}>{p.stock_quantity} units</td>
                          <td>
                            {isOut ? (
                              <span className="status-badge status-inactive">Out of Stock</span>
                            ) : isLow ? (
                              <span className="status-badge" style={{ background: '#fff3cd', color: '#856404' }}>Low Stock Alert</span>
                            ) : (
                              <span className="status-badge status-active">In Stock</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                              onClick={() => { setActiveItem(p); setStockEditQty(p.stock_quantity); setModalType('STOCK_EDIT'); }}
                            >
                              Update Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                  Order Management & Stage Dispatch
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Control customer orders and advance bakery stages.</p>
              </div>

              {/* Status Filter Bar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {['All', 'Order Placed', 'Order Confirmed', 'Preparing', 'Baking', 'Quality Check', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
                  <button
                    key={st}
                    className={`filter-chip ${orderStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter(st)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer Details</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Current Stage</th>
                      <th>Update Stage</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => orderStatusFilter === 'All' || o.order_status === orderStatusFilter)
                      .map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700 }}>{o.order_number}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{o.customer_name || 'Customer'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span>{o.customer_phone || '+91 98765 43210'}</span>
                              <a
                                href={`tel:${(o.customer_phone || '+919876543210').replace(/[^0-9+]/g, '')}`}
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#f0fdf4',
                                  color: '#16a34a',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  border: '1px solid #bbf7d0'
                                }}
                                title="Call Customer directly using phone number"
                              >
                                <PhoneCall size={10} /> Call Customer
                              </a>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>₹{o.total_amount || o.final_amount}</td>
                          <td>
                            <span className={`status-badge ${o.payment_status === 'Successful' ? 'status-active' : 'status-inactive'}`}>
                              {o.payment_status || 'Successful'}
                            </span>
                          </td>
                          <td>
                            <span className="status-badge" style={{ background: 'var(--bg-cream-soft)', border: '1px solid var(--border-gold)', color: 'var(--chocolate-dark)' }}>
                              {o.order_status}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={o.order_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              style={{ padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.8rem', background: '#fff' }}
                            >
                              <option value="Order Placed">1. Order Placed</option>
                              <option value="Order Confirmed">2. Order Confirmed</option>
                              <option value="Preparing">3. Preparing</option>
                              <option value="Baking">4. Baking</option>
                              <option value="Quality Check">5. Quality Check</option>
                              <option value="Packed">6. Packed</option>
                              <option value="Out for Delivery">7. Out for Delivery</option>
                              <option value="Delivered">8. Delivered</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setActiveItem(o); setModalType('ORDER_DETAILS'); }}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                  Registered Customers Directory
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View profiles, account status, & manage user access.</p>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${c.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              className={`btn ${c.status === 'active' ? 'btn-outline' : 'btn-primary'}`} 
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => handleToggleCustomerStatus(c)}
                            >
                              {c.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: OFFERS & COUPONS */}
          {activeTab === 'offers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                    Offers & Coupon Management
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configure discount codes and promotional campaigns.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setCouponForm({ code: '', discount_type: 'percentage', discount_value: 15, min_order_amount: 500 }); setModalType('ADD_COUPON'); }}>
                  <Plus size={18} /> Create New Coupon
                </button>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount Type</th>
                      <th>Discount Value</th>
                      <th>Min Order Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: 'var(--burgundy-royal)' }}>{c.code}</td>
                        <td style={{ textTransform: 'capitalize' }}>{c.discount_type}</td>
                        <td style={{ fontWeight: 600 }}>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                        <td>₹{c.min_order_amount}</td>
                        <td>
                          <span className={`status-badge ${c.is_active ? 'status-active' : 'status-inactive'}`}>
                            {c.is_active ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', color: '#c0392b', fontSize: '0.75rem' }} onClick={() => { setActiveItem(c); setModalType('DELETE_COUPON'); }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: LOYALTY PROGRAM */}
          {activeTab === 'loyalty' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                  Royal Loyalty Program Management
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Adjust customer loyalty points & inspect membership tiers.</p>
              </div>

              {/* Loyalty Tier Rules Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f5e6ca', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                  <div style={{ fontWeight: 700, color: '#7f5a00' }}>🥉 Bronze Tier</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>0 - 249 Points (1x Earning)</div>
                </div>
                <div style={{ background: '#e0e0e0', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}>
                  <div style={{ fontWeight: 700, color: '#555' }}>🥈 Silver Tier</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>250 - 499 Points (1.25x Earning)</div>
                </div>
                <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ffeeba' }}>
                  <div style={{ fontWeight: 700, color: '#856404' }}>🥇 Gold Tier</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>500 - 999 Points (1.5x Earning)</div>
                </div>
                <div style={{ background: 'var(--bg-cream-soft)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--burgundy-royal)' }}>👑 Royal Tier</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>1000+ Points (2x Earning)</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Loyalty Card #</th>
                      <th>Customer Name</th>
                      <th>Points Balance</th>
                      <th>Current Tier</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyAccounts.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 700 }}><code>{l.loyalty_card_number}</code></td>
                        <td>{l.customer_name || 'Demo Customer'}</td>
                        <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--burgundy-royal)' }}>{l.current_points} pts</td>
                        <td>
                          <span className="status-badge" style={{ background: 'var(--bg-cream-soft)', border: '1px solid var(--border-gold)', color: 'var(--chocolate-dark)' }}>
                            {l.tier || 'Silver'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => { setActiveItem(l); setLoyaltyAdjustForm({ points: 50, description: 'Admin Goodwill Bonus Points' }); setModalType('ADJUST_LOYALTY'); }}
                          >
                            Adjust Points
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: FOOD WASTE MANAGEMENT */}
          {activeTab === 'waste' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                    Food Waste Analytics & Mitigation Engine
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monitor near-expiry inventory, estimate financial loss, & execute AI mitigation actions.</p>
                </div>
                <button className="btn btn-outline" onClick={() => exportToCSV('SweetHaven_Food_Waste_Report', wasteData.expiringItems)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                  <Download size={14} /> Export Waste Report
                </button>
              </div>

              {/* KPI Summary Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Expiring Products</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#dc2626', margin: '4px 0' }}>{wasteData.summary.expiringProductsCount}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Items within 72h expiry</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Unsold Surplus Stock</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#d97706', margin: '4px 0' }}>{wasteData.summary.unsoldProductsCount}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Slow moving inventory</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Wasted Quantity</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#475569', margin: '4px 0' }}>{wasteData.summary.wastedQuantity} <span style={{ fontSize: '14px' }}>units</span></div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>This month total</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Waste Percentage</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#be185d', margin: '4px 0' }}>{wasteData.summary.wastePercentage}%</div>
                  <div style={{ fontSize: '11px', color: '#16a34a' }}>-0.9% improvement vs last mo</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Estimated Financial Loss</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#b91c1c', margin: '4px 0' }}>₹{wasteData.summary.estimatedLoss.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Cost of raw materials lost</div>
                </div>
              </div>

              {/* AI Waste Mitigation Recommendations */}
              <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '20px', padding: '24px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#be185d', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} /> AI Waste Mitigation Recommendations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {wasteData.aiRecommendations.map(rec => (
                    <div key={rec.id} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #f472b6' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>{rec.title}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.4' }}>{rec.description}</p>
                      {rec.actionType === 'APPLY_DISCOUNT' && (
                        <button 
                          onClick={() => handleApplyFlashDiscount(rec.targetProductId || 1)}
                          style={{ width: '100%', padding: '8px', borderRadius: '10px', border: 'none', backgroundColor: '#be185d', color: '#ffffff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          ⚡ Execute 30% Flash Discount
                        </button>
                      )}
                      {rec.actionType !== 'APPLY_DISCOUNT' && (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#be185d', backgroundColor: '#fdf2f8', padding: '4px 10px', borderRadius: '10px', display: 'inline-block' }}>
                          ✓ Recommended Protocol
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiring Items Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Near-Expiry Inventory Watchlist
                </h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Stock Qty</th>
                      <th>Days to Expiry</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteData.expiringItems.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td style={{ fontWeight: '700' }}>{item.stock_quantity} units</td>
                        <td>
                          <span style={{ color: item.days_to_expiry <= 1 ? '#dc2626' : '#d97706', fontWeight: '800' }}>
                            {item.days_to_expiry} day(s)
                          </span>
                        </td>
                        <td>₹{item.price}</td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', backgroundColor: item.days_to_expiry <= 1 ? '#fef2f2' : '#fffbeb', color: item.days_to_expiry <= 1 ? '#dc2626' : '#d97706' }}>
                            {item.status || (item.days_to_expiry <= 1 ? 'Near Expiry' : 'Expiring Soon')}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleApplyFlashDiscount(item.id)}
                          >
                            ⚡ 30% Off
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 10: SYSTEM NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', fontSize: '1.8rem', margin: 0 }}>
                    System Alerts & Notifications
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time updates on orders, inventory, and payments.</p>
                </div>
                <button className="btn btn-outline" onClick={handleMarkAllNotificationsRead}>
                  Mark All as Read
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    style={{
                      background: n.is_read ? 'var(--bg-surface)' : '#fff8e7',
                      border: '1px solid var(--border-gold)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Bell size={20} style={{ color: 'var(--burgundy-royal)' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{n.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    </div>

                    {!n.is_read && (
                      <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }} onClick={() => handleMarkNotificationRead(n.id)}>
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODALS SYSTEM */}
      {/* ---------------------------------------------------- */}
      {modalType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9990,
          display: 'flex',
          justify: 'center',
          alignItems: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-modal)',
            width: '100%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--burgundy-royal)', margin: 0 }}>
                {modalType === 'ADD_PRODUCT' && 'Add New Product'}
                {modalType === 'EDIT_PRODUCT' && 'Edit Product Details'}
                {modalType === 'DELETE_PRODUCT' && 'Confirm Delete Product'}
                {modalType === 'ADD_CATEGORY' && 'Add New Category'}
                {modalType === 'EDIT_CATEGORY' && 'Edit Category'}
                {modalType === 'DELETE_CATEGORY' && 'Delete Category'}
                {modalType === 'ORDER_DETAILS' && `Order Details #${activeItem?.order_number}`}
                {modalType === 'STOCK_EDIT' && `Update Stock: ${activeItem?.name}`}
                {modalType === 'ADD_COUPON' && 'Create Offer Coupon'}
                {modalType === 'DELETE_COUPON' && 'Delete Coupon'}
                {modalType === 'ADJUST_LOYALTY' && `Adjust Loyalty Points for ${activeItem?.customer_name}`}
              </h3>
              <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setModalType(null)}>
                <X size={18} />
              </button>
            </div>

            {/* PRODUCT ADD / EDIT FORM */}
            {(modalType === 'ADD_PRODUCT' || modalType === 'EDIT_PRODUCT') && (
              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Product Name</label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                    <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Price (₹)</label>
                    <input type="number" required step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Discount (%)</label>
                    <input type="number" value={productForm.discount} onChange={e => setProductForm({ ...productForm, discount: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Stock Quantity</label>
                    <input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Weight / Size</label>
                    <input type="text" value={productForm.weight_size} onChange={e => setProductForm({ ...productForm, weight_size: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Description</label>
                  <textarea rows="2" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Ingredients</label>
                  <input type="text" value={productForm.ingredients} onChange={e => setProductForm({ ...productForm, ingredients: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Image URL</label>
                  <input type="text" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input type="checkbox" checked={Boolean(productForm.is_available)} onChange={e => setProductForm({ ...productForm, is_available: e.target.checked ? 1 : 0 })} /> Available in Catalog
                  </label>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input type="checkbox" checked={Boolean(productForm.is_featured)} onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked ? 1 : 0 })} /> Featured
                  </label>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input type="checkbox" checked={Boolean(productForm.is_best_seller)} onChange={e => setProductForm({ ...productForm, is_best_seller: e.target.checked ? 1 : 0 })} /> Best Seller
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </form>
            )}

            {/* DELETE PRODUCT CONFIRMATION */}
            {modalType === 'DELETE_PRODUCT' && (
              <div>
                <p>Are you sure you want to permanently delete <strong>{activeItem?.name}</strong> from the confectionery database?</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#c0392b', borderColor: '#c0392b' }} onClick={handleDeleteProduct}>Confirm Delete</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* CATEGORY FORM */}
            {(modalType === 'ADD_CATEGORY' || modalType === 'EDIT_CATEGORY') && (
              <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category Name</label>
                  <input type="text" required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Description</label>
                  <textarea rows="2" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Category</button>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </form>
            )}

            {/* DELETE CATEGORY */}
            {modalType === 'DELETE_CATEGORY' && (
              <div>
                <p>Are you sure you want to delete category <strong>{activeItem?.name}</strong>?</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#c0392b' }} onClick={handleDeleteCategory}>Delete Category</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* STOCK EDIT MODAL */}
            {modalType === 'STOCK_EDIT' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Update Stock Quantity (Units)</label>
                <input 
                  type="number" 
                  value={stockEditQty} 
                  onChange={e => setStockEditQty(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '1.2rem', fontWeight: 700 }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleQuickStockUpdate(activeItem.id, stockEditQty)}>Save Stock</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {modalType === 'ORDER_DETAILS' && activeItem && (
              <div>
                <div style={{ background: 'var(--bg-cream-soft)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div><strong>Customer:</strong> {activeItem.customer_name || 'Demo Customer'}</div>
                  <div><strong>Phone:</strong> {activeItem.customer_phone || '+91 98765 43210'}</div>
                  <div><strong>Delivery Address:</strong> {activeItem.delivery_address || 'Heritage Plaza, Suite 402'}</div>
                  <div><strong>Order Total:</strong> ₹{activeItem.total_amount || activeItem.final_amount}</div>
                  <div><strong>Status:</strong> {activeItem.order_status}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" onClick={() => setModalType(null)}>Close</button>
                </div>
              </div>
            )}

            {/* ADD COUPON MODAL */}
            {modalType === 'ADD_COUPON' && (
              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Coupon Code</label>
                  <input type="text" required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="e.g. SWEET20" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Discount Type</label>
                    <select value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Discount Value</label>
                    <input type="number" required value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Min Order Amount (₹)</label>
                  <input type="number" value={couponForm.min_order_amount} onChange={e => setCouponForm({ ...couponForm, min_order_amount: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Coupon</button>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </form>
            )}

            {/* DELETE COUPON CONFIRMATION */}
            {modalType === 'DELETE_COUPON' && (
              <div>
                <p>Delete coupon code <strong>{activeItem?.code}</strong>?</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#c0392b' }} onClick={handleDeleteCoupon}>Delete</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* ADJUST LOYALTY MODAL */}
            {modalType === 'ADJUST_LOYALTY' && (
              <form onSubmit={handleAdjustLoyalty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Points Amount (+ Bonus or - Deduction)</label>
                  <input type="number" required value={loyaltyAdjustForm.points} onChange={e => setLoyaltyAdjustForm({ ...loyaltyAdjustForm, points: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '1.1rem', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reason / Log Description</label>
                  <input type="text" value={loyaltyAdjustForm.description} onChange={e => setLoyaltyAdjustForm({ ...loyaltyAdjustForm, description: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Points Adjustment</button>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalType(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
