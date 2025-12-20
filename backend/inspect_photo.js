const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findById('6920592eeb625eddf96a47099');
        if (user) {
            console.log('User found.');
            console.log('profilePhoto length:', user.profilePhoto ? user.profilePhoto.length : 'NULL/UNDEFINED');
            if (user.profilePhoto) {
                console.log('profilePhoto starts with:', user.profilePhoto.substring(0, 30));
            }
        } else {
            console.log('User NOT found with ID 6920592eeb625eddf96a47099');
        }
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
