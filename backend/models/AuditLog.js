const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            // User actions
            'user.signup', 'user.login', 'user.logout', 'user.profile_update',
            'user.plan_created', 'user.plan_updated', 'user.workout_submitted',
            // Admin actions
            'admin.login', 'admin.logout', 'admin.profile_update',
            'admin.created', 'admin.deactivated', 'admin.invite_generated',
            // Content actions
            'workout.created', 'workout.approved', 'workout.rejected', 'workout.deleted',
            'meal.created', 'meal.updated', 'meal.deleted',
            // System actions
            'system.startup', 'system.error'
        ],
        index: true
    },
    actorType: {
        type: String,
        enum: ['user', 'admin', 'system'],
        required: true,
        index: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'actorType',
        default: null
    },
    actorName: {
        type: String,
        default: 'System'
    },
    targetType: {
        type: String,
        enum: ['user', 'admin', 'workout', 'meal', 'plan', 'system', null],
        default: null
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    details: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient querying of recent events
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorType: 1, createdAt: -1 });

// Static helper to log events
AuditLogSchema.statics.log = async function (data) {
    try {
        return await this.create({
            action: data.action,
            actorType: data.actorType || 'system',
            actorId: data.actorId || null,
            actorName: data.actorName || 'System',
            targetType: data.targetType || null,
            targetId: data.targetId || null,
            details: data.details || null,
            metadata: data.metadata || {}
        });
    } catch (error) {
        console.error('AuditLog.log failed:', error.message);
        return null;
    }
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);
