const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ profilePhoto: { $exists: true, $ne: null } });
        if (user) {
            console.log('Found user with photo:', user._id);
        } else {
            const anyUser = await User.findOne();
            console.log('Any user ID:', anyUser ? anyUser._id : 'None');
        }
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
