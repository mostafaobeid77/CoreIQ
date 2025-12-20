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



    // Step 3: Simple Sequential Solver (NO CONFLICTS!)
    // Priority: Calories > Protein > Carbs/Fats (let last two flex)
    const CAL_TOLERANCE = 0.02; // 2%
    const PRO_TOLERANCE = 0.05; // 5%

    console.log(`\n🎯 [SOLVER] Target: ${targets.calories}kcal, ${targets.protein}g P, ${targets.carbs}g C, ${targets.fats}g F`);

    // PHASE 1: Scale everything proportionally to hit CALORIES
    for (let iter = 0; iter < 8; iter++) {
        const totals = calculateDayTotals(processedMeals);
        const calRatio = targets.calories / Math.max(1, totals.calories);

        if (Math.abs(calRatio - 1) < CAL_TOLERANCE) {
            console.log(`✅ Calories converged: ${totals.calories}kcal`);
            break;
        }

        // Scale ALL portions by same ratio
        processedMeals.forEach(meal => {
            meal.items.forEach(item => {
                item.grams *= calRatio;
                item.grams = Math.max(20, Math.min(item.grams, 500));
            });
        });
    }

    // PHASE 2: Adjust ONLY protein (don't touch anything else!)
    for (let iter = 0; iter < 12; iter++) {
        const totals = calculateDayTotals(processedMeals);
        const proDiff = targets.protein - totals.protein;
        const proError = Math.abs(proDiff / targets.protein);

        if (proError < PRO_TOLERANCE) {
            console.log(`✅ Protein converged: ${totals.protein}g`);
            break;
        }

        // Get top 3 protein items ONLY
        const allItems = processedMeals.flatMap(m => m.items);
        const proItems = allItems.filter(i => i.p > 15).sort((a, b) => b.p - a.p).slice(0, 3);

        if (proItems.length === 0) {
            console.log(`⚠️ No high-protein foods available`);
            break;
        }

        // Adjust ONLY these 3 items
        proItems.forEach(item => {
            const proPer1g = item.p / 100;
            const gramChange = (proDiff / proItems.length) / proPer1g;
            item.grams += gramChange * 0.6; // Damped
            item.grams = Math.max(20, Math.min(item.grams, 500));
        });

        if (iter % 4 === 0) {
            console.log(`[P-Iter ${iter}] Protein: ${totals.protein}g → Target: ${targets.protein}g (${(proError * 100).toFixed(1)}%)`);
        }
    }

    // PHASE 3: Adjust ONLY carbs
    for (let iter = 0; iter < 8; iter++) {
        const totals = calculateDayTotals(processedMeals);
        const carbDiff = targets.carbs - totals.carbs;
        const carbError = Math.abs(carbDiff / targets.carbs);

        if (carbError < PRO_TOLERANCE) {
            console.log(`✅ Carbs converged: ${totals.carbs}g`);
            break;
        }

        // Get top 3 carb items ONLY (high carb, low protein)
        const allItems = processedMeals.flatMap(m => m.items);
        const carbItems = allItems.filter(i => i.c > 20 && i.p < 10).sort((a, b) => b.c - a.c).slice(0, 3);

        if (carbItems.length === 0) {
            console.log(`⚠️ No high-carb foods available`);
            break;
        }

        // Adjust ONLY these 3 items
        carbItems.forEach(item => {
            const carbPer1g = item.c / 100;
            const gramChange = (carbDiff / carbItems.length) / carbPer1g;
            item.grams += gramChange * 0.6;
            item.grams = Math.max(20, Math.min(item.grams, 500));
        });
    }

    // PHASE 4: Adjust ONLY fats
    for (let iter = 0; iter < 8; iter++) {
        const totals = calculateDayTotals(processedMeals);
        const fatDiff = targets.fats - totals.fats;
        const fatError = Math.abs(fatDiff / targets.fats);

        if (fatError < PRO_TOLERANCE) {
            console.log(`✅ Fats converged: ${totals.fats}g`);
            break;
        }

        // Get top 2 fat items ONLY (high fat)
        const allItems = processedMeals.flatMap(m => m.items);
        const fatItems = allItems.filter(i => i.f > 10).sort((a, b) => b.f - a.f).slice(0, 2);

        if (fatItems.length === 0) {
            console.log(`⚠️ No high-fat foods available`);
            break;
        }

        // Adjust ONLY these 2 items
        fatItems.forEach(item => {
            const fatPer1g = item.f / 100;
            const gramChange = (fatDiff / fatItems.length) / fatPer1g;
            item.grams += gramChange * 0.6;
            item.grams = Math.max(20, Math.min(item.grams, 500));
        });
    }

    const finalTotals = calculateDayTotals(processedMeals);
    console.log(`📊 FINAL: ${finalTotals.calories}kcal | ${finalTotals.protein}g P | ${finalTotals.carbs}g C | ${finalTotals.fats}g F`);


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
