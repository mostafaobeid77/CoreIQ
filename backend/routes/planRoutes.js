const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const auth = require('../middleware/auth');

// All routes require authentication
router.get('/', auth, planController.getAllPlans);
router.get('/:id', auth, planController.getPlan);
router.post('/', auth, planController.createPlan);
router.put('/:id', auth, planController.updatePlan);
router.delete('/:id', auth, planController.deletePlan);
router.post('/:id/activate', auth, planController.activatePlan);
router.post('/:id/deactivate', auth, planController.deactivatePlan);
router.get('/:id/progress', auth, planController.getPlanProgress);

module.exports = router;







