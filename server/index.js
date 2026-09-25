const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, getIsConnected, dbConfig } = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const offerRoutes = require('./routes/offerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const wasteRoutes = require('./routes/wasteRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Smart Confectionery Management System (Sweet Haven) REST API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database Status Check API Route
app.get('/api/db-status', async (req, res) => {
  const connected = await testConnection();
  res.json({
    dbConnected: connected,
    database: dbConfig.database,
    host: dbConfig.host,
    port: dbConfig.port,
    message: connected 
      ? 'Database connected and operational.' 
      : 'Database connection offline. Please check local MySQL service and schema import.'
  });
});

// Mount Module API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/admin/loyalty', loyaltyRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin/waste', wasteRoutes);

// Root API Endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Sweet Haven REST API System',
    version: '1.0.0',
    modules: ['auth', 'products', 'categories', 'orders', 'admin/customers', 'admin/loyalty', 'offers', 'admin/dashboard']
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🍰 Sweet Haven Backend REST API Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
