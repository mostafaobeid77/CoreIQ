const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path if needed
const UserPreferences = require('../models/UserPreferences');
require('dotenv').config();

// Native Fetch for Node 18+
const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function testSuggestions() {
    console.log('🧪 Testing Food Suggestions API (Hybrid Mongoose/HTTP)...');

    // 1. Connect to DB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/coreiq');
    console.log('✅ Connected');

    try {
        // 2. Create Verified User directly
        console.log(`👤 Creating verified user ${TEST_EMAIL}...`);
        // Note: We normally hash passwords but for this test we'll rely on the model pre-save hook 
        // IF the model has one. Assuming User.js has pre-save hashing.
        // If not, we might need to hash it manually or use the register endpoint.
        // Let's use the register endpoint to be safe about hashing, then update verification status.

        // 2a. Register via HTTP (to ensure correct password hashing/creation logic)
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                username: `user_${Date.now()}`,
                fullName: 'Test User',
                gender: 'male',
                birthDate: '1990-01-01',
                weight: 70,
                height: 175
            })
        });

        if (!registerRes.ok) {
            const err = await registerRes.text();
            throw new Error(`Registration failed: ${err}`);
        }
        console.log('✅ Registered via HTTP');

        // 2b. Force Verify Email
        await User.findOneAndUpdate({ email: TEST_EMAIL }, { emailVerified: true });
        console.log('✅ Force-verified email via Mongoose');

        // 3. Login
        console.log('🔑 Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Login failed: ${err}`);
        }
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful, token received');

        // 4. Test Suggestions
        console.log('📡 Fetching suggestions...');
        const suggestionsRes = await fetch(`${API_URL}/foods/suggestions`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!suggestionsRes.ok) throw new Error(`Fetch failed: ${suggestionsRes.statusText}`);
        const data = await suggestionsRes.json();

        console.log('\n📦 Suggestions Response:');
        console.log('Favorites Count:', data.favorites?.length || 0);
        console.log('Recent Count:', data.recent?.length || 0);

        if (Array.isArray(data.favorites) && Array.isArray(data.recent)) {
            console.log('\n✅ Test PASSED: Response structure is correct');
        } else {
            console.error('\n❌ Test FAILED: Response structure is incorrect');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    } finally {
        // Cleanup
        if (TEST_EMAIL.includes('testuser_')) {
            await User.deleteOne({ email: TEST_EMAIL });
            console.log('🧹 Cleaned up test user');
        }
        await mongoose.disconnect();
    }
}

testSuggestions();
