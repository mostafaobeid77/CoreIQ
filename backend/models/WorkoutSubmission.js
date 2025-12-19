const mongoose = require('mongoose');

const WorkoutSubmissionSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  muscle_group: { type: String, required: true },
  equipment: { type: String, default: '' },
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

WorkoutSubmissionSchema.index({ submittedBy: 1, status: 1 });
WorkoutSubmissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('WorkoutSubmission', WorkoutSubmissionSchema);




