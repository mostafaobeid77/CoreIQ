const mongoose = require('mongoose');

// Embedded meal plan item schema
const MealPlanItemSchema = new mongoose.Schema({
  mealType: {
    type: String,
    required: true
    // Removed enum constraint to support dynamic meal sections per user
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.1
  },
  unit: {
    type: String,
    required: true
    // enum removed to allow 'ml', 'cups', etc.
  },
  category: {
    type: String,
    default: 'food'
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fats: {
    type: Number,
    required: true,
    min: 0
  },
  fatsPer100g: { type: Number, default: 0 },
  servings: { type: Array, default: [] }
}, { _id: false });

// Embedded workout plan item schema
const SetSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const WorkoutPlanItemSchema = new mongoose.Schema({
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  workoutType: {
    type: String,
    required: true,
    enum: ['strength', 'cardio']
  },
  muscle_group: {
    type: String
  },
  sets: [SetSchema],
  minutes: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Daily meal plan schema
const DailyMealPlanSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 14
  },
  date: {
    type: Date,
    required: true
  },
  meals: [MealPlanItemSchema]
}, { _id: false });

// Daily workout plan schema
const DailyWorkoutPlanSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 14
  },
  date: {
    type: Date,
    required: true
  },
  workouts: [WorkoutPlanItemSchema]
}, { _id: false });

// Main Plan schema
const PlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: true,
    default: 'My 14-Day Plan',
    maxlength: [100, 'Plan name must be less than 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    index: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  createdBy: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
    default: 'user'
  },
  mealPlan: {
    type: [DailyMealPlanSchema],
    validate: {
      validator: function (v) {
        return v.length === 14;
      },
      message: 'Meal plan must contain exactly 14 days'
    }
  },
  workoutPlan: {
    type: [DailyWorkoutPlanSchema],
    validate: {
      validator: function (v) {
        return v.length === 14;
      },
      message: 'Workout plan must contain exactly 14 days'
    }
  },
  metadata: {
    goal: {
      type: String,
      default: 'Not set'
    },
    targetCalories: {
      type: Number,
      default: 0
    },
    targetProtein: {
      type: Number,
      default: 0
    },
    targetCarbs: {
      type: Number,
      default: 0
    },
    targetFats: {
      type: Number,
      default: 0
    },
    targetFats: {
      type: Number,
      default: 0
    },
    workoutSplit: {
      type: String,
      default: 'Standard'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  progress: {
    mealsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    mealsTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    workoutsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    workoutsTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    daysCompleted: {
      type: Number,
      default: 0,
      min: 0,
      max: 14
    }
  }
}, {
  timestamps: true
});

// Calculate endDate from startDate before saving
PlanSchema.pre('validate', function (next) {
  if (this.startDate && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + 13); // 14 days total (day 1 to day 14)
    this.endDate = endDate;
  }

  // Calculate totals for progress
  if (this.mealPlan && this.mealPlan.length > 0) {
    this.progress.mealsTotal = this.mealPlan.reduce((total, day) => {
      return total + (day.meals ? day.meals.length : 0);
    }, 0);
  }

  if (this.workoutPlan && this.workoutPlan.length > 0) {
    this.progress.workoutsTotal = this.workoutPlan.reduce((total, day) => {
      return total + (day.workouts ? day.workouts.length : 0);
    }, 0);
  }

  next();
});

// Indexes
PlanSchema.index({ userId: 1, status: 1 }); // Compound index for finding active plan
PlanSchema.index({ userId: 1, startDate: 1 });
PlanSchema.index({ status: 1 });

module.exports = mongoose.model('Plan', PlanSchema);







