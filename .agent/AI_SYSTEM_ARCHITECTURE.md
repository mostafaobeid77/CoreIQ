# 🏗️ AI Plan Editor - System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                      (Mobile - React Native)                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    User taps AI button ✨
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AiEditModal.tsx                              │
│  • Text input for natural language commands                         │
│  • Quick-action suggestion chips                                    │
│  • Loading state & feedback display                                 │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                  User types: "Add more protein"
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PlansScreen.tsx                               │
│  • handleAiEditSubmit(instruction)                                  │
│  • Calls aiService.editPlan()                                       │
│  • Updates local state on success                                   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                    HTTP POST request
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Mobile Service Layer                              │
│                                                                     │
│  ┌────────────────────┐         ┌────────────────────┐            │
│  │  aiService.ts      │         │ aiCoachService.ts  │            │
│  │                    │         │                    │            │
│  │ • editPlan()       │         │ • suggestFoodSwap()│            │
│  │                    │         │ • applyFoodSwap()  │            │
│  │                    │         │ • suggestWorkoutSwap()          │
│  │                    │         │ • applyWorkoutSwap()│            │
│  └────────────────────┘         └────────────────────┘            │
│           │                              │                         │
│           └──────────────┬───────────────┘                         │
│                          │                                         │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
              POST /api/ai/edit-plan
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND - Express.js                             │
│                      (Node.js Server)                               │
└─────────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
┌────────────────┐                   ┌────────────────┐
│  aiRoutes.js   │                   │aiCoachRoutes.js│
│                │                   │                │
│ • /edit-plan   │                   │ • /swap-food/* │
│ • /generate-   │                   │ • /swap-workout│
│   plan         │                   │                │
└────────────────┘                   └────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Controller Layer                               │
│                                                                     │
│  ┌────────────────────┐         ┌────────────────────┐            │
│  │ aiController.js    │         │ aiCoachService.js  │            │
│  │                    │         │                    │            │
│  │ • editPlan()       │         │ • swapFood()       │            │
│  │   ├─ Intent detect │         │ • applyFoodSwap()  │            │
│  │   ├─ Route to      │         │ • swapWorkout()    │            │
│  │   │   handler      │         │ • applyWorkoutSwap()│            │
│  │   └─ Execute       │         │                    │            │
│  │                    │         │                    │            │
│  └────────────────────┘         └────────────────────┘            │
│           │                              │                         │
└───────────┼──────────────────────────────┼─────────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AI & Data Layer                                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Groq AI      │  │ Database     │  │ Smart Buffet │            │
│  │ Provider     │  │ (MongoDB)    │  │ Service      │            │
│  │              │  │              │  │              │            │
│  │ • Intent     │  │ • Foods      │  │ • Food       │            │
│  │   detection  │  │ • Workouts   │  │   matching   │            │
│  │ • Smart      │  │ • Plans      │  │ • Similarity │            │
│  │   suggestions│  │ • Users      │  │   scoring    │            │
│  │              │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: "Add more protein to lunch"

```
1. USER ACTION
   └─> Taps AI button → Types "Add more protein to lunch"

2. MOBILE LAYER
   └─> AiEditModal captures input
       └─> PlansScreen.handleAiEditSubmit()
           └─> aiService.editPlan(currentDay, instruction)

3. HTTP REQUEST
   POST /api/ai/edit-plan
   Body: {
     currentDay: { meals: {...}, workouts: [...] },
     instruction: "Add more protein to lunch",
     planContext: "Day 1, Goal: Muscle Gain"
   }

4. BACKEND ROUTING
   └─> aiRoutes.js → auth middleware → aiController.editPlan()

5. AI PROCESSING
   A. Get User Context
      └─> getUserTargets(userId) → { protein: 180g, ... }
   
   B. Load Resources
      └─> Food.find() → All foods
      └─> createSmartBuffet() → Optimized food list
   
   C. Intent Detection
      └─> Groq AI analyzes: "Add more protein to lunch"
      └─> Returns: { intent: "adjust_macros", target: "lunch" }
   
   D. Execute Handler (adjust_macros)
      1. Calculate current macros
         └─> currentProtein = 130g
      
      2. Find deficit
         └─> deficit = 180g - 130g = 50g
      
      3. Select high-protein food
         └─> Smart Buffet finds: Chicken Breast (p: 39g/100g)
      
      4. Calculate quantity
         └─> qty = (50g / 39g) * 100g = 128g
      
      5. Build meal item
         └─> {
              foodId: "...",
              name: "Chicken Breast",
              quantity: 128,
              protein: 50,
              ...
            }
      
      6. Add to lunch
         └─> modifiedDay.meals.lunch.push(newItem)

6. RESPONSE
   {
     success: true,
     modifiedDay: { ... },
     changes: ["Added Chicken Breast (128g) to boost protein"],
     aiReasoning: "High protein boost to reach target"
   }

7. MOBILE UPDATE
   └─> PlansScreen receives response
       └─> handleUpdateDay(modifiedDay)
           └─> UI re-renders with new meal

8. USER SEES
   ✅ "Added Chicken Breast (128g) to boost protein"
   Lunch now shows the new item with updated macros
```

## Component Relationships

```
PlansScreen
├── Uses: aiService (general editing)
├── Uses: aiCoachService (specialized swaps)
├── Renders: AiEditModal
├── Renders: PlanDayView
│   └── Shows: meals & workouts
└── State: planDays, currentDay

AiEditModal
├── Props: onSubmit, isLoading, context
├── UI: TextInput, suggestion chips, submit button
└── Calls: PlansScreen.handleAiEditSubmit()

aiService
└── editPlan() → POST /api/ai/edit-plan

aiCoachService
├── suggestFoodSwap() → POST /api/ai/swap-food/suggest
├── applyFoodSwap() → POST /api/ai/swap-food/apply
├── suggestWorkoutSwap() → POST /api/ai/swap-workout/suggest
└── applyWorkoutSwap() → POST /api/ai/swap-workout/apply
```

## Intent Handlers (Backend)

```
editPlan() receives instruction
    │
    ├─> Intent: "swap_food"
    │   └─> Find foodsToRemove
    │   └─> Find foodsToAdd in Smart Buffet
    │   └─> Replace in modifiedDay
    │
    ├─> Intent: "add_meal"
    │   └─> Find foodsToAdd
    │   └─> Query Smart Buffet
    │   └─> Calculate macros
    │   └─> Add to meal section
    │
    ├─> Intent: "remove_meal"
    │   └─> Find foodsToRemove
    │   └─> Filter out from meal array
    │
    ├─> Intent: "add_workout"
    │   └─> Find workoutsToAdd
    │   └─> Query Workout DB
    │   └─> Add to workouts array
    │
    ├─> Intent: "remove_workout"
    │   └─> Find workoutsToRemove
    │   └─> Filter out from workouts
    │
    ├─> Intent: "adjust_macros"
    │   └─> Calculate current macros
    │   └─> Find deficit
    │   └─> Select appropriate food
    │   └─> Calculate quantity
    │   └─> Add to meal
    │
    └─> Intent: "general_edit"
        └─> Apply general modifications
```

## AI Integration Flow

```
Groq AI Provider
    │
    ├─> Available?
    │   ├─> YES: Use AI for intent detection
    │   │   └─> generateJson(systemPrompt, userPrompt)
    │   │       └─> Returns structured JSON
    │   │           └─> { intent, target, foodsToAdd, ... }
    │   │
    │   └─> NO: Use keyword fallback
    │       └─> Basic regex matching
    │           └─> "add" → add_meal
    │           └─> "swap" → swap_food
    │           └─> "remove" → remove_meal
    │           └─> "protein" → adjust_macros
    │
    └─> Always resilient: System works with or without AI
```

## Error Handling

```
Every Layer Has Protection:

Mobile:
  ├─ Network errors → Show user-friendly message
  ├─ Validation → Check inputs before sending
  └─ Fallback → Allow manual editing

Backend:
  ├─ Missing data → 400 Bad Request
  ├─ AI failure → Keyword fallback
  ├─ DB error → 500 with details
  └─ Try-catch on all async operations

AI:
  ├─ Groq down → Use fallback logic
  ├─ Invalid JSON → Parse with fallback
  └─ No matches → Return helpful message
```

---

## Performance Optimizations

1. **Smart Buffet**: Pre-filtered food list reduces AI context size
2. **Minified Data**: Send only essential fields to AI
3. **Single Request**: One API call per edit
4. **Optimistic Updates**: UI feels instant
5. **Cached Contexts**: User targets cached
6. **Lean Queries**: Only fetch what's needed

---

## Security Considerations

1. **Authentication**: All endpoints require auth middleware
2. **User Isolation**: Plans scoped to req.userId
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent AI abuse (can add)
5. **Error Masking**: Don't expose internal errors to client

---

This architecture provides:
✅ **Scalability** - Easy to add new intents
✅ **Reliability** - Fallbacks at every layer
✅ **Performance** - Fast responses
✅ **Maintainability** - Clean separation of concerns
✅ **User Experience** - Feels magical!
