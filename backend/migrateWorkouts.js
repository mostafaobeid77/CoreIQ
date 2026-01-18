require('dotenv').config();
const mongoose = require('mongoose');
const Workout = require('./models/Workout');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coreiq');
        console.log('Connected to MongoDB');

        const result = await Workout.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'official' } }
        );

        console.log(`Updated ${result.modifiedCount} workouts to 'official' status.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
