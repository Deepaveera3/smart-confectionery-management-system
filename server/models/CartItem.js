const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_id: { type: mongoose.Schema.Types.Mixed, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  customization: { type: mongoose.Schema.Types.Mixed, default: null }
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

cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
