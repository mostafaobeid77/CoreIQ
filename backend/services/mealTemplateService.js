const Food = require('../models/Food');
const createSmartBuffet = require('../ai/buffet/createSmartBuffet');
const solveDayMeals = require('./solver/solveDayMeals');

class MealTemplateService {
    constructor() {
        this.templates = [
            {
                id: 'balanced',
                name: 'Balanced',
                description: 'A healthy mix of carbs, proteins, and fats. Good for maintenance.',
                goal: ['Maintain Weight', 'General Health']
            },
            {
                id: 'high_protein',
                name: 'High Protein',
                description: 'Prioritizes protein-rich foods. Ideal for muscle building.',
                goal: ['Gain Weight', 'Lose Weight', 'Build Muscle']
            },
            {
                id: 'low_carb',
                name: 'Low Carb',
                description: 'Reduced carbohydrates, higher in protein and healthy fats.',
                goal: ['Lose Weight']
            },
            {
                id: 'bulking',
                name: 'Bulking',
                description: 'Calorie-dense meals designed to help you gain mass.',
                goal: ['Gain Weight']
            }
        ];
    }

    getTemplates() {
        return this.templates;
    }

    async generateTemplate(type, days = 14, options = {}) {
        const targetCalories = options.targetCalories || 2000;

        // 1. Calculate Macros
        // PRIORITY: Use user's actual calculated targets if provided
        let targetProtein, targetCarbs, targetFats;

        if (options.targetProtein && options.targetCarbs && options.targetFats) {
            // User provided all macros - use them directly
            targetProtein = options.targetProtein;
            targetCarbs = options.targetCarbs;
            targetFats = options.targetFats;
            console.log(`📊 [TEMPLATE] Using user's calculated targets: ${targetProtein}g P, ${targetCarbs}g C, ${targetFats}g F`);
        } else {
            // Fallback: Calculate from template ratios
            let proteinRatio = 0.30; // Default Balanced
            if (type === 'high_protein') proteinRatio = 0.40;
            if (type === 'bulking') proteinRatio = 0.30;
            if (type === 'low_carb') proteinRatio = 0.45;

            targetProtein = Math.round((targetCalories * proteinRatio) / 4);
            console.log(`⚠️ [TEMPLATE] Using template ratio (${proteinRatio * 100}%): ${targetProtein}g P`);
        }

        // 2. Fetch Foods & Buffet
        const allFoods = await Food.find({});
        const buffet = createSmartBuffet(allFoods, 150);

        // 3. Define Strategy
        // PRIORITY: Use user's actual meal sections if provided
        let strategy;
        if (options.mealSections && Array.isArray(options.mealSections) && options.mealSections.length > 0) {
            // User provided their meal sections - use them!
            console.log(`📋 [TEMPLATE] Using user's meal sections: ${options.mealSections.join(', ')}`);
            strategy = this.getStrategy(type);
            strategy.sections = options.mealSections; // Override hardcoded sections
        } else {
            // Fallback to template defaults
            strategy = this.getStrategy(type);
            console.log(`⚠️ [TEMPLATE] Using template default sections: ${strategy.sections.join(', ')}`);
        }

        // Construct Targets Object for Solver
        const solverTargets = {
            calories: targetCalories,
            protein: targetProtein,
            carbs: targetCarbs,
            fats: targetFats,
            mealsPerDay: strategy.sections.length,
            mealSections: strategy.sections,
            dietType: type // Hint for solver if needed
        };

        // 4. Generate Days using Solver
        const plan = [];
        const globalUsedIds = new Set(); // Track foods across ALL days for variety

        console.log(`\n🔄 [TEMPLATE] Generating ${type} plan: ${targetCalories}kcal, ${targetProtein}g Protein`);

        for (let day = 1; day <= days; day++) {
            // A. Generate Structure (Just Food Choices)
            const dayStructure = this.generateDayStructure(buffet, strategy, {
                protein: targetProtein,
                carbs: targetCarbs,
                fats: targetFats
            }, globalUsedIds);

            // B. Solve for Grams (Deterministic)
            const solvedDay = solveDayMeals(dayStructure, buffet, solverTargets);

            // Flatten for Frontend
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
                        caloriesPer100g: item.caloriesPer100g,
                        proteinPer100g: item.proteinPer100g,
                        carbsPer100g: item.carbsPer100g,
                        fatsPer100g: item.fatsPer100g
                    });
                });
            });

            plan.push({
                day: day,
                meals: flatMeals,
                totals: solvedDay.totals
            });
        }

        return plan;
    }

    getStrategy(type) {
        switch (type) {
            case 'high_protein':
                return {
                    filters: {
                        Breakfast: (f) => (f.p > 10 && f.c < 40) || f.name.toLowerCase().includes('egg'),
                        Lunch: (f) => f.p > 25,
                        Dinner: (f) => f.p > 20,
                        Snack: (f) => f.p > 5 || f.cal < 200
                    },
                    sections: ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner']
                };
            case 'low_carb':
                return {
                    filters: {
                        Breakfast: (f) => f.c < 15,
                        Lunch: (f) => f.c < 20 && f.p > 20,
                        Dinner: (f) => f.c < 15 && f.p > 20,
                        Snack: (f) => f.c < 10
                    },
                    sections: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
                };
            case 'bulking':
                return {
                    filters: {
                        Breakfast: (f) => f.cal > 400,
                        Lunch: (f) => f.cal > 500,
                        Dinner: (f) => f.cal > 500,
                        Snack: (f) => f.cal > 300
                    },
                    sections: ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3']
                };
            case 'balanced':
            default:
                return {
                    filters: {
                        Breakfast: (f) => f.name.toLowerCase().includes('oat') || f.name.toLowerCase().includes('egg') || f.c > 20,
                        Lunch: (f) => f.cal > 400,
                        Dinner: (f) => f.cal > 350,
                        Snack: (f) => true
                    },
                    sections: ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner']
                };
        }
    }

    generateDayStructure(buffet, strategy, targets = {}, globalUsedIds = new Set()) {
        const meals = [];
        const usedIds = globalUsedIds; // Use global tracker for cross-day variety

        // Categorize foods by dominant macro - REALISTIC THRESHOLDS
        // Most foods don't have 40g+ of any macro per 100g!
        const proteinFoods = buffet.filter(f => f.protein > 10); // > 10g protein per 100g
        const carbFoods = buffet.filter(f => f.carbs > 15);      // > 15g carbs per 100g
        const fatFoods = buffet.filter(f => f.fats > 10);        // > 10g fats per 100g
        const balancedFoods = buffet.filter(f => f.protein <= 10 && f.carbs <= 15 && f.fats <= 10);

        // Calculate how many meals should be protein/carb/fat focused based on targets
        const totalMacros = (targets.protein || 150) * 4 + (targets.carbs || 200) * 4 + (targets.fats || 50) * 9;
        const proteinCalPercent = ((targets.protein || 150) * 4) / totalMacros;
        const carbCalPercent = ((targets.carbs || 200) * 4) / totalMacros;
        const fatCalPercent = ((targets.fats || 50) * 9) / totalMacros;

        const numMeals = strategy.sections.length;
        const numProteinMeals = Math.max(1, Math.round(numMeals * proteinCalPercent));
        const numCarbMeals = Math.max(1, Math.round(numMeals * carbCalPercent));
        const numFatMeals = Math.max(0, numMeals - numProteinMeals - numCarbMeals);

        console.log(`🍽️ [FOOD SELECTION] ${numMeals} meals: ${numProteinMeals} protein-focused, ${numCarbMeals} carb-focused, ${numFatMeals} fat-focused`);

        // Create meal allocations
        const mealAllocations = [];
        for (let i = 0; i < numProteinMeals; i++) mealAllocations.push('protein');
        for (let i = 0; i < numCarbMeals; i++) mealAllocations.push('carb');
        for (let i = 0; i < numFatMeals; i++) mealAllocations.push('fat');

        // Shuffle allocations to distribute randomly across meals
        for (let i = mealAllocations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mealAllocations[i], mealAllocations[j]] = [mealAllocations[j], mealAllocations[i]];
        }

        strategy.sections.forEach((section, idx) => {
            const allocation = mealAllocations[idx] || 'protein';

            // Pick 2-3 foods per meal for variety
            const mealItems = [];

            // 1. PRIMARY food from allocated pool
            let primaryPool;
            if (allocation === 'protein') {
                primaryPool = proteinFoods.length > 0 ? proteinFoods : balancedFoods;
            } else if (allocation === 'carb') {
                primaryPool = carbFoods.length > 0 ? carbFoods : balancedFoods;
            } else {
                primaryPool = fatFoods.length > 0 ? fatFoods : balancedFoods;
            }

            let availablePool = primaryPool.filter(f => !usedIds.has(f._id));
            if (availablePool.length === 0) availablePool = [...primaryPool];

            // Shuffle and pick primary
            for (let i = availablePool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
            }
            const primary = availablePool[0];
            if (primary) {
                usedIds.add(primary._id);
                mealItems.push(primary._id);
            }

            // 2. SECONDARY food from different pool (complementary)
            let secondaryPool;
            if (allocation === 'protein') {
                // Protein meal gets carbs secondary
                secondaryPool = carbFoods.length > 0 ? carbFoods : balancedFoods;
            } else if (allocation === 'carb') {
                // Carb meal gets protein secondary  
                secondaryPool = proteinFoods.length > 0 ? proteinFoods : balancedFoods;
            } else {
                // Fat meal gets protein secondary
                secondaryPool = proteinFoods.length > 0 ? proteinFoods : balancedFoods;
            }

            availablePool = secondaryPool.filter(f => !usedIds.has(f._id));
            if (availablePool.length === 0) availablePool = [...secondaryPool];

            // Shuffle and pick secondary
            for (let i = availablePool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
            }
            const secondary = availablePool[0];
            if (secondary) {
                usedIds.add(secondary._id);
                mealItems.push(secondary._id);
            }

            meals.push({
                mealType: section,
                items: mealItems
            });
            console.log(`  → ${section}: ${mealItems.length} items (${allocation})`);
        });

        return { meals };
    }
}

module.exports = new MealTemplateService();
