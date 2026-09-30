const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount_type: { type: String, enum: ['percentage', 'flat'], required: true },
  discount_value: { type: Number, required: true },
  min_order_amount: { type: Number, default: 0 },
  max_discount_amount: { type: Number, default: null },
  is_active: { type: Number, default: 1 },
  expiry_date: { type: Date, default: null },
  usage_limit: { type: Number, default: 1000 },
  times_used: { type: Number, default: 0 }
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

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
