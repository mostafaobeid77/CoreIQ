require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware - CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',      // Vite dev server
        'http://localhost:3000',      // Alternative dev port
        'https://coreiq.netlify.app', // Production Netlify
        'https://coreiq-admin.netlify.app', // Admin Netlify (if separate)
        /\.netlify\.app$/,            // Any Netlify subdomain
        /\.onrender\.com$/            // Any Render subdomain
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};
app.use(cors(corsOptions));
const compression = require('compression');
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/coreiq')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Test each route one by one
console.log('Testing route imports...');

try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ authRoutes loaded');
} catch (e) { console.error('❌ authRoutes:', e.message); }

try {
    const userRoutes = require('./routes/userRoutes');
    app.use('/api/users', userRoutes);
    console.log('✅ userRoutes loaded');
} catch (e) { console.error('❌ userRoutes:', e.message); }

try {
    const statsRoutes = require('./routes/statsRoutes');
    app.use('/api/stats', statsRoutes);
    console.log('✅ statsRoutes loaded');
} catch (e) { console.error('❌ statsRoutes:', e.message); }

try {
    const mealsRoutes = require('./routes/mealsRoutes');
    app.use('/api/meals', mealsRoutes);
    console.log('✅ mealsRoutes loaded');
} catch (e) { console.error('❌ mealsRoutes:', e.message); }

try {
    const mealTemplateRoutes = require('./routes/mealTemplateRoutes');
    app.use('/api/meal-templates', mealTemplateRoutes);
    console.log('✅ mealTemplateRoutes loaded');
} catch (e) { console.error('❌ mealTemplateRoutes:', e.message); }

try {
    const planRoutes = require('./routes/planRoutes');
    app.use('/api/plans', planRoutes);
    console.log('✅ planRoutes loaded');
} catch (e) { console.error('❌ planRoutes:', e.message); }

try {
    const workoutEntryRoutes = require('./routes/workoutEntryRoutes');
    app.use('/api/workout-entries', workoutEntryRoutes);
    console.log('✅ workoutEntryRoutes loaded');
} catch (e) { console.error('❌ workoutEntryRoutes:', e.message); }

try {
    const aiRoutes = require('./routes/aiRoutes');
    app.use('/api/ai', aiRoutes);
    console.log('✅ aiRoutes loaded');
} catch (e) { console.error('❌ aiRoutes:', e.message); }

try {
    const workoutTemplates = require('./routes/workoutTemplates');
    app.use('/api/workout-templates', workoutTemplates);
    console.log('✅ workoutTemplates loaded');
} catch (e) { console.error('❌ workoutTemplates:', e.message); }

try {
    const foodRoutes = require('./routes/foodRoutes');
    app.use('/api/foods', foodRoutes);
    console.log('✅ foodRoutes loaded');
} catch (e) { console.error('❌ foodRoutes:', e.message); }

try {
    const workoutRoutes = require('./routes/workoutRoutes');
    app.use('/api/workouts', workoutRoutes);
    console.log('✅ workoutRoutes loaded');
} catch (e) { console.error('❌ workoutRoutes:', e.message); }

try {
    const adminAuthRoutes = require('./routes/adminAuthRoutes');
    app.use('/api/admin/auth', adminAuthRoutes);
    console.log('✅ adminAuthRoutes loaded');
} catch (e) { console.error('❌ adminAuthRoutes:', e.message); }

try {
    const adminStatsRoutes = require('./routes/adminStatsRoutes');
    app.use('/api/admin/stats', adminStatsRoutes);
    console.log('✅ adminStatsRoutes loaded');
} catch (e) { console.error('❌ adminStatsRoutes:', e.message); }

try {
    const { requireAdmin } = require('./middleware/adminMiddleware');
    const adminContentRoutes = require('./routes/adminContentRoutes');
    app.use('/api/admin/content', requireAdmin, adminContentRoutes);
    console.log('✅ adminContentRoutes loaded');
} catch (e) { console.error('❌ adminContentRoutes:', e.message); }

try {
    const { requireAdmin } = require('./middleware/adminMiddleware');
    const adminUserRoutes = require('./routes/adminUserRoutes');
    app.use('/api/admin/users', requireAdmin, adminUserRoutes);
    console.log('✅ adminUserRoutes loaded');
} catch (e) { console.error('❌ adminUserRoutes:', e.message); }

// Basic route
app.get('/', (req, res) => {
    res.send('CoreIQ Backend API Running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
