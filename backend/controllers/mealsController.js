const Meal = require('../models/Meal');
const Food = require('../models/Food');

// Get all meals for a date
exports.getMealsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Use date RANGE to avoid timezone issues
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`[MEALS] Query for date: ${date}`);
    console.log(`[MEALS] Range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ mealType: 1, addedAt: 1 });

    console.log(`[MEALS] Found ${meals.length} meals for ${date}`);
    if (meals.length > 0) {
      console.log(`[MEALS] First meal date: ${meals[0].date}`);
    }

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

    if (unit === 'servings' && food.servings && food.servings.length > 0) {
      const serving = food.servings[0];
      calories = serving.calories * quantity;
      protein = serving.protein * quantity;
      carbs = serving.carbs * quantity;
      fats = serving.fat * quantity;
    } else {
      // Fallback: If unit is NOT metric (g, ml, grams), assume it's a serving count (1 unit = 1x base nutrients)
      // If it IS metric, assume base nutrients are per 100g/ml
      const isMetric = ['g', 'ml', 'grams', 'gram'].includes(unit.toLowerCase());
      const multiplier = isMetric ? quantity / 100 : quantity;

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

