require('dotenv').config();
const mongoose = require('mongoose');
const DailyStats = require('./models/DailyStats');

async function checkSteps() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all DailyStats for user with email mrkabalan04@gmail.com
        const User = require('./models/User');
        const user = await User.findOne({ email: 'mrkabalan04@gmail.com' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User ID:', user._id);
        console.log('Account created:', user.createdAt);

        // Get last 7 days of stats
        const stats = await DailyStats.find({
            userId: user._id
        }).sort({ date: -1 }).limit(7);

        console.log('\n📊 Daily Stats (last 7 days):');
        stats.forEach(stat => {
            console.log(`Date: ${stat.date.toISOString().split('T')[0]}`);
            console.log(`  Walking: ${stat.walking || 0} steps`);
            console.log(`  Water: ${stat.water || 0}ml`);
            console.log(`  Sleep: ${stat.sleep || 0}h`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSteps();
