const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_LOYALTY_RULES = {
  points_per_100_spent: 10,
  point_value_in_rs: 1.0,
  welcome_bonus_points: 50,
  bronze_threshold: 0,
  silver_threshold: 200,
  gold_threshold: 500,
  royal_threshold: 1000
};

function calculateTier(totalEarned) {
  if (totalEarned >= DEFAULT_LOYALTY_RULES.royal_threshold) return 'Royal';
  if (totalEarned >= DEFAULT_LOYALTY_RULES.gold_threshold) return 'Gold';
  if (totalEarned >= DEFAULT_LOYALTY_RULES.silver_threshold) return 'Silver';
  return 'Bronze';
}

/**
 * 1. CUSTOMER: Get Own Loyalty Card, Balance & History
 */
async function handleGetCustomerLoyalty(req, res) {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query('SELECT * FROM loyalty_accounts WHERE user_id = ?', [userId]);
    let account = rows[0];

    if (!account) {
      const cardNumber = `SH-LOYAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const [resIns] = await pool.query(
        'INSERT INTO loyalty_accounts (user_id, loyalty_card_number, current_points, total_points_earned, tier) VALUES (?, ?, 50, 50, "Bronze")',
        [userId, cardNumber]
      );
      await pool.query(
        'INSERT INTO loyalty_transactions (loyalty_account_id, points, transaction_type, description) VALUES (?, 50, "BONUS", "Welcome Bonus Points")',
        [resIns.insertId]
      );
      const [newRows] = await pool.query('SELECT * FROM loyalty_accounts WHERE id = ?', [resIns.insertId]);
      account = newRows[0];
    }

    const dynamicTier = calculateTier(account.total_points_earned || 0);
    if (dynamicTier !== account.tier) {
      await pool.query('UPDATE loyalty_accounts SET tier = ? WHERE id = ?', [dynamicTier, account.id]);
      account.tier = dynamicTier;
    }

    const [transactions] = await pool.query(
      'SELECT * FROM loyalty_transactions WHERE loyalty_account_id = ? ORDER BY id DESC LIMIT 50',
      [account.id]
    );

    res.json({
      success: true,
      account: { ...account, tier: dynamicTier },
      transactions: transactions || [],
      rules: DEFAULT_LOYALTY_RULES
    });

  } catch (error) {
    console.error('Fetch customer loyalty error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve loyalty account.' });
  }
}

router.get('/customer', authenticateToken, handleGetCustomerLoyalty);
router.get('/my-account', authenticateToken, handleGetCustomerLoyalty);
router.get('/my-card', authenticateToken, handleGetCustomerLoyalty);

/**
 * 2. CUSTOMER: Daily Check-in Streak Reward
 */
router.post('/daily-checkin', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT * FROM loyalty_accounts WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Loyalty account not found.' });
    }

    const account = rows[0];

    // Check if user already claimed today
    const [recentTxns] = await connection.query(
      `SELECT id FROM loyalty_transactions 
       WHERE loyalty_account_id = ? AND transaction_type = 'BONUS' AND description LIKE '%Daily Check-in%'
       AND DATE(created_at) = CURDATE()`,
      [account.id]
    );

    if (recentTxns.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Daily reward already claimed today! Check back tomorrow.' });
    }

    const rewardPoints = 10;
    const newCurrent = account.current_points + rewardPoints;
    const newTotal = account.total_points_earned + rewardPoints;
    const newTier = calculateTier(newTotal);

    await connection.query(
      'UPDATE loyalty_accounts SET current_points = ?, total_points_earned = ?, tier = ? WHERE id = ?',
      [newCurrent, newTotal, newTier, account.id]
    );

    await connection.query(
      'INSERT INTO loyalty_transactions (loyalty_account_id, points, transaction_type, description) VALUES (?, ?, "BONUS", "Daily Check-in Streak Bonus (+10 pts)")',
      [account.id, rewardPoints]
    );

    await connection.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, "LOYALTY", "Daily Reward Claimed!", "You received +10 loyalty reward points for checking in today.")',
      [userId]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: 'Daily check-in reward claimed! +10 points added.',
      pointsAdded: rewardPoints,
      currentPoints: newCurrent,
      tier: newTier
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Daily check-in error:', error);
    res.status(500).json({ success: false, message: 'Failed to claim daily check-in reward.' });
  }
});

/**
 * 3. ADMIN: Get All Loyalty Accounts
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [accounts] = await pool.query(
      `SELECT l.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM loyalty_accounts l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.current_points DESC`
    );

    const [transactions] = await pool.query(
      `SELECT lt.*, la.loyalty_card_number, u.name as customer_name
       FROM loyalty_transactions lt
       JOIN loyalty_accounts la ON lt.loyalty_account_id = la.id
       JOIN users u ON la.user_id = u.id
       ORDER BY lt.id DESC LIMIT 50`
    );

    res.json({ success: true, accounts, transactions, rules: DEFAULT_LOYALTY_RULES });
  } catch (error) {
    console.error('Fetch all loyalty accounts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch loyalty accounts.' });
  }
});

/**
 * 4. ADMIN: Adjust Loyalty Points Manually
 */
router.post('/adjust', authenticateToken, requireAdmin, async (req, res) => {
  const { account_id, user_id, points, reason } = req.body;
  const adjustPoints = parseInt(points);

  if (isNaN(adjustPoints) || (!account_id && !user_id)) {
    return res.status(400).json({ success: false, message: 'Valid account identifier and point adjustment amount are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let account;
    if (account_id) {
      const [rows] = await connection.query('SELECT * FROM loyalty_accounts WHERE id = ?', [account_id]);
      account = rows[0];
    } else {
      const [rows] = await connection.query('SELECT * FROM loyalty_accounts WHERE user_id = ?', [user_id]);
      account = rows[0];
    }

    if (!account) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Loyalty account not found.' });
    }

    const newCurrent = Math.max(0, account.current_points + adjustPoints);
    const newTotal = adjustPoints > 0 ? account.total_points_earned + adjustPoints : account.total_points_earned;
    const newTier = calculateTier(newTotal);

    await connection.query(
      'UPDATE loyalty_accounts SET current_points = ?, total_points_earned = ?, tier = ? WHERE id = ?',
      [newCurrent, newTotal, newTier, account.id]
    );

    await connection.query(
      'INSERT INTO loyalty_transactions (loyalty_account_id, points, transaction_type, description) VALUES (?, ?, "ADMIN_ADJUSTMENT", ?)',
      [account.id, adjustPoints, reason || `Manual Admin Point Adjustment (${adjustPoints > 0 ? '+' : ''}${adjustPoints})`]
    );

    await connection.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, "LOYALTY", "Loyalty Points Adjustment", ?)',
      [account.user_id, `Your loyalty reward points were adjusted by ${adjustPoints > 0 ? '+' : ''}${adjustPoints} points. Reason: ${reason || 'Admin adjustment'}.`]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: `Points adjusted successfully (${adjustPoints > 0 ? '+' : ''}${adjustPoints} pts).`,
      currentPoints: newCurrent,
      tier: newTier
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Points adjust error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust loyalty points in database.' });
  }
});

module.exports = router;
