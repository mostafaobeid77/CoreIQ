// FAST version of getAdherenceReport using MongoDB aggregation
// This replaces the slow loop-based calculation

const getAdherenceReportFast = async (req, res) => {
    const startTime = Date.now();
    console.log('[AdherenceReport] START (FAST VERSION)');

    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Missing start or end date' });
        }

        if (!req.userId) {
            return res.status(400).json({ message: 'User ID missing' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // PARALLEL: Fetch user + aggregated stats + aggregated meals
        const User = require('../models/User');
        const Meal = require('../models/Meal');
        const DailyStats = require('../models/DailyStats');
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.userId);

        const [user, statsAgg, mealsAgg] = await Promise.all([
            User.findById(req.userId).select('weight height gender birthDate goalWeight').lean(),

            // Aggregate daily stats to get totals
            DailyStats.aggregate([
                { $match: { userId, date: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: null,
                        totalWorkoutsBurn: { $sum: '$caloriesBurnedWorkouts' },
                        totalStepsBurn: { $sum: '$caloriesBurnedSteps' },
                        firstWeight: { $first: '$weight' },
                        lastWeight: { $last: '$weight' },
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Aggregate meals to get total calories
            Meal.aggregate([
                { $match: { userId, date: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: null,
                        totalCaloriesIn: { $sum: '$calories' },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        console.log(`[AdherenceReport] Data aggregated in ${Date.now() - startTime}ms`);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract aggregated values
        const stats = statsAgg[0] || { totalWorkoutsBurn: 0, totalStepsBurn: 0, firstWeight: user.weight, lastWeight: user.weight, count: 0 };
        const meals = mealsAgg[0] || { totalCaloriesIn: 0, count: 0 };

        // Calculate BMR once
        const userWeight = user.weight || 70;
        const userHeight = user.height || 170;
        let age = 30;
        if (user.birthDate) {
            age = Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        }
        const isMale = user.gender === 'male';
        const bmr = isMale
            ? 10 * userWeight + 6.25 * userHeight - 5 * age + 5
            : 10 * userWeight + 6.25 * userHeight - 5 * age - 161;

        // Total burn = BMR * activity factor * days + workouts + steps
        const totalBaseBurn = Math.round(bmr * 1.2 * daysCount);
        const totalExtrasBurn = stats.totalWorkoutsBurn + stats.totalStepsBurn;
        const totalCaloriesOut = totalBaseBurn + totalExtrasBurn;
        const totalCaloriesIn = meals.totalCaloriesIn || 0;
        const netBalance = totalCaloriesIn - totalCaloriesOut;

        const avgIn = Math.round(totalCaloriesIn / daysCount);
        const avgOut = Math.round(totalCaloriesOut / daysCount);
        const avgNet = Math.round(netBalance / daysCount);

        // Weight prediction
        const weightChange = netBalance / 7700;
        const initialWeight = stats.firstWeight || userWeight;
        const lastWeight = stats.lastWeight || userWeight;
        const predictedWeight = Number((lastWeight + weightChange).toFixed(2));

        // Verdict
        const goalStr = user.goalWeight || '';
        const isBulk = goalStr.toLowerCase().includes('gain');
        const isCut = goalStr.toLowerCase().includes('lose');

        let verdict = { status: 'Good', color: '#8B5CF6', advice: 'Keep going.' };
        if (isBulk) {
            if (avgNet >= 200 && avgNet <= 500) verdict = { status: 'Excellent', color: '#4ADE80', advice: 'Perfect surplus.' };
            else if (avgNet > 700) verdict = { status: 'Dirty Bulk', color: '#FBBF24', advice: 'Surplus too high.' };
            else if (avgNet < 100) verdict = { status: 'Off Track', color: '#F87171', advice: 'Eat more.' };
        } else if (isCut) {
            if (avgNet <= -300 && avgNet >= -800) verdict = { status: 'Excellent', color: '#4ADE80', advice: 'Perfect deficit.' };
            else if (avgNet <= -150 && avgNet > -300) verdict = { status: 'Good', color: '#8B5CF6', advice: 'Moderate deficit.' };
            else if (avgNet < -900) verdict = { status: 'Too Aggressive', color: '#F87171', advice: 'Deficit too large.' };
            else verdict = { status: 'Off Track', color: '#F87171', advice: 'Not in deficit.' };
        }

        // Goal projection
        let daysToGoal = null;
        let projectedGoalDate = null;
        const matchGoal = goalStr.match(/:\s*(\d+)/);
        if (matchGoal && weightChange !== 0) {
            const targetW = parseFloat(matchGoal[1]);
            const diff = targetW - userWeight;
            if ((diff > 0 && weightChange > 0) || (diff < 0 && weightChange < 0)) {
                const ratePerDay = Math.abs(weightChange) / daysCount;
                if (ratePerDay > 0.001) {
                    daysToGoal = Math.round(Math.abs(diff) / ratePerDay);
                    const pDate = new Date();
                    pDate.setDate(pDate.getDate() + daysToGoal);
                    projectedGoalDate = pDate.toISOString().split('T')[0];
                }
            }
        }

        // Suggestion
        let suggestion = null;
        if (Math.abs(weightChange) > 0.1) {
            suggestion = {
                estimatedWeight: predictedWeight,
                lastWeight: lastWeight,
                weightChange: Number(weightChange.toFixed(2)),
                daysSince: daysCount,
                netCalories: Math.round(netBalance)
            };
        }

        console.log(`[AdherenceReport] END - took ${Date.now() - startTime}ms`);

        res.json({
            period: { startDate, endDate, days: daysCount },
            startingWeight: initialWeight,
            currentActualWeight: userWeight,
            predictedWeight,
            weightChange: Number(weightChange.toFixed(2)),
            userGoal: user.goalWeight || 'Not set',
            verdict,
            suggestion,
            projection: { daysToGoal, projectedGoalDate },
            data: {
                totalCaloriesIn,
                totalCaloriesOut,
                netBalance: Math.round(netBalance),
                avgDailyIn: avgIn,
                avgDailyOut: avgOut,
                avgDailyNet: avgNet
            }
        });
    } catch (error) {
        console.error('[AdherenceReport] Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAdherenceReportFast };
