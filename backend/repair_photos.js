const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB.');

        // Find users where profilePhoto starts with http
        const usersWithUrls = await User.find({
            profilePhoto: { $regex: /^http/ }
        });

        console.log(`Found ${usersWithUrls.length} users with absolute URLs in profilePhoto.`);

        for (const user of usersWithUrls) {
            console.log(`Cleaning up user: ${user.username || user.email} (${user._id})`);
            user.profilePhoto = null;
            await user.save();
        }

        console.log('Cleanup complete.');
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error('Cleanup failed:', err);
        process.exit(1);
    });
