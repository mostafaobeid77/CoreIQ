const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const Food = require('./models/Food');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Find all foods with "coffee" in name
        const coffees = await Food.find({ name: { $regex: 'coffee', $options: 'i' } });
        console.log(`Found ${coffees.length} coffee items:`);
        coffees.forEach(f => {
            console.log(`- Name: "${f.name}", Category: "${f.category}", MealTypes: ${JSON.stringify(f.mealTypes)}`);
        });

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
