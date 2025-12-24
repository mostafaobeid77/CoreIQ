const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Food = require('./models/Food');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testDrinks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Check if drinks exist in database
        const drinksCount = await Food.countDocuments({ category: 'drinks' });
        console.log(`📊 Total drinks in database: ${drinksCount}`);

        // Test 2: Check if Arabic drinks exist
        const arabicDrinks = await Food.find({
            category: 'drinks',
            $or: [
                { name: /arabic/i },
                { name: /turkish/i },
                { name: /ayran/i },
                { name: /jallab/i },
                { name: /tamar/i }
            ]
        }).select('name category mealTypes');

        console.log(`\n🌍 Arabic drinks found: ${arabicDrinks.length}`);
        arabicDrinks.forEach(drink => {
            console.log(`  - ${drink.name}`);
            console.log(`    MealTypes: ${drink.mealTypes.join(', ') || 'none'}`);
        });

        // Test 3: Check if mealTypes field exists on drinks
        const sampleDrinks = await Food.find({ category: 'drinks' }).limit(10).select('name mealTypes');
        console.log(`\n📝 Sample drinks with mealTypes:`);
        sampleDrinks.forEach(drink => {
            console.log(`  - ${drink.name}: [${drink.mealTypes.join(', ')}]`);
        });

        // Test 4: Check zero-calorie drinks for low-carb
        const zeroCal = await Food.find({
            category: 'drinks',
            'nutrients.calories': 0
        }).select('name nutrients.calories');
        console.log(`\n🥤 Zero-calorie drinks (for low-carb): ${zeroCal.length}`);
        console.log(`  Examples: ${zeroCal.slice(0, 5).map(d => d.name).join(', ')}`);

        await mongoose.connection.close();
        console.log('\n✅ Test complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testDrinks();
