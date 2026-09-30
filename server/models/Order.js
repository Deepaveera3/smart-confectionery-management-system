const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.Mixed, default: null },
  product_name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  subtotal: { type: Number, required: true, default: 0 },
  customization_details: { type: mongoose.Schema.Types.Mixed, default: null }
}, {
  _id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      return ret;
    }
  }
});

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  customer_name: { type: String, default: '' },
  customer_email: { type: String, default: '' },
  total_amount: { type: Number, required: true, default: 0 },
  discount_amount: { type: Number, default: 0 },
  delivery_fee: { type: Number, default: 0 },
  loyalty_discount: { type: Number, default: 0 },
  final_amount: { type: Number, required: true, default: 0 },
  payment_status: { 
    type: String, 
    enum: ['Pending', 'Successful', 'Failed', 'Refunded'], 
    default: 'Successful' 
  },
  order_status: { 
    type: String, 
    enum: ['Order Placed', 'Order Confirmed', 'Preparing', 'Baking', 'Quality Check', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Order Placed' 
  },
  delivery_address: { type: String, required: true },
  delivery_instructions: { type: String, default: '' },
  points_earned: { type: Number, default: 0 },
  points_redeemed: { type: Number, default: 0 },
  items: [orderItemSchema],
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

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
