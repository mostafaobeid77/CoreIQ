const Workout = require('../models/Workout');
const Food = require('../models/Food');

const sanitizeString = (value = '') => value.trim();

// --- WORKOUTS ---

exports.getWorkouts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, muscle_group } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (muscle_group) {
      query.muscle_group = muscle_group;
    }

    const [workouts, total] = await Promise.all([
      Workout.find(query).skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
      Workout.countDocuments(query)
    ]);

    return res.json({
      workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get workouts error:', error.message);
    return res.status(500).json({ message: 'Failed to get workouts', error: error.message });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const { name, description, category, muscle_group, equipment } = req.body || {};

    if (!name || !description || !category || !muscle_group) {
      return res.status(400).json({ message: 'Please provide name, description, category, and muscle group.' });
    }

    const workout = await Workout.create({
      name: sanitizeString(name),
      description: sanitizeString(description),
      category: sanitizeString(category),
      muscle_group: sanitizeString(muscle_group),
      equipment: sanitizeString(equipment || ''),
    });

    return res.status(201).json({
      message: 'Workout created successfully.',
      workout,
    });
  } catch (error) {
    console.error('Admin create workout error:', error.message);
    return res.status(500).json({ message: 'Failed to create workout', error: error.message });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findByIdAndDelete(id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    return res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Admin delete workout error:', error.message);
    return res.status(500).json({ message: 'Failed to delete workout', error: error.message });
  }
};

// --- FOODS (Meals) ---

exports.getFoods = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    const [foods, total] = await Promise.all([
      Food.find(query).skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
      Food.countDocuments(query)
    ]);

    return res.json({
      foods,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get foods error:', error.message);
    return res.status(500).json({ message: 'Failed to get foods', error: error.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      calories,
      protein,
      carbs,
      fat,
      servingLabel,
      servings = [],
      baseQuantity,
    } = req.body || {};

    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Please provide name, description, and category.' });
    }

    const nutrients = {
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    };

    const servingEntries = Array.isArray(servings)
      ? servings
        .filter((serving) => serving && serving.size)
        .map((serving) => ({
          size: sanitizeString(serving.size),
          calories: Number(serving.calories) || 0,
          protein: Number(serving.protein) || 0,
          carbs: Number(serving.carbs) || 0,
          fat: Number(serving.fat) || 0,
          grams: serving.grams ? Number(serving.grams) : undefined,
        }))
      : [];

    if (servingLabel && !servingEntries.length) {
      servingEntries.push({
        size: sanitizeString(servingLabel),
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat,
      });
    }

    const cleanedBaseQuantity = baseQuantity && typeof baseQuantity === 'object'
      ? {
        amount: baseQuantity.amount ? Number(baseQuantity.amount) : undefined,
        unit: baseQuantity.unit ? sanitizeString(baseQuantity.unit) : undefined,
        basis: ['per100g', 'perServing'].includes(baseQuantity.basis)
          ? baseQuantity.basis
          : undefined,
      }
      : undefined;

    const food = await Food.create({
      name: sanitizeString(name),
      description: sanitizeString(description),
      category: sanitizeString(category),
      nutrients,
      servings: servingEntries,
      baseQuantity: cleanedBaseQuantity,
    });

    return res.status(201).json({
      message: 'Meal created successfully.',
      food,
    });
  } catch (error) {
    console.error('Admin create food error:', error.message);
    return res.status(500).json({ message: 'Failed to create meal', error: error.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    return res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Admin delete food error:', error.message);
    return res.status(500).json({ message: 'Failed to delete meal', error: error.message });
  }
};
