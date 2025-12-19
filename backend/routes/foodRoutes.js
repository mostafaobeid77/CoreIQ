const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// GET /api/foods - Get all foods with optional filtering
router.get('/', async (req, res) => {
  try {
    const { name, category, limit = 50 } = req.query;
    let query = {};
    let projection = {
      name: 1,
      description: 1,
      category: 1,
      nutrients: 1,
      servings: 1,
      _id: 1,
      createdAt: 1,
      updatedAt: 1
    };
    let sort = { name: 1 };

    if (name) {
      // Use regex for better matching
      query = {
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { description: { $regex: name, $options: 'i' } }
        ]
      };
      
      // Simple sort by name
      sort = { name: 1 };
    }

    if (category) {
      query.category = category;
    }

    // Use lean() for speed and maxTimeMS to avoid long-running queries
    const foods = await Food.find(query, projection)
      .sort(sort)
      .limit(parseInt(limit))
      .maxTimeMS(2000)
      .lean();
    
    // If searching by name, reorder results to prioritize exact matches
    if (name) {
      foods.sort((a, b) => {
        const aExact = a.name.toLowerCase() === name.toLowerCase();
        const bExact = b.name.toLowerCase() === name.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // If both are exact or both are not exact, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    }
    
    res.json(foods);
  } catch (err) {
    console.error('❌ Error fetching foods:', err.message);
    res.status(500).json({ message: 'Failed to fetch foods', error: err.message });
  }
});

// GET /api/foods/categories - Get all available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Food.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error('❌ Error fetching categories:', err.message);
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
});

// GET /api/foods/:id - Get a specific food by ID
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).lean();
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (err) {
    console.error('❌ Error fetching food:', err.message);
    res.status(500).json({ message: 'Failed to fetch food', error: err.message });
  }
});

module.exports = router;
