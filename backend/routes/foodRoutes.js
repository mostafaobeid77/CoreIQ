const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// GET /api/foods - Get all foods with optional filtering
// Uses multi-tier relevance scoring: exact > prefix > contains > description
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

    if (name) {
      // Escape regex special characters to handle parentheses etc.
      const escapedName = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query = {
        $or: [
          { name: { $regex: escapedName, $options: 'i' } },
          { description: { $regex: escapedName, $options: 'i' } }
        ]
      };
    }

    if (category) {
      query.category = category;
    }

    // Use lean() for speed and maxTimeMS to avoid long-running queries
    const foods = await Food.find(query, projection)
      .limit(parseInt(limit) * 2) // Fetch extra to have room after scoring
      .maxTimeMS(2000)
      .lean();

    // Multi-tier relevance scoring
    if (name) {
      const searchLower = name.toLowerCase().trim();

      // Score each food based on match quality
      const scoredFoods = foods.map(food => {
        const nameLower = food.name.toLowerCase();
        const descLower = (food.description || '').toLowerCase();

        let score = 0;

        // Tier 1: Exact match (highest priority)
        if (nameLower === searchLower) {
          score = 1000;
        }
        // Tier 2: Name starts with search term (prefix match)
        else if (nameLower.startsWith(searchLower)) {
          score = 800;
        }
        // Tier 3: Word in name starts with search term
        else if (nameLower.split(/\s+/).some(word => word.startsWith(searchLower))) {
          score = 600;
        }
        // Tier 4: Name contains search term anywhere
        else if (nameLower.includes(searchLower)) {
          score = 400;
        }
        // Tier 5: Description contains search term
        else if (descLower.includes(searchLower)) {
          score = 200;
        }

        // Bonus: Shorter names are usually more relevant (e.g., "Eggs" vs "Scrambled Eggs with Cheese")
        // Add small bonus for shorter names to break ties
        score += Math.max(0, 50 - food.name.length);

        return { ...food, _score: score };
      });

      // Sort by score (highest first), then alphabetically for ties
      scoredFoods.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return a.name.localeCompare(b.name);
      });

      // Remove internal score field and limit results
      const result = scoredFoods.slice(0, parseInt(limit)).map(({ _score, ...food }) => food);
      return res.json(result);
    }

    // No search term - just return sorted by name
    foods.sort((a, b) => a.name.localeCompare(b.name));
    res.json(foods.slice(0, parseInt(limit)));
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
