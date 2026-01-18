const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  muscle_group: { type: String, required: true, index: true },
  equipment: { type: String, required: false, index: true },
  status: {
    type: String,
    enum: ['pending', 'official', 'approved', 'rejected'],
    default: 'official',
    index: true
  }
}, { timestamps: true });

WorkoutSchema.index({ name: 'text', description: 'text', category: 'text', muscle_group: 'text', equipment: 'text' });

module.exports = mongoose.model('Workout', WorkoutSchema);
