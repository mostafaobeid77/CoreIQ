require('dotenv').config();
const mongoose = require('mongoose');

async function countCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coreiq');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Count for 'protiens'
        const countTypo = await db.collection('foods').countDocuments({ category: 'protiens' });
        console.log(`Category 'protiens': ${countTypo}`);

        // Count for 'proteins' (correct spelling)
        const countCorrect = await db.collection('foods').countDocuments({ category: 'proteins' });
        console.log(`Category 'proteins': ${countCorrect}`);

        // Count for 'Proteins' (Title Case)
        const countTitle = await db.collection('foods').countDocuments({ category: 'Proteins' });
        console.log(`Category 'Proteins': ${countTitle}`);

        // Get all distinct categories with counts
        const pipeline = [
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ];
        const allCounts = await db.collection('foods').aggregate(pipeline).toArray();
        console.log('All Categories:', allCounts);

        process.exit(0);
    } catch (error) {
        console.error('Count failed:', error);
        process.exit(1);
    }
}

countCategories();
