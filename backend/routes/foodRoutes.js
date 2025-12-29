const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { cache } = require('../middleware/cacheMiddleware');

// GET /api/foods - Search/List with Caching (5 mins)
router.get('/', cache(300000), foodController.getFoods);

// GET /api/foods/categories - Get categories (Cached 1 hour)
router.get('/categories', cache(3600000), async (req, res) => {
  const Food = require('../models/Food');
  try {
    const categories = await Food.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/foods/:id - Get single food
router.get('/:id', cache(300000), foodController.getFoodById);

module.exports = router;
