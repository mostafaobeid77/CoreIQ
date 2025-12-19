const express = require('express');
const router = express.Router();
const aiController = require('../ai/aiController'); // NEW MODULAR LOCATION
const auth = require('../middleware/auth');

router.get('/', auth, aiController.getConversations);
router.get('/:id', auth, aiController.getConversation);
router.post('/', auth, aiController.createConversation);
router.put('/:id', auth, aiController.updateConversation);
router.delete('/:id', auth, aiController.deleteConversation);
router.post('/:id/messages', auth, aiController.addMessage);

// Plan-related AI endpoints
router.get('/:id/analyze-needs', auth, aiController.analyzeUserNeeds);
router.post('/:id/generate-plan', auth, aiController.generatePlan);
router.put('/:id/modify-plan/:planId', auth, aiController.modifyPlan);
router.post('/edit-plan', auth, aiController.editPlan);
router.get('/:id/suggest-improvements/:planId', auth, aiController.suggestPlanImprovements);

module.exports = router;




