const express = require('express');
const router = express.Router();
const workoutEntryController = require('../controllers/workoutEntryController');
const auth = require('../middleware/auth');

router.get('/:date', auth, workoutEntryController.getWorkoutEntriesByDate);
router.post('/', auth, workoutEntryController.addWorkoutEntry);
router.post('/:id/toggle', auth, workoutEntryController.toggleWorkout);
router.delete('/:id', auth, workoutEntryController.deleteWorkoutEntry);

module.exports = router;










