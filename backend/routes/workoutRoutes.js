const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// GET /api/workouts - Get all workouts or search
router.get('/', workoutController.getAllWorkouts);

// GET /api/workouts/categories - Get all available categories
router.get('/categories', workoutController.getCategories);

// GET /api/workouts/muscle-groups - Get all available muscle groups
router.get('/muscle-groups', workoutController.getMuscleGroups);

module.exports = router;
