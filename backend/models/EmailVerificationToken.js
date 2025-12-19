const mongoose = require('mongoose');

const EmailVerificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

// TTL index to auto-delete expired tokens (MongoDB requires index option at collection level)
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailVerificationToken', EmailVerificationTokenSchema);





