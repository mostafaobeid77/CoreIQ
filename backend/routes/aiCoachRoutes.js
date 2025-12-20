const express = require('express');
const router = express.Router();
const aiCoachService = require('../services/aiCoachService');

/**
 * AI Coach - Suggest food swap
 * POST /ai/swap-food/suggest
 */
router.post('/swap-food/suggest', async (req, res) => {
    try {
        const { planId, dayIndex, mealType, foodId, userMessage } = req.body;

        if (!planId || dayIndex === undefined || !mealType || !foodId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await aiCoachService.swapFood(planId, dayIndex, mealType, foodId, userMessage);
        res.json(result);

    } catch (error) {
        console.error('[AI COACH API] Suggest swap error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Coach - Apply food swap
 * POST /ai/swap-food/apply
 */
router.post('/swap-food/apply', async (req, res) => {
    try {
        const { planId, dayIndex, mealType, oldFoodId, newFoodId, newQuantity } = req.body;

        if (!planId || dayIndex === undefined || !mealType || !oldFoodId || !newFoodId || !newQuantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await aiCoachService.applyFoodSwap(planId, dayIndex, mealType, oldFoodId, newFoodId, newQuantity);
        res.json(result);

    } catch (error) {
        console.error('[AI COACH API] Apply swap error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Coach - Suggest workout swap
 * POST /ai/swap-workout/suggest
 */
router.post('/swap-workout/suggest', async (req, res) => {
    try {
        const { planId, dayIndex, workoutId, userMessage } = req.body;

        if (!planId || dayIndex === undefined || !workoutId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await aiCoachService.swapWorkout(planId, dayIndex, workoutId, userMessage);
        res.json(result);

    } catch (error) {
        console.error('[AI COACH API] Suggest workout swap error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Coach - Apply workout swap
 * POST /ai/swap-workout/apply
 */
router.post('/swap-workout/apply', async (req, res) => {
    try {
        const { planId, dayIndex, oldWorkoutId, newWorkoutId, sets, reps, minutes } = req.body;

        if (!planId || dayIndex === undefined || !oldWorkoutId || !newWorkoutId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await aiCoachService.applyWorkoutSwap(planId, dayIndex, oldWorkoutId, newWorkoutId, sets, reps, minutes);
        res.json(result);

    } catch (error) {
        console.error('[AI COACH API] Apply workout swap error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

