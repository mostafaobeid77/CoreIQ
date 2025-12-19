# CoreIQ Implementation Guide

## 📚 Documentation Overview

This guide consolidates all implementation documentation for the CoreIQ health and fitness tracking application.

**Essential Documentation:**
- `DATABASE_SCHEMA.md` - Complete database schema and relationships
- `PROJECT_ANALYSIS.md` - Frontend architecture and features analysis
- `README_BACKEND_SETUP.md` - Backend setup and quick start guide
- `backend/API_DOCUMENTATION.md` - Complete API endpoint documentation

---

## 🎯 Project Status

### Backend (100% Complete)
✅ **Authentication System**
- User registration with validation
- Login with JWT tokens
- Password reset flow (forgot → verify code → reset)
- Token-based authentication middleware
- Password hashing with bcrypt

✅ **API Endpoints (40+ endpoints)**
- `/api/auth/*` - 6 authentication endpoints
- `/api/users/*` - 3 user profile endpoints
- `/api/stats/*` - 4 daily stats endpoints
- `/api/meals/*` - 6 meal tracking endpoints
- `/api/workout-entries/*` - 4 workout endpoints
- `/api/preferences/*` - 2 preference endpoints
- `/api/favorites/*` - 3 favorites endpoints
- `/api/ai/*` - 6 AI conversation endpoints
- `/api/plans/*` - 7 plan management endpoints
- `/api/foods/*` - 3 existing food endpoints
- `/api/workouts/*` - 2 existing workout endpoints

✅ **Database Models (12 collections)**
- User, UserPreferences, DailyStats
- Meal, WorkoutEntry, FoodFavorite
- AIConversation, PasswordResetToken
- Plan (14-day unified plans)
- Food, Workout (already existed)

### Frontend (85% Complete)
✅ **Service Layer Created**
- `api.ts` - Base API service with token management
- `authService.ts` - Authentication methods
- `statsService.ts` - Stats operations
- `mealsService.ts` - Meal operations
- `workoutsService.ts` - Workout operations
- `preferencesService.ts` - Preferences operations
- `favoritesService.ts` - Favorites operations

✅ **Screens Updated**
- LoginScreen - Connected to backend API
- RegisterScreen - Connected to backend API

⏳ **Still To Update:**
- ForgotPasswordScreen, ConfirmCodeScreen, ResetPasswordScreen
- DashboardScreen (backend sync)
- MealsScreen (backend sync)
- WorkoutScreen (backend sync)
- SettingScreen (preferences integration)
- AccountScreen (profile integration)
- AiScreen (conversations integration)

⏳ **Contexts To Update:**
- StatsContext - Add backend sync
- MealsContext - Add backend sync
- WorkoutsContext - Add backend sync
- PreferencesContext - Add backend sync

---

## 🗄️ Database Schema

### Collections Overview

| Collection | Purpose | Key Features |
|-----------|---------|--------------|
| **users** | User accounts | Authentication, profile data |
| **userPreferences** | Settings | Theme, units, notifications |
| **dailyStats** | Daily tracking | Water, sleep, weight, height, goals |
| **meals** | Meal items | Date-based, linked to foods, plan support |
| **workoutEntries** | Workout sessions | Date-based, linked to workouts, plan support |
| **foodFavorites** | Favorite foods | User preferences |
| **aiConversations** | Chat history | Messages, conversations |
| **passwordResetTokens** | Reset tokens | TTL auto-expire |
| **plans** | 14-day plans | Unified meal + workout plans |
| **foods** | Food database | Templates/nutrition data |
| **workouts** | Workout database | Exercise templates |

**For complete schema details, see `DATABASE_SCHEMA.md`**

---

## 🚀 14-Day Unified Plan System

### Overview
The unified 14-day plan system combines both meal plans and workout plans into a single structured program. Users can create separate meal-only or workout-only plans and merge them into a unified plan.

### Features Implemented

✅ **Plan Model** (`backend/models/Plan.js`)
- Unified 14-day plan structure
- Contains both meal plans and workout plans
- Plan status management (draft, active, completed)
- Progress tracking (meals/workouts completed)
- Metadata storage (goals, targets, notes)
- Support for both user-created and AI-generated plans

✅ **Plan Controller** (`backend/controllers/planController.js`)
- `getAllPlans()` - Get all user's plans
- `getPlan()` - Get plan details
- `createPlan()` - Create new plan (user or AI)
- `updatePlan()` - Modify plan
- `activatePlan()` - Activate plan (creates daily Meal and WorkoutEntry documents)
- `deactivatePlan()` - Deactivate plan
- `deletePlan()` - Delete plan (with cleanup)
- `getPlanProgress()` - Track completion status

✅ **Plan Routes** (`backend/routes/planRoutes.js`)
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/plans` - Create plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan
- `POST /api/plans/:id/activate` - Activate plan
- `POST /api/plans/:id/deactivate` - Deactivate plan
- `GET /api/plans/:id/progress` - Get plan progress

✅ **AI Plan Generation** (`backend/controllers/aiController.js`)
- `analyzeUserNeeds()` - Analyze user profile for plan requirements
- `generatePlan()` - AI generates complete 14-day plan based on:
  - User stats (weight, height, age, gender, activity level, goals)
  - Food preferences/favorites
  - Workout preferences/history
  - Calculates TDEE, macros, and generates meal/workout plans
- `modifyPlan()` - AI modifies existing plans
- `suggestPlanImprovements()` - AI analyzes and suggests improvements

### Plan Creation & Merging

**Plan Types:**
- **Meal-only plans**: Contains `mealPlan` with 14 days, `workoutPlan` can be empty arrays
- **Workout-only plans**: Contains `workoutPlan` with 14 days, `mealPlan` can be empty arrays
- **Unified plans**: Contains both `mealPlan` and `workoutPlan` with 14 days each

**Plan Merging:**
- Two separate plans (one meal-only, one workout-only) can be merged
- Both plans must have the same `startDate` and `userId`
- Merge operation combines `mealPlan` from one plan with `workoutPlan` from another
- Creates a new unified plan or updates existing plan
- Metadata is merged (preferring values from the more complete plan)

### AI Capabilities

**✅ AI Can Do:**
- Generate new 14-day plans (meal + workout plans)
- Modify existing plans (update mealPlan, workoutPlan, metadata)
- Suggest plan improvements based on analysis
- Read user's dailyStats and goals to inform plan generation
- Create plans with `createdBy: 'ai'` flag

**❌ AI Cannot Do:**
- Directly modify `dailyStats` collection (weight, height, activityLevel, goalWeight, etc.)
- Directly update user goals in `dailyStats.goalWeight`
- Users must manually update their goals/stats through the Dashboard screen

**Note:** AI reads current user stats to generate personalized plans, but all stat/goal updates remain user-initiated.

---

## 🔧 Setup & Installation

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up MongoDB**
   - Local: `mongod` or `docker run -d -p 27017:27017 --name mongodb mongo`
   - Cloud: Create MongoDB Atlas account and get connection string

3. **Create Environment File** (`backend/.env`)
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/coreiq
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRY=7d
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Development Server**
   ```bash
   npx expo start
   ```

---

## 📝 Integration Guide

### Updating Screens to Use Backend

**Pattern for All Screens:**
```typescript
import { authService } from '../services/authService';
import { ActivityIndicator, Alert } from 'react-native';

const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setLoading(true);
    const result = await authService.someMethod();
    // Handle success
  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

### Context Updates

**StatsContext Example:**
```typescript
import { statsService } from '../services/statsService';
import { api } from '../services/api';

const loadStatsFromBackend = async (dateKey: string) => {
  try {
    const token = await api.getToken();
    if (token) {
      const stats = await statsService.getStats(dateKey);
      setStatsByDate(prev => ({ ...prev, [dateKey]: stats }));
    }
  } catch (error) {
    console.error('Failed to load stats from backend:', error);
  }
};
```

**See `FRONTEND_BACKEND_INTEGRATION.md` (if exists) for detailed integration patterns**

---

## 🔒 Security Features

✅ **Implemented:**
- Password hashing with bcrypt
- JWT token authentication
- Token expiry (7 days)
- Protected routes with auth middleware
- Input validation on all endpoints
- Error handling without exposing sensitive info

---

## 📊 Key Design Decisions

### 1. Embedded vs Referenced Plans
- **Decision**: Hybrid approach
- Plan document contains embedded meal/workout structures (for preview)
- When activated, creates separate Meal/WorkoutEntry documents linked via `planId`
- **Benefits**: Fast preview, historical records, flexible modifications

### 2. Plan Status Management
- Only one `active` plan per user at a time
- Activating new plan deactivates previous
- Completed plans are read-only

### 3. AI Integration
- Simplified algorithm implementation (ready for external AI service integration)
- Uses user data from DailyStats, favorites, and preferences
- Calculates TDEE using Mifflin-St Jeor equation
- In production, replace helper functions with actual AI API calls

### 4. Date-Based Data Structure
- `dailyStats`, `meals`, and `workoutEntries` use date fields
- Enables time-series queries and historical tracking
- Front-end can query data by date range efficiently

---

## 🧪 Testing

### Unit Tests (TODO)
- Plan model validation
- Plan controller CRUD operations
- Plan activation/deactivation logic
- Progress calculation

### Integration Tests (TODO)
- AI plan generation
- Plan activation creates correct daily entries
- Plan modification updates daily entries
- Status management (only one active plan)

---

## 📋 Next Steps

### Backend (Mostly Complete)
1. ✅ Plan model and CRUD - **DONE**
2. ✅ Plan activation - **DONE**
3. ✅ AI plan generation (simplified) - **DONE**
4. ⏳ Integrate external AI service (OpenAI/Claude)
5. ⏳ Plan templates/presets
6. ⏳ Plan sharing between users

### Frontend (In Progress)
1. ⏳ Plan creation UI
2. ⏳ Plan preview (14-day calendar view)
3. ⏳ Plan activation/deactivation
4. ⏳ Plan progress dashboard
5. ⏳ AI plan generation interface
6. ⏳ Plan modification UI
7. ⏳ Update remaining screens with backend integration
8. ⏳ Update contexts with backend sync

### Testing
1. ⏳ Unit tests for Plan model
2. ⏳ Integration tests for plan activation
3. ⏳ AI generation tests
4. ⏳ Edge case handling

---

## 📁 File Structure

```
CoreIQ/
├── backend/
│   ├── controllers/        ✅ All controllers created
│   ├── models/             ✅ All models created
│   ├── routes/             ✅ All routes created
│   ├── middleware/         ✅ Auth middleware
│   ├── utils/              ✅ Utility functions
│   ├── server.js           ✅ Configured
│   └── API_DOCUMENTATION.md ✅ Complete API docs
├── mobile/
│   ├── services/           ✅ All services created
│   ├── screens/             ⏳ Need backend integration
│   ├── context/             ⏳ Need backend sync
│   └── components/         ✅ UI components
├── DATABASE_SCHEMA.md      ✅ Complete schema
├── PROJECT_ANALYSIS.md      ✅ Frontend analysis
├── README_BACKEND_SETUP.md ✅ Setup guide
└── IMPLEMENTATION_GUIDE.md  ✅ This file
```

---

## 🎯 Quick Reference

### API Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Common Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/stats/:date` - Get daily stats
- `GET /api/meals/:date` - Get meals for date
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create plan

**For complete API documentation, see `backend/API_DOCUMENTATION.md`**

---

## 📖 Additional Resources

- **Database Schema**: `DATABASE_SCHEMA.md`
- **Frontend Analysis**: `PROJECT_ANALYSIS.md`
- **Backend Setup**: `README_BACKEND_SETUP.md`
- **API Documentation**: `backend/API_DOCUMENTATION.md`

---

## 🎉 Summary

✅ **Complete:**
- Unified 14-day plan system
- Plan model with full CRUD operations
- Plan activation system (creates daily entries)
- AI plan generation (simplified algorithm)
- AI plan modification and suggestions
- Complete database schema
- Backend API (40+ endpoints)
- Service layer for frontend

⏳ **In Progress:**
- Frontend plan management UI
- Context backend sync
- Screen backend integration

The foundation for the unified 14-day plan system is now in place. The AI can generate personalized plans based on user data, and users can create, activate, and track their plans. The system is ready for frontend integration and can be enhanced with more sophisticated AI algorithms when an external AI service is integrated.

