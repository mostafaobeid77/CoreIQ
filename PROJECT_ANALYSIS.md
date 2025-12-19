# CoreIQ Project Analysis

## Overview
CoreIQ is a comprehensive health and fitness tracking mobile application built with React Native (Expo) for the frontend and Node.js/Express with MongoDB for the backend. The application allows users to track their daily nutrition, workouts, health metrics, and interact with an AI assistant.

---

## Frontend Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **State Management**: React Context API
- **Storage**: AsyncStorage for local persistence
- **UI Components**: Custom components with Ionicons
- **Theme**: Light/Dark mode support

### Key Screens

#### 1. Authentication Screens
- **LoginScreen.tsx**: User authentication with email/username and password
- **RegisterScreen.tsx**: User registration with:
  - Full name
  - Username
  - Email
  - Birth date
  - Gender (Male/Female)
  - Password and confirmation
- **ForgotPasswordScreen.tsx**: Password reset request
- **ConfirmCodeScreen.tsx**: 6-digit code verification
- **ResetPasswordScreen.tsx**: New password setup
- **ChangePasswordScreen.tsx**: Update existing password (from Settings)

#### 2. Main Application Screens
- **DashboardScreen.tsx**: Main hub showing:
  - Daily overview with goals
  - Water intake tracking
  - Nutrition tracking (calories, proteins, carbs, fats)
  - Meal completion status
  - Physical stats (weight, height)
  - Activity level
  - Goal weight settings
  - Mental health tracking
  - Sleep tracking
  - Walking steps (integrated with pedometer)
  - Date picker for viewing past/future days
- **MealsScreen.tsx**: Meal planning and tracking:
  - Search and add foods from database
  - Meal sections: Breakfast, Snacks, Lunch, Dinner (dynamic based on goal)
  - Mark meals as completed
  - View nutritional breakdown
  - Delete meals
  - Meal plans based on weight goal
- **WorkoutScreen.tsx**: Workout tracking:
  - Search and add workouts from database
  - Strength workouts grouped by Fig muscle group with sets (reps, weight)
  - Cardio workouts with duration
  - Mark workouts as completed
  - Muscle group organization
- **AiScreen.tsx**: AI assistant interface:
  - Chat conversation interface
  - Conversation history drawer
  - Create, rename, delete conversations
  - Edit/delete messages
  - Persistent storage
- **SettingScreen.tsx**: User settings:
  - Account management
  - Theme toggle (light/dark)
  - Units toggle (metric/imperial)
  - Water reminders
  - Wellness reminders
  - App version
  - Terms & Privacy links
  - Logout

#### 3. Profile Management
- **account.tsx**: User profile editing:
  - Profile photo upload
  - Full name
  - Username
  - Email
  - Birth date
  - Gender (read-only)
  - Link to password change

---

## Context Providers

### 1. **StatsContext.tsx**
Manages daily health statistics:
```typescript
statsByDate: { [date: string]: DashboardStats }
```
- Tracks water, calories, proteins, carbs, fats, sleep, mental state, walking, workouts, weight, height, activity level, goal weight
- Separate data per date for historical tracking

### 2. **MealsContext.tsx**
Manages daily meal data:
```typescript
mealsByDate: { [date: string]: { [mealType: string]: MealItem[] } }
```
- Stores meal items per date and meal type
- Tracks completion status
- Calculates nutrients based on quantity and unit (grams/servings)

### 3. **WorkoutsContext.tsx**
Manages daily workout data:
```typescript
workoutsByDate: { [date: string]: { 
  strengthByGroup: Record<string, StrengthWorkoutEntry[]>
  cardioEntries: CardioWorkoutEntry[]
}}
```
- Separates strength (with sets) and cardio (with duration)
- Groups strength by muscle group
- Tracks completion status

### 4. **PreferencesContext.tsx**
Manages user preferences:
- Theme (light/dark)
- Units (metric/imperial)

### 5. **themeContext.tsx**
Manages application theme state

---

## Backend API (Existing)

### Existing Endpoints

#### Food API (`/api/foods`)
- `GET /api/foods` - Get all foods or search by name
- `GET /api/foods/:id` - Get specific food by ID

#### Workout API (`/api/workouts`)
- Similar structure for workout database

### Existing Models
- **Food.js**: Food database with nutrients and serving sizes
- **Workout.js**: Workout database with muscle groups and equipment

---

## Data Flow & Features

### 1. Authentication Flow
1. User registers → Frontend collects form data
2. Backend validates and creates user → MongoDB
3. User logs in → Backend authenticates → Returns token/session
4. All subsequent requests include authentication

### 2. Daily Stats Flow
1. User updates stat (e.g., water) on Dashboard
2. Frontend updates StatsContext
3. Backend API receives update → MongoDB
4. Changes persist and sync across devices

### 3. Meals Flow
1. User searches for food → Backend Food API
 fills results
2. User selects food and adds to meal
3. Frontend calculates nutrients based on quantity/unit
4. Frontend adds to MealsContext
5. Backend API persists to MongoDB
6. Dashboard displays consumed nutrients from completed meals

### 4. Workouts Flow
1. User searches for workout → Backend Workout API
 fills results
2. User adds workout with details (sets/reps or duration)
3. Frontend adds to WorkoutsContext
4. Backend API persists to MongoDB
5. Dashboard displays completion status

### 5. AI Chat Flow
1. User sends message
2. Backend AI API processes and responds
3. Conversation saved to MongoDB
4. History accessible via drawer

---

## Key Data Structures

### DashboardStats
```typescript
{
  water: number;              // ml
  calories: number;           // kcal
  proteins: number;           // grams
  carbs: number;             // grams
  fats: number;              // grams
  meals: number;             // count
  sleep: number;             // hours
  mental: string;            // Mood state
  walking: number;           // steps
  workouts: number;          // completed
  workoutsCompleted: number;
  workoutsTotal: number;
  weight: number;            // kg
  height: number;            // cm
  activityLevel: string;
  goalWeight: string;
  age: number;
  sex: string;
}
```

### MealItem
```typescript
{
  id: string;
  name: string;
  brand: string;
  quantity: number;
  unit: 'grams' | 'servings';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isCompleted: boolean;
  addedAt: Date;
}
```

### WorkoutEntry
```typescript
// Strength
{
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  sets: { reps: number; weight: number }[];
  isCompleted: boolean;
}

// Cardio
{
  id: string;
  name: string;
  minutes: number;
  isCompleted: boolean;
}
```

---

## Business Logic

### 1. Daily Target Calculations
Based on user stats (weight, height, age, gender, activity level, goal), the app calculates:
- **TDEE** (Total Daily Energy Expenditure) using Mifflin-St Jeor equation
- **Activity multiplier** based on activity level
- **Goal adjustment** (deficit for weight loss, surplus for weight gain)
- **Macros**: Proteins (based on weight and goal), Fats (% of calories), Carbs (remaining)
- **Water**: ml per kg of body weight
- **Steps**: Based on activity level

### 2. Meal Plan Generation
Based on goal weight:
- **Maintain**: 4-5 meals (Breakfast, Snack 1, Lunch, Snack 2, Dinner)
- **Lose Weight**: 3-4 meals (Breakfast, Snack, Lunch, Dinner)
- **Gain Weight**: 5-6 meals (Breakfast, Snack 1, Lunch, Snack 2, Dinner, Snack 3)

### 3. Nutrient Calculation
- **Serving-based**: Use serving nutritional info × quantity
- **Gram-based**: Use per-100g nutritional info × (quantity/100)
- Only completed meals count toward daily targets

### 4. Workout Completion Tracking
- Completed workouts increase `workoutsCompleted` in daily stats
- UI shows completion percentage
- Strength and cardio tracked separately but combined in dashboard

---

## UI/UX Features

### 1. Date Navigation
- Users can navigate to any date (past/future)
- Past dates show historical data
- Future dates use most recent values as defaults
- Current date shows live tracking

### 2. Modal System
- Water input modal
- Mental health selection modal
- Weight/height input modals
- Activity level selector
- Goal weight modal
- Sleep input modal
- Food details modal
- Workout details modal

### 3. Interactive Cards
- Dashboard cards show progress bars
- Completion checkmarks
- Add/subtract buttons for quick increments
- Bottom sheets for detailed views

### 4. Search Functionality
- Real-time search with debouncing (500ms)
- Search foods by name, description, category
- Search workouts by name, muscle group, equipment
- Loading indicators during search

### 5. Swipe Gestures
- Swipe to delete meal items
- Swipe to access quick actions (planned)

---

## Notifications

### Water Reminders
- Scheduled every 2 hours
- User can enable/disable in settings

### Wellness Reminders
- Scheduled every 6 hours
- Remind for workouts, meals, motivation
- User can enable/disable in settings

---

## Data Persistence

### Current (Frontend Only)
- AsyncStorage for preferences, themes, conversations
- In-memory contexts for daily data
- Resets on app restart

### Target (With Backend)
- MongoDB for all user data
- Authentication required
- Sync across devices
- Historical data retention

---

## Security Considerations

### Required Implementations
1. **Password Hashing**: bcrypt with salt rounds
2. **Authentication**: JWT tokens or sessions
3. **Authorization**: Middleware to verify user permissions
4. **Input Validation**: Sanitize all user inputs
5. **Rate Limiting**: Prevent brute force attacks
6. **CORS**: Configure for mobile app origins
7. **Data Encryption**: HTTPS for all communications
 Privacy Compliance: GDPR compliance for user data

---

## Integration Points

### External Services (Potential)
1. **Pedometer API**: Already integrated via expo-sensors
2. **Image Storage**: AWS S3 or Cloudinary for profile photos
3. **Push Notifications**: Firebase Cloud Messaging or Expo Notifications
4. **AI Service**: OpenAI API or custom ML model
5. **Email Service**: SendGrid or AWS SES for password resets

---

## Performance Optimizations

### Frontend
1. **Debounced Search**: 500ms delay to reduce API calls
2. **Memoization**: React.useMemo for expensive calculations
3. **Lazy Loading**: Load components on demand
4. **Image Optimization**: Compress and cache images

### Backend
1. **Database Indexing**: Compound indexes on userId+date
2. **Query Optimization**: Limit results, use projections
3. **Caching**: Redis for frequently accessed data
4. **Pagination**: For large result sets

---

## Testing Strategy

### Unit Tests
- Model validations
- Business logic calculations
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### E2E Tests
- User registration to onboarding
- Daily tracking workflow
- Data synchronization

---

## Deployment Considerations

### Backend
- **Server**: AWS EC2, Digital Ocean, or Heroku
- **Database**: MongoDB Atlas (managed)
- **Environment Variables**: Secure storage
- **Logging**: Winston or Morgan

### Mobile App
- **Build**: Expo EAS Build
- **Distribution**: TestFlight (iOS), Google Play (Android)
- **Updates**: OTA updates via Expo Updates

---

## Future Enhancements

1. **Social Features**: Follow friends, share progress
2. **Workout/Meal Plans**: Pre-made templates
3. **Progress Charts**: Visualize weight trends, nutrient history
4. **Challenges**: 30-day fitness challenges
5. **Export Data**: CSV/PDF reports
6. **Wearables Integration**: Fitbit, Apple Watch, Garmin
7. **Recipe Suggestions**: Based on daily macros
8. **Workout Recommendations**: Based on goals and history
9. **Streak Tracking**: Daily consistency metrics
10. **Offline Mode**: Sync when connection restored

---

## Conclusion

CoreIQ is a well-structured health and fitness tracking application with:
- ✅ Comprehensive user authentication
- ✅ Daily health metrics tracking
- ✅ Meal planning and nutritional tracking
- ✅ Workout planning and execution tracking
- ✅ AI assistant for health guidance
- ✅ Beautiful, responsive UI with theme support
- ✅ Real-time data updates
- ✅ Date-based historical tracking

The frontend is 85% complete and requires backend integration for full functionality. The database schema designed in `DATABASE_SCHEMA.md` provides a complete foundation for all features present in the application.

