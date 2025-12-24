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

        // 2. Fetch ALL Foods via Smart Buffet
        const allFoods = await Food.find({});
        const buffet = createSmartBuffet(allFoods, 9999); // Use ALL foods (high limit)

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
            }, globalUsedIds, type);

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
                        // Allow vegetables and salads with low carbs
                        Breakfast: (f) => f.c < 20 || (f.category === 'vegetables' && f.c < 15) || (f.category === 'salads' && f.c < 10),
                        Lunch: (f) => (f.c < 25 && f.p > 15) || (f.category === 'vegetables') || (f.category === 'salads'),
                        Dinner: (f) => (f.c < 25 && f.p > 15) || (f.category === 'vegetables') || (f.category === 'salads'),
                        Snack: (f) => f.c < 15 || (f.category === 'vegetables' && f.c < 10)
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

    generateDayStructure(buffet, strategy, targets = {}, globalUsedIds = new Set(), templateType = 'balanced') {
        const meals = [];
        const usedIds = globalUsedIds;

        // Helper to detect protein powders/isolates
        const isPowderOrIsolate = (f) => {
            const name = f.name.toLowerCase();
            return name.includes('powder') ||
                name.includes('isolate') ||
                name.includes('protein shake') ||
                (f.p > 70 && f.c < 10 && f.f < 10); // Very high protein, low everything else = powder
        };

        // Template-specific protein selection
        let proteinFoods;
        if (templateType === 'high_protein') {
            // Prioritize LEAN proteins for high_protein template
            proteinFoods = buffet.filter(f =>
                (f.p > 20 && f.f < 5) || // Very lean (chicken breast, white fish)
                f.name.toLowerCase().includes('chicken breast') ||
                f.name.toLowerCase().includes('turkey') ||
                f.name.toLowerCase().includes('tuna') ||
                f.name.toLowerCase().includes('cod') ||
                f.name.toLowerCase().includes('tilapia') ||
                f.name.toLowerCase().includes('shrimp') ||
                f.name.toLowerCase().includes('egg white')
            );
            // Fallback to any high protein if lean not available
            if (proteinFoods.length < 20) {
                proteinFoods = buffet.filter(f => f.p > 15 && !isPowderOrIsolate(f));
            }
        } else {
            // Other templates: any high protein food (exclude powders/isolates)
            proteinFoods = buffet.filter(f => f.p > 15 && !isPowderOrIsolate(f));
        }

        const carbFoods = buffet.filter(f => f.c > 20 && f.p < 10);

        // Fatty foods for low-carb (nuts, avocado, cheese, fatty fish, oils)
        const fatFoods = buffet.filter(f =>
            f.f > 10 &&
            f.c < 15 &&
            !isPowderOrIsolate(f) &&
            (f.name.toLowerCase().includes('avocado') ||
                f.name.toLowerCase().includes('nut') ||
                f.name.toLowerCase().includes('seed') ||
                f.name.toLowerCase().includes('cheese') ||
                f.name.toLowerCase().includes('salmon') ||
                f.name.toLowerCase().includes('oil') ||
                f.name.toLowerCase().includes('butter') ||
                f.name.toLowerCase().includes('cream') ||
                f.f > 15) // High fat content
        );

        // Meal-appropriate foods
        const breakfastFoods = buffet.filter(f =>
            f.name.toLowerCase().includes('egg') ||
            f.name.toLowerCase().includes('oat') ||
            f.name.toLowerCase().includes('cereal') ||
            f.name.toLowerCase().includes('toast') ||
            f.name.toLowerCase().includes('yogurt') ||
            f.name.toLowerCase().includes('pancake')
        );

        const snackFoods = buffet.filter(f =>
            f.name.toLowerCase().includes('bar') ||
            f.name.toLowerCase().includes('fruit') ||
            f.name.toLowerCase().includes('apple') ||
            f.name.toLowerCase().includes('banana') ||
            f.name.toLowerCase().includes('nut') ||
            f.name.toLowerCase().includes('shake') ||
            f.name.toLowerCase().includes('smoothie') ||
            (f.cal < 300 && f.cal > 100)
        );

        // Drinks - categorized by calorie content for low-carb compatibility
        const zeroCaloricDrinks = buffet.filter(f =>
            f.category === 'drinks' &&
            f.cal === 0
        );

        const lowCalorieDrinks = buffet.filter(f =>
            f.category === 'drinks' &&
            f.cal > 0 &&
            f.cal <= 50 &&
            f.c < 10
        );

        const breakfastDrinks = buffet.filter(f =>
            f.category === 'drinks' &&
            (f.name.toLowerCase().includes('coffee') ||
                f.name.toLowerCase().includes('tea') ||
                f.name.toLowerCase().includes('juice') ||
                f.name.toLowerCase().includes('milk'))
        );

        const allDrinks = buffet.filter(f => f.category === 'drinks');

        console.log(`🍽️ [FOOD SELECTION] ${strategy.sections.length} meals (${templateType} template)`);

        strategy.sections.forEach((section, idx) => {
            const mealItems = [];

            // Determine meal type
            const isBreakfast = section.toLowerCase().includes('breakfast');
            const isSnack = section.toLowerCase().includes('snack');
            const isLunch = section.toLowerCase().includes('lunch');
            const isDinner = section.toLowerCase().includes('dinner');

            // Select appropriate drink pool based on template and meal type
            let drinkPool;
            if (templateType === 'low_carb') {
                // Low-carb: only zero-calorie drinks
                drinkPool = zeroCaloricDrinks;
            } else if (isBreakfast) {
                // Breakfast: coffee, tea, juice, milk
                drinkPool = [...breakfastDrinks, ...lowCalorieDrinks];
            } else {
                // Other meals: any drink, prioritize low-calorie
                drinkPool = [...lowCalorieDrinks, ...zeroCaloricDrinks];
                // Add regular drinks for non-low-carb plans
                if (templateType !== 'low_carb') {
                    const regularDrinks = allDrinks.filter(d => d.cal > 50 && d.c < 30);
                    drinkPool = [...drinkPool, ...regularDrinks];
                }
            }

            // Fallback to any drink if pool is empty
            if (drinkPool.length === 0) drinkPool = allDrinks;

            // Pick 2-3 foods based on meal type
            let primaryPool, secondaryPool;

            // Apply strategy filter if exists
            const filterForSection = strategy.filters ? strategy.filters[section] : null;

            if (isBreakfast) {
                // Breakfast: eggs/oats + fruit/toast (or fats for low-carb)
                primaryPool = breakfastFoods.length > 10 ? breakfastFoods : proteinFoods;
                secondaryPool = templateType === 'low_carb' ? fatFoods : carbFoods;
                // Apply low-carb filter if exists
                if (filterForSection) {
                    primaryPool = primaryPool.filter(filterForSection);
                    secondaryPool = secondaryPool.filter(filterForSection);
                }
            } else if (isSnack) {
                // Snack: bar/fruit + nuts/yogurt (always use fats as fallback)
                primaryPool = snackFoods.length > 10 ? snackFoods : fatFoods;
                secondaryPool = fatFoods;
                if (filterForSection) {
                    primaryPool = primaryPool.filter(filterForSection);
                    secondaryPool = secondaryPool.filter(filterForSection);
                }
            } else if (isLunch || isDinner) {
                // Main meals: protein + (carb OR fat for low-carb)
                primaryPool = proteinFoods;
                secondaryPool = templateType === 'low_carb' ? fatFoods : carbFoods;
                if (filterForSection) {
                    primaryPool = primaryPool.filter(filterForSection);
                    secondaryPool = secondaryPool.filter(filterForSection);
                }
            } else {
                // Default
                primaryPool = proteinFoods;
                secondaryPool = carbFoods;
                if (filterForSection) {
                    primaryPool = primaryPool.filter(filterForSection);
                    secondaryPool = secondaryPool.filter(filterForSection);
                }
            }

            // Pick primary food
            let availablePool = primaryPool.filter(f => !usedIds.has(f._id));
            if (availablePool.length === 0) availablePool = [...primaryPool];

            for (let i = availablePool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
            }
            const primary = availablePool[0];
            if (primary) {
                usedIds.add(primary._id);
                mealItems.push(primary._id);
            }

            // Pick secondary food (different pool)
            availablePool = secondaryPool.filter(f => !usedIds.has(f._id));
            if (availablePool.length === 0) availablePool = [...secondaryPool];

            for (let i = availablePool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
            }
            const secondary = availablePool[0];
            if (secondary) {
                usedIds.add(secondary._id);
                mealItems.push(secondary._id);
            }

            // Pick a drink for this meal
            let drinkAvailablePool = drinkPool.filter(f => !usedIds.has(f._id));
            if (drinkAvailablePool.length === 0) drinkAvailablePool = [...drinkPool];

            for (let i = drinkAvailablePool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [drinkAvailablePool[i], drinkAvailablePool[j]] = [drinkAvailablePool[j], drinkAvailablePool[i]];
            }
            const drink = drinkAvailablePool[0];
            if (drink) {
                usedIds.add(drink._id);
                mealItems.push(drink._id);
            }

            meals.push({
                mealType: section,
                items: mealItems
            });
            console.log(`  → ${section}: ${mealItems.length} items (${drink ? 'with drink' : 'no drink'})`);

        });

        return { meals };
    }
}

module.exports = new MealTemplateService();
