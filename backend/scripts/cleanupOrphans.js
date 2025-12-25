const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Meal = require('../models/Meal');
const WorkoutEntry = require('../models/WorkoutEntry');
const Plan = require('../models/Plan');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const cleanup = async () => {
    await connectDB();

    try {
        console.log('Starting cleanup of orphaned entries...');

        // 1. Get all unique User IDs currently in Meals
        const userIds = await Meal.distinct('userId');
        console.log('User IDs found in DB:', userIds);

        if (userIds.length === 0) {
            console.log('No meals found in DB.');
            process.exit(0);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log(`Clearing future meals from ${today.toISOString()} onwards...`);

        const mealResult = await Meal.deleteMany({
            date: { $gte: today }
        });
        console.log(`Deleted ${mealResult.deletedCount} meals`);

        const workoutResult = await WorkoutEntry.deleteMany({
            date: { $gte: today }
        });
        console.log(`Deleted ${workoutResult.deletedCount} workouts`);

        console.log('Cleanup complete');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup error:', error);
        process.exit(1);
    }
};

cleanup();
