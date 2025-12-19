const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: [true, 'Reps is required'],
    min: [1, 'Reps must be at least 1']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  }
}, { _id: false });

const WorkoutEntrySchema = new mongoose.Schema({
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
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: [true, 'Workout ID is required']
  },
  workoutType: {
    type: String,
    required: [true, 'Workout type is required'],
    enum: ['strength', 'cardio']
  },
  // Denormalized fields for fast access
  name: {
    type: String,
    required: [true, 'Workout name is required']
  },
  description: {
    type: String,
    default: ''
  },
  muscle_group: {
    type: String
  },
  // For strength workouts
  sets: [SetSchema],
  // For cardio workouts
  minutes: {
    type: Number,
    default: 0,
    min: [0, 'Minutes cannot be negative']
  },
  isCompleted: {
    type: Boolean,
    default: false
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

// Custom validation
WorkoutEntrySchema.pre('validate', function(next) {
  if (this.workoutType === 'strength') {
    if (!this.sets || this.sets.length === 0) {
      return next(new Error('Strength workouts must have at least one set'));
    }
  } else if (this.workoutType === 'cardio') {
    if (this.minutes <= 0) {
      return next(new Error('Cardio workouts must have minutes > 0'));
    }
  }
  next();
});

// Indexes
WorkoutEntrySchema.index({ userId: 1, date: 1 });
WorkoutEntrySchema.index({ workoutId: 1 });
WorkoutEntrySchema.index({ muscle_group: 1 });

module.exports = mongoose.model('WorkoutEntry', WorkoutEntrySchema);




