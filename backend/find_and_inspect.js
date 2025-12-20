const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ profilePhoto: { $exists: true, $ne: null } });
        if (user) {
            console.log('User found:', user._id);
            console.log('profilePhoto defined:', !!user.profilePhoto);
            console.log('profilePhoto length:', user.profilePhoto ? user.profilePhoto.length : 0);
            if (user.profilePhoto) {
                console.log('profilePhoto starts with:', typeof user.profilePhoto === 'string' ? user.profilePhoto.substring(0, 50) : 'NOT A STRING');
            }
        } else {
            console.log('No user found with a profile photo.');
        }
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
