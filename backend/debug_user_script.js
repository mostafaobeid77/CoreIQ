const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ profilePhoto: { $exists: true, $ne: null } });
        if (user) {
            const debugData = {
                id: user._id,
                idString: user._id.toString(),
                idLength: user._id.toString().length,
                photoDefined: !!user.profilePhoto,
                photoType: typeof user.profilePhoto,
                photoLength: user.profilePhoto ? user.profilePhoto.length : 0,
                photoStart: user.profilePhoto ? user.profilePhoto.substring(0, 100) : ''
            };
            fs.writeFileSync('debug_user.json', JSON.stringify(debugData, null, 2));
            console.log('Debug data written to debug_user.json');
        } else {
            console.log('No user found.');
        }
        await mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
