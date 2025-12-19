const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    // Removed enum constraint to support dynamic meal sections per user
    index: true
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: [true, 'Food ID is required']
  },
  name: {
    type: String,
    required: [true, 'Food name is required']
  },
  brand: {
    type: String,
    default: 'Generic'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be greater than 0']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['grams', 'servings']
  },
  calories: {
    type: Number,
    required: [true, 'Calories is required'],
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    required: [true, 'Protein is required'],
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: [true, 'Carbs is required'],
    min: [0, 'Carbs cannot be negative']
  },
  fats: {
    type: Number,
    required: [true, 'Fats is required'],
    min: [0, 'Fats cannot be negative']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null,
    index: true
  },
  planDay: {
    type: Number,
    min: 1,
    max: 14,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
MealSchema.index({ userId: 1, date: 1, mealType: 1 });
MealSchema.index({ foodId: 1 });
MealSchema.index({ isCompleted: 1 }, { sparse: true });

module.exports = mongoose.model('Meal', MealSchema);




