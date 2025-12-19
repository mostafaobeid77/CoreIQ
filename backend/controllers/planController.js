const Plan = require('../models/Plan');
const Meal = require('../models/Meal');
const WorkoutEntry = require('../models/WorkoutEntry');
const Food = require('../models/Food');
const Workout = require('../models/Workout');

// Get all plans for user
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('name startDate endDate status createdBy progress createdAt')
      .lean(); // Optimize for read-only

    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single plan details
exports.getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOne({
      _id: id,
      userId: req.userId
    }).lean(); // Optimize for read-only

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new plan
exports.createPlan = async (req, res) => {
  try {
    const { name, startDate, mealPlan, workoutPlan, metadata, createdBy } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 13); // 14 days total

    // Validate mealPlan and workoutPlan have 14 days
    if (mealPlan && mealPlan.length !== 14) {
      return res.status(400).json({ message: 'Meal plan must contain exactly 14 days' });
    }
    if (workoutPlan && workoutPlan.length !== 14) {
      return res.status(400).json({ message: 'Workout plan must contain exactly 14 days' });
    }

    // Calculate dates for each day
    const processedMealPlan = mealPlan ? mealPlan.map((day, index) => {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + index);
      return {
        day: index + 1,
        date: dayDate,
        meals: day.meals || []
      };
    }) : [];

    const processedWorkoutPlan = workoutPlan ? workoutPlan.map((day, index) => {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + index);
      return {
        day: index + 1,
        date: dayDate,
        workouts: day.workouts || []
      };
    }) : [];

    const plan = new Plan({
      userId: req.userId,
      name: name || 'My 14-Day Plan',
      startDate: start,
      endDate: end,
      mealPlan: processedMealPlan,
      workoutPlan: processedWorkoutPlan,
      metadata: metadata || {},
      createdBy: createdBy || 'user',
      status: 'draft'
    });

    await plan.save();
    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    console.error('Create plan error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update plan
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating status via this endpoint (use activate/deactivate)
    delete updateData.status;
    delete updateData.userId;

    // If updating startDate, recalculate endDate and dates
    if (updateData.startDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 13);
      updateData.endDate = end;

      // Recalculate dates for mealPlan and workoutPlan if they exist
      if (updateData.mealPlan) {
        updateData.mealPlan = updateData.mealPlan.map((day, index) => {
          const dayDate = new Date(start);
          dayDate.setDate(dayDate.getDate() + index);
          return {
            ...day,
            day: index + 1,
            date: dayDate
          };
        });
      }

      if (updateData.workoutPlan) {
        updateData.workoutPlan = updateData.workoutPlan.map((day, index) => {
          const dayDate = new Date(start);
          dayDate.setDate(dayDate.getDate() + index);
          return {
            ...day,
            day: index + 1,
            date: dayDate
          };
        });
      }
    }

    const plan = await Plan.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Update plan error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Activate plan (creates daily entries)
exports.activatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOne({
      _id: id,
      userId: req.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.status === 'active') {
      return res.status(400).json({ message: 'Plan is already active' });
    }

    if (plan.status === 'completed') {
      return res.status(400).json({ message: 'Cannot activate completed plan' });
    }

    // Deactivate any other active plan
    await Plan.updateMany(
      { userId: req.userId, status: 'active' },
      { status: 'draft' }
    );

    // Create Meal entries for all planned meals
    const mealEntries = [];
    for (const day of plan.mealPlan) {
      for (const mealItem of day.meals) {
        // Verify food exists
        const food = await Food.findById(mealItem.foodId);
        if (!food) {
          console.warn(`Food ${mealItem.foodId} not found, skipping meal`);
          continue;
        }

        const meal = new Meal({
          userId: req.userId,
          date: day.date,
          mealType: mealItem.mealType,
          foodId: mealItem.foodId,
          name: mealItem.name,
          brand: food.brand || 'Generic',
          quantity: mealItem.quantity,
          unit: mealItem.unit,
          calories: mealItem.calories,
          protein: mealItem.protein,
          carbs: mealItem.carbs,
          fats: mealItem.fats,
          isCompleted: false,
          planId: plan._id,
          planDay: day.day
        });
        mealEntries.push(meal);
      }
    }

    // Create WorkoutEntry for all planned workouts
    const workoutEntries = [];
    for (const day of plan.workoutPlan) {
      for (const workoutItem of day.workouts) {
        // Verify workout exists
        const workout = await Workout.findById(workoutItem.workoutId);
        if (!workout) {
          console.warn(`Workout ${workoutItem.workoutId} not found, skipping workout`);
          continue;
        }

        const entry = new WorkoutEntry({
          userId: req.userId,
          date: day.date,
          workoutId: workoutItem.workoutId,
          workoutType: workoutItem.workoutType,
          name: workoutItem.name,
          description: workout.description || '',
          muscle_group: workoutItem.muscle_group || workout.muscle_group,
          sets: workoutItem.sets || [],
          minutes: workoutItem.minutes || 0,
          isCompleted: false,
          planId: plan._id,
          planDay: day.day
        });
        workoutEntries.push(entry);
      }
    }

    // Save all entries
    await Meal.insertMany(mealEntries);
    await WorkoutEntry.insertMany(workoutEntries);

    // Update plan status
    plan.status = 'active';
    await plan.save();

    res.json({
      message: 'Plan activated successfully',
      plan,
      created: {
        meals: mealEntries.length,
        workouts: workoutEntries.length
      }
    });
  } catch (error) {
    console.error('Activate plan error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Deactivate plan (doesn't delete entries, just changes status)
exports.deactivatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOneAndUpdate(
      { _id: id, userId: req.userId, status: 'active' },
      { status: 'draft' },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Active plan not found' });
    }

    res.json({ message: 'Plan deactivated successfully', plan });
  } catch (error) {
    console.error('Deactivate plan error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete plan
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOne({
      _id: id,
      userId: req.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // If plan is active, delete associated meals/workouts
    if (plan.status === 'active') {
      await Meal.deleteMany({ planId: plan._id });
      await WorkoutEntry.deleteMany({ planId: plan._id });
    }

    await Plan.findByIdAndDelete(id);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get plan progress
exports.getPlanProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findOne({
      _id: id,
      userId: req.userId
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Calculate actual progress from Meal and WorkoutEntry collections
    const mealsCompleted = await Meal.countDocuments({
      planId: plan._id,
      isCompleted: true
    });

    const workoutsCompleted = await WorkoutEntry.countDocuments({
      planId: plan._id,
      isCompleted: true
    });

    // Update plan progress
    plan.progress.mealsCompleted = mealsCompleted;
    plan.progress.workoutsCompleted = workoutsCompleted;

    // Calculate days completed (days where all meals and workouts are done)
    const totalMeals = plan.progress.mealsTotal;
    const totalWorkouts = plan.progress.workoutsTotal;
    const completionPercentage = totalMeals + totalWorkouts > 0
      ? ((mealsCompleted + workoutsCompleted) / (totalMeals + totalWorkouts)) * 100
      : 0;

    await plan.save();

    res.json({
      plan: {
        _id: plan._id,
        name: plan.name,
        status: plan.status,
        startDate: plan.startDate,
        endDate: plan.endDate
      },
      progress: {
        mealsCompleted,
        mealsTotal: plan.progress.mealsTotal,
        workoutsCompleted,
        workoutsTotal: plan.progress.workoutsTotal,
        daysCompleted: plan.progress.daysCompleted,
        completionPercentage: Math.round(completionPercentage * 10) / 10
      }
    });
  } catch (error) {
    console.error('Get plan progress error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};







