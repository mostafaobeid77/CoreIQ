const Meal = require('../models/Meal');
const Food = require('../models/Food');

// Get all meals for a date
exports.getMealsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Use date RANGE to avoid timezone issues (same as workoutEntryController)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ mealType: 1, addedAt: 1 });

    // Group by mealType
    const groupedMeals = {};
    meals.forEach(meal => {
      if (!groupedMeals[meal.mealType]) {
        groupedMeals[meal.mealType] = [];
      }
      groupedMeals[meal.mealType].push(meal);
    });

    res.json(groupedMeals);
  } catch (error) {
    console.error('Get meals error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add meal item
exports.addMeal = async (req, res) => {
  try {
    const { date, mealType, foodId, quantity, unit } = req.body;

    // Validation
    if (!date || !mealType || !foodId || !quantity || !unit) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get food from database
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Calculate nutrients based on unit
    let calories, protein, carbs, fats;

    // Check if unit matches a specific serving size or is generic 'servings'
    let servingMatch = null;
    if (unit === 'servings' && food.servings && food.servings.length > 0) {
      servingMatch = food.servings[0];
    } else if (food.servings && food.servings.length > 0) {
      servingMatch = food.servings.find(s => s.size === unit);
    }

    if (servingMatch) {
      calories = servingMatch.calories * quantity;
      protein = servingMatch.protein * quantity;
      carbs = servingMatch.carbs * quantity;
      fats = servingMatch.fat * quantity;
    } else {
      // Default to grams/ml assumption (per 100 base)
      const multiplier = quantity / 100;
      calories = (food.nutrients.calories || 0) * multiplier;
      protein = (food.nutrients.protein || 0) * multiplier;
      carbs = (food.nutrients.carbs || 0) * multiplier;
      fats = (food.nutrients.fat || 0) * multiplier;
    }

    // Create meal
    const meal = new Meal({
      userId: req.userId,
      date: new Date(date),
      mealType,
      foodId,
      name: food.name,
      brand: food.brand || 'Generic',
      quantity,
      unit,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      isCompleted: false
    });

    await meal.save();
    res.status(201).json({ message: 'Meal added successfully', meal });
  } catch (error) {
    console.error('Add meal error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update meal item
exports.updateMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const meal = await Meal.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // REVERSE SYNC: If meal is linked to a plan, update the plan too
    if (meal.planId && meal.planDay) {
      try {
        const Plan = require('../models/Plan');
        await Plan.updateOne(
          { _id: meal.planId, 'mealPlan.day': meal.planDay },
          {
            $set: {
              'mealPlan.$[dayFilter].meals.$[mealFilter]': {
                foodId: meal.foodId,
                name: meal.name,
                mealType: meal.mealType,
                quantity: meal.quantity,
                unit: meal.unit,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fats: meal.fats
              }
            }
          },
          {
            arrayFilters: [
              { 'dayFilter.day': meal.planDay },
              { 'mealFilter.name': meal.name } // Match by name since meals don't have unique IDs in plan
            ]
          }
        );
        console.log('[SYNC] Meal update synced back to plan');
      } catch (syncErr) {
        console.warn('[SYNC] Failed to sync meal update to plan:', syncErr.message);
      }
    }

    res.json({ message: 'Meal updated successfully', meal });
  } catch (error) {
    console.error('Update meal error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle meal completion
exports.toggleMeal = async (req, res) => {
  try {
    const { id } = req.params;

    const meal = await Meal.findOne({ _id: id, userId: req.userId });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    meal.isCompleted = !meal.isCompleted;
    await meal.save();

    res.json({ message: 'Meal completion toggled', meal });
  } catch (error) {
    console.error('Toggle meal error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete meal item
exports.deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;

    const meal = await Meal.findOneAndDelete({ _id: id, userId: req.userId });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // REVERSE SYNC: If meal was linked to a plan, remove from plan too
    if (meal.planId && meal.planDay) {
      try {
        const Plan = require('../models/Plan');
        await Plan.updateOne(
          { _id: meal.planId },
          {
            $pull: {
              'mealPlan.$[dayFilter].meals': { name: meal.name, mealType: meal.mealType }
            }
          },
          {
            arrayFilters: [{ 'dayFilter.day': meal.planDay }]
          }
        );
        console.log('[SYNC] Meal deletion synced back to plan');
      } catch (syncErr) {
        console.warn('[SYNC] Failed to sync meal deletion to plan:', syncErr.message);
      }
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get total nutrients for a date
exports.getTotalNutrients = async (req, res) => {
  try {
    const { date } = req.params;

    // Use date RANGE to avoid timezone issues
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isCompleted: true
    });

    const totals = meals.reduce((acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fats += meal.fats;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fats = Math.round(totals.fats * 10) / 10;

    res.json(totals);
  } catch (error) {
    console.error('Get total nutrients error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Delete all meals for a date
exports.deleteMealsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Use date RANGE to avoid timezone issues
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await Meal.deleteMany({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({ message: 'All meals for the date deleted successfully' });
  } catch (error) {
    console.error('Delete meals by date error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

