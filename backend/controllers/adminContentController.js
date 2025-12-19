const Workout = require('../models/Workout');
const Food = require('../models/Food');

const sanitizeString = (value = '') => value.trim();

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
