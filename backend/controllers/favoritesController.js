const FoodFavorite = require('../models/FoodFavorite');
const Food = require('../models/Food');

// Get user's favorite foods
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await FoodFavorite.find({ userId: req.userId }).populate('foodId');
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { foodId } = req.body;

    if (!foodId) {
      return res.status(400).json({ message: 'Please provide foodId' });
    }

    // Check if already favorited
    const existing = await FoodFavorite.findOne({ userId: req.userId, foodId });
    if (existing) {
      return res.status(400).json({ message: 'Food already in favorites' });
    }

    const favorite = new FoodFavorite({
      userId: req.userId,
      foodId
    });

    await favorite.save();
    res.status(201).json({ message: 'Added to favorites', favorite });
  } catch (error) {
    console.error('Add favorite error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { foodId } = req.params;

    const favorite = await FoodFavorite.findOneAndDelete({
      userId: req.userId,
      foodId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

