const { calculateDayTotals, gramsForCalories } = require('./macroMath');

/**
 * DETERMINISTIC MEAL SOLVER
 * 
 * Processes AI's idx-based output and calculates exact grams to hit targets
 * AI responsibility: Choose foods (idx)
 * Backend responsibility: Calculate ALL grams, enforce ALL targets
 */
function solveDayMeals(dayMeals, smartBuffet, targets) {
    // Meal calorie distributions based on mealsPerDay
    const distributions = {
        3: { 'Breakfast': 0.30, 'Lunch': 0.40, 'Dinner': 0.30 },
        4: { 'Breakfast': 0.25, 'Snack 1': 0.10, 'Lunch': 0.35, 'Dinner': 0.30 },
        5: { 'Breakfast': 0.22, 'Snack 1': 0.10, 'Lunch': 0.30, 'Snack 2': 0.10, 'Dinner': 0.28 },
        6: { 'Breakfast': 0.20, 'Snack 1': 0.10, 'Lunch': 0.30, 'Snack 2': 0.10, 'Dinner': 0.20, 'Snack 3': 0.10 }
    };

    const mealDistribution = distributions[targets.mealsPerDay] || distributions[4];

    // Step 1: Ensure all meal slots exist
    const processedMeals = [];
    for (const mealType of targets.mealSections) {
        let meal = dayMeals.meals.find(m => m.mealType === mealType);

        if (!meal || !meal.items || meal.items.length === 0) {
            // Create missing meal with default high-protein item
            meal = {
                mealType: mealType,
                items: [1] // Default to first item in buffet (highest protein)
            };
        }

        // Step 2: Convert idx to food objects
        const resolvedItems = meal.items.map(idx => {
            if (idx < 1 || idx > smartBuffet.length) {
                return smartBuffet[0]; // Fallback
            }
            return { ...smartBuffet[idx - 1] }; // Clone to avoid mutation
        });

        // Step 3: Calculate meal calorie target
        const mealCalTarget = Math.round(targets.calories * (mealDistribution[mealType] || 0.25));

        // Step 4: Assign grams using protein-first logic
        if (resolvedItems.length === 1) {
            // Single item meal - simple calculation
            const item = resolvedItems[0];
            item.grams = gramsForCalories(item, mealCalTarget);
            item.grams = Math.max(50, Math.min(item.grams, 600)); // Clamp
        } else if (resolvedItems.length === 2) {
            // Two items - 70/30 split (protein/other)
            const proteinItem = resolvedItems.find(f => f.p > 15) || resolvedItems[0];
            const otherItem = resolvedItems.find(f => f !== proteinItem) || resolvedItems[1];

            proteinItem.grams = gramsForCalories(proteinItem, mealCalTarget * 0.7);
            otherItem.grams = gramsForCalories(otherItem, mealCalTarget * 0.3);

            proteinItem.grams = Math.max(100, Math.min(proteinItem.grams, 400));
            otherItem.grams = Math.max(50, Math.min(otherItem.grams, 300));
        } else {
            // Multiple items - protein 60%, carbs 30%, fats 10%
            const proteinItem = resolvedItems.find(f => f.p > 15);
            const carbItem = resolvedItems.find(f => f.c > f.p && f !== proteinItem);
            const fatItem = resolvedItems.find(f => f.f > f.c && f !== proteinItem && f !== carbItem);

            if (proteinItem) {
                proteinItem.grams = gramsForCalories(proteinItem, mealCalTarget * 0.6);
                proteinItem.grams = Math.max(100, Math.min(proteinItem.grams, 400));
            }
            if (carbItem) {
                carbItem.grams = gramsForCalories(carbItem, mealCalTarget * 0.3);
                carbItem.grams = Math.max(50, Math.min(carbItem.grams, 300));
            }
            if (fatItem) {
                fatItem.grams = gramsForCalories(fatItem, mealCalTarget * 0.1);
                fatItem.grams = Math.max(20, Math.min(fatItem.grams, 100));
            }

            // Assign remaining items minimal grams
            resolvedItems.forEach(item => {
                if (!item.grams) item.grams = 50;
            });
        }

        processedMeals.push({
            mealType: mealType,
            items: resolvedItems
        });
    }

    // Step 4.5: SMART FOOD BALANCING
    // Detect if AI chose foods that make targets impossible (e.g., all protein, no carbs)
    const initialTotals = calculateDayTotals(processedMeals);
    const proteinCalorieRatio = initialTotals.protein / (initialTotals.calories || 1);

    // If protein ratio is too high (>0.15), we have too many lean proteins
    if (proteinCalorieRatio > 0.15 || initialTotals.calories < targets.calories * 0.7) {
        console.log(`⚠️ Unbalanced foods detected. Rebalancing...`);

        // Find high-protein/low-calorie items (protein >25g/100g, cal <150/100g)
        const allItems = processedMeals.flatMap(m => m.items);
        const leanProteinItems = allItems.filter(item => item.p > 25 && item.cal < 150);

        // Find balanced items from buffet (moderate protein, good calories)
        const balancedFoods = smartBuffet.filter(f =>
            f.p >= 10 && f.p <= 25 && f.cal >= 200 && f.cal <= 400
        );

        if (leanProteinItems.length > 0 && balancedFoods.length > 0) {
            // Replace half the lean proteins with balanced foods
            const itemsToReplace = Math.ceil(leanProteinItems.length / 2);

            for (let i = 0; i < itemsToReplace && i < balancedFoods.length; i++) {
                const leanItem = leanProteinItems[i];
                const replacement = { ...balancedFoods[i] };
                replacement.grams = leanItem.grams; // Keep same initial grams

                // Find and replace in processedMeals
                processedMeals.forEach(meal => {
                    const index = meal.items.findIndex(item => item._id === leanItem._id);
                    if (index !== -1) {
                        meal.items[index] = replacement;
                    }
                });
            }

            console.log(`✅ Swapped ${itemsToReplace} lean proteins for balanced foods`);
        }
    }

    // Step 5: UNIFIED ITERATIVE SOLVER
    // Simultaneously enforce calories ±1% AND protein ±5g
    const MAX_ITERATIONS = 15;

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        const dayTotals = calculateDayTotals(processedMeals);

        const calorieDiff = targets.calories - dayTotals.calories;
        const calorieError = Math.abs(calorieDiff) / targets.calories;
        const proteinDiff = targets.protein - dayTotals.protein;

        // Check if we're within tolerance
        if (calorieError <= 0.01 && Math.abs(proteinDiff) <= 5) {
            break; // Success!
        }

        // Find protein and non-protein items
        const allItems = processedMeals.flatMap(m => m.items);
        const proteinItems = allItems.filter(item => item.p > 15);
        const carbItems = allItems.filter(item => item.c > item.p && item.p < 15);

        if (proteinItems.length === 0) {
            // No protein items, just scale everything for calories
            const scaleFactor = targets.calories / dayTotals.calories;
            processedMeals.forEach(meal => {
                meal.items.forEach(item => {
                    item.grams = Math.round(item.grams * scaleFactor);
                    item.grams = Math.max(20, Math.min(item.grams, 600));
                });
            });
            continue;
        }

        // Strategy: Adjust protein items for protein, carb items for calories
        if (Math.abs(proteinDiff) > 5) {
            // Adjust protein items
            const proteinAdjustment = proteinDiff / proteinItems.length;
            proteinItems.forEach(item => {
                const gramsNeeded = (proteinAdjustment / item.p) * 100;
                item.grams += Math.round(gramsNeeded);
                item.grams = Math.max(50, Math.min(item.grams, 600));
            });
        }

        // Recalculate and adjust for calories
        const newTotals = calculateDayTotals(processedMeals);
        const newCalorieDiff = targets.calories - newTotals.calories;

        if (Math.abs(newCalorieDiff) > targets.calories * 0.01 && carbItems.length > 0) {
            // Distribute calorie adjustment across carb items
            const calorieAdjustmentPerItem = newCalorieDiff / carbItems.length;
            carbItems.forEach(item => {
                const gramsNeeded = (calorieAdjustmentPerItem / item.cal) * 100;
                item.grams += Math.round(gramsNeeded);
                item.grams = Math.max(20, Math.min(item.grams, 600));
            });
        }
    }

    // Step 6: Final recalculation
    const finalTotals = calculateDayTotals(processedMeals);

    return {
        meals: processedMeals.map(meal => ({
            mealType: meal.mealType,
            items: meal.items.map(item => ({
                foodId: item._id,
                name: item.name,
                quantity: item.grams,
                unit: 'grams',
                calories: Math.round((item.grams / 100) * item.cal),
                protein: Math.round((item.grams / 100) * item.p),
                carbs: Math.round((item.grams / 100) * item.c),
                fats: Math.round((item.grams / 100) * item.f),
                // Explicit per-100g values for frontend
                caloriesPer100g: item.cal,
                proteinPer100g: item.p,
                carbsPer100g: item.c,
                fatsPer100g: item.f
            }))
        })),
        totals: finalTotals
    };
}

module.exports = solveDayMeals;
