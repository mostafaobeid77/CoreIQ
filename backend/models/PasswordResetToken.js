const mongoose = require('mongoose');
const crypto = require('crypto');

const PasswordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  token: {
    type: String,
    required: true
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
}, {
  timestamps: true
});

// Indexes
PasswordResetTokenSchema.index({ token: 1 }, { unique: true });
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to generate token
PasswordResetTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);










