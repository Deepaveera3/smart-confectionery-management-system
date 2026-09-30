const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otp_code: { type: String, required: true },
  purpose: { type: String, default: 'SIGNUP_VERIFICATION' },
  expires_at: { type: Date, required: true },
  is_verified: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at' },
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

module.exports = mongoose.models.OtpVerification || mongoose.model('OtpVerification', otpVerificationSchema);
