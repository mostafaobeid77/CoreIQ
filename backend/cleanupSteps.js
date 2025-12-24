require('dotenv').config();
const mongoose = require('mongoose');
const DailyStats = require('./models/DailyStats');

async function cleanupSteps() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');
        const user = await User.findOne({ email: 'mrkabalan04@gmail.com' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('Resetting incorrect step counts to 0...\n');

        // Reset steps for Dec 17-22 (all have incorrect 1614 steps)
        const result = await DailyStats.updateMany(
            {
                userId: user._id,
                date: {
                    $gte: new Date('2025-12-17'),
                    $lt: new Date('2025-12-23')
                }
            },
            { $set: { walking: 0 } }
        );

        console.log(`✅ Reset ${result.modifiedCount} days to 0 steps`);
        console.log('Note: Today (Dec 23) was not changed - it will auto-sync from your device.');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

cleanupSteps();
