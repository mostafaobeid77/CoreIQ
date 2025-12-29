const DailyStats = require('../models/DailyStats');
const { calculateCaloriesFromSteps } = require('../utils/calorieCalculator');

// Simple in-memory cache for user data (weight, height persist across days)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const User = require('../models/User');
const WorkoutEntry = require('../models/WorkoutEntry'); // Import WorkoutEntry for calorie aggregation

// Get stats for a specific date - OPTIMIZED VERSION
exports.getStats = async (req, res) => {
  try {
    const { date } = req.params;
    console.log(`[getStats] Request for date: ${date}, userId: ${req.userId}`);

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    // Try cache first for user data
    let user = userCache.get(req.userId)?.data;
    const cacheValid = userCache.get(req.userId)?.expires > Date.now();

    if (!user || !cacheValid) {
      user = await User.findById(req.userId).select('createdAt weight height goalWeight').lean();
      if (user) {
        userCache.set(req.userId, { data: user, expires: Date.now() + CACHE_TTL });
      } else {
        console.warn(`[getStats] User not found for ID: ${req.userId}`);
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
      console.log(`[getStats] Found stats for ${date}`);

      // FIX: Aggressive Aggregation of Workout Calories
      // Even if stats exist, the workouts might have been updated separately.
      // We re-calculate totalCaloriesBurned from the actual WorkoutEntries to be safe.
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const workoutEntries = await WorkoutEntry.find({
        userId: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        isCompleted: true
      });

      const workoutCalories = workoutEntries.reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0);

      // Update values in memory (and optionally save if different? Let's just return correct data for now)
      stats.caloriesBurnedWorkouts = workoutCalories;
      stats.totalCaloriesBurned = (stats.caloriesBurnedSteps || 0) + workoutCalories;

      console.log(`[getStats] Recalculated calories: Workouts=${workoutCalories}, Steps=${stats.caloriesBurnedSteps}, Total=${stats.totalCaloriesBurned}`);

      return res.json(stats);
    }

    console.log(`[getStats] No stats for ${date}, generating defaults`);

    // No stats for today - return defaults with carried over values
    const defaults = getDefaultStats(req.userId, date);

    // FIX: Calculate workout calories even for defaults
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const workoutEntries = await WorkoutEntry.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isCompleted: true
    });

    const workoutCalories = workoutEntries.reduce((sum, entry) => sum + (entry.caloriesBurned || 0), 0);
    defaults.caloriesBurnedWorkouts = workoutCalories;
    defaults.totalCaloriesBurned = (defaults.caloriesBurnedSteps || 0) + workoutCalories;

    // Carry over from previous stats or user profile
    defaults.weight = previousStats?.weight || user.weight || defaults.weight;
    defaults.height = previousStats?.height || user.height || defaults.height;
    defaults.activityLevel = previousStats?.activityLevel || defaults.activityLevel;
    defaults.goalWeight = previousStats?.goalWeight || user.goalWeight || defaults.goalWeight;

    res.json(defaults);
  } catch (error) {
    console.error('[getStats] FATAL ERROR:', error);
    console.error(error.stack);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
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
      stats.totalCaloriesBurned = (stats.caloriesBurnedWorkouts || 0) + stats.caloriesBurnedSteps;
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
      stats.totalCaloriesBurned = (stats.caloriesBurnedWorkouts || 0) + stats.caloriesBurnedSteps;
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

// Get adherence and predicted weight report
exports.getAdherenceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Missing start or end date' });
    }

    // Get stats for the period
    const stats = await DailyStats.find({
      userId: req.userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ date: 1 }).lean();

    // Get user for goal info
    const User = require('../models/User');
    const user = await User.findById(req.userId).select('goalWeight weight height gender birthDate activityLevel').lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate aggregations
    let totalCaloriesIn = 0;
    let daysWithFood = 0;

    stats.forEach(s => {
      if (s.caloriesIn > 0) {
        totalCaloriesIn += s.caloriesIn;
        daysWithFood++;
      }
    });

    const avgDailyIn = daysWithFood > 0 ? Math.round(totalCaloriesIn / daysWithFood) : 0;

    // Weight change
    let startWeight = user.weight; // Default to current if no history
    let endWeight = user.weight;

    if (stats.length > 0) {
      const weightStats = stats.filter(s => s.weight > 0);
      if (weightStats.length > 0) {
        startWeight = weightStats[0].weight;
        endWeight = weightStats[weightStats.length - 1].weight;
      }
    }

    const weightChange = Math.round((endWeight - startWeight) * 10) / 10;

    // Projection Logic (Simplified)
    const goalWeightMatch = (user.goalWeight || '').match(/(\d+(?:\.\d+)?)/);
    const targetWeight = goalWeightMatch ? parseFloat(goalWeightMatch[0]) : user.weight;
    const remainingWeight = Math.abs(user.weight - targetWeight);
    const weeklyChange = weightChange / (stats.length / 7 || 1);

    let daysToGoal = 90; // Default
    if (Math.abs(weeklyChange) > 0.1) {
      daysToGoal = Math.abs(remainingWeight / weeklyChange) * 7;
    }

    const projectedGoalDate = new Date();
    projectedGoalDate.setDate(projectedGoalDate.getDate() + daysToGoal);

    // net calories calculation (simplified)
    const netCalories = avgDailyIn - 2000; // rough TDEE placeholder if explicit burn missing

    // Verdict Logic
    let status = 'On Track';
    let color = '#4ADE80'; // Success green
    let advice = 'You are doing great! Keep it up.';

    if (daysWithFood < 3) {
      status = 'More Data Needed';
      color = '#FBBF24'; // Warning yellow
      advice = 'Track more days to get a detailed analysis.';
    } else if (user.goalWeight.includes('Lose') && weightChange > 0) {
      status = 'Off Track';
      color = '#F87171'; // Error red
      advice = 'You gained weight. Watch your calorie intake.';
    }

    const response = {
      period: { startDate, endDate, days: stats.length },
      data: {
        avgDailyIn,
        avgDailyOut: 0 // Placeholder
      },
      weightChange,
      userGoal: user.goalWeight || 'Maintain Weight',
      projection: {
        projectedGoalDate: projectedGoalDate.toISOString(),
        daysToGoal
      },
      verdict: {
        status,
        color,
        advice
      },
      suggestion: {
        daysSince: stats.length,
        netCalories: Math.round(netCalories),
        estimatedWeight: Math.round((user.weight + (netCalories * stats.length / 7700)) * 10) / 10 // 7700kcal = 1kg
      },
      dailyData: stats // Keep this for charts if needed
    };

    res.json(response);
  } catch (error) {
    console.error('Get adherence report error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply Estimated Weight
exports.applyEstimatedWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    let { date } = req.body;
    if (!date) date = new Date();

    const dateObj = new Date(date);

    // Find or create stats for today
    let stats = await DailyStats.findOne({
      userId: req.userId,
      date: dateObj
    });

    const updateData = {
      weight: weight,
      weightSource: 'estimated'
    };

    if (stats) {
      stats.weight = weight;
      stats.weightSource = 'estimated';
      await stats.save();
    } else {
      await DailyStats.create({
        userId: req.userId,
        date: dateObj,
        ...updateData
      });
    }

    // Also update user's profile weight
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, { weight });

    res.json({ message: 'Estimated weight applied successfully', weight });
  } catch (err) {
    console.error('[ApplyEstimate] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    return false;
  }
  const match = goalWeight.match(/(Lose|Gain) Weight:\s*(\d+(?:\.\d+)?)kg?/i);
  if (!match) return false;

  const goalType = match[1].toLowerCase();
  const targetWeight = parseFloat(match[2]);

  if (goalType === 'lose') {
    return currentWeight <= targetWeight;
  } else if (goalType === 'gain') {
    return currentWeight >= targetWeight;
  }
  return false;
};
