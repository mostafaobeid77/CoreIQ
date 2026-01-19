const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

const { requireAdmin } = require('../middleware/adminMiddleware');

router.post('/login', adminAuthController.login);
router.get('/me', requireAdmin, adminAuthController.getMe);

module.exports = router;


