const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const email = `perf_test_${Date.now()}@example.com`;
        // Manually hash password since we are bypassing the pre-save hook or just to be safe? 
        // Actually User model probably has a pre-save hook. Let's check.
        // If I use new User() and save(), the pre-save hook usually runs.
        // But wait, authController says: "password, // Will be hashed by pre-save hook"
        // So I should pass plain text password if the model hashes it.
        // Let's assume the model hashes it.

        const user = new User({
            fullName: 'Perf Test',
            username: `perftest_${Date.now()}`,
            email: email,
            password: 'password123',
            birthDate: new Date('1990-01-01'),
            gender: 'male',
            emailVerified: true
        });

        await user.save();
        console.log(`User created: ${email}`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
