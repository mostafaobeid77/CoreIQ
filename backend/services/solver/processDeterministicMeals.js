const solveDayMeals = require('./solveDayMeals');

/**
 * PROCESS DETERMINISTIC MEAL PLAN
 * 
 * Process AI's idx-based meal plan into full meal objects with calculated grams.
 * Calls solveDayMeals for each day to enforce exact targets.
 */
function processDeterministicMeals(aiMealPlan, smartBuffet, targets) {
    const processedDays = [];

    // Log Start
    console.log(`\n🔄 [SOLVER] Starting deterministic processing for ${targets.calories} kcal, ${targets.protein}g Protein`);

    for (let dayNum = 1; dayNum <= 14; dayNum++) {
        let day = aiMealPlan.find(d => d.day === dayNum);

        if (!day) {
            day = { day: dayNum, meals: [] };
        }

        // Ensure meals array exists
        if (!day.meals) day.meals = [];

        // SOLVE DAY
        const solvedDay = solveDayMeals(day, smartBuffet, targets);

        // Flatten items for final structure
        const flatMeals = [];
        solvedDay.meals.forEach(meal => {
            meal.items.forEach(item => {
                flatMeals.push({
                    mealType: meal.mealType,
                    foodId: item.foodId,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fats: item.fats,
                    // Pass through per-100g values
                    caloriesPer100g: item.caloriesPer100g,
                    proteinPer100g: item.proteinPer100g,
                    carbsPer100g: item.carbsPer100g,
                    carbsPer100g: item.carbsPer100g,
                    fatsPer100g: item.fatsPer100g,
                    category: item.category // Passed through from solver items
                });
            });
        });

        // Calculate Totals for Log/Validation
        const dayTotals = solvedDay.totals;
        const calDiff = dayTotals.calories - targets.calories;
        const proDiff = dayTotals.protein - targets.protein;

        // Log Status
        const statusIcon = (Math.abs(calDiff) < 50 && Math.abs(proDiff) <= 5) ? '✅' : '⚠️';
        console.log(`${statusIcon} Day ${dayNum}: ${dayTotals.calories} kcal (Diff: ${calDiff}), ${dayTotals.protein}g P (Diff: ${proDiff}g)`);

        processedDays.push({
            day: dayNum,
            meals: flatMeals,
            totals: dayTotals
        });
    }

    return processedDays;
}

module.exports = processDeterministicMeals;
