const mongoose = require('mongoose');

const NutrientsSchema = new mongoose.Schema({
  calories: { type: Number, default: 0, required: true },
  protein: { type: Number, default: 0, required: true },
  fat: { type: Number, default: 0, required: true },
  carbs: { type: Number, default: 0, required: true },
}, { _id: false });

const ServingSchema = new mongoose.Schema({
  size: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  grams: { type: Number },
}, { _id: false });

const FoodSubmissionSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  nutrients: { type: NutrientsSchema, required: true },
  servings: { type: [ServingSchema], default: [] },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null }
}, { timestamps: true });

FoodSubmissionSchema.index({ submittedBy: 1, status: 1 });
FoodSubmissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('FoodSubmission', FoodSubmissionSchema);




