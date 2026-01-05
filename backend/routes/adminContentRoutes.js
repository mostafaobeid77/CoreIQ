const express = require('express');
const router = express.Router();
const adminContentController = require('../controllers/adminContentController');

// Workouts
router.get('/workouts', adminContentController.getWorkouts);
router.post('/workouts', adminContentController.createWorkout);
router.put('/workouts/:id', adminContentController.updateWorkout);
router.delete('/workouts/:id', adminContentController.deleteWorkout);

// Meals (Foods)
router.get('/meals', adminContentController.getFoods);
router.post('/meals', adminContentController.createFood);
router.delete('/meals/:id', adminContentController.deleteFood);

module.exports = router;
