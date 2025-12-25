const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const foodRoutes = require('./routes/foodRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const mealsRoutes = require('./routes/mealsRoutes');
const workoutEntryRoutes = require('./routes/workoutEntryRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const aiRoutes = require('./routes/aiRoutes');
const aiCoachRoutes = require('./routes/aiCoachRoutes');
const planRoutes = require('./routes/planRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminContentRoutes = require('./routes/adminContentRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const workoutTemplatesRoutes = require('./routes/workoutTemplates');
const mealTemplateRoutes = require('./routes/mealTemplateRoutes');
const adminRoutes = require('./routes/adminRoutes'); // TEMPORARY
const app = express();

// Configure CORS to allow mobile app connections
app.use(cors({
  origin: '*', // Allow ALL origins explicitly
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Simple ping endpoint to test connectivity
app.get('/api/ping', (req, res) => {
  console.log('Ping received!');
  res.json({
    message: 'pong',
    dbStatus: mongoose.connection.readyState,
    dbStatusText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  });
});

// Increase JSON body size limit for profile photos (base64 images can be large)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const compression = require('compression');
const responseTime = require('response-time');

// Enable Gzip compression
app.use(compression());

// Add X-Response-Time header
app.use(responseTime());

// Log all requests with timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealsRoutes); // Corrected from mealRoutes to mealsRoutes
app.use('/api/workouts', workoutRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/templates/workout', workoutTemplatesRoutes);
app.use('/api/templates/meal', mealTemplateRoutes);
app.use('/api/stats', statsRoutes); // Corrected from dailyStatsRoutes to statsRoutes
app.use('/api/ai', aiRoutes);
app.use('/api/ai', aiCoachRoutes); // AI Coach
app.use('/api/workout-entries', workoutEntryRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/workout-templates', workoutTemplatesRoutes);
app.use('/api/meal-templates', mealTemplateRoutes);
app.use('/api/admin', adminRoutes); // TEMPORARY - for food reimport

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 10000,
  bufferCommands: false, // Don't buffer if connection is down
  autoIndex: false // Don't build indexes in production for better performance
})
  .then(async () => {
    console.log('MongoDB connected');

    // START SERVER ONLY AFTER MONGO IS CONNECTED
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Network: http://0.0.0.0:${PORT}`);
    });

    // MongoDB Keep-Alive to prevent cold starts (Atlas Free Tier)
    setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          const pingStart = Date.now();
          await mongoose.connection.db.admin().command({ ping: 1 });
          console.log(`[Mongo KeepAlive] ping ok (${Date.now() - pingStart}ms)`);
        } catch (err) {
          console.error('[Mongo KeepAlive] ping failed:', err.message);
        }
      } else {
        console.log('[Mongo KeepAlive] skipped (not connected)');
      }
    }, 300000); // Run every 5 minutes

    // Force sync indexes to fix any discrepancies
    try {
      const User = require('./models/User');
      await User.syncIndexes();
      console.log('User indexes synced');
      const indexes = await User.collection.indexes();
      console.log('Current User Indexes:', JSON.stringify(indexes, null, 2));
    } catch (err) {
      console.error('Index sync error:', err);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

