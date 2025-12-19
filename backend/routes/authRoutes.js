const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-code', authController.verifyCode);
router.post('/reset-password', authController.resetPassword);
router.post('/request-email-verification', authController.requestEmailVerification);
router.post('/verify-email', authController.verifyEmail);

// Protected route
router.get('/me', auth, authController.getMe);

module.exports = router;







