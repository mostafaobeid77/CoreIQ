const Food = require('../models/Food');
const Workout = require('../models/Workout');
const FoodSubmission = require('../models/FoodSubmission');
const WorkoutSubmission = require('../models/WorkoutSubmission');

const sanitizeString = (value = '') => value.trim();

// Submit food for approval
exports.submitFood = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      calories,
      protein,
      carbs,
      fat,
      servings = [],
    } = req.body || {};

    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Please provide name, description, and category.' });
    }

    const sanitizedName = sanitizeString(name);

    // Check if food already exists
    const existingFood = await Food.findOne({
      name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') }
    });

    if (existingFood) {
      return res.status(400).json({ message: 'This food item already exists in the database.' });
    }

    // Check if user already submitted this (pending)
    const existingSubmission = await FoodSubmission.findOne({
      submittedBy: req.userId,
      name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') },
      status: 'pending'
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this food item. It is pending admin approval.' });
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

    const submission = await FoodSubmission.create({
      submittedBy: req.userId,
      name: sanitizedName,
      description: sanitizeString(description),
      category: sanitizeString(category),
      nutrients,
      servings: servingEntries,
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Food submission sent for admin approval. You will be notified once it is reviewed.',
      submission: {
        id: submission._id,
        name: submission.name,
        status: submission.status,
        createdAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Submit food error:', error.message);
    return res.status(500).json({ message: 'Failed to submit food', error: error.message });
  }
};

// Submit workout for approval
exports.submitWorkout = async (req, res) => {
  try {
    const { name, description, category, muscle_group, equipment } = req.body || {};

    if (!name || !description || !category || !muscle_group) {
      return res.status(400).json({ message: 'Please provide name, description, category, and muscle group.' });
    }

    const sanitizedName = sanitizeString(name);

    // Check if workout already exists
    const existingWorkout = await Workout.findOne({
      name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') }
    });

    if (existingWorkout) {
      return res.status(400).json({ message: 'This workout already exists in the database.' });
    }

    // Check if user already submitted this (pending)
    const existingSubmission = await WorkoutSubmission.findOne({
      submittedBy: req.userId,
      name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') },
      status: 'pending'
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this workout. It is pending admin approval.' });
    }

    const submission = await WorkoutSubmission.create({
      submittedBy: req.userId,
      name: sanitizedName,
      description: sanitizeString(description),
      category: sanitizeString(category),
      muscle_group: sanitizeString(muscle_group),
      equipment: sanitizeString(equipment || ''),
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Workout submission sent for admin approval. You will be notified once it is reviewed.',
      submission: {
        id: submission._id,
        name: submission.name,
        status: submission.status,
        createdAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Submit workout error:', error.message);
    return res.status(500).json({ message: 'Failed to submit workout', error: error.message });
  }
};

// Get user's submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const foodSubmissions = await FoodSubmission.find({ submittedBy: req.userId })
      .sort({ createdAt: -1 })
      .select('name description category status createdAt reviewedAt rejectionReason');

    const workoutSubmissions = await WorkoutSubmission.find({ submittedBy: req.userId })
      .sort({ createdAt: -1 })
      .select('name description category muscle_group status createdAt reviewedAt rejectionReason');

    res.json({
      food: foodSubmissions,
      workouts: workoutSubmissions
    });
  } catch (error) {
    console.error('Get submissions error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




