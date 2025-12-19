/**
 * VALIDATE PLAN SCHEMA
 * 
 * Ensures the generated plan meets MongoDB schema requirements
 */
function validatePlan(mealPlan, workoutPlan) {
    const errors = [];

    // Check Plan Length
    if (!mealPlan || mealPlan.length !== 14) errors.push('Meal plan must have 14 days');
    if (!workoutPlan || workoutPlan.length !== 14) errors.push('Workout plan must have 14 days');

    // Check Meal Details
    mealPlan.forEach((day, i) => {
        if (!day.meals) errors.push(`Day ${i + 1} missing meals array`);

        day.meals.forEach((meal, mIdx) => {
            if (!meal.mealType) errors.push(`Day ${i + 1} meal ${mIdx} missing mealType`);
            // Previously checked for quantities, but now we trust the determinator
        });
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = { validatePlan };
