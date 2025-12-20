const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');
const auth = require('../middleware/auth');

router.get('/:date', auth, mealsController.getMealsByDate);
router.get('/:date/nutrients', auth, mealsController.getTotalNutrients);
router.post('/', auth, mealsController.addMeal);
router.patch('/:id', auth, mealsController.updateMeal);
router.post('/:id/toggle', auth, mealsController.toggleMeal);
router.delete('/:id', auth, mealsController.deleteMeal);
router.delete('/date/:date', auth, mealsController.deleteMealsByDate);

module.exports = router;










