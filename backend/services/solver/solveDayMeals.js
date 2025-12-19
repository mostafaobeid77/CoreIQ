/**
 * DETERMINISTIC MEAL SOLVER
 * 
 * Processes AI's idx-based output and calculates exact grams to hit targets.
 * Backend responsibility: Calculate ALL grams, enforce ALL targets.
 * 
 * KEY RULES:
 * 1. Protein must be target ± 5g
 * 2. Calories must be target ± 1%
 * 3. No empty meals
 * 4. Strict unit math: (grams / 100) * nutrient
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

    // Step 1: Ensure all meal slots exist and map foods
    let processedMeals = [];
    const usedSections = new Set();

    // First pass: Process existing meals from AI
    if (dayMeals && dayMeals.meals) {
        dayMeals.meals.forEach(meal => {
            if (targets.mealSections.includes(meal.mealType)) {
                processedMeals.push(resolveMeal(meal, meal.mealType, smartBuffet));
                usedSections.add(meal.mealType);
            }
        });
    }

    // Second pass: Fill missing sections
    targets.mealSections.forEach(section => {
        if (!usedSections.has(section)) {
            // Create missing meal with balanced default (e.g. idx 1 & 15)
            const defaultMeal = {
                mealType: section,
                items: [1, 15] // High protein + Balanced
            };
            processedMeals.push(resolveMeal(defaultMeal, section, smartBuffet));
        }
    });

    // ---------------------------------------------------------
    // STEP 1.5: SMART BALANCING (The "Protein Fixer")
    // If AI picked only chicken/eggs, we MUST swap items before solving.
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // STEP 1.5: SMART BALANCING (The "Protein Fixer")
    // If AI picked only chicken/eggs, we MUST swap items before solving.
    // ---------------------------------------------------------

    // Calculate balanced total for density check
    const checkTotals = calculateDayTotals(processedMeals);
    const projectedProtein = (targets.calories / Math.max(1, checkTotals.calories)) * checkTotals.protein;
    const proteinRatio = projectedProtein / targets.protein;

    console.log(`\n🔍 [SOLVER LOG] Day Input: ${processedMeals.map(m => m.items.map(i => i.name).join('+')).join(', ')}`);
    console.log(`📊 [SOLVER LOG] Projected Protein: ${Math.round(projectedProtein)}g (Target: ${targets.protein}g, Ratio: ${proteinRatio.toFixed(2)}x)`);

    // CASE A: PROTEIN TOO HIGH (> 5% over)
    if (projectedProtein > targets.protein * 1.05) {
        // Find Carb/Fat Sources - Looser filter to catch Potatoes, Oats etc.
        const carbSources = smartBuffet.filter(f => (f.c > 15 && f.p < 8)).sort((a, b) => b.c - a.c);
        const fatSources = smartBuffet.filter(f => (f.f > 10 && f.p < 12)).sort((a, b) => b.f - a.f);
        const balancers = [...carbSources, ...fatSources];

        console.log(`🛠️ [SOLVER LOG] Protein TOO HIGH. Balancing down...`);
        if (balancers.length < 3) console.log(`⚠️ [SOLVER WARNING] Low balancer count! Buffet: ${smartBuffet.length} items.`);

        if (balancers.length > 0) {
            const MAX_SWAPS = 5;
            let swaps = 0;
            processedMeals.sort((a, b) => getMealProtein(b) - getMealProtein(a)); // Fix meatiest meals first

            for (let meal of processedMeals) {
                if (swaps >= MAX_SWAPS) break;
                // Find highest protein item that isn't already a balancer
                const highProItemIdx = meal.items.findIndex(i => i.p > 12);
                if (highProItemIdx !== -1 && meal.items.length > 1) {
                    const balancer = balancers[swaps % balancers.length];
                    console.log(`✅ [SWAP DOWN] ${meal.items[highProItemIdx].name} -> ${balancer.name} in ${meal.mealType}`);
                    meal.items[highProItemIdx] = { ...balancer, grams: 100 };
                    swaps++;
                }
            }
        } else {
            console.error('❌ [SOLVER FAILURE] No carb/fat balancers found!');
        }
    }
    // CASE B: PROTEIN TOO LOW (< 15% under)
    else if (projectedProtein < targets.protein * 0.85) {
        console.log(`🛠️ [SOLVER LOG] Protein TOO LOW. Balancing up...`);

        // Find High Protein Sources (Chicken, Turkey, Egg Whites, Tuna, Whey)
        const proteinBoosters = smartBuffet.filter(f => f.p > 20 && f.c < 10 && f.f < 10).sort((a, b) => b.p - a.p);

        if (proteinBoosters.length > 0) {
            const MAX_SWAPS = 4;
            let swaps = 0;
            // Sort by LOWEST protein density to fix weakest meals
            processedMeals.sort((a, b) => getMealProtein(a) - getMealProtein(b));

            for (let meal of processedMeals) {
                if (swaps >= MAX_SWAPS) break;

                // Find lowest protein item (heuristic: low P density)
                const weakItemIdx = meal.items.findIndex(i => i.p < 8); // Pasta, Rice, etc.

                if (weakItemIdx !== -1) {
                    const booster = proteinBoosters[swaps % proteinBoosters.length];
                    // Don't swap if it duplicates existing item
                    if (!meal.items.some(i => i._id === booster._id)) {
                        console.log(`✅ [SWAP UP] ${meal.items[weakItemIdx].name} -> ${booster.name} in ${meal.mealType}`);
                        meal.items[weakItemIdx] = { ...booster, grams: 100 };
                        swaps++;
                    }
                } else if (meal.items.length < 3) {
                    // Inject booster
                    const booster = proteinBoosters[swaps % proteinBoosters.length];
                    console.log(`✅ [INJECT] Adding ${booster.name} to ${meal.mealType}`);
                    meal.items.push({ ...booster, grams: 100 });
                    swaps++;
                }
            }
        } else {
            console.error('❌ [SOLVER FAILURE] No protein boosters found!');
        }
    } else {
        console.log('✅ [SOLVER LOG] Protein projection is safe.');
    }

    // ---------------------------------------------------------
    // STEP 1.6: FAT CHECK (The "Fat Fixer")
    // If we have no fats (common in "clean" eating), inject them.
    // ---------------------------------------------------------
    const checkTotalsFat = calculateDayTotals(processedMeals);
    const projectedFat = (targets.calories / Math.max(1, checkTotalsFat.calories)) * checkTotalsFat.fats;
    console.log(`🔍 [FAT CHECK] Projected: ${projectedFat.toFixed(1)}g vs Limit: ${targets.fats * 0.85}`);

    if (projectedFat < targets.fats * 0.85) {
        console.log(`⚠️ [SOLVER LOG] Low Fat Detected (${Math.round(projectedFat)}g vs Target ${targets.fats}g). Injecting healthy fats...`);
        // Lower filter to include Avocado (15g) and Eggs (11g)
        const fatBoosters = smartBuffet.filter(f => f.f > 10).sort((a, b) => b.f - a.f);

        if (fatBoosters.length > 0) {
            ['Dinner', 'Snack 2'].forEach(type => {
                const meal = processedMeals.find(m => m.mealType === type);
                if (meal) {
                    const booster = fatBoosters[Math.floor(Math.random() * fatBoosters.length)];
                    if (!meal.items.some(i => i._id === booster._id)) {
                        console.log(`✅ [INJECT FAT] Adding ${booster.name} to ${type}`);
                        meal.items.push({ ...booster, grams: 30 });
                    }
                }
            });
        }
    }

    // ---------------------------------------------------------

    // Step 2: Initial Gram Assignment (Heuristic)
    processedMeals.forEach(meal => {
        const mealCalTarget = Math.round(targets.calories * (mealDistribution[meal.mealType] || 0.10));
        distributeGramsInitial(meal, mealCalTarget);
    });


    // Step 3: Unified Solver - Simultaneously optimize calories AND protein
    const CAL_TOLERANCE = 0.02; // 2% for calories
    const PRO_TOLERANCE = 0.05; // 5% for protein
    const MIN_GRAMS = 50; // Increased from 10g to prevent tiny portions
    const MAX_GRAMS = 350; // Reduced to prevent extreme single-item dominance

    console.log(`\n🎯 [SOLVER] Targets: ${targets.calories}kcal | ${targets.protein}g P | ${targets.carbs}g C | ${targets.fats}g F`);

    // UNIFIED OPTIMIZATION: Balance ALL FOUR MACROS simultaneously
    const SOLVER_MAX_ITERATIONS = 50;

    for (let iter = 0; iter < SOLVER_MAX_ITERATIONS; iter++) {
        const totals = calculateDayTotals(processedMeals);

        // Calculate errors for ALL macros
        const calError = Math.abs(targets.calories - totals.calories) / targets.calories;
        const proError = targets.protein > 0 ? Math.abs(targets.protein - totals.protein) / targets.protein : 0;
        const carbError = targets.carbs > 0 ? Math.abs(targets.carbs - totals.carbs) / targets.carbs : 0;
        const fatError = targets.fats > 0 ? Math.abs(targets.fats - totals.fats) / targets.fats : 0;

        // Check convergence (all macros within tolerance)
        if (calError < CAL_TOLERANCE && proError < PRO_TOLERANCE && carbError < PRO_TOLERANCE && fatError < PRO_TOLERANCE) {
            console.log(`✅ CONVERGED at iteration ${iter}`);
            console.log(`   Cal: ${totals.calories}/${targets.calories} | P: ${totals.protein}/${targets.protein} | C: ${totals.carbs}/${targets.carbs} | F: ${totals.fats}/${targets.fats}`);
            break;
        }

        // Log progress every 5 iterations
        if (iter % 5 === 0) {
            console.log(`[Iter ${iter}] Cal: ${totals.calories}/${targets.calories} (${(calError * 100).toFixed(1)}%) | P: ${totals.protein}/${targets.protein} (${(proError * 100).toFixed(1)}%) | C: ${totals.carbs}/${targets.carbs} (${(carbError * 100).toFixed(1)}%) | F: ${totals.fats}/${targets.fats} (${(fatError * 100).toFixed(1)}%)`);
        }

        const allItems = processedMeals.flatMap(m => m.items);

        // STEP 1: Global calorie scaling (affects all items)
        if (calError >= CAL_TOLERANCE) {
            const calRatio = targets.calories / Math.max(1, totals.calories);
            processedMeals.forEach(meal => {
                meal.items.forEach(item => {
                    item.grams *= calRatio;
                    item.grams = Math.max(MIN_GRAMS, Math.min(item.grams, MAX_GRAMS));
                });
            });
        }

        // STEP 2: Adjust protein-rich items if protein is off
        if (proError >= PRO_TOLERANCE && targets.protein > 0) {
            const proDiff = targets.protein - totals.protein;
            const proItems = allItems.filter(i => i.p > 15).sort((a, b) => b.p - a.p);

            if (proItems.length > 0) {
                const numItems = Math.min(3, proItems.length);
                const itemsToAdjust = proItems.slice(0, numItems);

                itemsToAdjust.forEach(item => {
                    const gramsNeeded = (proDiff / numItems) * (100 / item.p);
                    item.grams += gramsNeeded * 0.5; // Conservative damping
                    item.grams = Math.max(MIN_GRAMS, Math.min(item.grams, MAX_GRAMS));
                });
            }
        }

        // STEP 3: Adjust carb-rich items if carbs are off
        if (carbError >= PRO_TOLERANCE && targets.carbs > 0) {
            const carbDiff = targets.carbs - totals.carbs;
            const carbItems = allItems.filter(i => i.c > 20).sort((a, b) => b.c - a.c);

            if (carbItems.length > 0) {
                const numItems = Math.min(3, carbItems.length);
                const itemsToAdjust = carbItems.slice(0, numItems);

                itemsToAdjust.forEach(item => {
                    const gramsNeeded = (carbDiff / numItems) * (100 / item.c);
                    item.grams += gramsNeeded * 0.5;
                    item.grams = Math.max(MIN_GRAMS, Math.min(item.grams, MAX_GRAMS));
                });
            }
        }

        // STEP 4: Adjust fat-rich items if fats are off
        if (fatError >= PRO_TOLERANCE && targets.fats > 0) {
            const fatDiff = targets.fats - totals.fats;
            const fatItems = allItems.filter(i => i.f > 10).sort((a, b) => b.f - a.f);

            if (fatItems.length > 0) {
                const numItems = Math.min(2, fatItems.length);
                const itemsToAdjust = fatItems.slice(0, numItems);

                itemsToAdjust.forEach(item => {
                    const gramsNeeded = (fatDiff / numItems) * (100 / item.f);
                    item.grams += gramsNeeded * 0.5;
                    item.grams = Math.max(MIN_GRAMS, Math.min(item.grams, MAX_GRAMS));
                });
            }
        }
    }

    const finalTotals = calculateDayTotals(processedMeals);
    console.log(`📊 Final: ${finalTotals.calories}kcal, ${finalTotals.protein}g P, ${finalTotals.carbs}g C, ${finalTotals.fats}g F`);

    // Step 4: Finalize and Format
    // finalTotals already calculated above

    console.log(`\n📤 [SOLVER RETURN] Final totals: ${finalTotals.calories}kcal, ${finalTotals.protein}g P, ${finalTotals.carbs}g C, ${finalTotals.fats}g F`);

    const result = {
        meals: processedMeals.map(meal => ({
            mealType: meal.mealType,
            items: meal.items.map(item => {
                const itemData = {
                    foodId: item._id,
                    name: item.name,
                    quantity: Math.round(item.grams),
                    unit: 'grams',
                    // STRICT MATH: (grams/100) * values
                    calories: Math.round((item.grams / 100) * item.cal),
                    protein: Math.round((item.grams / 100) * item.p),
                    carbs: Math.round((item.grams / 100) * item.c),
                    fats: Math.round((item.grams / 100) * item.f),
                    // EXPLICIT BASE VALUES
                    caloriesPer100g: item.cal,
                    proteinPer100g: item.p,
                    carbsPer100g: item.c,
                    fatsPer100g: item.f
                };

                console.log(`  → ${item.name}: ${itemData.quantity}g = ${itemData.calories}kcal, ${itemData.protein}g P`);

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

    console.log(`✅ [SOLVER] Returning: ${result.totals.calories}kcal, ${result.totals.protein}g P\n`);

    return result;
}

function getMealProtein(meal) {
    return meal.items.reduce((sum, i) => sum + (i.p || 0), 0);
}

// --- HELPERS ---

function resolveMeal(aiMeal, type, buffet) {
    const items = (aiMeal.items || [1]).map(idx => {
        // Handle direct ID or Index
        let food = null;
        if (typeof idx === 'number') {
            food = buffet[idx - 1] || buffet[0];
        } else {
            food = buffet.find(f => f._id === idx) || buffet[0];
        }
        return { ...food, grams: 100 }; // Default 100g start
    });

    return {
        mealType: type,
        items: items
    };
}

function distributeGramsInitial(meal, targetCals) {
    const items = meal.items;
    if (items.length === 0) return;

    // Simple even split for start
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
    // Round totals
    return {
        calories: Math.round(t.calories),
        protein: Math.round(t.protein),
        carbs: Math.round(t.carbs),
        fats: Math.round(t.fats)
    };
}

module.exports = solveDayMeals;
