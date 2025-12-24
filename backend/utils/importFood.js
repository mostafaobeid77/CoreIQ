const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Food = require('../models/Food');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env file');
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

async function importData() {
  try {
    const dataDir = path.join(__dirname, '../data/food-data');
    const categoryFiles = [
      'fruits.json',
      'vegetables.json',
      'grains_carbs.json',
      'protiens.json',
      'salads.json',
      'fastfoods.json',
      'drinks.json'
    ];

    // Drop the entire collection to remove old indexes
    await Food.collection.drop();
    console.log('🗑️ Old food collection dropped');

    let totalImported = 0;

    for (const fileName of categoryFiles) {
      const filePath = path.join(dataDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${fileName}`);
        continue;
      }

      console.log(`📖 Reading ${fileName}...`);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const foodsData = JSON.parse(rawData);

      if (!Array.isArray(foodsData)) {
        console.warn(`⚠️ Invalid format in ${fileName}: expected array`);
        continue;
      }

      const formattedFoods = [];

      for (let i = 0; i < foodsData.length; i++) {
        const food = foodsData[i];
        try {
          if (!food.nutrients_per_100g) {
            console.error(`❌ Missing nutrients_per_100g in ${fileName} at index ${i}:`, food.name);
            continue;
          }

          formattedFoods.push({
            name: food.name,
            description: food.description,
            category: food.category,
            nutrients: {
              calories: food.nutrients_per_100g.calories,
              protein: food.nutrients_per_100g.protein,
              fat: food.nutrients_per_100g.fat,
              carbs: food.nutrients_per_100g.carbs,
            },
            servings: food.servings || [],
            mealTypes: food.mealTypes || [], // Add mealTypes field
          });
        } catch (err) {
          console.error(`❌ Error processing food at index ${i} in ${fileName}:`, food.name, err.message);
          continue;
        }
      }

      if (formattedFoods.length > 0) {
        await Food.insertMany(formattedFoods);
        console.log(`✅ Imported ${formattedFoods.length} foods from ${fileName}`);
        totalImported += formattedFoods.length;
      }
    }

    // Ensure text index is created
    console.log('🔍 Creating text index...');
    await Food.collection.createIndex({ name: 'text', description: 'text', category: 'text' });
    console.log('✅ Text index created');

    console.log(`🎉 Successfully imported ${totalImported} total foods`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing data:', err.message);
    process.exit(1);
  }
}

connectDB().then(importData);
