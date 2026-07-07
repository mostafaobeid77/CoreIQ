// controllers/foodController.js
const Food = require('../models/Food');
const FoodFavorite = require('../models/FoodFavorite');
const Meal = require('../models/Meal');

// Get smart suggestions (Favorites + Recent)
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.userId; // Provided by auth middleware

    // Parallel fetch for performance
    const [favorites, recentMeals] = await Promise.all([
      FoodFavorite.find({ userId })
        .populate('foodId')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
      Meal.find({ userId })
        .sort({ date: -1 }) // Newest first
        .limit(50) // Look at last 50 meals
        .populate('foodId')
        .lean()
    ]);

    // Process Favorites
    const favoriteFoods = favorites
      .map(f => f.foodId)
      .filter(f => f); // Filter nulls if food was deleted

    // Process Recent (Deduplicate)
    const recentFoodIds = new Set();
    const recentFoods = [];

    for (const meal of recentMeals) {
      if (meal.foodId && !recentFoodIds.has(meal.foodId._id.toString())) {
        recentFoodIds.add(meal.foodId._id.toString());
        recentFoods.push(meal.foodId);
        if (recentFoods.length >= 10) break; // Limit recent suggestions to 10 unique items
      }
    }

    res.json({
      favorites: favoriteFoods,
      recent: recentFoods
    });
  } catch (error) {
    console.error('Suggestions Error:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
};

// Get all foods OR search by name
exports.getFoods = async (req, res) => {
  try {
    const { name, search } = req.query;
    const searchTerm = name || search;
    let query = {};

    if (searchTerm) {
      // Create regex for "starts with" and "contains"
      // Escape special characters to be safe
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const startRegex = new RegExp(`^${escapedTerm}`, 'i');
      const containRegex = new RegExp(escapedTerm, 'i');

      query = {
        name: { $regex: containRegex }
      };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Fetch all matching documents (limit is applied in memory for sorting, which is okay for this dataset size, 
    // or we can use aggregation for better performance on large datasets. 
    // For now, standard find + sort is safest, but Mongo sort by relevance with regex is tricky without aggregation.
    // Given the request for specific priority: Exact -> StartsWith -> Contains.

    // Let's use aggregation to score and sort
    if (searchTerm) {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const pipeline = [
        {
          $match: {
            $or: [
              { name: { $regex: new RegExp(escapedTerm, 'i') } },
              { $text: { $search: searchTerm } } // Keep text search to catch synonyms if needed, or strictly regex
            ]
          }
        },
        {
          $addFields: {
            priority: {
              $switch: {
                branches: [
                  // Priority 1: Exact Match (Case insensitive)
                  { case: { $regexMatch: { input: "$name", regex: new RegExp(`^${escapedTerm}$`, 'i') } }, then: 1 },
                  // Priority 2: Starts With
                  { case: { $regexMatch: { input: "$name", regex: new RegExp(`^${escapedTerm}`, 'i') } }, then: 2 },
                ],
                default: 3 // Contains
              }
            },
            // Secondary sort: Shortest length (usually more relevant)
            nameLength: { $strLenCP: "$name" }
          }
        },
        { $sort: { priority: 1, nameLength: 1, name: 1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      // Total count for pagination
      const countPipeline = [
        {
          $match: {
            $or: [
              { name: { $regex: new RegExp(escapedTerm, 'i') } },
              { $text: { $search: searchTerm } }
            ]
          }
        },
        { $count: "total" }
      ];

      const [results, countResult] = await Promise.all([
        Food.aggregate(pipeline),
        Food.aggregate(countPipeline)
      ]);

      const total = countResult.length > 0 ? countResult[0].total : 0;

      return res.json({
        data: results,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    }

    // Default projection and sort for food list
    const projection = {
      name: 1,
      brand: 1,
      calories: 1,
      protein: 1,
      carbs: 1,
      fats: 1,
      servingSize: 1,
      servings: 1,
      _id: 1,
    };
    const sort = { name: 1 };

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
