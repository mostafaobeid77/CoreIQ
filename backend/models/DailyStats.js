const mongoose = require('mongoose');

const mentalHealthEnum = [
  'Motivated', 'Neutral', 'Stressed', 'Tired', 'Sad', 'Confident', 'Overwhelmed'
];

const activityLevelEnum = [
  'Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'
];

const DailyStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  water: {
    type: Number,
    default: 0,
    min: [0, 'Water cannot be negative']
  },
  sleep: {
    type: Number,
    default: 0,
    min: [0, 'Sleep cannot be negative'],
    max: [24, 'Sleep cannot be more than 24 hours']
  },
  mental: {
    type: String,
    enum: mentalHealthEnum,
    default: 'Neutral'
  },
  walking: {
    type: Number,
    default: 0,
    min: [0, 'Walking steps cannot be negative']
  },
  weight: {
    type: Number,
    default: 0,
    min: [0, 'Weight must be positive or zero']
  },
  weightSource: {
    type: String,
    enum: ['manual', 'estimated'],
    default: 'manual'
  },
  estimatedMeta: {
    type: mongoose.Schema.Types.Mixed, // Stores details like netCalories, calculation range
    default: null
  },
  height: {
    type: Number,
    default: 0,
    min: [0, 'Height must be positive or zero']
  },
  activityLevel: {
    type: String,
    enum: activityLevelEnum,
    default: 'Moderate'
  },
  goalWeight: {
    type: String,
    default: 'Not set'
  },
  targetCalories: {
    type: Number,
    default: 0,
    min: [0, 'Target calories cannot be negative']
  },
  targetProtein: {
    type: Number,
    default: 0,
    min: [0, 'Target protein cannot be negative']
  },
  targetCarbs: {
    type: Number,
    default: 0,
    min: [0, 'Target carbs cannot be negative']
  },
  targetFats: {
    type: Number,
    default: 0,
    min: [0, 'Target fats cannot be negative']
  },
  caloriesBurnedWorkouts: {
    type: Number,
    default: 0,
    min: [0, 'Calories burned from workouts cannot be negative']
  },
  caloriesBurnedSteps: {
    type: Number,
    default: 0,
    min: [0, 'Calories burned from steps cannot be negative']
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0,
    min: [0, 'Total calories burned cannot be negative']
  },
  workoutsCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Workouts completed cannot be negative']
  },
  workoutsTotal: {
    type: Number,
    default: 0,
    min: [0, 'Total workouts cannot be negative']
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
DailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });
DailyStatsSchema.index({ date: 1 });

module.exports = mongoose.model('DailyStats', DailyStatsSchema);

