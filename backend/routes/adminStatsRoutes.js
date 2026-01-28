const express = require('express');
const router = express.Router();
const adminStatsController = require('../controllers/adminStatsController');
const { requireAdmin, requireSuperadmin } = require('../middleware/adminMiddleware');

// Reports (Date Range Analytics)
router.get('/reports', requireAdmin, adminStatsController.getReportStats);

// Dashboard Stats (Cached)
router.get('/dashboard', requireAdmin, adminStatsController.getDashboardStats);

// Events (all admins)
router.get('/events', requireAdmin, adminStatsController.getRecentEvents);
router.get('/events/stream', requireAdmin, adminStatsController.streamEvents);

// User details (all admins)
router.get('/users/:userId', requireAdmin, adminStatsController.getUserDetails);



module.exports = router;
