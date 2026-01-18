require('dotenv').config();
const mongoose = require('mongoose');

async function inspectCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coreiq');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const categories = await db.collection('foods').distinct('category');

        console.log('Distinct Categories:', categories);
        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

inspectCategories();
