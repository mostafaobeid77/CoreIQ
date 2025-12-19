const DailyStats = require('../../models/DailyStats');
const User = require('../../models/User');

/**
 * GET USER TARGETS - SINGLE SOURCE OF TRUTH
 * 
 * Pulls nutrition targets from DB (NO GUESSING, NO HARDCODING)
 * Priority: 1) User model targets, 2) DailyStats targets, 3) Calculate from profile, 4) Return null
 */
async function getUserTargets(userId) {
    // Try 1: Check User model for pre-calculated targets (PRIMARY SOURCE)
    const user = await User.findById(userId);

    if (user?.targetCalories && user?.targetProtein) {
        console.log('✅ Using User model targets (primary source)');

        // Determine mealSections based on goal
        let mealSections;
        if (user.goalWeight?.includes('Lose')) {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Dinner'];
        } else if (user.goalWeight?.includes('Gain')) {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
        } else {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
        }

        return {
            calories: Math.round(user.targetCalories),
            protein: Math.round(user.targetProtein),
            carbs: Math.round(user.targetCarbs || 200),
            fats: Math.round(user.targetFats || 60),
            mealsPerDay: mealSections.length,
            mealSections: mealSections,
            goal: user.goalWeight || 'Maintain Weight',
            activityLevel: user.activityLevel || 'Moderate'
        };
    }

    console.log('⚠️ No targets in User model, checking DailyStats...');

    // Try 2: Look for MOST RECENT DailyStats (dashboard uses today's date)
    const mostRecentStats = await DailyStats.findOne({
        userId: userId
    }).sort({ date: -1 });

    console.log('🔍 getUserTargets - Most recent stats:', {
        date: mostRecentStats?.date,
        targetCalories: mostRecentStats?.targetCalories,
        targetProtein: mostRecentStats?.targetProtein,
        targetCarbs: mostRecentStats?.targetCarbs,
        targetFats: mostRecentStats?.targetFats
    });

    if (mostRecentStats?.targetCalories && mostRecentStats?.targetProtein) {
        console.log('✅ Using DailyStats targets from dashboard');

        // Determine mealSections based on goal
        let mealSections;
        if (mostRecentStats.goalWeight?.includes('Lose')) {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Dinner'];
        } else if (mostRecentStats.goalWeight?.includes('Gain')) {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
        } else {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
        }

        return {
            calories: Math.round(mostRecentStats.targetCalories),
            protein: Math.round(mostRecentStats.targetProtein),
            carbs: Math.round(mostRecentStats.targetCarbs || 200),
            fats: Math.round(mostRecentStats.targetFats || 60),
            mealsPerDay: mealSections.length,
            mealSections: mealSections,
            goal: mostRecentStats.goalWeight || 'Maintain Weight',
            activityLevel: mostRecentStats.activityLevel || 'Moderate'
        };
    }

    console.log('⚠️ No targets in DailyStats, calculating from profile...');

    // Try 3: Calculate from user profile data (reuse user from Try 1)
    const validWeightStats = await DailyStats.findOne({ userId, weight: { $gt: 0 } }).sort({ date: -1 });
    const validHeightStats = await DailyStats.findOne({ userId, height: { $gt: 0 } }).sort({ date: -1 });
    const validActivityStats = await DailyStats.findOne({ userId, activityLevel: { $exists: true } }).sort({ date: -1 });
    const validGoalStats = await DailyStats.findOne({ userId, goalWeight: { $exists: true, $ne: 'Not set' } }).sort({ date: -1 });

    if (validWeightStats && validHeightStats && user) {
        // Calculate targets using scientific formulas
        const weight = validWeightStats.weight;
        const height = validHeightStats.height;
        const activityLevel = validActivityStats?.activityLevel || 'Moderate';
        const goalWeight = validGoalStats?.goalWeight || 'Maintain Weight';
        const isMale = user.gender === 'male' || !user.gender;
        const age = user.birthDate
            ? Math.floor((new Date() - new Date(user.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))
            : 30;

        // BMR calculation (Mifflin-St Jeor)
        const bmr = isMale
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        const multipliers = { 'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55, 'Active': 1.725, 'Very Active': 1.9 };
        let tdee = bmr * (multipliers[activityLevel] || 1.55);

        let targetCalories = tdee;
        let proteinPerKg = 2.0;
        let fatPercent = 0.25;

        if (goalWeight.includes('Lose')) {
            targetCalories -= 500;
            proteinPerKg = 2.2;
            fatPercent = 0.20;
        } else if (goalWeight.includes('Gain')) {
            targetCalories += 300;
            proteinPerKg = 1.8;
            fatPercent = 0.30;
        }

        const minCalories = isMale ? 1800 : 1400;
        if (targetCalories < minCalories) targetCalories = minCalories;

        const targetProtein = Math.round(weight * proteinPerKg);
        const fatCalories = targetCalories * fatPercent;
        const targetFats = Math.round(fatCalories / 9);
        const carbCalories = targetCalories - (targetProtein * 4) - fatCalories;
        const targetCarbs = Math.round(carbCalories / 4);

        let mealSections;
        if (goalWeight.includes('Lose')) {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Dinner'];
        } else if (goalWeight.includes('Gain')) {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
        } else {
            mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
        }

        return {
            calories: Math.round(targetCalories),
            protein: targetProtein,
            carbs: targetCarbs,
            fats: targetFats,
            mealsPerDay: mealSections.length,
            mealSections: mealSections,
            goal: goalWeight,
            activityLevel: activityLevel
        };
    }

    // Try 3: No valid data - return null (will error in generatePlan)
    return null;
}

module.exports = getUserTargets;
