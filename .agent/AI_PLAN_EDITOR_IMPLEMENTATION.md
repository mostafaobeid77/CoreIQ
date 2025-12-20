# AI-Powered Plan Editing System - Implementation Summary

## 🎯 Overview
Implemented a comprehensive AI system that understands natural language commands and can intelligently modify meal plans and workout routines in the Plans screen.

## ✨ Features Implemented

### 1. **Intelligent Natural Language Processing**
The AI can understand commands like:
- "Swap all chicken for salmon"
- "Add a protein shake in the afternoon"  
- "Remove breakfast"
- "Add bench press to my workout"
- "Replace squats with leg press"
- "Fix my protein deficit"
- "Make it vegetarian"

### 2. **Intent Detection & Classification**
The system automatically detects user intent and routes to specialized handlers:
- `swap_food` - Replace food items
- `add_meal` - Add new meals
- `remove_meal` - Delete meals  
- `add_workout` - Add exercises
- `remove_workout` - Delete exercises
- `adjust_macros` - Auto-fix macro deficits
- `general_edit` - Fallback for other modifications

### 3. **Smart Food Swapping**
Backend (`/api/ai/swap-food/suggest` & `/apply`):
- Finds similar foods based on macros (±30% tolerance)
- AI picks best replacement based on user preference
- Two-step process: suggest → review → apply
- Preserves portion sizes by default

### 4. **Intelligent Workout Swapping**  
Backend (`/api/ai/swap-workout/suggest` & `/apply`):
- Matches by exercise type & muscle groups
- AI recommends alternatives
- Maintains sets/reps from original
- Equipment and difficulty considered

### 5. **Macro Deficit Auto-Fix**
When protein/calorie deficit detected:
- Automatically adds high-protein foods
- Calculates optimal quantities
- Explains reasoning to user

## 🏗️ Architecture

### Backend Components

#### 1. **aiController.js** (`/backend/ai/aiController.js`)
- **`editPlan` endpoint** - Main AI orchestrator
- Processes natural language instructions
- Routes to specialized handlers
- Returns modified day data

Key Features:
```javascript
POST /api/ai/edit-plan
Body: {
  currentDay: { meals: {...}, workouts: [...] },
  instruction: "user command",
  planContext: "Day 1, Goal: Muscle Gain"
}
Response: {
  success: true,
  modifiedDay: {...},
  changes: ["Added 150g Chicken to lunch"],
  aiReasoning: "High protein boost"
}
```

#### 2. **aiCoachService.js** (`/backend/services/aiCoachService.js`)
Specialized swap handlers:
- `swapFood(planId, dayIndex, mealType, foodId, userMessage)`
- `applyFoodSwap(planId, dayIndex, mealType, oldFoodId, newFoodId, qty)`
- `swapWorkout(planId, dayIndex, workoutId, userMessage)`  
- `applyWorkoutSwap(planId, dayIndex, oldWorkoutId, newWorkoutId, sets, reps)`

#### 3. **Routes**
- `/api/ai/edit-plan` - General AI editor (in aiRoutes.js)
- `/api/ai/swap-food/*` - Food operations (in aiCoachRoutes.js)
- `/api/ai/swap-workout/*` - Workout operations (in aiCoachRoutes.js)

### Mobile Components

#### 1. **aiService.ts** (`/mobile/services/aiService.ts`)
```typescript
editPlan(currentDay, instruction, planContext)
// Calls POST /api/ai/edit-plan
```

#### 2. **aiCoachService.ts** (`/mobile/services/aiCoachService.ts`)
```typescript
suggestFoodSwap(planId, dayIndex, mealType, foodId, userMessage)
applyFoodSwap(planId, dayIndex, mealType, oldFoodId, newFoodId, qty)
suggestWorkoutSwap(planId, dayIndex, workoutId, userMessage)
applyWorkoutSwap(planId, dayIndex, oldWorkoutId, newWorkoutId, sets, reps)
```

#### 3. **PlansScreen.tsx** 
Already integrated:
- AI edit modal trigger (`onAiAssist` button)
- `handleAiEditSubmit` processes instructions
- Updates plan state on success

#### 4. **AiEditModal.tsx**
Premium UI with:
- Natural language input
- Quick-action chips
- Loading states
- AI reasoning display

## 🔄 User Flow

### Example: "Add more protein to lunch"

1. **User** taps AI assist button → enters "Add more protein to lunch"
2. **PlansScreen** calls `aiService.editPlan(dayData, instruction)`
3. **Backend** receives request → `aiController.editPlan()`
4. **AI Intent Detection** → classifies as `adjust_macros`
5. **Handler** finds high-protein food → calculates quantity
6. **Response** returns modified day + changes
7. **PlansScreen** updates local state
8. **User** sees updated meal plan with new item

### Example: "Swap chicken breast for salmon"

1. **User** enters command in AI modal
2. **Intent Detection** → `swap_food`
3. **AI** identifies foods to remove/add
4. **Handler** finds salmon in database → builds meal item
5. Returns modified day with salmon replacing chicken
6. UI updates immediately

## 🎨 UI Components

### AiEditModal Features
- Floating bottom sheet design
- Keyboard-aware input
- Sample prompts:
  - "Add protein"
  - "Vegetarian"
  - "Fix calories"
- Real-time validation
- Loading spinner during processing

## 🧠 AI Capabilities

### Groq Integration
- Primary: Structured JSON responses
- Fallback: Keyword detection if AI unavailable
- Smart context: User targets, current meals, available foods

### Context-Aware
The AI receives:
- User's macro targets (calories, protein, carbs, fats)
- Current day's meals and workouts
- Plan context (goal, day number)
- Available food database
- Available workout database

### Smart Matching
**Foods:**
- Exact name match
- Partial name match
- Macro-based similarity
- Protein-focused (if request mentions protein)

**Workouts:**
- Exercise type match
- Muscle group overlap
- Equipment compatibility

## 🔧 Technical Details

### Error Handling
- Graceful AI failures (keyword fallback)
- Validation at every step
- User-friendly error messages
- Detailed console logging

### Performance
- Lean AI prompts (minified food list)
- Single round-trip per edit
- Optimistic UI updates
- Fast keyword fallback

### Data Flow
```
User Input → Intent Detection → Handler Selection → 
Database Query → AI Enhancement → Data Modification → 
Response → UI Update
```

## 📝 Next Steps (Recommendations)

1. **Add Undo/Redo**: Store edit history
2. **Bulk Operations**: "Make entire week vegetarian"
3. **Smart Suggestions**: Proactive AI recommendations
4. **Voice Input**: Speak commands
5. **Plan Templates**: Save frequently used modifications
6. **Nutrition Insights**: "Why did you suggest this?"
7. **Conflict Resolution**: Handle overlapping changes
8. **Offline Mode**: Queue edits when offline

## 🐛 Bug Fixes Included

1. **Fixed server.js typo**: `aiChatRoutes` → `aiRoutes`
2. **Added missing import**: `aiCoachRoutes` in server.js
3. **Implemented editPlan**: Was returning 501 "Not implemented"

## 🎉 Result

The Plans screen now has a **powerful, intelligent AI assistant** that:
✅ Understands natural language  
✅ Swaps meals and workouts intelligently  
✅ Adds items based on context  
✅ Removes items easily  
✅ Auto-fixes macro deficits  
✅ Explains its reasoning  
✅ Works seamlessly with existing UI  

Users can now interact with their plans conversationally, making the CoreIQ app feel truly AI-powered and intelligent!
