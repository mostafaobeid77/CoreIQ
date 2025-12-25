const DailyStats = require('../models/DailyStats');
const { calculateCaloriesFromSteps } = require('../utils/calorieCalculator');

// Simple in-memory cache for user data (weight, height persist across days)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get stats for a specific date - OPTIMIZED VERSION
exports.getStats = async (req, res) => {
  try {
    const { date } = req.params;
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    // Try cache first for user data
    let user = userCache.get(req.userId)?.data;
    const cacheValid = userCache.get(req.userId)?.expires > Date.now();

    if (!user || !cacheValid) {
      const User = require('../models/User');
      user = await User.findById(req.userId).select('createdAt weight height goalWeight').lean();
      if (user) {
        userCache.set(req.userId, { data: user, expires: Date.now() + CACHE_TTL });
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check date validity
    const accountCreated = new Date(user.createdAt);
    accountCreated.setHours(0, 0, 0, 0);
    if (requestedDate < accountCreated) {
      return res.status(404).json({
        message: 'No data available before account creation',
        accountCreatedAt: accountCreated.toISOString()
      });
    }

    // Parallel query: today's stats + most recent previous (for fallback values)
    const [stats, previousStats] = await Promise.all([
      DailyStats.findOne({ userId: req.userId, date: new Date(date) }).lean(),
      DailyStats.findOne({ userId: req.userId, date: { $lt: new Date(date) } }).sort({ date: -1 }).select('weight height activityLevel goalWeight').lean()
    ]);

    if (stats) {
      return res.json(stats);
    }

    // No stats for today - return defaults with carried over values
    const defaults = getDefaultStats(req.userId, date);

    // Carry over from previous stats or user profile
    defaults.weight = previousStats?.weight || user.weight || defaults.weight;
    defaults.height = previousStats?.height || user.height || defaults.height;
    defaults.activityLevel = previousStats?.activityLevel || defaults.activityLevel;
    defaults.goalWeight = previousStats?.goalWeight || user.goalWeight || defaults.goalWeight;

    res.json(defaults);
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get stats for date range
exports.getStatsRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { userId: req.userId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await DailyStats.find(query).sort({ date: 1 });
    res.json(stats);
  } catch (error) {
    console.error('Get stats range error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update or create stats for a date
exports.updateStats = async (req, res) => {
  try {
    const { date } = req.params;
    const updateData = req.body;

    // Check if stats already exist for this date
    let stats = await DailyStats.findOne({
      userId: req.userId,
      date: new Date(date)
    });

    if (stats) {
      // Update existing stats
      Object.assign(stats, updateData);
      await stats.save();
    } else {
      // Create new entry - first get previous stats to carry over persistent values
      const previousStats = await DailyStats.findOne({
        userId: req.userId,
        date: { $lt: new Date(date) }
      }).sort({ date: -1 });

      const defaults = getDefaultStats(req.userId, date);

      if (previousStats) {
        // Carry over persistent values
        defaults.weight = previousStats.weight;
        defaults.height = previousStats.height;
        defaults.activityLevel = previousStats.activityLevel;
        defaults.goalWeight = previousStats.goalWeight;
      }

      // Merge defaults with update data
      stats = new DailyStats({
        ...defaults,
        ...updateData
      });
    }

    // Calculate calories burned from steps if walking was updated
    if (updateData.walking !== undefined) {
      stats.caloriesBurnedSteps = calculateCaloriesFromSteps(stats.walking);
      stats.totalCaloriesBurned = stats.caloriesBurnedWorkouts + stats.caloriesBurnedSteps;
    }

    // Check if weight goal is achieved and auto-clear it
    if (stats.weight && stats.goalWeight && checkGoalAchieved(stats.weight, stats.goalWeight)) {
      stats.goalWeight = 'Not set';
    }

    await stats.save();

    res.json({ message: 'Stats updated successfully', stats });
  } catch (error) {
    console.error('Update stats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Partial update stats
exports.patchStats = async (req, res) => {
  try {
    const { date } = req.params;
    const updateData = req.body;

    // Check if stats already exist for this date
    let stats = await DailyStats.findOne({
      userId: req.userId,
      date: new Date(date)
    });

    if (stats) {
      // Update existing stats
      Object.assign(stats, updateData);
      await stats.save();
    } else {
      // Create new entry - first get previous stats to carry over persistent values
      const previousStats = await DailyStats.findOne({
        userId: req.userId,
        date: { $lt: new Date(date) }
      }).sort({ date: -1 });

      const defaults = getDefaultStats(req.userId, date);

      if (previousStats) {
        // Carry over persistent values
        defaults.weight = previousStats.weight;
        defaults.height = previousStats.height;
        defaults.activityLevel = previousStats.activityLevel;
        defaults.goalWeight = previousStats.goalWeight;
      }

      // Merge defaults with update data
      stats = new DailyStats({
        ...defaults,
        ...updateData
      });
    }

    // Calculate calories burned from steps if walking was updated
    if (updateData.walking !== undefined) {
      stats.caloriesBurnedSteps = calculateCaloriesFromSteps(stats.walking);
      stats.totalCaloriesBurned = stats.caloriesBurnedWorkouts + stats.caloriesBurnedSteps;
    }

    // Check if weight goal is achieved and auto-clear it
    if (stats.weight && stats.goalWeight && checkGoalAchieved(stats.weight, stats.goalWeight)) {
      stats.goalWeight = 'Not set';
    }

    await stats.save();

    res.json({ message: 'Stats updated successfully', stats });
  } catch (error) {
    console.error('Patch stats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get adherence and predicted weight report - OPTIMIZED VERSION
/*
exports.getAdherenceReport = async (req, res) => {
  const startTime = Date.now();
  console.log('[AdherenceReport] START');
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Missing start or end date' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (!req.userId) {
      return res.status(400).json({ message: 'User ID missing from request' });
    }

    // SINGLE PARALLEL FETCH - all 3 queries at once
    const User = require('../models/User');
    const Meal = require('../models/Meal');

    console.log('[AdherenceReport] Fetching data...');
    const t1 = Date.now();

    const [user, dailyStats, meals] = await Promise.all([
      User.findById(req.userId).lean(),
      DailyStats.find({ userId: req.userId, date: { $gte: start, $lte: end } }).lean(),
      Meal.find({ userId: req.userId, date: { $gte: start, $lte: end } }).lean()
    ]);

    console.log(`[AdherenceReport] Data fetched in ${Date.now() - t1}ms`);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // PRE-INDEX for O(1) lookup (PERFORMANCE FIX)
    const statsMap = new Map();
    dailyStats.forEach(s => {
      const key = new Date(s.date).toISOString().split('T')[0];
      statsMap.set(key, s);
    });

    const mealsMap = new Map();
    meals.forEach(m => {
      const key = new Date(m.date).toISOString().split('T')[0];
      if (!mealsMap.has(key)) mealsMap.set(key, []);
      mealsMap.get(key).push(m);
    });

    // 4. Calculate Logic
    let totalCaloriesIn = 0;
    let totalCaloriesOut = 0;
    let netBalance = 0;
    let daysCount = 0;

    // Helper: Calculate BMR (Mifflin-St Jeor) - safe defaults
    const calculateBMR = (weight, height, age, isMale) => {
      // Defaults: 70kg, 170cm, 30yo if missing
      const w = weight || 70;
      const h = height || 170;
      const a = age || 30;
      return isMale
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
    };

    let age = 30; // Default
    if (user.birthDate) {
      age = Math.floor((new Date() - new Date(user.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
    }

    // Check for NaN age
    if (isNaN(age)) age = 30;

    const isMale = user.gender === 'male';

    // Determine initial weight safely
    let initialWeight = user.weight || 70;
    if (dailyStats.length > 0 && dailyStats[0].weight) {
      initialWeight = dailyStats[0].weight;
    }

    // Iterate and build daily breakdown
    const dailyData = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      try {
        daysCount++;
        const dateStr = d.toISOString().split('T')[0];

        // FAST O(1) lookups using Maps
        const dayStat = statsMap.get(dateStr);
        const dayMeals = mealsMap.get(dateStr) || [];

        // Current weight
        const currentWeight = dayStat?.weight || (dailyData.length > 0 ? dailyData[dailyData.length - 1].weight : initialWeight) || 70;

        // BMR & TDEE
        const bmr = calculateBMR(currentWeight, user.height || 170, age, isMale);
        const baseBurn = bmr * 1.2;
        const extras = (dayStat?.caloriesBurnedWorkouts || 0) + (dayStat?.caloriesBurnedSteps || 0);
        const dailyOut = Math.round(baseBurn + extras);
        const dailyIn = Math.round(dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0));
        const dailyNet = dailyIn - dailyOut;

        totalCaloriesIn += dailyIn;
        totalCaloriesOut += dailyOut;
        netBalance += dailyNet;

        dailyData.push({
          date: dateStr,
          weight: currentWeight,
          caloriesIn: dailyIn,
          caloriesOut: dailyOut,
          net: dailyNet
        });

      } catch (err) {
        console.error(`[AdherenceReport] Error calculating day ${d}:`, err);
      }
    }

    // 5. Prediction
    // 5. Verdict & Prediction
    const weightChange = netBalance / 7700;
    const predictedWeight = (initialWeight || 70) + weightChange;

    const days = daysCount || 1;
    const avgIn = Math.round(totalCaloriesIn / days);
    const avgOut = Math.round(totalCaloriesOut / days);
    const avgNet = Math.round(netBalance / days);

    // Determine Goal Type
    const goalStr = user.goalWeight || '';
    const isBulk = goalStr.toLowerCase().includes('gain');
    const isCut = goalStr.toLowerCase().includes('lose');

    // Verdict Logic (Strict Math)
    let verdict = { status: 'Good', color: '#8B5CF6', advice: 'Keep going.' };

    if (isBulk) {
      if (avgNet >= 200 && avgNet <= 500) {
        verdict = { status: 'Excellent', color: '#4ADE80', advice: 'Perfect surplus (+200-500).' };
      } else if (avgNet > 700) {
        verdict = { status: 'Dirty Bulk', color: '#FBBF24', advice: 'Surplus too high (>700). Risk of fat gain.' };
      } else if (avgNet < 100) {
        verdict = { status: 'Off Track', color: '#F87171', advice: 'Not enough surplus (<100). Eat more.' };
      }
    } else if (isCut) {
      if (avgNet <= -300 && avgNet >= -800) {
        verdict = { status: 'Excellent', color: '#4ADE80', advice: 'Perfect deficit (-300 to -800).' };
      } else if (avgNet <= -150 && avgNet > -300) {
        verdict = { status: 'Good', color: '#8B5CF6', advice: 'Moderate deficit.' };
      } else if (avgNet < -900) {
        verdict = { status: 'Too Aggressive', color: '#F87171', advice: 'Deficit too large (<-900). Risk of muscle loss.' };
      } else {
        verdict = { status: 'Off Track', color: '#F87171', advice: 'Not in a significant deficit (> -150).' };
      }
    }

    // 6. Long-Term Projection (Time to Goal)
    let daysToGoal = null;
    let projectedGoalDate = null;
    const matchGoal = (user.goalWeight || '').match(/:\s*(\d+)/);

    if (matchGoal && weightChange !== 0) {
      const targetW = parseFloat(matchGoal[1]);
      const currentW = user.weight || initialWeight || 70;
      const diff = targetW - currentW;

      // If moving in right direction
      if ((diff > 0 && weightChange > 0) || (diff < 0 && weightChange < 0)) {
        const ratePerDay = Math.abs(weightChange) / days; // kg per day change
        if (ratePerDay > 0.001) {
          daysToGoal = Math.round(Math.abs(diff) / ratePerDay);
          const pDate = new Date();
          pDate.setDate(pDate.getDate() + daysToGoal);
          projectedGoalDate = pDate.toISOString().split('T')[0];
        }
      }
    }

    // 7. Smart Weight Suggestion (OPTIMIZED - uses existing data, no extra queries)
    let suggestion = null;
    // If we have weight change, suggest an update
    if (dailyData.length > 0 && Math.abs(weightChange) > 0.1) {
      const firstWeight = dailyData[0].weight;
      const lastWeight = dailyData[dailyData.length - 1].weight;
      const estimatedNew = Number((lastWeight + weightChange).toFixed(1));

      suggestion = {
        estimatedWeight: estimatedNew,
        lastWeight: lastWeight,
        weightChange: Number(weightChange.toFixed(2)),
        daysSince: daysCount,
        netCalories: Math.round(netBalance),
        message: `Based on ${daysCount} days of data, your weight should be around ${estimatedNew}kg`
      };
    }

    const responsePayload = {
      period: { startDate, endDate, days: daysCount },
      startingWeight: initialWeight || 70,
      currentActualWeight: user.weight || initialWeight || 70,
      predictedWeight: Number(predictedWeight.toFixed(2)),
      weightChange: Number(weightChange.toFixed(2)),
      userGoal: user.goalWeight || 'Not set',
      verdict, // NEW
      suggestion, // NEW
      projection: { daysToGoal, projectedGoalDate }, // NEW
      chartData: dailyData,
      data: {
        totalCaloriesIn: Math.round(totalCaloriesIn),
        totalCaloriesOut: Math.round(totalCaloriesOut),
        netBalance: Math.round(netBalance),
        avgDailyIn: avgIn,
        avgDailyOut: avgOut,
        avgDailyNet: avgNet
      }
    };

    // Validate payload for NaN
    if (isNaN(responsePayload.predictedWeight)) responsePayload.predictedWeight = initialWeight || 70;
    if (isNaN(responsePayload.weightChange)) responsePayload.weightChange = 0;

    console.log(`[AdherenceReport] END - took ${Date.now() - startTime}ms`);
    res.json(responsePayload);

  } catch (error) {
    console.error('[AdherenceReport] Fatal error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
*/

// Get adherence and predicted weight report - NOW USES FAST AGGREGATION VERSION
const { getAdherenceReportFast } = require('./adherenceReportFast');
exports.getAdherenceReport = getAdherenceReportFast;

// Helper function for default stats
const getDefaultStats = (userId, date) => ({
  userId,
  date: new Date(date),
  water: 0,
  sleep: 0,
  mental: 'Neutral',
  walking: 0,
  weight: 0,
  height: 0,
  activityLevel: 'Moderate',
  goalWeight: 'Not set',
  workoutsCompleted: 0,
  workoutsTotal: 0
});

// Helper function to check if weight goal is achieved
const checkGoalAchieved = (currentWeight, goalWeight) => {
  if (!goalWeight || goalWeight === 'Not set' || goalWeight === 'Maintain Weight') {
    return false; // Don't auto-clear maintain weight or unset goals
  }

  // Parse goal format: "Lose Weight: 70kg" or "Gain Weight: 80kg"
  const match = goalWeight.match(/(Lose|Gain) Weight:\s*(\d+(?:\.\d+)?)kg?/i);
  if (!match) return false;

  const goalType = match[1].toLowerCase();
  const targetWeight = parseFloat(match[2]);

  if (goalType === 'lose') {
    // Goal achieved if current weight <= target
    return currentWeight <= targetWeight;
  } else if (goalType === 'gain') {
    // Goal achieved if current weight >= target
    return currentWeight >= targetWeight;
  }

  return false;
};


// Apply Estimated Weight
exports.applyEstimatedWeight = async (req, res) => {
  console.log('[ApplyEstimate] Request received:', req.body);
  try {
    const { weight, netCalories, daysSince } = req.body;
    let { date } = req.body;
    if (!date) date = new Date();

    // Use same date format as getStats (just new Date from string)
    const dateObj = new Date(date);

    // Find or create stats for today
    let stats = await DailyStats.findOne({
      userId: req.userId,
      date: dateObj
    });

    const updateData = {
      weight: weight,
      weightSource: 'estimated',
      estimatedMeta: { netCalories, daysSince, appliedAt: new Date() }
    };

    if (stats) {
      stats.weight = weight;
      stats.weightSource = 'estimated';
      stats.estimatedMeta = updateData.estimatedMeta;
      await stats.save();
      console.log('[ApplyEstimate] Updated existing stats for date:', dateObj);
    } else {
      await DailyStats.create({
        userId: req.userId,
        date: dateObj,
        ...updateData
      });
      console.log('[ApplyEstimate] Created new stats for date:', dateObj);
    }

    // Also update user's profile weight
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, { weight });
    console.log('[ApplyEstimate] User weight updated to:', weight);

    res.json({ message: 'Estimated weight applied successfully', weight });
  } catch (err) {
    console.error('[ApplyEstimate] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
