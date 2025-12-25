const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.get('/range', auth, statsController.getStatsRange);
router.get('/progress-report', auth, statsController.getAdherenceReport);
router.get('/:date', auth, statsController.getStats);
router.put('/:date', auth, statsController.updateStats);
router.post('/apply-estimated-weight', auth, statsController.applyEstimatedWeight);
router.patch('/:date', auth, statsController.patchStats);

module.exports = router;
