require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const db = mongoose.connection.db;

    // Count workouts by status
    const byStatus = await db.collection('workouts').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    console.log('By status:', byStatus);

    // Count workouts by muscle_group (for status=official or no status)
    const byMuscle = await db.collection('workouts').aggregate([
        { $match: { $or: [{ status: 'official' }, { status: null }, { status: { $exists: false } }] } },
        { $group: { _id: '$muscle_group', count: { $sum: 1 } } }
    ]).toArray();
    console.log('By muscle (official):', byMuscle);

    await mongoose.disconnect();
}

check();
