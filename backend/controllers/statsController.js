const DailyStats = require('../models/DailyStats');
const { calculateCaloriesFromSteps } = require('../utils/calorieCalculator');

// Get stats for a specific date
exports.getStats = async (req, res) => {
  try {
    const { date } = req.params;

    const stats = await DailyStats.findOne({
      userId: req.userId,
      date: new Date(date)
    });

    if (stats) {
      return res.json(stats);
    }

    // If no stats for today, try to find the most recent previous stats
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
      // Note: We don't carry over water, sleep, etc. as those are daily specific
    }

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

