const DailyStats = require('../../models/DailyStats');
const User = require('../../models/User');

/**
 * GET USER TARGETS
 * 
 * Single source of truth for nutritional targets.
 * 1. Checks DailyStats for explicit targets (calculated by specific date).
 * 2. If missing, calculates them based on User Profile (fallback) AND SAVES THEM.
 * 3. Returns standardized target object.
 */
async function getUserTargets(userId, date = new Date()) {
    // 1. Try to fetch existing stats for the date
    let stats = await DailyStats.findOne({
        userId: userId,
        date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999))
        }
    });

    // If stats found and targets are valid, return them
    if (stats && stats.targetCalories > 0 && stats.targetProtein > 0) {
        console.log(`[TARGETS] Found explicit targets in DailyStats: ${stats.targetCalories}kcal, ${stats.targetProtein}g P`);
        return {
            calories: stats.targetCalories,
            protein: stats.targetProtein,
            carbs: stats.targetCarbs,
            fats: stats.targetFats,
            mealsPerDay: Math.max(3, Math.min(6, getMealsPerDay(stats.goalWeight))), // Logic check
            mealSections: getMealSections(stats.goalWeight),
            water: stats.water || 2500
        };
    }

    // 2. Fallback: Calculate from User Profile
    console.log('[TARGETS] Missing DailyStats targets. Calculating from User Profile...');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Use latest stats if available, else user profile defaults
    // Note: DailyStats handles weight/height history, User handles static profile.
    // For calculation, we need weight/height/age/sex/activity.

    // Attempt to find *latest* stats for weight/height even if today is missing matching logic in statsController
    if (!stats) {
        const previousStats = await DailyStats.findOne({ userId, date: { $lt: new Date() } }).sort({ date: -1 });
        const weight = previousStats?.weight || user.weight || 70;
        const height = previousStats?.height || user.height || 170;
        const age = user.age || 25;
        const sex = user.sex || 'male';
        const activityLevel = previousStats?.activityLevel || user.activityLevel || 'Moderate';
        const goalWeight = previousStats?.goalWeight || user.goalWeight || 'Maintain Weight';

        const targets = calculateTargets({ weight, height, age, sex, activityLevel, goalWeight });

        // SAVE to DailyStats (Create new or Update)
        stats = new DailyStats({
            userId,
            date: date,
            ...targets,
            weight,
            height,
            activityLevel,
            goalWeight,
            water: targets.water
        });
        await stats.save();
        console.log(`[TARGETS] Calculated and SAVED new targets: ${targets.targetCalories}kcal`);

        return {
            calories: targets.targetCalories,
            protein: targets.targetProtein,
            carbs: targets.targetCarbs,
            fats: targets.targetFats,
            mealsPerDay: Math.max(3, Math.min(6, getMealsPerDay(goalWeight))),
            mealSections: getMealSections(goalWeight),
            water: targets.water
        };
    } else {
        // Stats exist but targets are 0. Update them.
        const targets = calculateTargets({
            weight: stats.weight || user.weight || 70,
            height: stats.height || user.height || 170,
            age: user.age || 25,
            sex: user.sex || 'male',
            activityLevel: stats.activityLevel || user.activityLevel || 'Moderate',
            goalWeight: stats.goalWeight || user.goalWeight || 'Maintain Weight'
        });

        stats.targetCalories = targets.targetCalories;
        stats.targetProtein = targets.targetProtein;
        stats.targetCarbs = targets.targetCarbs;
        stats.targetFats = targets.targetFats;
        await stats.save();
        console.log(`[TARGETS] Updated existing stats with targets: ${targets.targetCalories}kcal`);

        return {
            calories: targets.targetCalories,
            protein: targets.targetProtein,
            carbs: targets.targetCarbs,
            fats: targets.targetFats,
            mealsPerDay: Math.max(3, Math.min(6, getMealsPerDay(stats.goalWeight))),
            mealSections: getMealSections(stats.goalWeight),
            water: stats.water || 2500
        };
    }
}

// --- Calculation Helpers (Ported from DashboardUtils) ---

function getMealsPerDay(goal) {
    if (!goal) return 4;
    if (goal.includes('Lose')) return 3; // 3 meals + maybe snack
    if (goal.includes('Gain')) return 5;
    return 4;
}

function getMealSections(goal) {
    // Standardize sections based on frequency
    const n = getMealsPerDay(goal);
    if (n === 3) return ['Breakfast', 'Lunch', 'Dinner'];
    if (n === 4) return ['Breakfast', 'Snack 1', 'Lunch', 'Dinner'];
    if (n === 5) return ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
    if (n === 6) return ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
    return ['Breakfast', 'Snack 1', 'Lunch', 'Dinner'];
}

function calculateTargets({ weight, height, age, sex, activityLevel, goalWeight }) {
    // 1. BMR (Mifflin-St Jeor)
    let bmr = sex === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // 2. TDEE
    const activityMultipliers = {
        'Sedentary': 1.2,
        'Light': 1.375,
        'Moderate': 1.55,
        'Active': 1.725,
        'Very Active': 1.9,
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // 3. Goal Adjustment
    let targetCalories = tdee;
    let proteinPerKg = 2.0;
    let fatPercent = 0.25;

    if (goalWeight && goalWeight.includes('Lose')) {
        targetCalories -= 500;
        proteinPerKg = 2.2;
        fatPercent = 0.20;
    } else if (goalWeight && goalWeight.includes('Gain')) {
        targetCalories += 300;
        proteinPerKg = 1.8;
        fatPercent = 0.30;
    }

    // Minsafe
    const minCalories = sex === 'male' ? 1800 : 1400;
    if (targetCalories < minCalories) targetCalories = minCalories;

    // 4. Macros
    const protein = Math.round(weight * proteinPerKg);
    const fats = Math.round((targetCalories * fatPercent) / 9);
    const carbs = Math.round((targetCalories - (protein * 4) - (fats * 9)) / 4);
    const water = Math.round(weight * 35); // Simple estimator

    return {
        targetCalories: Math.round(targetCalories),
        targetProtein: Math.max(protein, 50),
        targetCarbs: Math.max(carbs, 100),
        targetFats: Math.max(fats, 30),
        water
    };
}

module.exports = getUserTargets;
