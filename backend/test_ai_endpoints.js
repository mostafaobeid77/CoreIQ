// Test script for AI Plan Editor endpoints
// Run with: node test_ai_endpoints.js

const BASE_URL = 'http://localhost:5000/api';

// Sample test data
const testData = {
    currentDay: {
        day: 1,
        meals: {
            breakfast: [
                {
                    foodId: '507f1f77bcf86cd799439011',
                    name: 'Oatmeal',
                    quantity: 100,
                    calories: 389,
                    protein: 17,
                    carbs: 66,
                    fats: 7
                }
            ],
            lunch: [
                {
                    foodId: '507f1f77bcf86cd799439012',
                    name: 'Chicken Breast',
                    quantity: 150,
                    calories: 248,
                    protein: 47,
                    carbs: 0,
                    fats: 5
                }
            ],
            dinner: [],
            snacks: []
        },
        workouts: [
            {
                workoutId: '507f1f77bcf86cd799439013',
                name: 'Bench Press',
                type: 'Strength',
                sets: 3,
                reps: [10, 10, 10]
            }
        ]
    }
};

async function testEndpoints() {
    console.log('🧪 Testing AI Plan Editor Endpoints\n');

    // Test 1: Add protein to lunch
    console.log('Test 1: Add protein to lunch');
    try {
        const response = await fetch(`${BASE_URL}/ai/edit-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentDay: testData.currentDay,
                instruction: 'Add more protein to lunch',
                planContext: 'Day 1'
            })
        });
        const result = await response.json();
        console.log('✅ Success:', result.message);
        console.log('   Changes:', result.changes);
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }

    console.log('\n---\n');

    // Test 2: Swap chicken for salmon
    console.log('Test 2: Swap chicken for salmon');
    try {
        const response = await fetch(`${BASE_URL}/ai/edit-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentDay: testData.currentDay,
                instruction: 'Swap chicken breast for salmon',
                planContext: 'Day 1, Goal: Muscle Gain'
            })
        });
        const result = await response.json();
        console.log('✅ Success:', result.message);
        console.log('   Changes:', result.changes);
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }

    console.log('\n---\n');

    // Test 3: Remove breakfast
    console.log('Test 3: Remove breakfast');
    try {
        const response = await fetch(`${BASE_URL}/ai/edit-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentDay: testData.currentDay,
                instruction: 'Remove all breakfast items',
                planContext: 'Day 1'
            })
        });
        const result = await response.json();
        console.log('✅ Success:', result.message);
        console.log('   Changes:', result.changes);
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }

    console.log('\n---\n');

    // Test 4: Add workout
    console.log('Test 4: Add pull-ups workout');
    try {
        const response = await fetch(`${BASE_URL}/ai/edit-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentDay: testData.currentDay,
                instruction: 'Add pull-ups to my workout',
                planContext: 'Day 1'
            })
        });
        const result = await response.json();
        console.log('✅ Success:', result.message);
        console.log('   Changes:', result.changes);
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }

    console.log('\n✨ Testing complete!\n');
}

// Run tests (uncomment to use)
// testEndpoints();

console.log('📖 Test script loaded. To run, uncomment testEndpoints() at the bottom of this file.');
console.log('Or run individual tests by copying the fetch calls into your code.\n');
console.log('Available endpoints:');
console.log('  POST /api/ai/edit-plan - General AI editor');
console.log('  POST /api/ai/swap-food/suggest - Get food swap suggestion');
console.log('  POST /api/ai/swap-food/apply - Apply food swap');
console.log('  POST /api/ai/swap-workout/suggest - Get workout swap suggestion');
console.log('  POST /api/ai/swap-workout/apply - Apply workout swap');
