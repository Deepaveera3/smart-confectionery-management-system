const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. CUSTOMER: Get Own Notifications
 */
router.get('/customer', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 30',
      [userId]
    );
    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('Fetch customer notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

/**
 * 2. ADMIN: Get All Notifications
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications ORDER BY id DESC LIMIT 50'
    );
    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('Fetch admin notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin notifications.' });
  }
});

/**
 * 3. Mark Single Notification as Read
 */
router.patch('/:id/read', authenticateToken, async (req, res) => {
  const notifId = parseInt(req.params.id);
  try {
    const [result] = await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [notifId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

/**
 * 4. Mark All Notifications as Read
 */
router.post('/mark-all-read', authenticateToken, async (req, res) => {
  const userId = req.user.role === 'admin' ? null : req.user.id;
  try {
    if (userId) {
      await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await pool.query('UPDATE notifications SET is_read = 1');
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});

/**
 * 5. ADMIN: Broadcast Notification
 */
router.post('/broadcast', authenticateToken, requireAdmin, async (req, res) => {
  const { title, message, type = 'ANNOUNCEMENT' } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (NULL, ?, ?, ?)',
      [type, title.trim(), message.trim()]
    );
    res.json({ success: true, message: 'Broadcast notification sent successfully.' });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
  }
});

module.exports = router;
