const WorkoutEntry = require('../models/WorkoutEntry');
const Workout = require('../models/Workout');
const DailyStats = require('../models/DailyStats');
const User = require('../models/User');
const { calculateCaloriesFromWorkout } = require('../utils/calorieCalculator');

// Get all workout entries for a date
exports.getWorkoutEntriesByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Use date RANGE to avoid timezone issues
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await WorkoutEntry.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ muscle_group: 1, createdAt: 1 });

    // Separate strength and cardio
    const strengthByGroup = {};
    const cardioEntries = [];

    entries.forEach(entry => {
      if (entry.workoutType === 'strength') {
        const group = entry.muscle_group || 'Other';
        if (!strengthByGroup[group]) {
          strengthByGroup[group] = [];
        }
        strengthByGroup[group].push(entry);
      } else {
        cardioEntries.push(entry);
      }
    });

    res.json({ strengthByGroup, cardioEntries });
  } catch (error) {
    console.error('Get workout entries error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add workout entry
exports.addWorkoutEntry = async (req, res) => {
  try {
    const { date, workoutId, sets, minutes } = req.body;

    // Validation
    if (!date || !workoutId) {
      return res.status(400).json({ message: 'Please provide date and workoutId' });
    }

    // Get workout template
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Determine workout type
    const isCardio = workout.category?.toLowerCase() === 'cardio' ||
      workout.muscle_group?.toLowerCase() === 'cardio';
    const workoutType = isCardio ? 'cardio' : 'strength';

    // Validate based on type
    if (workoutType === 'strength' && (!sets || sets.length === 0)) {
      return res.status(400).json({ message: 'Strength workouts require sets' });
    }
    if (workoutType === 'cardio' && !minutes) {
      return res.status(400).json({ message: 'Cardio workouts require minutes' });
    }

    // Create entry
    const entry = new WorkoutEntry({
      userId: req.userId,
      date: new Date(date),
      workoutId,
      workoutType,
      name: workout.name,
      description: workout.description,
      muscle_group: workout.muscle_group,
      sets: sets || [],
      minutes: minutes || 0,
      isCompleted: false
    });

    await entry.save();
    res.status(201).json({ message: 'Workout entry added successfully', entry });
  } catch (error) {
    console.error('Add workout entry error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle workout completion
exports.toggleWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await WorkoutEntry.findOne({ _id: id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: 'Workout entry not found' });
    }

    const wasCompleted = entry.isCompleted;
    entry.isCompleted = !entry.isCompleted;

    // Calculate calories if workout is being marked as complete
    if (!wasCompleted && entry.isCompleted) {
      // Get user weight for accurate calorie calculation
      const user = await User.findById(req.userId).select('weight');
      const userWeight = user?.weight || 70; // Default 70kg if no weight set

      // Determine duration (use minutes field or estimate from sets)
      let durationMinutes = entry.minutes || 0;
      if (!durationMinutes && entry.sets && entry.sets.length > 0) {
        // Estimate: 3 minutes per set for strength training
        durationMinutes = entry.sets.length * 3;
      }

      // Calculate calories burned
      const caloriesBurned = calculateCaloriesFromWorkout({
        workoutType: entry.muscle_group || entry.name || 'general',
        durationMinutes,
        userWeight
      });

      // Store calories in workout entry
      entry.caloriesBurned = caloriesBurned;

      // Update DailyStats
      const stats = await DailyStats.findOne({
        userId: req.userId,
        date: entry.date
      });

      if (stats) {
        stats.caloriesBurnedWorkouts += caloriesBurned;
        stats.totalCaloriesBurned = stats.caloriesBurnedWorkouts + stats.caloriesBurnedSteps;
        await stats.save();
      }
    } else if (wasCompleted && !entry.isCompleted) {
      // If unmarking as complete, subtract calories
      if (entry.caloriesBurned) {
        const stats = await DailyStats.findOne({
          userId: req.userId,
          date: entry.date
        });

        if (stats) {
          stats.caloriesBurnedWorkouts = Math.max(0, stats.caloriesBurnedWorkouts - entry.caloriesBurned);
          stats.totalCaloriesBurned = stats.caloriesBurnedWorkouts + stats.caloriesBurnedSteps;
          await stats.save();
        }

        entry.caloriesBurned = 0;
      }
    }

    await entry.save();

    res.json({ message: 'Workout completion toggled', entry });
  } catch (error) {
    console.error('Toggle workout error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete workout entry
exports.deleteWorkoutEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await WorkoutEntry.findOneAndDelete({ _id: id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: 'Workout entry not found' });
    }

    res.json({ message: 'Workout entry deleted successfully' });
  } catch (error) {
    console.error('Delete workout entry error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Update workout entry
exports.updateWorkoutEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { sets, minutes } = req.body;

    const entry = await WorkoutEntry.findOne({ _id: id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: 'Workout entry not found' });
    }

    if (entry.workoutType === 'strength') {
      if (sets) entry.sets = sets;
    } else {
      if (minutes) entry.minutes = minutes;
    }

    await entry.save();
    res.json({ message: 'Workout entry updated successfully', entry });
  } catch (error) {
    console.error('Update workout entry error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
