const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected');

        console.log('Checking for duplicate emails...');
        const emailDuplicates = await User.aggregate([
            {
                $group: {
                    _id: { $toLower: "$email" },
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (emailDuplicates.length > 0) {
            console.log('Found duplicate emails:', JSON.stringify(emailDuplicates, null, 2));
        } else {
            console.log('No duplicate emails found.');
        }

        console.log('Checking for duplicate usernames...');
        const usernameDuplicates = await User.aggregate([
            {
                $group: {
                    _id: "$username",
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (usernameDuplicates.length > 0) {
            console.log('Found duplicate usernames:', JSON.stringify(usernameDuplicates, null, 2));
        } else {
            console.log('No duplicate usernames found.');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
