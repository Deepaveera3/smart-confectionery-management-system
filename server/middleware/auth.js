const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sweethaven_super_secret_jwt_key_2026';

// Middleware to verify JWT Token with graceful demo guest fallback
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token === 'demo_guest_token_2026') {
    // Default demo customer profile for guest operations
    req.user = { id: 2, role: 'customer', name: 'Demo Customer', email: 'customer@sweethaven.com' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Fallback to guest mode if token is invalid or expired
    req.user = { id: 2, role: 'customer', name: 'Demo Customer', email: 'customer@sweethaven.com' };
    next();
  }
};

// Middleware to require Admin Role and Authorized Email
const requireAdmin = (req, res, next) => {
  const allowedAdminEmail = (process.env.ADMIN_EMAIL || 'deepaveera3slm@gmail.com').toLowerCase().trim();
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access forbidden. Administrator privileges required.' 
    });
  }
  const userEmail = (req.user.email || '').toLowerCase().trim();
  if (userEmail !== allowedAdminEmail && userEmail !== 'deepaveera3slm@gmail.com') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Unauthorized administrator account.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};
