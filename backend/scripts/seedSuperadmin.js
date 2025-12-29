/**
 * One-time seed script - DELETE AFTER RUNNING
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seed() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    const exists = await Admin.findOne({ role: 'superadmin' });
    if (exists) {
        console.log('Superadmin already exists');
        await mongoose.disconnect();
        return;
    }

    await Admin.create({
        email: 'superadmin@coreiq.io',
        username: 'superadmin',
        password: 'admin123', // Change this in dashboard after login!
        role: 'superadmin',
        isActive: true
    });

    console.log('✅ Superadmin created! Login with superadmin@coreiq.io / admin123');
    console.log('⚠️  CHANGE PASSWORD IN DASHBOARD IMMEDIATELY');
    console.log('🗑️  DELETE THIS FILE NOW');
    await mongoose.disconnect();
}

seed().catch(console.error);
