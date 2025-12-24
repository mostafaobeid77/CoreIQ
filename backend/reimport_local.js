const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const importFood = require('./utils/importFood');

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected. Starting re-import...');

        await importFood();

        console.log('Re-import complete checking for Coffee...');
        const Food = require('./models/Food');
        const coffee = await Food.findOne({ name: 'Coffee (Black, Brewed)' });
        if (coffee) {
            console.log('✅ Coffee found in DB:', coffee.name, coffee.category, coffee.mealTypes);
        } else {
            console.error('❌ Coffee NOT found in DB after import!');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
