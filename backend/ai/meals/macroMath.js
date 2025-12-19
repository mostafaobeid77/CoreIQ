/**
 * MACRO MATH UTILITIES
 * Pure functions for calculating nutrition values
 */

/**
 * Calculate macros for a given quantity of food
 */
function calculateMacros(food, grams) {
    return {
        calories: Math.round((grams / 100) * food.cal),
        protein: Math.round((grams / 100) * food.p),
        carbs: Math.round((grams / 100) * food.c),
        fats: Math.round((grams / 100) * food.f)
    };
}

/**
 * Calculate total macros for multiple food items
 */
function calculateDayTotals(meals) {
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    meals.forEach(meal => {
        meal.items.forEach(item => {
            const grams = item.grams || 100;
            totals.calories += Math.round((grams / 100) * item.cal);
            totals.protein += Math.round((grams / 100) * item.p);
            totals.carbs += Math.round((grams / 100) * item.c);
            totals.fats += Math.round((grams / 100) * item.f);
        });
    });

    return totals;
}

/**
 * Calculate grams needed to hit target calories for a food
 */
function gramsForCalories(food, targetCalories) {
    if (!food.cal || food.cal === 0) return 100;
    return Math.round((targetCalories / food.cal) * 100);
}

/**
 * Check if macros are within acceptable tolerance
 */
function isWithinTolerance(actual, target, percentTolerance) {
    const diff = Math.abs(actual - target);
    return diff <= (target * percentTolerance);
}

module.exports = {
    calculateMacros,
    calculateDayTotals,
    gramsForCalories,
    isWithinTolerance
};
