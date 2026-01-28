const mongoose = require('mongoose');

const AdminRequestSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must be less than 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        minlength: [10, 'Reason must be at least 10 characters']
    },
    availability: {
        type: String, // e.g., "10 hrs/week", "Weekends"
        required: [true, 'Availability is required']
    },
    department: {
        type: String, // e.g., "Nutrition", "Workouts"
        required: [true, 'Department is required']
    },
    experience: {
        type: String, // e.g., "3 years as PT"
        required: [true, 'Experience is required']
    },
    cvLink: {
        type: String, // e.g., LinkedIn URL
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
AdminRequestSchema.index({ email: 1 });
AdminRequestSchema.index({ status: 1 });

module.exports = mongoose.model('AdminRequest', AdminRequestSchema);
