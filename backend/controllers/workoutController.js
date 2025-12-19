const Workout = require('../models/Workout');

// GET /api/workouts - Get all workouts with optional filtering
exports.getAllWorkouts = async (req, res) => {
  try {
    const { name, category, muscle_group, equipment, limit = 50 } = req.query;
    let query = {};
    let projection = {
      name: 1,
      description: 1,
      category: 1,
      muscle_group: 1,
      equipment: 1,
      _id: 1,
      createdAt: 1,
      updatedAt: 1
    };
    let sort = { name: 1 };

    if (name) {
      query.$or = [
        { name: { $regex: name, $options: 'i' } },
        { description: { $regex: name, $options: 'i' } },
        { muscle_group: { $regex: name, $options: 'i' } },
        { equipment: { $regex: name, $options: 'i' } },
      ];
      sort = { name: 1 };
    }
    if (category) {
      query.category = category;
    }
    if (muscle_group) {
      query.muscle_group = muscle_group;
    }
    if (equipment) {
      query.equipment = equipment;
    }

    const workouts = await Workout.find(query, projection)
      .sort(sort)
      .limit(parseInt(limit))
      .maxTimeMS(2000)
      .lean();

    // If searching by name, prioritize exact matches
    if (name) {
      workouts.sort((a, b) => {
        const aExact = a.name.toLowerCase() === name.toLowerCase();
        const bExact = b.name.toLowerCase() === name.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    res.json(workouts);
  } catch (err) {
    console.error('❌ Error fetching workouts:', err.message);
    res.status(500).json({ message: 'Failed to fetch workouts', error: err.message });
  }
};

// GET /api/workouts/categories - Get all available categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Workout.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

// GET /api/workouts/muscle-groups - distinct muscle groups
exports.getMuscleGroups = async (req, res) => {
  try {
    const groups = await Workout.distinct('muscle_group');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch muscle groups', error: err.message });
  }
};