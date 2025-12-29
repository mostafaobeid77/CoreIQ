/**
 * Admin Stats Controller
 * Dashboard metrics, SSE events, and user management for admin panel
 */

const User = require('../models/User');
const Admin = require('../models/Admin');
const Plan = require('../models/Plan');
const Workout = require('../models/Workout');
const Food = require('../models/Food');
const AuditLog = require('../models/AuditLog');

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();

        // Run all counts in parallel for performance
        const [
            totalUsers,
            activeAdmins,
            totalAdmins,
            activePlans,
            totalWorkouts,
            pendingWorkouts,
            totalMeals
        ] = await Promise.all([
            User.countDocuments(),
            Admin.countDocuments({ isActive: true }),
            Admin.countDocuments(),
            Plan.countDocuments({ endDate: { $gte: now } }),
            Workout.countDocuments(),
            Workout.countDocuments({ status: 'pending' }),
            Food.countDocuments()
        ]);

        return res.json({
            stats: {
                totalUsers,
                activeAdmins,
                totalAdmins,
                activePlans,
                totalWorkouts,
                pendingWorkouts,
                totalMeals
            },
            generatedAt: now.toISOString()
        });
    } catch (error) {
        console.error('getDashboardStats error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

/**
 * Get recent audit log events (for polling fallback)
 */
exports.getRecentEvents = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const since = req.query.since ? new Date(req.query.since) : null;

        const query = since ? { createdAt: { $gt: since } } : {};

        const events = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.json({
            events,
            count: events.length,
            latestTimestamp: events.length > 0 ? events[0].createdAt : null
        });
    } catch (error) {
        console.error('getRecentEvents error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch events' });
    }
};

/**
 * SSE endpoint for live events stream
 */
exports.streamEvents = async (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Keep track of last event timestamp
    let lastEventTime = new Date();

    // Poll for new events every 2 seconds
    const pollInterval = setInterval(async () => {
        try {
            const newEvents = await AuditLog.find({ createdAt: { $gt: lastEventTime } })
                .sort({ createdAt: 1 })
                .limit(20)
                .lean();

            if (newEvents.length > 0) {
                lastEventTime = newEvents[newEvents.length - 1].createdAt;

                for (const event of newEvents) {
                    res.write(`data: ${JSON.stringify({ type: 'event', event })}\n\n`);
                }
            }

            // Send heartbeat every poll to keep connection alive
            res.write(`: heartbeat ${Date.now()}\n\n`);
        } catch (error) {
            console.error('SSE poll error:', error.message);
        }
    }, 2000);

    // Clean up on client disconnect
    req.on('close', () => {
        clearInterval(pollInterval);
        res.end();
    });
};

/**
 * Get user details with their activity/plans
 */
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's plans
        const plans = await Plan.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Get user's recent activity
        const recentActivity = await AuditLog.find({
            actorType: 'user',
            actorId: userId
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return res.json({
            user,
            plans,
            recentActivity
        });
    } catch (error) {
        console.error('getUserDetails error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch user details' });
    }
};

/**
 * Generate invite code for new admin registration
 */

