const Workout = require('../models/Workout');
const Food = require('../models/Food');
const WorkoutSubmission = require('../models/WorkoutSubmission');
const { invalidateStatsCache } = require('./adminStatsController');

const sanitizeString = (value = '') => value.trim();

// --- WORKOUTS ---

exports.getWorkouts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, muscle_group, status } = req.query;
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
    // Note: status filter handled by collection selection below

    let items = [];
    let total = 0;

    if (status === 'pending') {
      // Query Submissions for PENDING
      const submissionQuery = { ...query, status: 'pending' };
      // Map search to name regex if text search not available on submissions yet or consistent
      if (search) {
        delete submissionQuery.$text;
        submissionQuery.name = { $regex: search, $options: 'i' };
      }

      [items, total] = await Promise.all([
        WorkoutSubmission.find(submissionQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
        WorkoutSubmission.countDocuments(submissionQuery)
      ]);

      // Add a flag to indicate these are submissions
      items = items.map(item => ({ ...item.toObject(), isSubmission: true }));

    } else {
      // Query Workouts for OFFICIAL (or other statuses if we had them)
      if (status) query.status = status;

      [items, total] = await Promise.all([
        Workout.find(query).skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
        Workout.countDocuments(query)
      ]);
    }

    return res.json({
      workouts: items, // Frontend expects 'workouts' key
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
    const { name, description, category, muscle_group, equipment, status } = req.body || {};

    if (!name || !description || !category || !muscle_group) {
      return res.status(400).json({ message: 'Please provide name, description, category, and muscle group.' });
    }

    const workout = await Workout.create({
      name: sanitizeString(name),
      description: sanitizeString(description),
      category: sanitizeString(category),
      muscle_group: sanitizeString(muscle_group),
      equipment: sanitizeString(equipment || ''),
      status: status || 'official',
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

exports.updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, muscle_group, equipment, status } = req.body || {};

    // Try finding existing OFFICIAL workout first
    let workout = await Workout.findByIdAndUpdate(
      id,
      {
        name: sanitizeString(name),
        description: sanitizeString(description),
        category: sanitizeString(category),
        muscle_group: sanitizeString(muscle_group),
        equipment: sanitizeString(equipment || ''),
        ...(status && { status }),
      },
      { new: true, runValidators: true }
    );

    if (workout) {
      return res.json({
        message: 'Workout updated successfully.',
        workout,
      });
    }

    // If not found, check if it is a pending SUBMISSION being approved
    const submission = await WorkoutSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // It is a submission. Are we approving it?
    if (status === 'official' || status === 'approved') {
      // Create new OFFICIAL workout
      workout = await Workout.create({
        name: sanitizeString(name || submission.name),
        description: sanitizeString(description || submission.description),
        category: sanitizeString(category || submission.category),
        muscle_group: sanitizeString(muscle_group || submission.muscle_group),
        equipment: sanitizeString(equipment || submission.equipment),
        status: 'official'
      });

      // Mark submission as approved
      submission.status = 'approved';
      submission.reviewedBy = req.userId; // Assuming auth middleware sets this
      submission.reviewedAt = new Date();
      await submission.save();

      return res.json({
        message: 'Workout submission approved and created.',
        workout
      });
    } else if (status === 'rejected') {
      submission.status = 'rejected';
      submission.reviewedBy = req.userId;
      submission.reviewedAt = new Date();
      await submission.save();
      return res.json({ message: 'Workout submission rejected.' });
    } else {
      // Just updating the submission details without approving yet?
      // Or user trying to update a submission?
      // For now, let's allow updating the submission content
      submission.name = sanitizeString(name || submission.name);
      submission.description = sanitizeString(description || submission.description);
      submission.category = sanitizeString(category || submission.category);
      submission.muscle_group = sanitizeString(muscle_group || submission.muscle_group);
      submission.equipment = sanitizeString(equipment || submission.equipment);
      await submission.save();

      return res.json({
        message: 'Submission updated.',
        workout: submission // Frontend expects 'workout' key
      });
    }

  } catch (error) {
    console.error('Admin update workout error:', error.message);
    return res.status(500).json({ message: 'Failed to update workout', error: error.message });
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

exports.updateWorkoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await WorkoutSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (status === 'approved') {
      const workout = await Workout.create({
        name: submission.name,
        description: submission.description,
        category: submission.category,
        muscle_group: submission.muscle_group,
        equipment: submission.equipment,
        status: 'official'
      });

      submission.status = 'approved';
      submission.reviewedBy = req.adminId; // Middleware provides this
      submission.reviewedAt = new Date();
      await submission.save();

      invalidateStatsCache();
      return res.json({ message: 'Workout approved', workout });
    } else {
      submission.status = 'rejected';
      submission.rejectionReason = rejectionReason;
      submission.reviewedBy = req.adminId;
      submission.reviewedAt = new Date();
      await submission.save();

      invalidateStatsCache();
      return res.json({ message: 'Workout rejected' });
    }

  } catch (error) {
    console.error('Update status error:', error.message);
    return res.status(500).json({ message: 'Failed to update status', error: error.message });
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
      // API sends Title Case (e.g., 'Fast Foods'), DB uses snake_case and has typos
      const categoryMap = {
        'Proteins': 'proteins', // DB actually uses correct spelling despite filename typo
        'Grains/Carbs': 'grains_carbs',
        'Fast Foods': 'fast_foods',
        'Vegetables': 'vegetables',
        'Fruits': 'fruits',
        'Salads': 'salads',
        'Drinks': 'drinks'
      };

      const mappedCategory = categoryMap[category] || category.toLowerCase().replace(/ /g, '_');

      // Special case for Proteins due to mixed data in DB (typo 'protiens' vs correct 'proteins')
      if (mappedCategory === 'proteins') {
        query.category = { $in: ['proteins', 'protiens'] };
      } else {
        query.category = mappedCategory;
      }
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
