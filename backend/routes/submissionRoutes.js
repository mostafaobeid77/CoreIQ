const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');

router.post('/food', auth, submissionController.submitFood);
router.post('/workout', auth, submissionController.submitWorkout);
router.get('/my-submissions', auth, submissionController.getMySubmissions);

module.exports = router;




