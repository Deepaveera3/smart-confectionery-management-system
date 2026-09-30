const mongoose = require('mongoose');

const loyaltyAccountSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, unique: true, index: true },
  loyalty_card_number: { type: String, required: true, unique: true },
  current_points: { type: Number, default: 0 },
  total_points_earned: { type: Number, default: 0 },
  total_points_redeemed: { type: Number, default: 0 },
  tier: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold', 'Royal'], 
    default: 'Bronze' 
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

module.exports = mongoose.models.LoyaltyAccount || mongoose.model('LoyaltyAccount', loyaltyAccountSchema);
