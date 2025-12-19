const solveDayMeals = require('./solveDayMeals');

/**
 * PROCESS DETERMINISTIC MEAL PLAN
 * 
 * Process AI's idx-based meal plan into full meal objects with calculated grams
 * Calls solveDayMeals for each day to enforce exact targets
 */
function processMealPlan(aiMealPlan, smartBuffet, targets) {
    const processedDays = [];

    for (let dayNum = 1; dayNum <= 14; dayNum++) {
        let day = aiMealPlan.find(d => d.day === dayNum);

        if (!day) {
            day = { day: dayNum, meals: [] };
        }

        if (!day.meals) day.meals = [];

        // STAGE A: Fill and solve this day
        const solvedDay = solveDayMeals(day, smartBuffet, targets);
        console.log(`[STAGE A] Day ${dayNum} after solveDayMeals: ${solvedDay.totals.calories} kcal, ${solvedDay.totals.protein}g protein`);

        // Flatten items into meals
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
                    fatsPer100g: item.fatsPer100g
                });
            });
        });

        // STAGE B: Recalculate totals from flattened items
        const stageBTotals = {
            calories: flatMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
            protein: flatMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
            carbs: flatMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
            fats: flatMeals.reduce((sum, m) => sum + (m.fats || 0), 0)
        };
        console.log(`[STAGE B] Day ${dayNum} after flattening: ${stageBTotals.calories} kcal, ${stageBTotals.protein}g protein`);

        // FINAL ASSERT
        const calorieDiff = Math.abs(stageBTotals.calories - targets.calories);
        const diffPercent = (calorieDiff / targets.calories) * 100;

        if (diffPercent > 1.5) {
            console.error(`❌ Day ${dayNum} FAILED: ${stageBTotals.calories} kcal vs target ${targets.calories} kcal (${diffPercent.toFixed(1)}% diff)`);
        } else {
            console.log(`✅ Day ${dayNum} within tolerance: ${diffPercent.toFixed(2)}% diff`);
        }

        processedDays.push({
            day: dayNum,
            meals: flatMeals,
            totals: stageBTotals
        });

        console.log(`📅 Day ${dayNum}: ${stageBTotals.calories} kcal, ${stageBTotals.protein}g protein, ${flatMeals.length} meal items`);
    }

    return processedDays;
}

module.exports = processMealPlan;
