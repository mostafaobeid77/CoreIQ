const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Workout = require('../models/Workout');

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
    const dataDir = path.join(__dirname, '../data/workouts-data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    // Drop the entire collection to remove old indexes
    await Workout.collection.drop().catch(() => {});
    console.log('🗑️ Old workout collection dropped');

    let totalImported = 0;

    for (const fileName of files) {
      const filePath = path.join(dataDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${fileName}`);
        continue;
      }

      console.log(`📖 Reading ${fileName}...`);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const workoutsData = JSON.parse(rawData);

      if (!Array.isArray(workoutsData)) {
        console.warn(`⚠️ Invalid format in ${fileName}: expected array`);
        continue;
      }

      const formattedWorkouts = [];
      for (let i = 0; i < workoutsData.length; i++) {
        const workout = workoutsData[i];
        try {
          formattedWorkouts.push({
            name: workout.name,
            description: workout.description,
            category: workout.category,
            muscle_group: workout.muscle_group,
            equipment: workout.equipment || '',
          });
        } catch (err) {
          console.error(`❌ Error processing workout at index ${i} in ${fileName}:`, workout.name, err.message);
          continue;
        }
      }

      if (formattedWorkouts.length > 0) {
        await Workout.insertMany(formattedWorkouts);
        console.log(`✅ Imported ${formattedWorkouts.length} workouts from ${fileName}`);
        totalImported += formattedWorkouts.length;
      }
    }

    // Ensure text index is created
    console.log('🔍 Creating text index...');
    await Workout.collection.createIndex({ name: 'text', description: 'text', category: 'text', muscle_group: 'text', equipment: 'text' });
    console.log('✅ Text index created');

    console.log(`🎉 Successfully imported ${totalImported} total workouts`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing data:', err.message);
    process.exit(1);
  }
}

connectDB().then(importData);
