# CoreIQ - Health & Fitness Tracking App

A comprehensive health and fitness tracking mobile application built with React Native (Expo) for the frontend and Node.js/Express with MongoDB for the backend.

## 📱 Features

- **Daily Health Tracking**: Water intake, sleep, mental health, weight, height, activity level
- **Meal Planning**: Track meals, calculate nutrition, manage favorites
- **Workout Tracking**: Strength and cardio workouts with progress tracking
- **Flexible Plans**: 14-90 day meal and workout plans with AI generation
- **Smart Analysis**: Weekly progress reports with calorie verdicts and weight projections
- **AI Assistant**: Chat-based health and fitness guidance
- **User Authentication**: Secure registration, login, and password reset
- **Preferences**: Theme (light/dark), units (metric/imperial), notifications

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your MongoDB connection
npm run dev
```

**See `README_BACKEND_SETUP.md` for detailed setup instructions**

### Frontend Setup

```bash
cd mobile
npm install
npx expo start
```

## 📚 Documentation

### Essential Documentation
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete database schema, collections, relationships, and queries
- **[PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)** - Frontend architecture, screens, contexts, and data flow
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Comprehensive implementation guide, status, and next steps
- **[README_BACKEND_SETUP.md](./README_BACKEND_SETUP.md)** - Backend setup and configuration guide
- **[backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)** - Complete API endpoint documentation

## 🏗️ Project Structure

```
CoreIQ/
├── backend/              # Node.js/Express backend
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   └── server.js         # Express server
├── mobile/               # React Native frontend
│   ├── app/              # Expo Router screens
│   ├── components/       # Reusable components
│   ├── context/          # React Context providers
│   ├── services/         # API service layer
│   └── screens/          # Screen components
├── web/                  # React web admin panel
│   ├── src/pages/        # Admin dashboard & login
│   └── src/components/   # Web components
└── docs/                 # Documentation files
```

## 🗄️ Database

**15 MongoDB Collections:**
- `users` - User accounts and authentication
- `userPreferences` - User settings and preferences
- `dailyStats` - Daily health metrics tracking
- `meals` - Daily meal items with nutrition
- `workoutEntries` - Daily workout sessions
- `foodFavorites` - User's favorite foods
- `aiConversations` - AI chat conversations
- `passwordResetTokens` - Password reset tokens
- `plans` - Unified meal and workout plans
- `foods` - Food database/templates
- `workouts` - Workout database/templates
- `admins` - Admin user accounts
- `foodSubmissions` - User food submissions
- `workoutSubmissions` - User workout submissions
- `emailVerificationTokens` - Email verification

**For complete schema details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Plans
- `GET /api/plans` - Get all user's plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans` - Create new plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan
- `POST /api/plans/:id/activate` - Activate plan

### AI Features
- `GET /api/ai/conversations` - Get all conversations
- `POST /api/ai/conversations` - Create conversation
- `POST /api/ai/:conversationId/generate-plan` - AI generate plan

### Stats & Analysis
- `GET /api/stats/:date` - Get daily stats
- `PATCH /api/stats/:date` - Update daily stats
- `GET /api/stats/progress-report` - Get Smart Analysis weekly report

**For complete API documentation, see [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)**

## 🎯 Current Status

### Backend: ✅ 100% Complete
- All models created
- All controllers implemented
- All routes configured
- Authentication system
- Plan management system
- AI plan generation (Groq)

### Frontend: ✅ 100% Complete
- All screens implemented
- Service layer created
- Login/Register/Password Reset integrated
- Dashboard with daily tracking
- Meals and Workout tracking
- AI-powered Plans generation
- Smart Analysis weekly reports
- Settings with theme and unit preferences

### Web Admin: ✅ 100% Complete
- Admin authentication
- Dashboard with overview
- Workouts management
- Meals management
- User management

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected routes with middleware
- ✅ Input validation
- ✅ Secure error handling

## 🛠️ Technology Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT authentication
- bcrypt for password hashing
- Groq AI for plan generation

### Frontend
- React Native with Expo
- Expo Router
- React Context API
- TypeScript
- Ionicons

### Web Admin
- React with TypeScript
- React Router
- Tailwind CSS

## 📝 Development

### Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coreiq
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
GROQ_API_KEY=your_groq_key
```

## 📖 Learn More

- [Database Schema](./DATABASE_SCHEMA.md) - Complete database documentation
- [Project Analysis](./PROJECT_ANALYSIS.md) - Frontend architecture details
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Implementation status and next steps
- [Backend Setup](./README_BACKEND_SETUP.md) - Detailed setup instructions
- [API Documentation](./backend/API_DOCUMENTATION.md) - Complete API reference

## 🤝 Contributing

1. Read the [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
2. Follow the existing code structure
3. Update documentation as needed
4. Test your changes

## 📄 License

MIT License

---

**Need help?** Check the documentation files or refer to [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed information.