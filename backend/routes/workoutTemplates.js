const express = require('express');
const router = express.Router();
const workoutTemplates = require('../data/workoutTemplates');

// Get all workout templates
router.get('/templates', (req, res) => {
    try {
        // Return templates as an array with metadata
        const templates = Object.keys(workoutTemplates).map(key => ({
            id: key,
            ...workoutTemplates[key]
        }));

        res.json({ success: true, templates });
    } catch (error) {
        console.error('Error fetching workout templates:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch workout templates' });
    }
});

// Get a specific workout template by ID
router.get('/templates/:templateId', (req, res) => {
    try {
        const { templateId } = req.params;
        const template = workoutTemplates[templateId];

        if (!template) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }

        res.json({ success: true, template: { id: templateId, ...template } });
    } catch (error) {
        console.error('Error fetching workout template:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch workout template' });
    }
});

// Get recommended templates based on user goal
router.get('/templates/recommend/:goal', (req, res) => {
    try {
        const { goal } = req.params;

        // Filter templates that match the goal
        const recommended = Object.keys(workoutTemplates)
            .filter(key => workoutTemplates[key].goal.some(g => goal.includes(g)))
            .map(key => ({
                id: key,
                ...workoutTemplates[key]
            }));

        res.json({ success: true, templates: recommended });
    } catch (error) {
        console.error('Error getting recommended templates:', error);
        res.status(500).json({ success: false, error: 'Failed to get recommendations' });
    }
});

module.exports = router;
