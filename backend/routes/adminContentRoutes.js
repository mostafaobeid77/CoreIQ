const express = require('express');
const router = express.Router();
const adminContentController = require('../controllers/adminContentController');

router.post('/workouts', adminContentController.createWorkout);
router.post('/meals', adminContentController.createFood);

module.exports = router;


