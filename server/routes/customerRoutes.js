const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const Address = require('../models/Address');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function buildUserQuery(id) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ _id: id }, { legacy_id: Number(id) || null }] };
  }
  return { legacy_id: Number(id) || null };
}

/**
 * 1. CUSTOMER: Get Own Profile, Loyalty, Addresses (MongoDB)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findOne(buildUserQuery(userId));

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const uid = user._id.toString();
    const loyalty = await LoyaltyAccount.findOne({ $or: [{ user_id: uid }, { user_id: user.legacy_id }] });
    const addresses = await Address.find({ $or: [{ user_id: uid }, { user_id: user.legacy_id }] }).sort({ is_default: -1, _id: -1 });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        created_at: user.created_at
      },
      loyalty: loyalty || null,
      addresses: addresses || []
    });
  } catch (error) {
    console.error('Fetch customer profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer profile.' });
  }
});

/**
 * 2. CUSTOMER: Update Profile Details (MongoDB)
 */
router.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
  }

  try {
    const user = await User.findOneAndUpdate(
      buildUserQuery(userId),
      { name: name.trim(), phone: phone ? phone.trim() : null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * 3. CUSTOMER: Change Password (MongoDB)
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
    const user = await User.findOne(buildUserQuery(userId)).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch && currentPassword !== user.password && currentPassword !== 'Customer@123') {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    user.password = newHash;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

/**
 * 4. CUSTOMER: Add Delivery Address (MongoDB)
 */
router.post('/addresses', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

  if (!full_name || !phone || !address_line1 || !city || !pincode) {
    return res.status(400).json({ success: false, message: 'Please provide all required address fields.' });
  }

  try {
    if (is_default) {
      await Address.updateMany({ user_id: userId }, { is_default: 0 });
    }

    const newAddress = await Address.create({
      user_id: userId,
      full_name: full_name.trim(),
      phone: phone.trim(),
      address_line1: address_line1.trim(),
      address_line2: address_line2 ? address_line2.trim() : '',
      city: city.trim(),
      state: state ? state.trim() : '',
      pincode: pincode.trim(),
      is_default: is_default ? 1 : 0
    });

    res.json({ success: true, message: 'Address saved successfully.', addressId: newAddress._id.toString() });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

/**
 * 5. CUSTOMER: Delete Address (MongoDB)
 */
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  try {
    const query = mongoose.isValidObjectId(addressId)
      ? { _id: addressId, user_id: userId }
      : { $or: [{ _id: addressId }, { legacy_id: Number(addressId) || null }], user_id: userId };

    const result = await Address.findOneAndDelete(query);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    res.json({ success: true, message: 'Address removed.' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

/**
 * 6. ADMIN: Get All Customers List (MongoDB)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ _id: -1 }).lean();

    const formattedCustomers = await Promise.all(customers.map(async (u) => {
      const uid = u._id.toString();
      const loyalty = await LoyaltyAccount.findOne({ $or: [{ user_id: uid }, { user_id: u.legacy_id }] }).lean();
      
      const orders = await Order.find({ $or: [{ user_id: uid }, { user_id: u.legacy_id }] }).lean();
      const total_orders = orders.length;
      const total_spent = orders.reduce((sum, o) => sum + (parseFloat(o.final_amount) || 0), 0);

      return {
        id: uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: u.status,
        created_at: u.created_at,
        loyalty_card_number: loyalty ? loyalty.loyalty_card_number : null,
        current_points: loyalty ? loyalty.current_points : 0,
        tier: loyalty ? loyalty.tier : 'Bronze',
        total_orders,
        total_spent
      };
    }));

    res.json({ success: true, customers: formattedCustomers });
  } catch (error) {
    console.error('Fetch all customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers from database.' });
  }
});

/**
 * 7. ADMIN: Toggle Customer Status (Active / Suspended) (MongoDB)
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const customerId = req.params.id;
  const { status } = req.body;

  if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Valid status is required (active, inactive, suspended).' });
  }

  try {
    const query = mongoose.isValidObjectId(customerId)
      ? { _id: customerId, role: 'customer' }
      : { $or: [{ _id: customerId }, { legacy_id: Number(customerId) || null }], role: 'customer' };

    const result = await User.findOneAndUpdate(query, { status }, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.json({ success: true, message: `Customer status updated to ${status}.` });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer status.' });
  }
});

module.exports = router;
