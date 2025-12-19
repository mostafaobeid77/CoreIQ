# CoreIQ - Health & Fitness Tracking App

A comprehensive health and fitness tracking mobile application built with React Native (Expo) for the frontend and Node.js/Express with MongoDB for the backend.

## 📱 Features

- **Daily Health Tracking**: Water intake, sleep, mental health, weight, height, activity level
- **Meal Planning**: Track meals, calculate nutrition, manage favorites
- **Workout Tracking**: Strength and cardio workouts with progress tracking
- **14-Day Plans**: Unified meal and workout plans with AI generation
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
├── mobile/                # React Native frontend
│   ├── app/              # Expo Router screens
│   ├── components/       # Reusable components
│   ├── context/          # React Context providers
│   ├── services/         # API service layer
│   └── screens/          # Screen components
└── docs/                 # Documentation files
```

## 🗄️ Database

**12 MongoDB Collections:**
- `users` - User accounts and authentication
- `userPreferences` - User settings and preferences
- `dailyStats` - Daily health metrics tracking
- `meals` - Daily meal items with nutrition
- `workoutEntries` - Daily workout sessions
- `foodFavorites` - User's favorite foods
- `aiConversations` - AI chat conversations
- `passwordResetTokens` - Password reset tokens
- `plans` - 14-day unified meal and workout plans
- `foods` - Food database/templates
- `workouts` - Workout database/templates

**For complete schema details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### Plans (14-Day Plans)
- `GET /api/plans` - Get all user's plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans` - Create new plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan
- `POST /api/plans/:id/activate` - Activate plan
- `GET /api/plans/:id/progress` - Get plan progress

### AI Features
- `GET /api/ai/conversations` - Get all conversations
- `POST /api/ai/conversations` - Create conversation
- `POST /api/ai/:conversationId/generate-plan` - AI generate plan
- `PUT /api/ai/:conversationId/modify-plan/:planId` - AI modify plan

**For complete API documentation, see [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)**

## 🎯 Current Status

### Backend: ✅ 100% Complete
- All models created
- All controllers implemented
- All routes configured
- Authentication system
- Plan management system
- AI plan generation

### Frontend: ⏳ 85% Complete
- Service layer created
- Login/Register integrated
- Remaining screens need backend sync
- Contexts need backend integration
- Plan UI needs implementation

**See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed status**

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

### Frontend
- React Native with Expo
- Expo Router
- React Context API
- TypeScript
- Ionicons

## 📝 Development

### Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coreiq
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
```

### Running Tests
```bash
# Backend tests (TODO)
cd backend
npm test

# Frontend tests (TODO)
cd mobile
npm test
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

[Add your license here]

---

**Need help?** Check the documentation files or refer to [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed information.



CoreIQ is an AI-driven fitness and nutrition ecosystem built as a full-stack product suite. The React marketing site delivers a polished brand presence with animated hero elements, responsive navigation that adapts to the underlying section, a refined footer, and download CTAs that highlight the iOS and Android apps. The same web stack hosts a rich admin console that uses React Router to provide multiple views: an overview with visual KPIs, a workouts console where categories and primary muscle groups are pulled live from the backend so administrators can publish new programmes with trustworthy metadata, and a meals console tailored to the canonical food categories stored in the database—drinks, fast foods, fruits, grains and carbs, proteins, salads, and vegetables—while capturing nutrients per 100 grams and optional serving shortcuts for accurate tracking. The admin experience also includes a user-management hub that surfaces recent registrations, supports search, and notifies operators when new athletes join, plus a system tab that summarizes infrastructure health and compliance workspaces. Underpinning the interface is a Node.js and Express API connected to MongoDB; it exposes endpoints for workouts, foods, user accounts, and dedicated admin routes for both authentication and content creation. Mongoose models handle hashed credentials, nutrient schemas, workout metadata, and admin authorizations, while utility scripts manage bulk data ingestion for workouts and ingredient libraries. A React Native mobile client is present in the repo as well, mirroring CoreIQ’s coaching features on handheld devices. Altogether, the project is structured as a coordinated platform where marketing, operational control, and data services integrate to deliver an intelligent coaching experience with rigorous admin oversight and extensible data models.