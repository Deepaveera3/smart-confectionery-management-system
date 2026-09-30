const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  loyalty_account_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
  points: { type: Number, required: true },
  transaction_type: { 
    type: String, 
    enum: ['EARNED', 'REDEEMED', 'BONUS', 'ADMIN_ADJUSTMENT'], 
    required: true 
  },
  description: { type: String, required: true },
  reference_order_id: { type: mongoose.Schema.Types.Mixed, default: null }
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

module.exports = mongoose.models.LoyaltyTransaction || mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
