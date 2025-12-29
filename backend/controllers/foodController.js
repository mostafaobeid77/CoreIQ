// controllers/foodController.js
const Food = require('../models/Food');

// Get all foods OR search by name
exports.getFoods = async (req, res) => {
  try {
    const { name, search } = req.query;
    const searchTerm = name || search;
    let query = {};

    if (searchTerm) {
      // Use efficient Text Index search
      query.$text = { $search: searchTerm };
      // Sort by relevance
      sort = { score: { $meta: 'textScore' } };
      projection = { score: { $meta: 'textScore' } };
    } else {
      sort = { name: 1 };
      projection = {};
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Reduced default to 20 for mobile
    const skip = (page - 1) * limit;

    const [foods, total] = await Promise.all([
      Food.find(query, projection).sort(sort).skip(skip).limit(limit).lean(),
      Food.countDocuments(query)
    ]);

    res.json({
      data: foods,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single food by ID
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
