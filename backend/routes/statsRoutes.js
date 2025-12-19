const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.get('/:date', auth, statsController.getStats);
router.get('/', auth, statsController.getStatsRange);
router.put('/:date', auth, statsController.updateStats);
router.patch('/:date', auth, statsController.patchStats);

module.exports = router;



