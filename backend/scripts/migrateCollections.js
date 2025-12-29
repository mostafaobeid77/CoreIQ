/**
 * Migration Script - Fix existing collections
 * Run: node scripts/migrateCollections.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Update all workouts without a status field to 'official'
    const workoutResult = await db.collection('workouts').updateMany(
        { status: { $exists: false } },
        { $set: { status: 'official' } }
    );
    console.log(`Updated ${workoutResult.modifiedCount} workouts to 'official' status`);

    // Also update any with null status
    const workoutNullResult = await db.collection('workouts').updateMany(
        { status: null },
        { $set: { status: 'official' } }
    );
    console.log(`Updated ${workoutNullResult.modifiedCount} workouts with null status to 'official'`);

    // 2. Count collections
    const workoutCount = await db.collection('workouts').countDocuments();
    const foodCount = await db.collection('foods').countDocuments();
    console.log(`\nTotal workouts: ${workoutCount}`);
    console.log(`Total foods: ${foodCount}`);

    // 3. Sample a workout and food to verify structure
    const sampleWorkout = await db.collection('workouts').findOne();
    const sampleFood = await db.collection('foods').findOne();

    console.log('\nSample workout structure:');
    console.log(JSON.stringify(sampleWorkout, null, 2).slice(0, 500));

    console.log('\nSample food structure:');
    console.log(JSON.stringify(sampleFood, null, 2).slice(0, 500));

    await mongoose.disconnect();
    console.log('\n✅ Migration complete');
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
