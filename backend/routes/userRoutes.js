const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, userController.getProfile);
router.get('/:id/photo', userController.getProfilePhoto); // Publicly accessible for lazy loading (protected by Obscurity + potential rate limiting globally)
router.put('/profile', auth, userController.updateProfile);
router.patch('/stats', auth, userController.updateUserStats);
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;



