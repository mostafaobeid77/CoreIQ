# CoreIQ API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Authentication

All endpoints except `/api/auth/*` require authentication via JWT token in the header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /api/auth/register
Register a new user

**Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "birthDate": "1995-04-12T00:00:00.000Z",
  "gender": "male"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### POST /api/auth/login
Login user

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/forgot-password
Request password reset code

**Body:**
```json
{
  "email": "john@example.com"
}
```

### POST /api/auth/verify-code
Verify reset code

**Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

### POST /api/auth/reset-password
Reset password

**Body:**
```json
{
  "token": "reset_token_id",
  "newPassword": "newpassword123"
}
```

### GET /api/auth/me
Get current user (protected)

---

## User Endpoints

### GET /api/users/profile
Get user profile (protected)

### PUT /api/users/profile
Update user profile (protected)

**Body:**
```json
{
  "fullName": "John Doe Updated",
  "username": "johndoe2",
  "email": "john2@example.com",
  "profilePhoto": "photo_url"
}
```

### DELETE /api/users/account
Delete user account (protected)

---

## Preferences Endpoints

### GET /api/preferences
Get user preferences (protected)

**Response:**
```json
{
  "theme": "light",
  "units": "metric",
  "waterRemindersEnabled": false,
  "wellnessRemindersEnabled": false
}
```

### PUT /api/preferences
Update preferences (protected)

**Body:**
```json
{
  "theme": "dark",
  "units": "imperial",
  "waterUploadersEnabled": true,
  "wellnessRemindersEnabled": true
}
```

---

## Stats Endpoints

### GET /api/stats/:date
Get stats for a specific date (protected)

**Example:** `GET /api/stats/2024-01-15`

### GET /api/stats?startDate=&endDate=
Get stats for date range (protected)

### PUT /api/stats/:date
Update or create stats for a date (protected)

**Body:**
```json
{
  "water": 1500,
  "sleep": 7.5,
  "mental": "Motivated",
  "walking": 8500,
  "weight": 75.5,
  "height": 175,
  "activityLevel": "Moderate",
  "goalWeight": "Lose Weight: 70kg"
}
```

### PATCH /api/stats/:date
Partial update stats (protected)

**Body:**
```json
{
  "water": 1500
}
```

---

## Meals Endpoints

### GET /api/meals/:date
Get all meals for a date (protected)

**Response:**
```json
{
  "Breakfast": [...],
  "Lunch": [...],
  "Dinner": [...]
}
```

### GET /api/meals/:date/nutrients
Get total nutrients for completed meals (protected)

### POST /api/meals
Add meal item (protected)

**Body:**
```json
{
  "date": "2024-01-15",
  "mealType": "Breakfast",
  "foodId": "food_id_here",
  "quantity": 150,
  "unit": "grams"
}
```

### PATCH /api/meals/:id
Update meal item (protected)

### POST /api/meals/:id/toggle
Toggle meal completion (protected)

### DELETE /api/meals/:id
Delete meal item (protected)

---

## Workout Entry Endpoints

### GET /api/workout-entries/:date
Get all workout entries for a date (protected)

**Response:**
```json
{
  "strengthByGroup": {
    "Chest": [...],
    "Back": [...]
  },
  "cardioEntries": [...]
}
```

### POST /api/workout-entries
Add workout entry (protected)

**Body for Strength:**
```json
{
  "date": "2024-01-15",
  "workoutId": "workout_id",
  "sets": [
    { "reps": 10, "weight": 80 },
    { "reps": 10, "weight": 80 }
  ]
}
```

**Body for Cardio:**
```json
{
  "date": "2024-01-15",
  "workoutId": "workout_id",
  "minutes": 30
}
```

### POST /api/workout-entries/:id/toggle
Toggle workout completion (protected)

### DELETE /api/workout-entries/:id
Delete workout entry (protected)

---

## Favorites Endpoints

### GET /api/favorites
Get user's favorite foods (protected)

### POST /api/favorites
Add food to favorites (protected)

**Body:**
```json
{
  "foodId": "food_id_here"
}
```

### DELETE /api/favorites/:foodId
Remove food from favorites (protected)

---

## AI Conversation Endpoints

### GET /api/ai
Get all conversations (protected)

### GET /api/ai/:id
Get specific conversation (protected)

### POST /api/ai
Create new conversation (protected)

**Body:**
```json
{
  "title": "New chat"
}
```

### PUT /api/ai/:id
Update conversation (protected)

**Body:**
```json
{
  "title": "Updated title",
  "messages": [...]
}
```

### DELETE /api/ai/:id
Delete conversation (protected)

### POST /api/ai/:id/messages
Add message to conversation (protected)

**Body:**
```json
{
  "role": "user",
  "content": "Hello!"
}
```

---

## Existing Endpoints (Already Working)

### Food Database
- GET /api/foods
- GET /api/foods/categories
- GET /api/foods/:id

### Workout Database
- GET /api/workouts
- GET /api/workouts/categories

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `500` - Server Error

---

## Notes

1. All dates should be in ISO format or YYYY-MM-DD
2. JWT tokens expire after 7 days (configurable)
3. Passwords are hashed using bcrypt before storage
4. All user-specific endpoints require authentication
5. MongoDB connection is required for all operations

