const mongoose = require('mongoose');

const UserPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  units: {
    type: String,
    enum: ['metric', 'imperial'],
    default: 'metric'
  },
  waterRemindersEnabled: {
    type: Boolean,
    default: false
  },
  wellnessRemindersEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index
UserPreferencesSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('UserPreferences', UserPreferencesSchema);










