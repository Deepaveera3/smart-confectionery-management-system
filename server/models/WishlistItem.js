const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_id: { type: mongoose.Schema.Types.Mixed, required: true }
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

wishlistItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
