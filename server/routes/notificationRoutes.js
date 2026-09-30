const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. CUSTOMER: Get Own Notifications (MongoDB)
 */
router.get('/customer', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await Notification.find({
      $or: [{ user_id: userId }, { user_id: null }, { user_id: { $exists: false } }]
    }).sort({ _id: -1 }).limit(30);

    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('Fetch customer notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

/**
 * 2. ADMIN: Get All Notifications (MongoDB)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await Notification.find().sort({ _id: -1 }).limit(50);
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
  const notifId = req.params.id;
  try {
    const query = mongoose.isValidObjectId(notifId)
      ? { _id: notifId }
      : { $or: [{ _id: notifId }, { legacy_id: Number(notifId) || null }] };

    const result = await Notification.findOneAndUpdate(query, { is_read: 1 });
    if (!result) {
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
      await Notification.updateMany({ $or: [{ user_id: userId }, { user_id: null }] }, { is_read: 1 });
    } else {
      await Notification.updateMany({}, { is_read: 1 });
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
    await Notification.create({
      user_id: null,
      type,
      title: title.trim(),
      message: message.trim(),
      is_read: 0
    });
    res.json({ success: true, message: 'Broadcast notification sent successfully.' });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
  }
});

module.exports = router;
