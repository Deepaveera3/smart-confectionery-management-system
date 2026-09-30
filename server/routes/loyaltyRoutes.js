const express = require('express');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Notification = require('../models/Notification');
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
  if (totalEarned >= 1000) return 'Royal';
  if (totalEarned >= 500) return 'Gold';
  if (totalEarned >= 200) return 'Silver';
  return 'Bronze';
}

// 1. Get Customer Loyalty (my-account, my-card, customer)
async function handleGetCustomerLoyalty(req, res) {
  const userId = req.user.id;
  try {
    let account = await LoyaltyAccount.findOne({ user_id: userId });

    if (!account) {
      const cardNumber = `SH-LOYAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      account = await LoyaltyAccount.create({ user_id: userId, loyalty_card_number: cardNumber, current_points: 50, total_points_earned: 50, tier: 'Bronze' });
      await LoyaltyTransaction.create({ loyalty_account_id: account._id, user_id: userId, points: 50, transaction_type: 'BONUS', description: 'Welcome Bonus Points' });
    }

    const dynamicTier = calculateTier(account.total_points_earned || 0);
    if (dynamicTier !== account.tier) {
      await LoyaltyAccount.findByIdAndUpdate(account._id, { tier: dynamicTier });
      account.tier = dynamicTier;
    }

    const transactions = await LoyaltyTransaction.find({ loyalty_account_id: account._id }).sort({ createdAt: -1 }).limit(50).lean();

    res.json({
      success: true,
      account: { ...account.toObject(), id: account._id.toString(), tier: dynamicTier },
      transactions: transactions.map(t => ({ ...t, id: t._id.toString() })),
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

// 2. Daily Check-in
router.post('/daily-checkin', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    let account = await LoyaltyAccount.findOne({ user_id: userId });
    if (!account) return res.status(404).json({ success: false, message: 'Loyalty account not found.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyClaimed = await LoyaltyTransaction.findOne({
      loyalty_account_id: account._id,
      transaction_type: 'BONUS',
      description: { $regex: 'Daily Check-in', $options: 'i' },
      created_at: { $gte: today, $lt: tomorrow }
    });

    if (alreadyClaimed) {
      return res.status(400).json({ success: false, message: 'Daily reward already claimed today! Check back tomorrow.' });
    }

    const rewardPoints = 10;
    const newCurrent = account.current_points + rewardPoints;
    const newTotal = account.total_points_earned + rewardPoints;
    const newTier = calculateTier(newTotal);

    await LoyaltyAccount.findByIdAndUpdate(account._id, { current_points: newCurrent, total_points_earned: newTotal, tier: newTier });
    await LoyaltyTransaction.create({ loyalty_account_id: account._id, user_id: userId, points: rewardPoints, transaction_type: 'BONUS', description: 'Daily Check-in Streak Bonus (+10 pts)' });
    await Notification.create({ user_id: userId, type: 'LOYALTY', title: 'Daily Reward Claimed!', message: 'You received +10 loyalty reward points for checking in today.', is_read: 0 });

    res.json({ success: true, message: 'Daily check-in reward claimed! +10 points added.', pointsAdded: rewardPoints, currentPoints: newCurrent, tier: newTier });
  } catch (error) {
    console.error('Daily check-in error:', error);
    res.status(500).json({ success: false, message: 'Failed to claim daily check-in reward.' });
  }
});

// 3. ADMIN: Get All Loyalty Accounts
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const accounts = await LoyaltyAccount.find({}).sort({ current_points: -1 }).lean();
    const transactions = await LoyaltyTransaction.find({}).sort({ createdAt: -1 }).limit(50).lean();

    res.json({
      success: true,
      accounts: accounts.map(a => ({ ...a, id: a._id.toString() })),
      transactions: transactions.map(t => ({ ...t, id: t._id.toString() })),
      rules: DEFAULT_LOYALTY_RULES
    });
  } catch (error) {
    console.error('Fetch all loyalty accounts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch loyalty accounts.' });
  }
});

// 4. ADMIN: Adjust Loyalty Points
router.post('/adjust', authenticateToken, requireAdmin, async (req, res) => {
  const { account_id, user_id, points, reason } = req.body;
  const adjustPoints = parseInt(points);
  if (isNaN(adjustPoints) || (!account_id && !user_id)) {
    return res.status(400).json({ success: false, message: 'Valid account identifier and point adjustment amount are required.' });
  }

  try {
    let account = account_id
      ? await LoyaltyAccount.findById(account_id)
      : await LoyaltyAccount.findOne({ user_id });

    if (!account) return res.status(404).json({ success: false, message: 'Loyalty account not found.' });

    const newCurrent = Math.max(0, account.current_points + adjustPoints);
    const newTotal = adjustPoints > 0 ? account.total_points_earned + adjustPoints : account.total_points_earned;
    const newTier = calculateTier(newTotal);

    await LoyaltyAccount.findByIdAndUpdate(account._id, { current_points: newCurrent, total_points_earned: newTotal, tier: newTier });
    await LoyaltyTransaction.create({
      loyalty_account_id: account._id,
      user_id: account.user_id,
      points: adjustPoints,
      transaction_type: 'ADMIN_ADJUSTMENT',
      description: reason || `Manual Admin Point Adjustment (${adjustPoints > 0 ? '+' : ''}${adjustPoints})`
    });
    await Notification.create({
      user_id: account.user_id, type: 'LOYALTY',
      title: 'Loyalty Points Adjustment',
      message: `Your loyalty reward points were adjusted by ${adjustPoints > 0 ? '+' : ''}${adjustPoints} points. Reason: ${reason || 'Admin adjustment'}.`,
      is_read: 0
    });

    res.json({ success: true, message: `Points adjusted successfully (${adjustPoints > 0 ? '+' : ''}${adjustPoints} pts).`, currentPoints: newCurrent, tier: newTier });
  } catch (error) {
    console.error('Points adjust error:', error);
    res.status(500).json({ success: false, message: 'Failed to adjust loyalty points in database.' });
  }
});

module.exports = router;
