const fs = require('fs');
const path = require('path');
const Food = require('../models/Food');
const Workout = require('../models/Workout');

async function seedFoods() {
  const count = await Food.countDocuments();
  if (count > 0) {
    console.log('Foods collection already seeded:', count, 'items');
    return;
  }

  const dataDir = path.join(__dirname, '..', 'data', 'food-data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  let total = 0;
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const items = JSON.parse(raw);
      const docs = items.map(i => {
        const servings = (i.servings || []).map(s => ({
          size: s.size || s.label || 'serving',
          calories: s.calories || 0,
          protein: s.protein || 0,
          fat: s.fat || s.fats || 0,
          carbs: s.carbs || 0,
          grams: s.grams || undefined,
        }));

        return {
          name: i.name,
          description: i.description || i.name,
          category: i.category || file.replace('.json',''),
          nutrients: {
            calories: (i.nutrients_per_100g && i.nutrients_per_100g.calories) || (i.nutrients && i.nutrients.calories) || 0,
            protein: (i.nutrients_per_100g && i.nutrients_per_100g.protein) || (i.nutrients && i.nutrients.protein) || 0,
            fat: (i.nutrients_per_100g && i.nutrients_per_100g.fat) || (i.nutrients && i.nutrients.fat) || 0,
            carbs: (i.nutrients_per_100g && i.nutrients_per_100g.carbs) || (i.nutrients && i.nutrients.carbs) || 0,
          },
          servings,
          mealTypes: i.mealTypes || [],
        };
      });

      if (docs.length) {
        await Food.insertMany(docs);
        total += docs.length;
        console.log(`Seeded ${docs.length} foods from ${file}`);
      }
    } catch (err) {
      console.error('Failed to seed file', file, err.message);
    }
  }
  console.log('Food seeding complete. Total inserted:', total);
}

async function seedWorkouts() {
  const count = await Workout.countDocuments();
  if (count > 0) {
    console.log('Workouts collection already seeded:', count, 'items');
    return;
  }

  const dataDir = path.join(__dirname, '..', 'data', 'workouts-data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  let total = 0;
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const items = JSON.parse(raw);
      const docs = items.map(i => ({
        name: i.name,
        description: i.description || i.name,
        category: i.category || file.replace('.json',''),
        muscle_group: i.muscle_group || i.muscle || 'General',
        equipment: i.equipment || 'Bodyweight',
        status: i.status || 'official'
      }));

      if (docs.length) {
        await Workout.insertMany(docs);
        total += docs.length;
        console.log(`Seeded ${docs.length} workouts from ${file}`);
      }
    } catch (err) {
      console.error('Failed to seed workouts file', file, err.message);
    }
  }
  console.log('Workout seeding complete. Total inserted:', total);
}

async function seedAll() {
  try {
    await seedFoods();
    await seedWorkouts();
  } catch (err) {
    console.error('Seeding failed:', err.message);
  }
}

module.exports = { seedAll };
