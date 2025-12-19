const mongoose = require('mongoose');

const FoodFavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: [true, 'Food ID is required'],
    index: true
  }
}, {
  timestamps: true
});

// Compound unique index
FoodFavoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true });

module.exports = mongoose.model('FoodFavorite', FoodFavoriteSchema);










