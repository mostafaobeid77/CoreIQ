const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Food = require('./models/Food');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const count = await Food.countDocuments({ category: 'drinks' });
        console.log(`Straight count 'drinks': ${count}`);

        const drinks = await Food.find({
            $or: [
                { category: 'drinks' },
                { name: { $regex: 'coffee', $options: 'i' } }
            ]
        }).select('name category');

        console.log(`Found ${drinks.length} items (drinks OR *coffee*):`);
        drinks.forEach(d => console.log(`[${d.category}] ${d.name}`));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
check();
