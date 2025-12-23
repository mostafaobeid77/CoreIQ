const express = require('express');
const router = express.Router();
const mealTemplateService = require('../services/mealTemplateService');

// Get available template types
router.get('/types', (req, res) => {
    try {
        const types = mealTemplateService.getTemplates();
        res.json({ success: true, types });
    } catch (error) {
        console.error('Error fetching template types:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch template types' });
    }
});

// Generate a full plan from a template type
router.get('/generate/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const targetCalories = parseInt(req.query.targetCalories) || 2000;

        // Accept user's calculated macro targets (override template defaults)
        const targetProtein = req.query.targetProtein ? parseInt(req.query.targetProtein) : null;
        const targetCarbs = req.query.targetCarbs ? parseInt(req.query.targetCarbs) : null;
        const targetFats = req.query.targetFats ? parseInt(req.query.targetFats) : null;

        // Accept user's meal sections (e.g., "Breakfast,Snack,Lunch,Dinner")
        const mealSections = req.query.mealSections ? req.query.mealSections.split(',').map(s => s.trim()) : null;

        const options = { targetCalories };
        if (targetProtein) options.targetProtein = targetProtein;
        if (targetCarbs) options.targetCarbs = targetCarbs;
        if (targetFats) options.targetFats = targetFats;
        if (mealSections) options.mealSections = mealSections;

        console.log(`🎯 [ROUTE] LOW-CARB DEBUG - Type: ${type}, Received targetCarbs: ${targetCarbs}, targetProtein: ${targetProtein}, targetFats: ${targetFats}`);

        // Default to 14 days
        const plan = await mealTemplateService.generateTemplate(type, 14, options);
        res.json({ success: true, plan });
    } catch (error) {
        console.error('Generate template error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate template' });
    }
});

module.exports = router;
