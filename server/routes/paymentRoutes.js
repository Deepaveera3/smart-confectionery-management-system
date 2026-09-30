const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 1. Initiate Payment Session
router.post('/initiate', authenticateToken, async (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;
  if (!orderId || !amount) return res.status(400).json({ success: false, message: 'Order ID and amount are required.' });

  const transactionId = `TXN-SH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const payment = await Payment.create({
      order_id: orderId,
      transaction_id: transactionId,
      payment_method: paymentMethod || 'Online Gateway',
      amount,
      status: 'Pending',
      gateway_response: { mode: 'Sandbox Gateway', initiated_at: new Date().toISOString() }
    });

    res.json({ success: true, message: 'Payment session initiated.', transactionId, paymentId: payment._id.toString(), amount, status: 'Pending' });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment session in database.' });
  }
});

// 2. Verify Payment
router.post('/verify', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { transactionId, orderId, paymentMethod, simulateStatus } = req.body;
  if (!transactionId || !orderId) return res.status(400).json({ success: false, message: 'Transaction ID and Order ID are required.' });

  const isSuccess = simulateStatus !== 'FAILED';
  const newStatus = isSuccess ? 'Successful' : 'Failed';

  try {
    await Payment.findOneAndUpdate({ transaction_id: transactionId }, { status: newStatus, ...(paymentMethod ? { payment_method: paymentMethod } : {}) });

    if (isSuccess) {
      await Order.findByIdAndUpdate(orderId, { payment_status: 'Successful', order_status: 'Order Confirmed' });
      await Notification.create({
        user_id: userId, type: 'PAYMENT',
        title: 'Payment Successful!',
        message: `Your payment for Order #${orderId} was processed successfully.`,
        is_read: 0
      });
    } else {
      await Order.findByIdAndUpdate(orderId, { payment_status: 'Failed' });
    }

    res.json({ success: isSuccess, message: isSuccess ? 'Payment verified successfully!' : 'Payment transaction failed.', orderId, transactionId, status: newStatus });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
});

// 3. Customer Payment History
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Get user's orders
    let query = {};
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { $or: [{ user_id: userId }, { user_id: new mongoose.Types.ObjectId(userId) }] };
    } else {
      query = { user_id: userId };
    }
    const orders = await Order.find(query).select('_id order_number final_amount').lean();
    const orderIds = orders.map(o => o._id.toString());

    const payments = await Payment.find({ order_id: { $in: orderIds } }).sort({ createdAt: -1 }).lean();

    const enriched = payments.map(p => {
      const ord = orders.find(o => o._id.toString() === p.order_id.toString());
      return { ...p, id: p._id.toString(), order_number: ord?.order_number || '', final_amount: ord?.final_amount || p.amount };
    });

    res.json({ success: true, payments: enriched });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
});

// 4. ADMIN: All Payments
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
    const enriched = [];
    for (const p of payments) {
      const ord = await Order.findById(p.order_id).select('order_number user_id customer_name customer_email').lean();
      enriched.push({
        ...p, id: p._id.toString(),
        order_number: ord?.order_number || '',
        customer_name: ord?.customer_name || '',
        customer_email: ord?.customer_email || ''
      });
    }
    res.json({ success: true, payments: enriched });
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

module.exports = router;
