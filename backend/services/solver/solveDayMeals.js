/**
 * SIMPLE RELIABLE MEAL SOLVER
 * 
 * Goals:
 * 1. Hit calories within ±2%
 * 2. Hit protein within ±5%
 * 3. Accept carbs/fats within ±15%
 */

function solveDayMeals(dayMeals, smartBuffet, targets) {
    const distributions = {
        3: { 'Breakfast': 0.30, 'Lunch': 0.40, 'Dinner': 0.30 },
        4: { 'Breakfast': 0.25, 'Snack 1': 0.10, 'Lunch': 0.35, 'Dinner': 0.30 },
        5: { 'Breakfast': 0.22, 'Snack 1': 0.10, 'Lunch': 0.30, 'Snack 2': 0.10, 'Dinner': 0.28 },
        6: { 'Breakfast': 0.20, 'Snack 1': 0.10, 'Lunch': 0.30, 'Snack 2': 0.10, 'Dinner': 0.20, 'Snack 3': 0.10 }
    };

    const mealDistribution = distributions[targets.mealsPerDay] || distributions[4];

    // Step 1: Process meals from AI selection
    let processedMeals = [];
    const usedSections = new Set();

    if (dayMeals && dayMeals.meals) {
        dayMeals.meals.forEach(meal => {
            if (targets.mealSections.includes(meal.mealType)) {
                processedMeals.push(resolveMeal(meal, meal.mealType, smartBuffet));
                usedSections.add(meal.mealType);
            }
        });
    }

    // Fill missing sections
    targets.mealSections.forEach(section => {
        if (!usedSections.has(section)) {
            const defaultMeal = {
                mealType: section,
                items: [1, 15]
            };
            processedMeals.push(resolveMeal(defaultMeal, section, smartBuffet));
        }
    });

    // Add drinks to each meal (ONLY if missing)
    processedMeals.forEach(meal => {
        const hasDrink = meal.items.some(item => item.category === 'drinks');
        if (!hasDrink) {
            const drinkItem = selectDrinkForMeal(meal.mealType, smartBuffet, targets);
            if (drinkItem) {
                meal.items.push(drinkItem);
            }
        }
    });

    console.log(`\n🔍 [SOLVER] Day Input: ${processedMeals.map(m => m.items.map(i => i.name).join('+')).join(', ')}`);

    // Step 2: Initial portions
    processedMeals.forEach(meal => {
        const mealCalTarget = Math.round(targets.calories * (mealDistribution[meal.mealType] || 0.10));
        distributeGramsInitial(meal, mealCalTarget);
    });

    // Step 3: Robust Convergence Solver
    const CAL_TOLERANCE = 0.02;
    const PRO_TOLERANCE = 0.05;
    const MAX_ITERATIONS = 20;

    console.log(`🎯 [SOLVER] Target: ${targets.calories}kcal, ${targets.protein}g P, ${targets.carbs}g C, ${targets.fats}g F`);

    for (let mainIter = 0; mainIter < MAX_ITERATIONS; mainIter++) {
        const totals = calculateDayTotals(processedMeals);

        // Check if we are close enough
        const calDiffPct = Math.abs(1 - (totals.calories / targets.calories));
        const proDiffPct = Math.abs(1 - (totals.protein / targets.protein));

        // Stricter checking: Cal < 2% off, Pro < 5% off (or just under max if we are stricter)
        if (calDiffPct < CAL_TOLERANCE && proDiffPct < PRO_TOLERANCE) {
            console.log(`✅ Converged at iter ${mainIter}: ${totals.calories}kcal, ${totals.protein}g P`);
            break;
        }

        // 1. CALORIE ADJUSTMENT (Global Scale)
        // But be careful not to scale UP if protein is already too high
        const calRatio = targets.calories / Math.max(1, totals.calories);

        // If we need to scale UP (ratio > 1) BUT protein is already too high (> 1.05 target),
        // we should NOT scale up high-protein items.
        const proteinIsTooHigh = totals.protein > targets.protein * 1.05;

        processedMeals.forEach(meal => {
            meal.items.forEach(item => {
                let scalingFactor = calRatio;

                // If scaling up and protein is high, freeze high-protein items
                if (calRatio > 1 && proteinIsTooHigh && item.p > 10) {
                    scalingFactor = 1.0; // Don't increase
                }

                // Apply scaling
                item.grams *= scalingFactor;
                item.grams = Math.max(20, Math.min(item.grams, 500));
            });
        });

        // 2. PROTEIN ADJUSTMENT (Targeted)
        const currentTotals = calculateDayTotals(processedMeals);
        const currentProDiff = targets.protein - currentTotals.protein;

        // If protein is OFF by more than tolerance
        if (Math.abs(currentProDiff / targets.protein) > PRO_TOLERANCE) {
            const allItems = processedMeals.flatMap(m => m.items);

            if (currentProDiff > 0) {
                // Protein is LOW -> Increase high-protein items
                const proItems = allItems.filter(i => i.p > 15).sort((a, b) => b.p - a.p).slice(0, 3);
                proItems.forEach(item => {
                    item.grams *= 1.15; // Boost by 15%
                    item.grams = Math.max(20, Math.min(item.grams, 500));
                });
            } else {
                // Protein is HIGH -> Decrease high-protein items
                const highProItems = allItems.filter(i => i.p > 15).sort((a, b) => b.p - a.p).slice(0, 4);
                highProItems.forEach(item => {
                    item.grams *= 0.85; // Reduce by 15%
                    item.grams = Math.max(20, Math.min(item.grams, 500));
                });
            }
        }
    }

    // FINAL SAFEGUARD: Hard cap on limits
    // If we exited loop and protein is STILL crazy high, force reduce it
    // and rely on fats/carbs to hold the calories up.
    for (let iter = 0; iter < 10; iter++) { // Increased iterations
        const totals = calculateDayTotals(processedMeals);
        if (totals.protein <= targets.protein * 1.05) break; // Accept 5% overage max

        console.log(`⚠️ Final Safeguard: ${totals.protein}g > target. Switching calories from Protein to Carbs/Fats.`);

        const allItems = processedMeals.flatMap(m => m.items);

        // 1. Identify items to cut (High Protein) and items to boost (Low Protein)
        const highProItems = allItems.filter(i => i.p > 12).sort((a, b) => b.p - a.p);
        const fillerItems = allItems.filter(i => i.p < 8 && i.cal > 0); // Broader definition of fillers

        if (highProItems.length === 0) break;

        // 2. Calculate calories to remove from Protein
        let caloriesRemoved = 0;
        highProItems.forEach(item => {
            const oldGrams = item.grams;
            item.grams *= 0.90; // Cut by 10%
            item.grams = Math.max(20, item.grams);

            const gramDiff = oldGrams - item.grams;
            caloriesRemoved += (gramDiff / 100) * item.cal;
        });

        // 3. Redistribute those calories to Fillers
        if (fillerItems.length > 0 && caloriesRemoved > 0) {
            const caloriesPerFiller = caloriesRemoved / fillerItems.length;

            fillerItems.forEach(item => {
                const gramsToAdd = (caloriesPerFiller / item.cal) * 100;
                item.grams += gramsToAdd;
                item.grams = Math.min(item.grams, 600); // Respect limit
            });
        }
    }

    const finalTotals = calculateDayTotals(processedMeals);
    console.log(`📊 FINAL: ${finalTotals.calories}kcal | ${finalTotals.protein}g P | ${finalTotals.carbs}g C | ${finalTotals.fats}g F\n`);

    // Step 4: Format output
    const result = {
        meals: processedMeals.map(meal => ({
            mealType: meal.mealType,
            items: meal.items.map(item => {
                const portionRatio = item.grams / 100;
                const itemData = {
                    foodId: item._id,
                    name: item.name,
                    quantity: Math.round(item.grams),
                    unit: item.category === 'drinks' ? 'ml' : 'grams',
                    calories: Math.round(item.cal * portionRatio),
                    protein: Math.round(item.p * portionRatio),
                    carbs: Math.round(item.c * portionRatio),
                    fats: Math.round(item.f * portionRatio),
                    caloriesPer100g: item.cal,
                    proteinPer100g: item.p,
                    carbsPer100g: item.c,
                    fatsPer100g: item.f,
                    category: item.category // Persist category
                };
                return itemData;
            })
        })),
        totals: {
            calories: Math.round(finalTotals.calories),
            protein: Math.round(finalTotals.protein),
            carbs: Math.round(finalTotals.carbs),
            fats: Math.round(finalTotals.fats)
        }
    };

    return result;
}

function resolveMeal(aiMeal, type, buffet) {
    const items = (aiMeal.items || [1]).map(idx => {
        let food = null;
        if (typeof idx === 'number') {
            food = buffet[idx - 1] || buffet[0];
        } else {
            food = buffet.find(f => f._id === idx) || buffet[0];
        }
        return { ...food, grams: 100 };
    });

    return {
        mealType: type,
        items: items
    };
}

function distributeGramsInitial(meal, targetCals) {
    const items = meal.items;
    if (items.length === 0) return;

    const targetPerItem = targetCals / items.length;
    items.forEach(item => {
        item.grams = (targetPerItem / item.cal) * 100;
        item.grams = Math.max(30, Math.min(item.grams, 500));
    });
}

function calculateDayTotals(meals) {
    let t = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    meals.forEach(m => {
        m.items.forEach(i => {
            const ratio = i.grams / 100;
            t.calories += ratio * i.cal;
            t.protein += ratio * i.p;
            t.carbs += ratio * i.c;
            t.fats += ratio * i.f;
        });
    });
    return {
        calories: Math.round(t.calories),
        protein: Math.round(t.protein),
        carbs: Math.round(t.carbs),
        fats: Math.round(t.fats)
    };
}

// Helper function to select a drink for a meal
function selectDrinkForMeal(mealType, buffet, targets) {
    const isBreakfast = mealType.toLowerCase().includes('breakfast');
    const isLowCarb = targets.dietType === 'low_carb';

    // Filter drinks from buffet
    const drinks = buffet.filter(f => f.category === 'drinks');

    if (drinks.length === 0) return null;

    let suitableDrinks = [];

    if (isLowCarb) {
        // Low-carb: only zero-calorie drinks
        suitableDrinks = drinks.filter(d => d.cal === 0);
    } else if (isBreakfast) {
        // Breakfast: coffee, tea, juice
        suitableDrinks = drinks.filter(d =>
            d.name.toLowerCase().includes('coffee') ||
            d.name.toLowerCase().includes('tea') ||
            d.name.toLowerCase().includes('juice') ||
            d.name.toLowerCase().includes('milk') ||
            (d.cal <= 50 && d.c < 15)
        );
    } else {
        // Other meals: low-calorie drinks
        suitableDrinks = drinks.filter(d => d.cal <= 50);
    }

    // Fallback to any drink if no suitable ones found
    if (suitableDrinks.length === 0) {
        suitableDrinks = drinks.filter(d => d.cal === 0);
    }
    if (suitableDrinks.length === 0) {
        suitableDrinks = drinks; // Last resort
    }

    // Select a random drink from suitable options
    const selectedDrink = suitableDrinks[Math.floor(Math.random() * suitableDrinks.length)];

    // Return with minimal grams (drinks don't need much quantity)
    return { ...selectedDrink, grams: 100 }; // 100ml standard serving
}

module.exports = solveDayMeals;
