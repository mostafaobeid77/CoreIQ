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
      .select('name startDate endDate duration status createdBy progress createdAt')
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
    const { name, startDate, mealPlan, workoutPlan, metadata, createdBy, duration = 14 } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    // Validate duration
    const validDurations = [14, 30, 60, 90];
    const planDuration = validDurations.includes(duration) ? duration : 14;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + planDuration - 1); // Dynamic duration

    // Validate mealPlan and workoutPlan match duration
    if (mealPlan && mealPlan.length !== planDuration) {
      return res.status(400).json({ message: `Meal plan must contain exactly ${planDuration} days` });
    }
    if (workoutPlan && workoutPlan.length !== planDuration) {
      return res.status(400).json({ message: `Workout plan must contain exactly ${planDuration} days` });
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
      name: name || `My ${planDuration}-Day Plan`,
      duration: planDuration,
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

    // If updating startDate, recalculate endDate
    if (updateData.startDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 13);
      updateData.endDate = end;
    }

    // ALWAYS recalculate dates for mealPlan and workoutPlan if they are provided,
    // using either the new startDate or the existing one.
    if (updateData.mealPlan || updateData.workoutPlan) {
      const existingPlan = await Plan.findById(id);
      if (existingPlan) {
        const start = new Date(updateData.startDate || existingPlan.startDate);

        if (updateData.mealPlan) {
          updateData.mealPlan = updateData.mealPlan.map((day, index) => {
            const dayDate = new Date(start);
            dayDate.setDate(dayDate.getDate() + index);
            return {
              ...day,
              day: index + 1,
              date: dayDate,
              meals: (day.meals || []).map(m => ({
                ...m,
                mealType: m.mealType || 'snacks'
              }))
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
              date: dayDate,
              workouts: (day.workouts || [])
                .filter(w => w.workoutId || w.id || w._id) // Remove corrupt entries
                .map(w => {
                  // Ensure workoutType is set (frontend often uses 'type')
                  let wType = w.workoutType || w.type || 'strength';
                  if (wType.toLowerCase() === 'cardio') wType = 'cardio';
                  else wType = 'strength';

                  return {
                    ...w,
                    workoutId: w.workoutId || w.id || w._id,
                    workoutType: wType,
                    // Ensure sets exist for strength
                    sets: (wType === 'strength' && (!w.sets || w.sets.length === 0)) ? [{ reps: 10, weight: 0 }] : (w.sets || [])
                  };
                })
            };
          });
        }
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

    // SYNC ACTIVE PLANS TO MEAL/WORKOUT ENTRIES
    // If the plan is active, sync changes to Meal and WorkoutEntry collections
    if (plan.status === 'active' && (updateData.mealPlan || updateData.workoutPlan)) {
      console.log('[SYNC] Plan is active, syncing changes to entries...');

      try {
        // If mealPlan was updated, sync meals
        if (updateData.mealPlan && plan.mealPlan) {
          for (const day of plan.mealPlan) {
            // Delete existing meals for this plan+day
            await Meal.deleteMany({
              userId: req.userId,
              planId: plan._id,
              planDay: day.day
            });

            // Recreate meals from plan
            const mealEntries = [];
            for (const meal of day.meals) {
              mealEntries.push({
                userId: req.userId,
                date: day.date,
                mealType: meal.mealType,
                foodId: meal.foodId,
                name: meal.name,
                brand: meal.brand || 'Generic',
                quantity: meal.quantity,
                unit: meal.unit,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fats: meal.fats,
                isCompleted: false,
                planId: plan._id,
                planDay: day.day
              });
            }
            if (mealEntries.length > 0) {
              await Meal.insertMany(mealEntries);
            }
          }
          console.log('[SYNC] Meals synced');
        }

        // If workoutPlan was updated, sync workouts
        if (updateData.workoutPlan && plan.workoutPlan) {
          for (const day of plan.workoutPlan) {
            // Delete existing workout entries for this plan+day
            await WorkoutEntry.deleteMany({
              userId: req.userId,
              planId: plan._id,
              planDay: day.day
            });

            // Recreate workout entries from plan
            const workoutEntries = [];
            for (const workout of day.workouts) {
              if (!workout.workoutId) continue;

              workoutEntries.push({
                userId: req.userId,
                date: day.date,
                workoutId: workout.workoutId,
                workoutType: workout.workoutType || 'strength',
                name: workout.name,
                description: workout.description || '',
                muscle_group: workout.muscle_group || '',
                sets: workout.sets || [],
                minutes: workout.minutes || 0,
                isCompleted: false,
                planId: plan._id,
                planDay: day.day
              });
            }
            if (workoutEntries.length > 0) {
              await WorkoutEntry.insertMany(workoutEntries);
            }
          }
          console.log('[SYNC] Workouts synced');
        }
      } catch (syncError) {
        console.error('[SYNC] Error syncing plan entries:', syncError.message);
        // Don't fail the request, just log the error
      }
    }

    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Update plan error:', error.message);
    console.error('Update plan error stack:', error.stack);
    console.error('Update plan full error:', error);
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

    // 1. Collect all unique IDs for bulk lookup
    const foodIds = new Set();
    const workoutIds = new Set();
    const foodNames = new Set();
    const workoutNames = new Set();

    plan.mealPlan.forEach(day => {
      day.meals.forEach(m => {
        if (m.foodId) foodIds.add(m.foodId.toString());
        else if (m.name) foodNames.add(m.name);
      });
    });

    plan.workoutPlan.forEach(day => {
      day.workouts.forEach(w => {
        if (w.workoutId) workoutIds.add(w.workoutId.toString());
        else if (w.name) workoutNames.add(w.name);
      });
    });

    // 2. Bulk fetch
    const [foodsById, workoutsById, foodsByName, workoutsByName] = await Promise.all([
      Food.find({ _id: { $in: Array.from(foodIds) } }).lean(),
      Workout.find({ _id: { $in: Array.from(workoutIds) } }).lean(),
      Food.find({ name: { $in: Array.from(foodNames) } }).lean(),
      Workout.find({ name: { $in: Array.from(workoutNames) } }).lean()
    ]);

    const foodMap = new Map();
    foodsById.forEach(f => foodMap.set(f._id.toString(), f));
    foodsByName.forEach(f => foodMap.set(f.name, f));

    const workoutMap = new Map();
    workoutsById.forEach(w => workoutMap.set(w._id.toString(), w));
    workoutsByName.forEach(w => workoutMap.set(w.name, w));

    // Deactivate any active plans that OVERLAP with this plan's date range
    // Plans that don't overlap (e.g., chained plans that start after) can stay active
    await Plan.updateMany(
      {
        userId: req.userId,
        status: 'active',
        _id: { $ne: plan._id },
        // Overlapping = this plan's start <= other's end AND this plan's end >= other's start
        startDate: { $lte: plan.endDate },
        endDate: { $gte: plan.startDate }
      },
      { status: 'draft' }
    );

    // 3. Create Meal entries
    const mealEntries = [];
    let skippedMeals = 0;
    for (const day of plan.mealPlan) {
      for (const mealItem of day.meals) {
        const idStr = mealItem.foodId ? mealItem.foodId.toString() : null;
        const food = idStr ? foodMap.get(idStr) : foodMap.get(mealItem.name);
        const resolvedId = mealItem.foodId || food?._id;

        if (!resolvedId) {
          skippedMeals++;
          continue;
        }

        mealEntries.push(new Meal({
          userId: req.userId,
          date: day.date,
          mealType: mealItem.mealType,
          foodId: resolvedId,
          name: mealItem.name,
          brand: food?.brand || mealItem.brand || 'Generic',
          quantity: mealItem.quantity,
          unit: mealItem.unit,
          calories: mealItem.calories,
          protein: mealItem.protein,
          carbs: mealItem.carbs,
          fats: mealItem.fats,
          isCompleted: false,
          planId: plan._id,
          planDay: day.day
        }));
      }
    }

    // 4. Create Workout entries
    const workoutEntries = [];
    let skippedWorkouts = 0;
    for (const day of plan.workoutPlan) {
      for (const workoutItem of day.workouts) {
        const idStr = workoutItem.workoutId ? workoutItem.workoutId.toString() : null;
        const workout = idStr ? workoutMap.get(idStr) : workoutMap.get(workoutItem.name);
        const resolvedId = workoutItem.workoutId || workout?._id;

        if (!resolvedId) {
          skippedWorkouts++;
          continue;
        }

        // Ensure strength workouts have at least one set to pass validation
        const type = workoutItem.workoutType || workout?.category?.toLowerCase() || 'strength';
        let sets = workoutItem.sets || [];
        let minutes = workoutItem.minutes || 0;

        if (type === 'strength' && sets.length === 0) {
          sets = [{ reps: 10, weight: 0 }]; // Fallback default set
        }
        if (type === 'cardio' && minutes <= 0) {
          minutes = 30; // Fallback default minutes
        }

        workoutEntries.push(new WorkoutEntry({
          userId: req.userId,
          date: day.date,
          workoutId: resolvedId,
          workoutType: type === 'cardio' ? 'cardio' : 'strength',
          name: workoutItem.name,
          description: workout?.description || '',
          muscle_group: workoutItem.muscle_group || workout?.muscle_group,
          sets: sets,
          minutes: minutes,
          isCompleted: false,
          planId: plan._id,
          planDay: day.day
        }));
      }
    }

    if (skippedMeals > 0 || skippedWorkouts > 0) {
      console.warn(`[ACTIVATE] Skipped items with missing IDs - Meals: ${skippedMeals}, Workouts: ${skippedWorkouts}`);
    }

    console.log(`[ACTIVATE] Plan ${plan.name} - Creating ${mealEntries.length} meals and ${workoutEntries.length} workouts`);
    console.log(`[ACTIVATE] Plan dates: ${plan.startDate} to ${plan.endDate}`);
    if (mealEntries.length > 0) {
      console.log(`[ACTIVATE] First meal date: ${mealEntries[0].date}, Last meal date: ${mealEntries[mealEntries.length - 1].date}`);
    }

    // 5. Save all entries (faster with insertMany)
    if (mealEntries.length > 0) {
      const insertedMeals = await Meal.insertMany(mealEntries);
      console.log(`[ACTIVATE] ✅ Inserted ${insertedMeals.length} meals`);
    }
    if (workoutEntries.length > 0) {
      const insertedWorkouts = await WorkoutEntry.insertMany(workoutEntries);
      console.log(`[ACTIVATE] ✅ Inserted ${insertedWorkouts.length} workouts`);
    }

    // Update plan status
    plan.status = 'active';
    await plan.save();
    console.log(`[ACTIVATE] ✅ Plan ${plan._id} activated successfully`);

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
    console.error('Activate plan error stack:', error.stack);
    console.error('Activate plan full error:', error);
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

    // Delete all associated meals and workouts tied to this plan ID
    await Meal.deleteMany({ planId: plan._id });
    await WorkoutEntry.deleteMany({ planId: plan._id });

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







