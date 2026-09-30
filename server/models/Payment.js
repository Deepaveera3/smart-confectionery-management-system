const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.Mixed, required: true },
  order_number: { type: String, default: '' },
  transaction_id: { type: String, required: true, unique: true },
  payment_method: { type: String, default: 'Online / Sandbox Gateway' },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Successful', 'Failed', 'Refunded'], 
    default: 'Successful' 
  },
  gateway_response: { type: mongoose.Schema.Types.Mixed, default: null }
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

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
