# CoreIQ Database Schema - MongoDB

## Overview
This document outlines the complete database schema for CoreIQ, a comprehensive health and fitness tracking application. The database uses MongoDB with Mongoose for data modeling.

---

## Table of Contents
1. [Users Collection](#1-users-collection)
2. [User Preferences Collection](#2-user-preferences-collection)
3. [Daily Stats Collection](#3-daily-stats-collection)
4. [Meals Collection](#4-meals-collection)
5. [Workouts Collection](#5-workouts-collection)
6. [Workout Entries Collection](#6-workout-entries-collection)
7. [Food Favorites Collection](#7-food-favorites-collection)
8. [AI Conversations Collection](#8-ai-conversations-collection)
9. [Password Reset Tokens Collection](#9-password-reset-tokens-collection)
10. [Email Verification Tokens Collection](#10-email-verification-tokens-collection)
11. [Food Collection](#12-food-collection-already-exists)
12. [Plans Collection](#11-plans-collection)
13. [Workout Database Collection](#12-workout-database-collection-already-exists)
14. [Admins Collection](#13-admins-collection)

---

## 1. Users Collection

**Purpose:** Stores user authentication and profile information from registration and account management screens.

**Collection Name:** `users`

### Schema:
```javascript
{
  _id: ObjectId,                    // Primary key
  fullName: String,                 // From registration (Required)
  username: String,                 // From registration (Required, Unique, Indexed)
  email: String,                    // From registration (Required, Unique, Indexed)
  password: String,                 // Hashed password (Required)
  birthDate: Date,                  // From registration (Required)
  gender: String,                   // 'male' | 'female' (Required)
  profilePhoto: String,             // URL/path to photo from account screen (Optional)
  emailVerified: Boolean,           // Default: false
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Indexes:**
- `username`: unique index
- `email`: unique index
- `emailVerified`: sparse index

**Relationships:**
- One-to-One with `userPreferences`
- One-to-Many with `dailyStats`
- One-to-Many with `meals`
- One-to-Many with `workoutEntries`

**Front-end Mapping:**
- Registration Screen → Creates new user
- Account Screen → Updates profile info
- Login Screen → Authenticates user

---

## 2. User Preferences Collection

**Purpose:** Stores user settings and preferences from the Settings screen.

**Collection Name:** `userPreferences`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed, Unique)
  theme: String,                    // 'light' | 'dark' (Default: 'light')
  units: String,                    // 'metric' | 'imperial' (Default: 'metric')
  waterRemindersEnabled: Boolean,   // Default: false
  wellnessRemindersEnabled: Boolean,// Default: false
  updatedAt: Date                   // Auto-generated 
}
```

**Indexes:**
- `userId`: unique index

**Relationships:**
- Many-to-One with `users` (via userId)

**Front-end Mapping:**
- Settings Screen → Updates preferences
- Used across all screens for display units and theme

---

## 3. Daily Stats Collection

**Purpose:** Tracks daily health metrics from the Dashboard screen for each date. **Only users can modify these values** - AI reads them but cannot update them.

**Collection Name:** `dailyStats`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  date: Date,                       // Date of the stats (Required, Indexed)
  water: Number,                    // Water intake in ml (Default: 0)
  sleep: Number,                    // Sleep hours (Default: 0)
  mental: String,                   // Mental state: 'Motivated', 'Neutral', 'Stressed', 'Tired', 'Sad', 'Confident', 'Overwhelmed' (Default: 'Neutral')
  walking: Number,                  // Steps count (Default: 0)
  weight: Number,                   // Weight in kg (Default: 0)
  height: Number,                   // Height in cm (Default: 0)
  activityLevel: String,            // 'Sedentary', 'Light', 'Moderate', 'Active', 'Very Active' (Default: 'Moderate')
  goalWeight: String,               // e.g., 'Maintain Weight', 'Lose Weight: 75kg', 'Gain Weight: 80kg' (Default: 'Not set')
  workoutsCompleted: Number,        // Number of completed workouts (Default: 0)
  workoutsTotal: Number,            // Total workouts for the day (Default: 0)
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Indexes:**
- Compound index: `{ userId: 1, date: 1 }` (unique)
- `date`: index for date range queries

**Relationships:**
- Many-to-One with `users` (via userId)
- One-to-One with meals for that date (virtual)
- One-to-One with workout entries for that date (virtual)

**Front-end Mapping:**
- Dashboard Screen → Updates all stats (user-initiated only)
- PhysicalStatsSection → Updates weight & height
- GoalsSection → Updates activityLevel & goalWeight
- CategoryCards → Updates water, mental, sleep, walking
- Used in daily targets calculation
- AI reads these values to generate personalized plans, but cannot modify them

**AI Access:**
- AI can **read** dailyStats to understand user's current state (weight, height, activityLevel, goalWeight)
- AI uses this data to generate personalized meal and workout plans
- AI **cannot modify** dailyStats - all updates must be user-initiated through the Dashboard
- When AI generates a plan, it copies `goalWeight` to `plan.metadata.goal` but does not update the original dailyStats

**Enum Values:**
- `mental`: ['Motivated', 'Neutral', 'Stressed', 'Tired', 'Sad', 'Confident', 'Overwhelmed']
- `activityLevel`: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active']

---

## 4. Meals Collection

**Purpose:** Stores individual meal items added to daily meal plans.

**Collection Name:** `meals`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  date: Date,                       // Date of the meal (Required, Indexed)
  mealType: String,                 // 'Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3' (Required, Indexed)
  foodId: ObjectId,                 // Foreign key → foods._id (Required)
  name: String,                     // Food name (Required, denormalized for fast access)
  brand: String,                    // Food brand (Default: 'Generic')
  quantity: Number,                 // Quantity value (Required)
  unit: String,                     // 'grams' | 'servings' (Required)
  calories: Number,                 // Calculated calories (Required)
  protein: Number,                  // Calculated protein in grams (Required)
  carbs: Number,                    // Calculated carbs in grams (Required)
  fats: Number,                     // Calculated fats in grams (Required)
  isCompleted: Boolean,             // Whether meal was consumed (Default: false)
  addedAt: Date,                    // When item was added (Default: now)
  planId: ObjectId,                 // Foreign key → plans._id (Optional, Indexed)
  planDay: Number,                  // Day in plan 1-14 (Optional)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ userId: 1, date: 1, mealType: 1 }`
- `foodId`: index for food lookups
- `isCompleted`: sparse index

**Relationships:**
- Many-to-One with `users` (via userId)
- Many-to-One with `foods` (via foodId)
- Grouped by date and mealType for daily meal plans

**Front-end Mapping:**
- MealsScreen → Displays and manages meals
- Search results → Links to food database
- Meal items can be marked as completed
- Meal items can be deleted
- Nutrients calculated based on quantity and unit

---

## 5. Workouts Collection

**Purpose:** Already exists - stores the workout database/templates.

**Collection Name:** `workouts`

### Schema: (Already exists)
```javascript
{
  _id: ObjectId,
  name: String,                     // Workout name (Required, Indexed)
  description: String,              // Workout description (Required)
  category: String,                 // 'Strength' | 'Cardio' (Required, Indexed)
  muscle_group: String,             // 'Chest', 'Back', 'Biceps', etc. (Required, Indexed)
  equipment: String,                // Equipment needed (Optional, Indexed)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Text index on `name`, `description`, `category`, `muscle_group`, `equipment`

**Front-end Mapping:**
- WorkoutScreen → Searchable workout database
- Used as templates for creating workout entries

---

## 6. Workout Entries Collection

**Purpose:** Stores user's actual workout sessions performed on specific dates.

**Collection Name:** `workoutEntries`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  date: Date,                       // Date of the workout (Required, Indexed)
  workoutId: ObjectId,              // Foreign key → workouts._id (Required)
  workoutType: String,              // 'strength' | 'cardio' (Required)
  
  // For strength workouts
  name: String,                     // Workout name (denormalized)
  description: String,              // Workout description
  muscle_group: String,             // Target muscle group
  sets: [{                          // Array of sets (for strength)
    reps: Number,                   // Reps per set
    weight: Number                  // Weight in kg
  }],
  
  // For cardio workouts
  minutes: Number,                  // Duration in minutes (for cardio)
  
  isCompleted: Boolean,             // Whether workout was completed (Default: false)
  planId: ObjectId,                // Foreign key → plans._id (Optional, Indexed)
  planDay: Number,                 // Day in plan 1-14 (Optional)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ userId: 1, date: 1 }`
- `workoutId`: index for workout template lookups
- `muscle_group`: index for grouping by muscle

**Relationships:**
- Many-to-One with `users` (via userId)
- Many-to-One with `workouts` (via workoutId)

**Front-end Mapping:**
- WorkoutScreen → Displays workouts by muscle group
- Strength workouts show sets with reps and weight
- Cardio workouts show duration in minutes
- Can toggle completion status
- Completion status updates dailyStats.workoutsCompleted

**Notes:**
- For strength workouts: `sets` array is populated, `minutes` is 0
- For cardio workouts: `minutes` is populated, `sets` is empty
- Workouts are grouped by `muscle_group` in the UI

---

## 7. Food Favorites Collection

**Purpose:** Stores user's favorite foods for quick access.

**Collection Name:** `foodFavorites`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  foodId: ObjectId,                 // Foreign key → foods._id (Required, Indexed)
  createdAt: Date,                  // When favorited
  updatedAt: Date
}
```

**Indexes:**
- Compound unique index: `{ userId: 1, foodId: 1 }`

**Relationships:**
- Many-to-One with `users` (via userId)
- Many-to-One with `foods` (via foodId)

**Front-end Mapping:**
- MealsScreen → FavoritesSection
- Users can favorite/unfavorite foods
- Shows frequently used foods

---

## 8. AI Conversations Collection

**Purpose:** Stores AI chat conversations and messages. AI can generate plans, modify plans, and suggest improvements, but cannot directly modify user goals or dailyStats.

**Collection Name:** `aiConversations`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  title: String,                    // Conversation title (Default: 'New chat')
  messages: [{                      // Array of messages
    role: String,                   // 'user' | 'assistant'
    content: String,                // Message text
    createdAt: Date                 // Message timestamp
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`: index for user conversations
- `createdAt`: index for chronological sorting

**Relationships:**
- Many-to-One with `users` (via userId)

**Front-end Mapping:**
- AiScreen → Chat interface
- Conversation history drawer
- Create, rename, delete conversations
- Edit/delete messages

**AI Permissions & Capabilities:**
- ✅ **Can do:**
  - Generate new 14-day plans (meal + workout plans)
  - Modify existing plans (update mealPlan, workoutPlan, metadata)
  - Suggest plan improvements based on analysis
  - Read user's dailyStats and goals to inform plan generation
  - Create plans with `createdBy: 'ai'` flag
- ❌ **Cannot do:**
  - Directly modify `dailyStats` collection (weight, height, activityLevel, goalWeight, etc.)
  - Directly update user goals in `dailyStats.goalWeight`
  - Users must manually update their goals/stats through the Dashboard screen
- AI reads current user stats to generate personalized plans, but all stat/goal updates remain user-initiated

---

## 9. Password Reset Tokens Collection

**Purpose:** Stores temporary tokens for password reset functionality.

**Collection Name:** `passwordResetTokens`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  token: String,                    // Reset token (Required, Unique, Indexed)
  email: String,                    // User's email
  expiresAt: Date,                  // Token expiration (Required, Indexed)
  used: Boolean,                    // Whether token was used (Default: false)
  createdAt: Date
}
```

**Indexes:**
- `token`: unique index
- `userId`: index
- `expiresAt`: TTL index (auto-delete expired tokens)

**Relationships:**
- Many-to-One with `users` (via userId)

**Front-end Mapping:**
- ForgotPasswordScreen → Generates token
- ConfirmCodeScreen → Validates token
- ResetPasswordScreen → Uses token to reset password

**TTL Index:**
- Documents expire after 1 hour (based on `expiresAt`)

---

## 10. Email Verification Tokens Collection

**Purpose:** Stores temporary tokens for verifying user email addresses. Users must verify email before login and password reset.

**Collection Name:** `emailVerificationTokens`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  token: String,                    // 6-digit code (Required, Unique, Indexed)
  email: String,                    // User's email
  expiresAt: Date,                  // Token expiration (Required, Indexed)
  used: Boolean,                    // Whether token was used (Default: false)
  createdAt: Date                   // Auto-generated
}
```

**Indexes:**
- `token`: unique index
- `userId`: index
- `expiresAt`: TTL index (auto-delete expired tokens)

**Relationships:**
- Many-to-One with `users` (via userId)

**Front-end Mapping:**
- Register → Generates email verification code
- VerifyEmail → Confirms code and sets `users.emailVerified = true`
- ResendCode → Regenerates code if not expired/used

**TTL Index:**
- Documents expire after 1 hour (based on `expiresAt`)

---

## 11. Plans Collection

**Purpose:** Stores unified 14-day plans that combine both meal plans and workout plans into a single structured program. Users can create separate meal-only or workout-only plans and merge them into a unified plan.

**Collection Name:** `plans`

### Schema:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Foreign key → users._id (Required, Indexed)
  name: String,                     // Plan name (Required, Default: 'My 14-Day Plan')
  startDate: Date,                  // Plan start date (Required, Indexed)
  endDate: Date,                    // Calculated: startDate + 13 days (Required)
  status: String,                   // 'draft' | 'active' | 'completed' (Default: 'draft', Indexed)
  createdBy: String,                // 'user' | 'ai' (Required, Default: 'user')
  
  // 14-Day Meal Plan Structure (Optional - can be empty array)
  mealPlan: [{                      // Array of exactly 14 days (can be empty meals arrays)
    day: Number,                    // 1-14 (Required)
    date: Date,                     // Calculated from startDate + (day - 1)
    meals: [{                        // Array of planned meals for this day (can be empty)
      mealType: String,             // 'Breakfast', 'Snack 1', 'Lunch', etc.
      foodId: ObjectId,             // Foreign key → foods._id
      name: String,                 // Food name (denormalized)
      quantity: Number,            // Quantity value
      unit: String,                 // 'grams' | 'servings'
      calories: Number,            // Calculated calories
      protein: Number,              // Calculated protein
      carbs: Number,                // Calculated carbs
      fats: Number                  // Calculated fats
    }]
  }],
  
  // 14-Day Workout Plan Structure (Optional - can be empty array)
  workoutPlan: [{                   // Array of exactly 14 days (can be empty workouts arrays)
    day: Number,                    // 1-14 (Required)
    date: Date,                     // Calculated from startDate + (day - 1)
    workouts: [{                    // Array of planned workouts for this day (can be empty)
      workoutId: ObjectId,         // Foreign key → workouts._id
      name: String,                 // Workout name (denormalized)
      workoutType: String,          // 'strength' | 'cardio'
      muscle_group: String,         // Target muscle group
      sets: [{                      // For strength workouts
        reps: Number,
        weight: Number
      }],
      minutes: Number               // For cardio workouts
    }]
  }],
  
  metadata: {
    goal: String,                   // User's goal when plan created (copied from dailyStats.goalWeight)
    targetCalories: Number,         // Daily calorie target (calculated from user stats)
    targetProtein: Number,          // Daily protein target (grams)
    targetCarbs: Number,           // Daily carbs target (grams)
    targetFats: Number,             // Daily fats target (grams)
    notes: String                   // User or AI notes
  },
  
  progress: {
    mealsCompleted: Number,        // Total meals completed (Default: 0)
    mealsTotal: Number,             // Total meals in plan (Default: 0)
    workoutsCompleted: Number,       // Total workouts completed (Default: 0)
    workoutsTotal: Number,          // Total workouts in plan (Default: 0)
    daysCompleted: Number           // Days fully completed (Default: 0, Max: 14)
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `{ userId: 1, status: 1 }`
- Compound index: `{ userId: 1, startDate: 1 }`
- `status`: index

**Relationships:**
- Many-to-One with `users` (via userId)
- One-to-Many with `meals` (via planId, when plan is activated)
- One-to-Many with `workoutEntries` (via planId, when plan is activated)

**Front-end Mapping:**
- Plan management screen → Create, view, edit plans
- Users can create separate meal-only or workout-only plans
- Plan merging → Combine meal plan and workout plan into unified plan
- Plan activation → Creates daily Meal and WorkoutEntry documents
- AI chat interface → Generate/modify plans via AI
- Progress tracking → Track completion across 14 days

**Plan Status Flow:**
- `draft` → Plan created but not activated
- `active` → Plan is active, daily entries created and linked
- `completed` → All 14 days completed

**Plan Creation & Merging:**
- Users can create plans with:
  - **Meal-only plans**: Contains `mealPlan` with 14 days, `workoutPlan` can be empty arrays
  - **Workout-only plans**: Contains `workoutPlan` with 14 days, `mealPlan` can be empty arrays
  - **Unified plans**: Contains both `mealPlan` and `workoutPlan` with 14 days each
- **Plan Merging**: Two separate plans (one meal-only, one workout-only) can be merged:
  - Both plans must have the same `startDate` and `userId`
  - Merge operation combines `mealPlan` from one plan with `workoutPlan` from another
  - Creates a new unified plan or updates existing plan
  - Metadata is merged (preferring values from the more complete plan)
- Plans must contain exactly 14 days (arrays must have 14 elements, but individual `meals` or `workouts` arrays can be empty)
- Only one `active` plan per user at a time
- When a plan is activated, corresponding Meal and WorkoutEntry documents are created with `planId` and `planDay` fields
- Plans can be created by users manually or generated by AI

**AI Capabilities:**
- AI can create new plans via `generatePlan` endpoint
- AI can modify existing plans via `modifyPlan` endpoint (updates mealPlan, workoutPlan, metadata)
- AI can suggest plan improvements via `suggestPlanImprovements` endpoint
- AI uses user's current `dailyStats` (weight, height, activityLevel, goalWeight) to generate plans
- **AI does NOT directly modify `dailyStats` or `goalWeight`** - AI reads these values to create plans but users must manually update their goals/stats
- AI can update plan metadata (targetCalories, targetProtein, etc.) when modifying plans

---

## 12. Food Collection (Already Exists)

**Purpose:** Stores the food database/templates.

**Collection Name:** `foods`

### Schema: (Already exists)
```javascript
{
  _id: ObjectId,
  name: String,                     // Food name (Required, Indexed)
  description: String,              // Food description (Required)
  category: String,                 // 'fruits', 'vegetables', etc. (Required, Indexed)
  nutrients: {
    calories: Number,               // Per 100g (Required)
    protein: Number,                // Per 100g (Required)
    fat: Number,                    // Per 100g (Required)
    carbs: Number                   // Per 100g (Required)
  },
  servings: [{                      // Array of serving sizes
    size: String,                   // Serving description
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Text index on `name`, `description`, `category`
- `category`: index

**Front-end Mapping:**
- MealsScreen → Searchable food database
- Used as templates for creating meal entries

---

## Entity Relationship Diagram Summary

```
users (1) -----< (M) userPreferences
users (1) -----< (M) dailyStats
users (1) -----< (M) meals
users (1) -----< (M) workoutEntries
users (1) -----< (M) foodFavorites
users (1) -----< (M) aiConversations
users (1) -----< (M) passwordResetTokens
users (1) -----< (M) plans

foods (1) -----< (M) meals
foods (1) -----< (M) foodFavorites

workouts (1) -----< (M) workoutEntries

plans (1) -----< (M) meals (via planId)
plans (1) -----< (M) workoutEntries (via planId)

admins (Standalone - Full access to all collections via web admin panel)

(dailyStats is linked to meals and workoutEntries by date, not by foreign key)
```

---

## Key Design Decisions

### 1. **Denormalization for Performance**
- Storing `name`, `brand`, and calculated `calories`, `protein`, `carbs`, `fats` in `meals` collection
- This allows fast queries without joins and preserves historical nutritional data even if food database changes

### 2. **Date-Based Data Structure**
- `dailyStats`, `meals`, and `workoutEntries` use date fields
- Enables time-series queries and historical tracking
- Front-end can query data by date range efficiently

### 3. **Flexible Workout System**
- Single collection handles both strength and cardio workouts
- Uses `workoutType` to differentiate between types
- Strength workouts use `sets` array, cardio uses `minutes`

### 4. **Atomic Data Updates**
- Daily stats are updated atomically per date
- Prevents race conditions when multiple operations modify the same day's data

### 5. **Indexing Strategy**
- Compound indexes on `{userId, date}` for most collections
- Text indexes for search functionality (foods, workouts)
- Unique indexes prevent duplicates where needed

### 6. **TTL Indexes**
- Password reset tokens auto-expire using TTL index
- Automatic cleanup of expired data

---

## Validation Rules

### Users
- `email` must be valid email format
- `username` must be 3-30 characters, alphanumeric
- `password` must be at least 8 characters (enforced by backend hashing)
- `gender` must be 'male' or 'female'
- `birthDate` cannot be in the future

### Daily Stats
- `water` must be >= 0 (in ml)
- `sleep` must be between 0-24 hours
- `walking` must be >= 0 (steps)
- `weight` must be > 0 (in kg)
- `height` must be > 0 (in cm)

### Meals
- `quantity` must be > 0
- `unit` must be 'grams' or 'servings'
- `calories`, `protein`, `carbs`, `fats` must be >= 0
- `planDay` must be between 1-14 if `planId` is provided

### Workout Entries
- For strength: `sets` array must not be empty
- Each set must have `reps` > 0 and `weight` >= 0
- For cardio: `minutes` must be > 0
- `workoutType` must be 'strength' or 'cardio'
- `planDay` must be between 1-14 if `planId` is provided

### Plans
- `mealPlan` and `workoutPlan` must contain exactly 14 days
- `status` must be 'draft', 'active', or 'completed'
- `createdBy` must be 'user' or 'ai'
- Only one plan with `status: 'active'` per user at a time
- `endDate` is automatically calculated as `startDate + 13 days`

---

## Sample Queries

### Get today's stats for a user
```javascript
db.dailyStats.findOne({
  userId: ObjectId("..."),
  date: new Date("2024-01-15")
})
```

### Get all meals for a date
```javascript
db.meals.find({
  userId: ObjectId("..."),
  date: new Date("2024-01-15")
}).sort({ mealType: 1 })
```

### Get completed workout entries for a date
```javascript
db.workoutEntries.find({
  userId: ObjectId("..."),
  date: new Date("2024-01-15"),
  isCompleted: true
})
```

### Search foods by name
```javascript
db.foods.find({
  $text: { $search: "apple" }
})
```

### Get user's weight history
```javascript
db.dailyStats.find({
  userId: ObjectId("..."),
  weight: { $gt: 0 }
}).sort({ date: -1 })
```

### Get active plan for user
```javascript
db.plans.findOne({
  userId: ObjectId("..."),
  status: 'active'
})
```

### Get all meals for a plan
```javascript
db.meals.find({
  planId: ObjectId("..."),
  planDay: 1
})
```

---

## Migration Notes

### From Frontend to Backend
1. Replace AsyncStorage with MongoDB persistence
2. Add authentication middleware for all user-specific endpoints
3. Implement date-based queries for stats, meals, workouts
4. Add proper validation and error handling
5. Implement email verification system
6. Add rate limiting for password reset requests

### Backward Compatibility
- Maintain existing Food and Workout schemas
- Keep existing API endpoints
- Add new endpoints for user-specific data

---

## Future Enhancements

1. **Social Features**
   - Add `followers` and `following` collections
   - Add `workoutChallenges` collection

2. **Advanced Analytics**
   - Add `weeklyReports` collection
   - Add `goalProgress` tracking

3. **Notification System**
   - Add `notifications` collection
   - Push notification preferences

4. **Meal Plans**
   - Add `mealPlanTemplates` collection
   - Add `weeklyMealPlans` collection

5. **Workout Plans**
   - Add `workoutPlanTemplates` collection
   - Add `weeklyWorkoutPlans` collection

---

## 13. Admins Collection

**Purpose:** Stores admin accounts for web-based administration panel that controls all aspects of the application.

**Collection Name:** `admins`

### Schema:
```javascript
{
  _id: ObjectId,                    // Primary key
  username: String,                 // Admin username (Required, Unique, Indexed)
  email: String,                    // Admin email (Required, Unique, Indexed)
  password: String,                 // Hashed password (Required)
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Indexes:**
- `username`: unique index
- `email`: unique index

**Relationships:**
- No direct relationships with other collections
- Admins have full access to all collections via web admin panel

**Front-end Mapping:**
- Web Admin Panel → Admin authentication and management
- Admin can view, edit, delete all user data
- Admin can manage food and workout databases
- Admin can view system statistics and analytics

**Security:**
- Password is hashed using bcrypt before storage
- Passwords are not returned in JSON responses
- Admin authentication separate from user authentication

**Validation Rules:**
- `username` must be 3-30 characters, alphanumeric and underscores only
- `email` must be valid email format
- `password` must be at least 8 characters
- `username` and `email` must be unique

