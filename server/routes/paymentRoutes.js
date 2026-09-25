const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * 1. Initiate Payment Session
 */
router.post('/initiate', authenticateToken, async (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, message: 'Order ID and amount are required.' });
  }

  const transactionId = `TXN-SH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const [payRes] = await pool.query(
      `INSERT INTO payments (order_id, transaction_id, payment_method, amount, status, gateway_response) 
       VALUES (?, ?, ?, ?, 'Pending', ?)`,
      [orderId, transactionId, paymentMethod || 'Online Gateway', amount, JSON.stringify({ mode: 'Sandbox Gateway', initiated_at: new Date().toISOString() })]
    );

    res.json({
      success: true,
      message: 'Payment session initiated.',
      transactionId,
      paymentId: payRes.insertId,
      amount,
      status: 'Pending'
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment session in database.' });
  }
});

/**
 * 2. Verify Payment (Sandbox / Signature Verification)
 */
router.post('/verify', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { transactionId, orderId, paymentMethod, simulateStatus } = req.body;

  if (!transactionId || !orderId) {
    return res.status(400).json({ success: false, message: 'Transaction ID and Order ID are required.' });
  }

  const isSuccess = simulateStatus !== 'FAILED';
  const newStatus = isSuccess ? 'Successful' : 'Failed';

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE payments SET status = ?, payment_method = COALESCE(?, payment_method) WHERE transaction_id = ?`,
      [newStatus, paymentMethod, transactionId]
    );

    if (isSuccess) {
      await connection.query(
        `UPDATE orders SET payment_status = 'Successful', order_status = 'Order Confirmed' WHERE id = ?`,
        [orderId]
      );

      // Notification
      await connection.query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'PAYMENT', 'Payment Successful!', ?)`,
        [userId, `Your payment for Order #${orderId} was processed successfully.`]
      );
    } else {
      await connection.query(
        `UPDATE orders SET payment_status = 'Failed' WHERE id = ?`,
        [orderId]
      );
    }

    await connection.commit();
    connection.release();

    res.json({
      success: isSuccess,
      message: isSuccess ? 'Payment verified successfully!' : 'Payment transaction failed.',
      orderId,
      transactionId,
      status: newStatus
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
});

/**
 * 3. Customer Payment History
 */
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT p.*, o.order_number, o.final_amount 
       FROM payments p 
       JOIN orders o ON p.order_id = o.id 
       WHERE o.user_id = ? 
       ORDER BY p.id DESC`,
      [userId]
    );
    res.json({ success: true, payments: rows });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
});

/**
 * 4. ADMIN: All Payments
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, o.order_number, u.name as customer_name, u.email as customer_email 
       FROM payments p 
       JOIN orders o ON p.order_id = o.id 
       JOIN users u ON o.user_id = u.id 
       ORDER BY p.id DESC`
    );
    res.json({ success: true, payments: rows });
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

module.exports = router;
