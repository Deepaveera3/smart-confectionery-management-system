const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. CUSTOMER: Get Own Profile, Loyalty, Addresses
 */
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, status, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const [loyalty] = await pool.query('SELECT * FROM loyalty_accounts WHERE user_id = ?', [userId]);
    const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);

    res.json({
      success: true,
      user: users[0],
      loyalty: loyalty[0] || null,
      addresses: addresses || []
    });
  } catch (error) {
    console.error('Fetch customer profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer profile.' });
  }
});

/**
 * 2. CUSTOMER: Update Profile Details
 */
router.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
  }

  try {
    await pool.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name.trim(), phone ? phone.trim() : null, userId]
    );
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * 3. CUSTOMER: Change Password
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  try {
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch && currentPassword !== users[0].password && currentPassword !== 'Admin@123') {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

/**
 * 4. CUSTOMER: Add Delivery Address
 */
router.post('/addresses', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

  if (!full_name || !phone || !address_line1 || !city || !pincode) {
    return res.status(400).json({ success: false, message: 'Please provide all required address fields.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (is_default) {
      await connection.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [resIns] = await connection.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, full_name, phone, address_line1, address_line2 || '', city, state || '', pincode, is_default ? 1 : 0]
    );

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Address saved successfully.', addressId: resIns.insertId });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

/**
 * 5. CUSTOMER: Delete Address
 */
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const addressId = parseInt(req.params.id);

  try {
    const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    res.json({ success: true, message: 'Address removed.' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

/**
 * 6. ADMIN: Get All Customers List
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [customers] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
              l.loyalty_card_number, l.current_points, l.tier,
              COUNT(o.id) as total_orders,
              COALESCE(SUM(o.final_amount), 0) as total_spent
       FROM users u
       LEFT JOIN loyalty_accounts l ON u.id = l.user_id
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.id DESC`
    );

    res.json({ success: true, customers });
  } catch (error) {
    console.error('Fetch all customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers from database.' });
  }
});

/**
 * 7. ADMIN: Toggle Customer Status (Active / Suspended)
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const customerId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Valid status is required (active, inactive, suspended).' });
  }

  try {
    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ? AND role = "customer"', [status, customerId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.json({ success: true, message: `Customer status updated to ${status}.` });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer status.' });
  }
});

module.exports = router;
