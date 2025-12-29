require('dotenv').config();
const mongoose = require('mongoose');

async function updateEmail() {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const db = mongoose.connection.db;
    await db.collection('admins').updateOne(
        { username: 'superadmin' },
        { $set: { email: 'superadmin@coreiq.com' } }
    );
    console.log('✅ Updated email to superadmin@coreiq.com');
    await mongoose.disconnect();
}

updateEmail().catch(console.error);
