const express = require('express');
const router = express.Router();
const { requireAdmin, requireSuperadmin } = require('../middleware/adminMiddleware');
const adminRequestController = require('../controllers/adminRequestController');

// Public: Submit request
router.post('/', adminRequestController.submitRequest);

// Super Admin Only: Manage requests
router.get('/', requireAdmin, requireSuperadmin, adminRequestController.getRequests);
router.post('/:id/approve', requireAdmin, requireSuperadmin, adminRequestController.approveRequest);
router.post('/:id/reject', requireAdmin, requireSuperadmin, adminRequestController.rejectRequest);
router.delete('/:id', requireAdmin, requireSuperadmin, adminRequestController.deleteRequest);

module.exports = router;
