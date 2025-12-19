const mongoose = require('mongoose');

/**
 * VALIDATE PLAN SCHEMA
 * 
 * Validates meal and workout plans against Mongoose schemas
 * Ensures all enums, ObjectIds, and required fields are valid
 */

const VALID_MEAL_TYPES = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
const VALID_WORKOUT_TYPES = ['strength', 'cardio'];

function validateMealPlan(mealPlan) {
    const errors = [];

    mealPlan.forEach((day, dayIdx) => {
        if (!day.meals || !Array.isArray(day.meals)) {
            errors.push(`Day ${day.day}: meals array missing or invalid`);
            return;
        }

        day.meals.forEach((meal, mealIdx) => {
            // Validate mealType enum
            if (!VALID_MEAL_TYPES.includes(meal.mealType)) {
                errors.push(`Day ${day.day}, Meal ${mealIdx}: Invalid mealType "${meal.mealType}"`);
            }

            // Validate foodId
            if (!mongoose.Types.ObjectId.isValid(meal.foodId)) {
                errors.push(`Day ${day.day}, Meal ${mealIdx}: Invalid foodId "${meal.foodId}"`);
            }

            // Validate unit
            if (meal.unit !== 'grams') {
                errors.push(`Day ${day.day}, Meal ${mealIdx}: Invalid unit "${meal.unit}" (must be "grams")`);
            }

            // Validate required numeric fields
            if (typeof meal.quantity !== 'number' || meal.quantity <= 0) {
                errors.push(`Day ${day.day}, Meal ${mealIdx}: Invalid quantity`);
            }
            if (typeof meal.calories !== 'number' || meal.calories < 0) {
                errors.push(`Day ${day.day}, Meal ${mealIdx}: Invalid calories`);
            }
            if (typeof meal.protein !== 'number' || meal.protein < 0) {
                errors.push(`Day ${day.day}, Meal ${mealIdx}: Invalid protein`);
            }
        });
    });

    return errors;
}

function validateWorkoutPlan(workoutPlan) {
    const errors = [];

    workoutPlan.forEach((day, dayIdx) => {
        if (!day.workouts || !Array.isArray(day.workouts)) {
            errors.push(`Day ${day.day}: workouts array missing or invalid`);
            return;
        }

        day.workouts.forEach((workout, workoutIdx) => {
            // Validate workoutType enum
            if (!VALID_WORKOUT_TYPES.includes(workout.workoutType)) {
                errors.push(`Day ${day.day}, Workout ${workoutIdx}: Invalid workoutType "${workout.workoutType}"`);
            }

            // Validate workoutId
            if (!mongoose.Types.ObjectId.isValid(workout.workoutId)) {
                errors.push(`Day ${day.day}, Workout ${workoutIdx}: Invalid workoutId`);
            }

            // Validate strength workouts have sets
            if (workout.workoutType === 'strength') {
                if (!workout.sets || !Array.isArray(workout.sets) || workout.sets.length === 0) {
                    errors.push(`Day ${day.day}, Workout ${workoutIdx}: Strength workout missing sets`);
                }
            }

            // Validate cardio workouts have minutes
            if (workout.workoutType === 'cardio') {
                if (typeof workout.minutes !== 'number' || workout.minutes <= 0) {
                    errors.push(`Day ${day.day}, Workout ${workoutIdx}: Cardio workout missing or invalid minutes`);
                }
            }
        });
    });

    return errors;
}

function validatePlan(mealPlan, workoutPlan) {
    const mealErrors = validateMealPlan(mealPlan);
    const workoutErrors = validateWorkoutPlan(workoutPlan);

    return {
        isValid: mealErrors.length === 0 && workoutErrors.length === 0,
        errors: [...mealErrors, ...workoutErrors]
    };
}

module.exports = {
    validatePlan,
    validateMealPlan,
    validateWorkoutPlan
};
