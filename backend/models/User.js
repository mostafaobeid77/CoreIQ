const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name must be less than 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: 'Birth date cannot be in the future'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be either male or female'
    }
  },
  profilePhoto: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Physical stats
  weight: {
    type: Number,
    default: 0,
    min: [0, 'Weight cannot be negative']
  },
  height: {
    type: Number,
    default: 0,
    min: [0, 'Height cannot be negative']
  },
  activityLevel: {
    type: String,
    default: 'Moderate',
    enum: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active']
  },
  goalWeight: {
    type: String,
    default: 'Not set'
  },
  // Calculated nutrition targets
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
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailVerified: 1 }, { sparse: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate and update nutrition targets
UserSchema.methods.calculateNutritionTargets = function () {
  // Only calculate if we have valid data
  if (!this.weight || this.weight <= 0 || !this.height || this.height <= 0 || !this.birthDate) {
    this.targetCalories = 0;
    this.targetProtein = 0;
    this.targetCarbs = 0;
    this.targetFats = 0;
    return;
  }

  // Calculate age
  const age = Math.floor((new Date() - new Date(this.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));

  // BMR calculation (Mifflin-St Jeor)
  const isMale = this.gender === 'male';
  const bmr = isMale
    ? 10 * this.weight + 6.25 * this.height - 5 * age + 5
    : 10 * this.weight + 6.25 * this.height - 5 * age - 161;

  // TDEE based on activity level
  const activityMultipliers = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Active': 1.725,
    'Very Active': 1.9
  };
  const tdee = bmr * (activityMultipliers[this.activityLevel] || 1.55);

  // Adjust for goal
  let targetCalories = tdee;
  let proteinPerKg = 2.0;
  let fatPercent = 0.25;

  if (this.goalWeight && this.goalWeight.includes('Lose')) {
    targetCalories -= 500; // caloric deficit
    proteinPerKg = 2.2; // higher protein to preserve muscle
    fatPercent = 0.20; // lower fat
  } else if (this.goalWeight && this.goalWeight.includes('Gain')) {
    targetCalories += 300; // caloric surplus
    proteinPerKg = 1.8; // slightly lower protein
    fatPercent = 0.30; // higher fat for hormones
  }

  // Ensure minimum calories
  const minCalories = isMale ? 1800 : 1400;
  if (targetCalories < minCalories) targetCalories = minCalories;

  // Calculate macros
  const targetProtein = Math.round(this.weight * proteinPerKg);
  const targetFats = Math.round((targetCalories * fatPercent) / 9);
  const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFats * 9)) / 4);

  // Update targets
  this.targetCalories = Math.round(targetCalories);
  this.targetProtein = Math.max(targetProtein, 50);
  this.targetCarbs = Math.max(targetCarbs, 100);
  this.targetFats = Math.max(targetFats, 30);
};

// Method to return user without password
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);

