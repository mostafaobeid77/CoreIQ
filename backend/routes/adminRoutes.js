const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const fs = require('fs');
const path = require('path');

// TEMPORARY ADMIN ENDPOINT - Remove after import complete
router.post('/reimport-foods', async (req, res) => {
    try {
        console.log('🔄 Starting food reimport...');

        // Get all JSON files
        const dataDir = path.join(__dirname, '../data/food-data');
        const files = [
            'drinks.json',
            'protiens.json',
            'grains_carbs.json',
            'fruits.json',
            'vegetables.json',
            'salads.json',
            'fastfoods.json'
        ];

        let totalImported = 0;

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            if (!fs.existsSync(filePath)) continue;

            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            console.log(`📖 Processing ${file}: ${data.length} items`);

            for (const item of data) {
                const foodDoc = {
                    name: item.name,
                    description: item.description,
                    category: item.category,
                    cal: item.nutrients_per_100g.calories,
                    p: item.nutrients_per_100g.protein,
                    c: item.nutrients_per_100g.carbs,
                    f: item.nutrients_per_100g.fat,
                    servings: item.servings || [],
                    baseQuantity: item.baseQuantity || 100,
                    mealTypes: item.mealTypes || [] // NEW FIELD
                };

                await Food.findOneAndUpdate(
                    { name: item.name, category: item.category },
                    foodDoc,
                    { upsert: true, new: true }
                );
                totalImported++;
            }
        }

        console.log(`✅ Reimport complete! Total: ${totalImported} foods`);

        // Count drinks with mealTypes
        const drinksWithMealTypes = await Food.countDocuments({
            category: 'drinks',
            mealTypes: { $exists: true, $ne: [] }
        });

        res.json({
            success: true,
            message: 'Food data reimported successfully',
            totalImported,
            drinksWithMealTypes
        });

    } catch (error) {
        console.error('❌ Reimport error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
