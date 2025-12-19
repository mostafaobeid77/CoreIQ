// controllers/foodController.js
const Food = require('../models/Food');

// Get all foods OR search by name
exports.getFoods = async (req, res) => {
  try {
    const { name, search } = req.query;
    const searchTerm = name || search;
    let query = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const foods = await Food.find(query).limit(50); // Limit to 50 for testing
    res.json(foods);
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
