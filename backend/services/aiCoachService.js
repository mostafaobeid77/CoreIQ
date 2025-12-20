const groqService = require('./groqService');
const Food = require('../models/Food');
const Plan = require('../models/Plan');
const solveDayMeals = require('./solver/solveDayMeals');
const { createSmartBuffet } = require('./buffet/createSmartBuffet');

class AICoachService {
    /**
     * AI-powered food swap
     * Replaces a food item in a meal based on user preference
     */
    async swapFood(planId, dayIndex, mealType, foodId, userMessage) {
        try {
            // 1. Get the plan and find the current food
            const plan = await Plan.findById(planId);
            if (!plan) throw new Error('Plan not found');

            const day = plan.mealPlan[dayIndex];
            if (!day) throw new Error('Day not found');

            const currentMeal = day.meals.find(m => m.mealType === mealType);
            if (!currentMeal) throw new Error('Meal not found');

            const currentFood = currentMeal.findIndex(item => item.foodId.toString() === foodId);
            if (currentFood === -1) throw new Error('Food not found');

            const foodToSwap = currentMeal[currentFood];

            // 2. Get similar foods from database
            const allFoods = await Food.find({});
            const buffet = createSmartBuffet(allFoods, 9999);

            // Find foods with similar macros (±30% tolerance)
            const similarFoods = buffet.filter(f => {
                const calorieMatch = Math.abs(f.cal - foodToSwap.caloriesPer100g) / foodToSwap.caloriesPer100g < 0.3;
                const proteinMatch = Math.abs(f.p - foodToSwap.proteinPer100g) / Math.max(1, foodToSwap.proteinPer100g) < 0.3;
                return calorieMatch && proteinMatch && f._id.toString() !== foodId;
            }).slice(0, 15); // Top 15 similar foods

            if (similarFoods.length === 0) {
                return {
                    success: false,
                    message: "Couldn't find similar foods. Try removing this item instead."
                };
            }

            // 3. Ask AI to pick the best replacement
            const aiPrompt = `You are a nutrition coach helping a user swap food in their meal plan.

Current food: ${foodToSwap.name} (${foodToSwap.calories}kcal, ${foodToSwap.protein}g protein)
User's request: "${userMessage || 'Find me a similar alternative'}"

Available similar foods:
${similarFoods.map((f, i) => `${i + 1}. ${f.name} (${f.cal}kcal/100g, ${f.p}g protein/100g)`).join('\n')}

Respond ONLY with a JSON object (no markdown, no explanation):
{
  "choiceIndex": <number 1-${similarFoods.length}>,
  "reason": "<one sentence why this is a good swap>"
}`;

            const aiResponse = await groqService.chat([
                { role: 'user', content: aiPrompt }
            ]);

            // Parse AI response
            let aiChoice;
            try {
                const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                aiChoice = JSON.parse(cleanResponse);
            } catch (e) {
                // Fallback: pick first similar food
                aiChoice = { choiceIndex: 1, reason: "Selected based on similar nutritional profile." };
            }

            const replacement = similarFoods[aiChoice.choiceIndex - 1] || similarFoods[0];

            // 4. Return swap suggestion (don't modify plan yet)
            return {
                success: true,
                replacement: {
                    foodId: replacement._id,
                    name: replacement.name,
                    caloriesPer100g: replacement.cal,
                    proteinPer100g: replacement.p,
                    carbsPer100g: replacement.c,
                    fatsPer100g: replacement.f,
                    suggestedQuantity: foodToSwap.quantity // Start with same quantity
                },
                aiReason: aiChoice.reason,
                message: `AI suggests: ${replacement.name}. ${aiChoice.reason}`
            };

        } catch (error) {
            console.error('[AI COACH] Swap error:', error);
            throw error;
        }
    }

    /**
     * Apply a food swap to the plan
     * This actually modifies the plan in the database
     */
    async applyFoodSwap(planId, dayIndex, mealType, oldFoodId, newFoodId, newQuantity) {
        try {
            const plan = await Plan.findById(planId);
            if (!plan) throw new Error('Plan not found');

            const day = plan.mealPlan[dayIndex];
            const mealIndex = day.meals.findIndex(m => m.mealType === mealType && m.foodId.toString() === oldFoodId);

            if (mealIndex === -1) throw new Error('Meal item not found');

            // Get new food details
            const newFood = await Food.findById(newFoodId);
            if (!newFood) throw new Error('New food not found');

            // Update the meal item
            const portionRatio = newQuantity / 100;
            day.meals[mealIndex] = {
                mealType: mealType,
                foodId: newFood._id,
                name: newFood.name,
                quantity: newQuantity,
                unit: 'grams',
                calories: Math.round(newFood.nutrients.calories * portionRatio),
                protein: Math.round(newFood.nutrients.protein * portionRatio),
                carbs: Math.round(newFood.nutrients.carbs * portionRatio),
                fats: Math.round(newFood.nutrients.fats * portionRatio),
                caloriesPer100g: newFood.nutrients.calories,
                proteinPer100g: newFood.nutrients.protein,
                carbsPer100g: newFood.nutrients.carbs,
                fatsPer100g: newFood.nutrients.fats
            };

            await plan.save();

            return {
                success: true,
                message: 'Food swapped successfully!',
                updatedDay: day
            };

        } catch (error) {
            console.error('[AI COACH] Apply swap error:', error);
            throw error;
        }
    }

    /**
     * AI-powered workout swap
     * Replaces a workout based on user preference
     */
    async swapWorkout(planId, dayIndex, workoutId, userMessage) {
        try {
            // 1. Get the plan and find the current workout
            const plan = await Plan.findById(planId);
            if (!plan) throw new Error('Plan not found');

            const day = plan.workoutPlan[dayIndex];
            if (!day) throw new Error('Day not found');

            const currentWorkoutIndex = day.workouts.findIndex(w => w.workoutId.toString() === workoutId);
            if (currentWorkoutIndex === -1) throw new Error('Workout not found');

            const workoutToSwap = day.workouts[currentWorkoutIndex];

            // 2. Get similar workouts from database
            const Workout = require('../models/Workout');
            const allWorkouts = await Workout.find({});

            // Find workouts with similar type/muscle groups
            const similarWorkouts = allWorkouts.filter(w => {
                if (w._id.toString() === workoutId) return false;

                // Match by type
                if (w.type === workoutToSwap.type) return true;

                // Match by muscle groups if available
                if (workoutToSwap.muscleGroups && w.muscleGroups) {
                    const overlap = workoutToSwap.muscleGroups.some(mg =>
                        w.muscleGroups.includes(mg)
                    );
                    if (overlap) return true;
                }

                return false;
            }).slice(0, 15); // Top 15 similar workouts

            if (similarWorkouts.length === 0) {
                return {
                    success: false,
                    message: "Couldn't find similar workouts. Try browsing manually."
                };
            }

            // 3. Ask AI to pick the best replacement and extract parameters
            const aiPrompt = `You are a fitness coach helping a user swap a workout.

Current workout: ${workoutToSwap.name} (Type: ${workoutToSwap.type})
User's request: "${userMessage || 'Find me a similar alternative'}"

Available similar workouts:
${similarWorkouts.map((w, i) => `${i + 1}. ${w.name} (${w.type}${w.muscleGroups ? ', ' + w.muscleGroups.join(', ') : ''})`).join('\n')}

Respond ONLY with a JSON object (no markdown, no explanation):
{
  "choiceIndex": <number 1-${similarWorkouts.length}>,
  "reason": "<one sentence why this is a good swap>",
  "suggestedDuration": <number in minutes, ONLY if user specified duration or if it is cardio, else null>,
  "suggestedSets": <number, ONLY if user specified sets, else null>,
  "suggestedReps": <number, ONLY if user specified reps, else null>
}`;

            const aiResponse = await groqService.chat([
                { role: 'user', content: aiPrompt }
            ]);

            // Parse AI response
            let aiChoice;
            try {
                const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                aiChoice = JSON.parse(cleanResponse);
            } catch (e) {
                // Fallback: pick first similar workout
                aiChoice = { choiceIndex: 1, reason: "Selected based on similar exercise type." };
            }

            const replacement = similarWorkouts[aiChoice.choiceIndex - 1] || similarWorkouts[0];

            // 4. Return swap suggestion
            return {
                success: true,
                replacement: {
                    workoutId: replacement._id,
                    name: replacement.name,
                    type: replacement.type,
                    muscleGroups: replacement.muscleGroups || [],
                    equipment: replacement.equipment || [],
                    difficulty: replacement.difficulty || 'Intermediate',
                    suggestedSets: aiChoice.suggestedSets || workoutToSwap.sets || 3,
                    // If multiple reps provided, use them, otherwise array of single rep
                    suggestedReps: aiChoice.suggestedReps
                        ? [aiChoice.suggestedReps, aiChoice.suggestedReps, aiChoice.suggestedReps]
                        : (workoutToSwap.reps || [10, 10, 10]),
                    suggestedMinutes: aiChoice.suggestedDuration || (workoutToSwap.minutes || 30)
                },
                aiReason: aiChoice.reason,
                message: `AI suggests: ${replacement.name}. ${aiChoice.reason}`
            };

        } catch (error) {
            console.error('[AI COACH] Workout swap error:', error);
            throw error;
        }
    }

    /**
     * Apply a workout swap to the plan
     */
    async applyWorkoutSwap(planId, dayIndex, oldWorkoutId, newWorkoutId, sets = 3, reps = [10, 10, 10], minutes = 0) {
        try {
            const plan = await Plan.findById(planId);
            if (!plan) throw new Error('Plan not found');

            const day = plan.workoutPlan[dayIndex];
            const workoutIndex = day.workouts.findIndex(w => w.workoutId.toString() === oldWorkoutId);

            if (workoutIndex === -1) throw new Error('Workout not found');

            // Get new workout details
            const Workout = require('../models/Workout');
            const newWorkout = await Workout.findById(newWorkoutId);
            if (!newWorkout) throw new Error('New workout not found');

            // Construct new workout entry
            const newEntry = {
                workoutId: newWorkout._id,
                name: newWorkout.name,
                type: newWorkout.type,
                muscleGroups: newWorkout.muscleGroups || [],
                equipment: newWorkout.equipment || [],
                caloriesBurned: 100 // Default estimate
            };

            // Handle Cardio vs Strength structure
            const isCardio = (newWorkout.category && newWorkout.category.toLowerCase() === 'cardio') ||
                (newWorkout.type && newWorkout.type.toLowerCase() === 'cardio');

            if (isCardio || minutes > 0) {
                newEntry.minutes = minutes || 30;
                newEntry.sets = []; // Cardio usually doesn't have sets in this schema
                // But keep sets empty array to avoid frontend crashes if it expects it
            } else {
                newEntry.sets = sets;
                newEntry.reps = Array.isArray(reps) ? reps : Array(sets).fill(reps);
                newEntry.weight = new Array(sets).fill(0);
                newEntry.minutes = 0;
            }

            // Update the workout item
            day.workouts[workoutIndex] = newEntry;

            await plan.save();

            return {
                success: true,
                message: 'Workout swapped successfully!',
                updatedDay: day
            };

        } catch (error) {
            console.error('[AI COACH] Apply workout swap error:', error);
            throw error;
        }
    }
}

module.exports = new AICoachService();

