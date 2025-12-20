import { API_URLS } from '../constants/api';

const API_BASE_URL = API_URLS[0]; // Use the first configured API URL

interface SwapSuggestion {
    success: boolean;
    replacement?: {
        foodId: string;
        name: string;
        caloriesPer100g: number;
        proteinPer100g: number;
        carbsPer100g: number;
        fatsPer100g: number;
        suggestedQuantity: number;
    };
    aiReason?: string;
    message: string;
}

interface ApplySwapResult {
    success: boolean;
    message: string;
    updatedDay?: any;
}

class AICoachService {
    /**
     * Get AI suggestion for food swap
     */
    async suggestFoodSwap(
        planId: string,
        dayIndex: number,
        mealType: string,
        foodId: string,
        userMessage?: string
    ): Promise<SwapSuggestion> {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/swap-food/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    dayIndex,
                    mealType,
                    foodId,
                    userMessage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get swap suggestion');
            }

            return await response.json();
        } catch (error) {
            console.error('[AI COACH] Suggest swap error:', error);
            throw error;
        }
    }

    /**
     * Apply the food swap
     */
    async applyFoodSwap(
        planId: string,
        dayIndex: number,
        mealType: string,
        oldFoodId: string,
        newFoodId: string,
        newQuantity: number
    ): Promise<ApplySwapResult> {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/swap-food/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    dayIndex,
                    mealType,
                    oldFoodId,
                    newFoodId,
                    newQuantity
                })
            });

            if (!response.ok) {
                throw new Error('Failed to apply swap');
            }

            return await response.json();
        } catch (error) {
            console.error('[AI COACH] Apply swap error:', error);
            throw error;
        }
    }

    /**
     * Get AI suggestion for workout swap
     */
    async suggestWorkoutSwap(
        planId: string,
        dayIndex: number,
        workoutId: string,
        userMessage?: string
    ): Promise<{
        success: boolean;
        replacement?: {
            workoutId: string;
            name: string;
            type: string;
            muscleGroups: string[];
            equipment: string[];
            difficulty: string;
            suggestedSets: number;
            suggestedReps: number[];
            suggestedMinutes?: number;
        };
        aiReason?: string;
        message: string;
    }> {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/swap-workout/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    dayIndex,
                    workoutId,
                    userMessage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get workout swap suggestion');
            }

            return await response.json();
        } catch (error) {
            console.error('[AI COACH] Suggest workout swap error:', error);
            throw error;
        }
    }

    /**
     * Apply the workout swap
     */
    async applyWorkoutSwap(
        planId: string,
        dayIndex: number,
        oldWorkoutId: string,
        newWorkoutId: string,
        sets: number,
        reps: number[],
        minutes?: number
    ): Promise<{
        success: boolean;
        message: string;
        updatedDay?: any;
    }> {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/swap-workout/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    dayIndex,
                    oldWorkoutId,
                    newWorkoutId,
                    sets,
                    reps,
                    minutes
                })
            });

            if (!response.ok) {
                throw new Error('Failed to apply workout swap');
            }

            return await response.json();
        } catch (error) {
            console.error('[AI COACH] Apply workout swap error:', error);
            throw error;
        }
    }
}

export default new AICoachService();

