const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category_id: { type: mongoose.Schema.Types.Mixed, default: null },
  category: { type: String, default: 'Bakery' },
  category_slug: { type: String, default: 'bakery' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  stock_quantity: { type: Number, default: 0 },
  weight_size: { type: String, default: '500g' },
  ingredients: { type: String, default: '' },
  is_available: { type: Number, default: 1 },
  is_featured: { type: Number, default: 0 },
  is_best_seller: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  legacy_id: { type: Number, default: null }
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

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
