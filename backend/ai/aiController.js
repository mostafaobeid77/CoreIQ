const AIConversation = require('../models/AIConversation');
const Plan = require('../models/Plan');
const DailyStats = require('../models/DailyStats');
const User = require('../models/User');
const Food = require('../models/Food');
const Workout = require('../models/Workout');

// --- MODULAR SERVICES ---
const getUserTargets = require('../services/targets/getUserTargets');
const createSmartBuffet = require('../services/buffet/createSmartBuffet');
const groqProvider = require('../services/ai/providers/groqProvider');
const createMealStructurePrompt = require('../services/ai/prompt/buildMealStructurePrompt');
const processDeterministicMeals = require('../services/solver/processDeterministicMeals');
const generateDeterministicWorkouts = require('../services/workouts/generateDeterministicWorkouts');
const { validatePlan } = require('../services/validation/validatePlanSchema');
const ensure14Days = require('../services/utils/ensure14Days');

// Global Cache setup
const planCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Memory cache for DB data
let cachedFoods = null;
let cachedWorkouts = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

// Helper to normalize food structures (smartBuffet vs raw DB)
const normalizeFood = (food) => {
    if (!food) return null;
    // Already normalized? (smartBuffet format)
    if (food.cal !== undefined && food.p !== undefined) return food;

    // Raw Mongo object?
    const n = food.nutrients || {};
    return {
        _id: food._id.toString(),
        name: food.name,
        category: food.category,
        cal: Math.round(n.calories || 0),
        p: Math.round(n.protein || 0),
        c: Math.round(n.carbs || 0),
        f: Math.round(n.fat || 0),
        servings: food.servings || []
    };
};

// ==========================================
// CONVERSATION HANDLERS
// ==========================================

exports.getConversations = async (req, res) => {
    try {
        const conversations = await AIConversation.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await AIConversation.findOne({ _id: id, userId: req.userId });
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createConversation = async (req, res) => {
    try {
        const conversation = new AIConversation({ userId: req.userId, title: 'New chat', messages: [] });
        await conversation.save();
        res.status(201).json({ message: 'Conversation created', conversation });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, messages } = req.body;
        const conversation = await AIConversation.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { ...(title && { title }), ...(messages && { messages }) },
            { new: true }
        );
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json({ message: 'Conversation updated', conversation });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        await AIConversation.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, content } = req.body;

        const conversation = await AIConversation.findOne({ _id: id, userId: req.userId });
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        conversation.messages.push({ role, content });
        if (conversation.title === 'New chat' && role === 'user') {
            conversation.title = content.slice(0, 30);
        }
        await conversation.save();

        let aiResponseContent = "I'm connected but having trouble thinking.";
        let action = null;

        if (groqProvider.isAvailable()) {
            try {
                // Fetch context
                const userTargets = await getUserTargets(req.userId);
                const user = await User.findById(req.userId);

                // Humanize the identity
                const userName = user.fullName ? user.fullName.split(' ')[0] : 'there';

                const statsContext = {
                    name: user.fullName || 'User',
                    age: user.birthDate ? Math.floor((new Date() - new Date(user.birthDate)) / 31557600000) : 'unknown',
                    gender: user.gender || 'unknown',
                    weight: user.weight ? `${user.weight}kg` : 'unknown',
                    height: user.height ? `${user.height}cm` : 'unknown',
                    activityLevel: user.activityLevel || 'unknown',
                    goal: userTargets.goalWeight || 'Health',
                    targets: {
                        calories: `${userTargets.calories} kcal`,
                        protein: `${userTargets.protein}g`,
                        carbs: `${userTargets.carbs}g`,
                        fats: `${userTargets.fats}g`
                    }
                };

                const systemPrompt = `You are CoreIQ, a specialized AI fitness and nutrition coach. 
Your personality is professional, encouraging, and focused.
You MUST address the user as '${user.fullName || 'there'}' naturally.
You have access to the user's current profile and targets: ${JSON.stringify(statsContext)}.

STRICT DOMAIN RESTRICTION:
You are strictly limited to the domain of: Health, Fitness, Nutrition, Muscle Building, Weight Loss, and Personal Development related to these topics.
- IF asked about sports results (e.g., "Who won the World Cup?", "Score of the game"), politics, entertainment, history, or general trivia:
  You MUST REFUSE to answer.
  Reply politely: "I focus exclusively on your fitness and nutrition goals. Let's get back to your training or diet plan."
- Do NOT engage in casual chit-chat unrelated to health/fitness.
- Do NOT provide coding, math, or homework help.
- ONLY answer questions that help the user achieve their physical goals.

CORE PRODUCT CONNECTION:
- If the user discusses specific goals like gaining weight, losing weight, or body shaping, explain that the BEST results come from creating a structured plan using our app's "Plans" feature.
- Advise them to let the app generate their multi-day roadmap first.
- Emphasize that your role as AI Coach is to support them, answer questions, and fine-tune things once that foundational plan is active.

CRITICAL GUIDELINES:
1. LANGUAGE DYNAMISM: Detect the user's language and respond in the SAME language. If they speak Arabic, respond in Arabic. If they speak English, respond in English.
2. Don't be robotic. Use natural transitions and supportive language.
3. Refer to their specific goals or stats if it adds value to the conversation.
4. Keep advice science-based but accessible.
5. If they ask about their plan or progress, you know their exact targets.
6. Your replies should be concise but meaningful. Avoid long lists unless asked.

Return your response in strict JSON format:
{
  "reply": "Your human-like response here in the user's language",
  "intent": "chat" or "generate_plan"
}
If the user indicates they want to start a completely new multi-day meal/workout plan, set intent to "generate_plan". Otherwise, keep it as "chat".`;

                const chatHistory = conversation.messages.slice(-5).map(m => ({ role: m.role, content: m.content })); // Reduce history to 5

                const result = await groqProvider.generateJson(systemPrompt, JSON.stringify(chatHistory));

                aiResponseContent = result.reply || "I'm here for you. Could you rephrase that? I want to make sure I give you the best advice.";
                if (result.intent === 'generate_plan') action = 'generate_plan';
            } catch (err) {
                console.error('Chat Error:', err.message);
            }
        }

        conversation.messages.push({ role: 'assistant', content: aiResponseContent });
        await conversation.save();

        res.json({
            message: 'Message added',
            conversation,
            aiResponse: { role: 'assistant', content: aiResponseContent },
            action
        });

    } catch (error) {
        console.error('Add message error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.analyzeUserNeeds = async (req, res) => {
    // keeping simplistic
    res.json({ message: 'User needs analyzed', analysis: { status: 'ready' } });
};

// ==========================================
// PLAN GENERATION (REFACTORED)
// ==========================================

exports.generatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { requirements, startDate } = req.body;
        console.log(`\n🚀 [PLAN] Starting Generation for User ${req.userId}`);

        // 1. GET TARGETS (Single Source of Truth)
        const userTargets = await getUserTargets(req.userId);

        // 2. PREPARE BUFFET
        const allFoods = await Food.find().lean();
        if (!allFoods.length) return res.status(500).json({ message: 'No foods found' });
        const smartBuffet = createSmartBuffet(allFoods);
        const foodsForAI = smartBuffet.map(f => ({ idx: f.idx, n: f.name, p: f.p, tag: f.p > 20 ? 'HighPro' : 'Reg' })); // Minified for context window

        // 3. AI GENERATION (Structure Only)
        let mealPlanStructure = [];
        let fromCache = false;
        const cacheKey = `${req.userId}_${userTargets.calories}_${userTargets.protein}`;

        if (planCache.has(cacheKey) && (Date.now() - planCache.get(cacheKey).ts < CACHE_TTL)) {
            console.log('⚡ Using Cached Plan Structure');
            mealPlanStructure = planCache.get(cacheKey).structure;
            fromCache = true;
        } else {
            console.log('🤖 Asking AI for Structure...');
            const prompt = createMealStructurePrompt(userTargets, smartBuffet, foodsForAI);

            try {
                if (groqProvider.isAvailable()) {
                    const aiResult = await groqProvider.generateJson("You are a JSON generator.", prompt);
                    if (aiResult.mealPlan) {
                        mealPlanStructure = aiResult.mealPlan;
                        // Cache the structure (not the processed result, to allow re-solving logic changes)
                        planCache.set(cacheKey, { structure: mealPlanStructure, ts: Date.now() });
                    }
                }
            } catch (err) {
                console.warn('⚠️ AI Gen Failed, falling back to deterministic structure');
            }

            // Fallback
            if (!mealPlanStructure.length) {
                mealPlanStructure = [];
                for (let i = 1; i <= 14; i++) {
                    mealPlanStructure.push({
                        day: i,
                        meals: userTargets.mealSections.map(m => ({ mealType: m, items: [1, 15] })) // Default
                    });
                }
            }
        }

        // 4. DETERMINISTIC SOLVER (The Heavy Lifting)
        const processedMealPlan = processDeterministicMeals(mealPlanStructure, smartBuffet, userTargets);

        // 5. WORKOUTS
        const availableWorkouts = await Workout.find().lean();
        const workoutPlan = generateDeterministicWorkouts(userTargets.activityLevel || 'Moderate', userTargets.goal || 'General', availableWorkouts);

        // 6. FINALIZE (14 Days + Validation)
        const start = startDate ? new Date(startDate) : new Date();
        const finalMealPlan = ensure14Days(processedMealPlan, 'meal', start);
        const finalWorkoutPlan = ensure14Days(workoutPlan, 'workout', start);

        const validation = validatePlan(finalMealPlan, finalWorkoutPlan);
        if (!validation.isValid) {
            console.error('❌ Validation Failed:', validation.errors);
            // Even if failed, we might want to return what we have or error out. 
            // For now, let's error to be safe as user requested stability.
            return res.status(500).json({ message: 'Plan validation failed', errors: validation.errors });
        }

        // 7. SAVE PLAN
        const plan = await Plan.create({
            userId: req.userId,
            name: requirements?.name || 'My Copilot Plan',
            startDate: start,
            endDate: new Date(start.getTime() + 13 * 24 * 60 * 60 * 1000),
            mealPlan: finalMealPlan,
            workoutPlan: finalWorkoutPlan,
            metadata: {
                source: fromCache ? 'cache_hybrid' : 'ai_hybrid',
                targets: userTargets,
                solverVersion: '2.0-deterministic'
            },
            status: 'draft',
            createdBy: 'ai'
        });

        // Add note to conversation
        const conversation = await AIConversation.findOne({ _id: id, userId: req.userId });
        if (conversation) {
            conversation.messages.push({
                role: 'assistant',
                content: `✅ Plan Generated!\nTarget: ${userTargets.calories} kcal | ${userTargets.protein}g Protein\nCheck the Plans tab.`
            });
            await conversation.save();
        }

        res.status(201).json({ message: 'Plan generated', plan });

    } catch (error) {
        console.error('Generate Plan Critical Fail:', error.message);
        res.status(500).json({ message: 'Critical error generating plan', error: error.message });
    }
};

exports.modifyPlan = async (req, res) => res.status(501).json({ message: 'Not implemented' });

/**
 * AI-Powered Plan Editor
 * Understands natural language and modifies meals/workouts
 */
exports.editPlan = async (req, res) => {
    console.log('\n========================================');
    console.log('🔍 [AI EDIT] Endpoint called!');
    console.log('User ID:', req.userId);
    console.log('Body received:', JSON.stringify(req.body, null, 2));
    console.log('========================================\n');

    try {
        const { currentDay, instruction, planContext } = req.body;
        console.log(`🤖 [AI EDIT] User says: "${instruction}"`);

        if (!currentDay || !instruction) {
            console.error('[AI EDIT] Missing fields - currentDay:', !!currentDay, 'instruction:', !!instruction);
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // inside editPlan - use global cache
        const now = Date.now();
        if (!cachedFoods || !cachedWorkouts || (now - lastCacheTime > CACHE_DURATION)) {
            console.log('[AI PERFORMANCE] Cache miss - Fetching DB data...');
            const [foods, workouts] = await Promise.all([
                Food.find().lean(),
                Workout.find().lean()
            ]);
            cachedFoods = foods;
            cachedWorkouts = workouts;
            lastCacheTime = now;
        } else {
            console.log('[AI PERFORMANCE] Cache hit - Using in-memory data');
        }

        // Parallelize fetching user targets with using cached data
        // (User targets are per-user, so always fetch fresh)
        const [userTargets] = await Promise.all([
            getUserTargets(req.userId)
        ]);

        const allFoods = cachedFoods;
        const allWorkouts = cachedWorkouts;
        const smartBuffet = createSmartBuffet(allFoods);

        // Build context for AI
        const contextPrompt = `You are an intelligent fitness plan editor.
User Context: ${planContext || 'General fitness'}
Targets: ${userTargets.calories}kcal, ${userTargets.protein}g protein, ${userTargets.carbs}g carbs, ${userTargets.fats}g fat
Current Day Meals: ${JSON.stringify(currentDay.meals || {})}
Current Day Workouts: ${JSON.stringify(currentDay.workouts || [])}

User Request: "${instruction}"

CRITICAL RULES:
1. Trust the provided context. If a food is labeled "Diet" or "Zero", it has 0 sugar/calories. Do NOT assume sodas are high sugar if they are diet versions.
2. For portion sizes, use standard servings (e.g., 250g/ml for drinks, 100-200g for proteins) unless the user specifies a quantity.
3. Be concise in your reasoning.

Analyze the request and respond with JSON ONLY (no markdown):
{
  "intent": "swap_food" | "swap_workout" | "add_meal" | "remove_meal" | "add_workout" | "remove_workout" | "update_workout" | "adjust_macros" | "general_edit",
  "target": "breakfast" | "lunch" | "dinner" | "snacks" | "workout" | null,
  "action": "detailed description of what to do",
  "foodsToAdd": [{ "name": "food name", "quantity": 100, "mealType": "breakfast" }],
  "foodsToRemove": [{ "mealType": "breakfast", "foodName": "current food" }],
  "workoutsToAdd": ["workout name"],
  "workoutsToRemove": ["workout name"],
  "workoutsToUpdate": [{ 
    "name": "workout name", 
    "sets": 4, 
    "reps": 12, 
    "weight": 50,
    "duration": 30
  }],
  "reasoning": "brief explanation for user"
}`;

        let aiPlan;
        if (groqProvider.isAvailable()) {
            try {
                aiPlan = await groqProvider.generateJson(
                    "You are a precise JSON generator for fitness plan editing.",
                    contextPrompt
                );
                console.log('[AI EDIT] AI Response:', JSON.stringify(aiPlan, null, 2));
            } catch (err) {
                console.warn('AI intent detection failed:', err.message);
                console.log('[AI EDIT] Falling back to basic pattern matching...');
            }
        } else {
            console.log('[AI EDIT] Groq not available or returned no plan, using fallback. String input:', instruction);
        }

        // Fallback to basic intent detection
        if (!aiPlan || !aiPlan.intent) {
            const lowerInstruction = instruction.toLowerCase();

            // Detect workout update keywords
            const isWorkoutUpdate = (lowerInstruction.includes('weight') ||
                lowerInstruction.includes('sets') ||
                lowerInstruction.includes('reps') ||
                lowerInstruction.includes('increase') ||
                lowerInstruction.includes('decrease') ||
                lowerInstruction.includes('change') ||
                lowerInstruction.includes('make it') ||
                lowerInstruction.includes('update')) &&
                (lowerInstruction.includes('workout') ||
                    currentDay.workouts?.length > 0);

            const intent = lowerInstruction.includes('swap') || lowerInstruction.includes('replace') ?
                (lowerInstruction.includes('workout') || lowerInstruction.includes('exercise') ||
                    lowerInstruction.includes('bench') || lowerInstruction.includes('squat') ||
                    lowerInstruction.includes('deadlift') || lowerInstruction.includes('press') ?
                    'swap_workout' : 'swap_food') :
                isWorkoutUpdate ? 'update_workout' :
                    lowerInstruction.includes('add') && lowerInstruction.includes('workout') ? 'add_workout' :
                        lowerInstruction.includes('add') ? 'add_meal' :
                            lowerInstruction.includes('remove') || lowerInstruction.includes('delete') ? 'remove_meal' :
                                lowerInstruction.includes('protein') || lowerInstruction.includes('macro') ? 'adjust_macros' :
                                    'general_edit';

            aiPlan = {
                intent,
                reasoning: "Processing your request..."
            };

            // Try to extract workout/food names from instruction
            if (intent === 'add_workout') {
                // Extract workout types from common keywords
                const workoutKeywords = ['cardio', 'running', 'treadmill', 'cycling', 'bench press',
                    'squat', 'deadlift', 'pull up', 'push up', 'plank', 'yoga'];
                const foundWorkouts = workoutKeywords.filter(kw => lowerInstruction.includes(kw));

                if (foundWorkouts.length > 0) {
                    aiPlan.workoutsToAdd = foundWorkouts;
                } else {
                    // If no specific workout mentioned, assume they want generic cardio/strength
                    aiPlan.workoutsToAdd = lowerInstruction.includes('strength') ? ['strength'] : ['cardio'];
                }
                console.log('[AI EDIT] Fallback extracted workouts:', aiPlan.workoutsToAdd);
            } else if (intent === 'update_workout') {
                // Extract workout update parameters
                console.log('[AI EDIT] Detected workout update intent');

                // Try to find which workout they're referring to
                const workoutKeywords = ['bench press', 'squat', 'deadlift', 'pull up', 'push up', 'plank',
                    'bicep curl', 'tricep', 'shoulder press', 'lat pulldown', 'leg press'];
                const mentionedWorkout = workoutKeywords.find(kw => lowerInstruction.includes(kw));

                // Extract numeric values
                const weightMatch = lowerInstruction.match(/(\d+)\s*(kg|lb|pound)/i);
                const setsMatch = lowerInstruction.match(/(\d+)\s*set/i);
                const repsMatch = lowerInstruction.match(/(\d+)\s*rep/i);

                // If no specific workout mentioned, try to use the first/last workout in current day
                const targetWorkoutName = mentionedWorkout ||
                    currentDay.workouts?.[currentDay.workouts.length - 1]?.name ||
                    'workout';

                aiPlan.workoutsToUpdate = [{
                    name: targetWorkoutName,
                    ...(weightMatch && { weight: parseInt(weightMatch[1]) }),
                    ...(setsMatch && { sets: parseInt(setsMatch[1]) }),
                    ...(repsMatch && { reps: parseInt(repsMatch[1]) })
                }];

                console.log('[AI EDIT] Extracted update params:', aiPlan.workoutsToUpdate[0]);

            } else if (intent === 'add_meal') {
                // Try to extract meal type
                const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
                const targetMeal = mealTypes.find(m => lowerInstruction.includes(m)) || 'snacks';
                aiPlan.target = targetMeal;

                // Try to extract food name from instruction
                // Remove common words to isolate the food name
                let foodName = lowerInstruction
                    .replace(/add|to|in|for|my|a|an|the|please|can you/gi, '')
                    .replace(new RegExp(targetMeal, 'gi'), '')
                    .trim();

                // If we found a specific food name, use it
                if (foodName && foodName.length > 2) {
                    aiPlan.foodsToAdd = [{ name: foodName, quantity: 100, mealType: targetMeal }];
                    console.log(`[AI EDIT] Fallback extracted food: "${foodName}" for ${targetMeal}`);
                } else {
                    // Generic fallback
                    aiPlan.foodsToAdd = [{ name: 'protein', quantity: 100, mealType: targetMeal }];
                }
            }
        }

        console.log(`📋 Intent detected: ${aiPlan.intent}`);

        // Helper function to find the correct meal key (case-insensitive)
        const findMealKey = (mealType) => {
            if (!modifiedDay.meals) return mealType;
            const lowerMealType = mealType.toLowerCase();
            const existingKey = Object.keys(modifiedDay.meals).find(
                key => key.toLowerCase() === lowerMealType
            );
            return existingKey || mealType; // Return existing key or original if not found
        };

        // Clone current day to modify
        const modifiedDay = JSON.parse(JSON.stringify(currentDay));
        let changesMade = [];

        // Execute based on intent
        switch (aiPlan.intent) {
            case 'swap_food':
                // Swap food items
                if (aiPlan.foodsToRemove && aiPlan.foodsToAdd) {
                    for (const toRemove of aiPlan.foodsToRemove) {
                        const mealType = findMealKey(toRemove.mealType);
                        if (modifiedDay.meals[mealType]) {
                            modifiedDay.meals[mealType] = modifiedDay.meals[mealType].filter(
                                item => !item.name.toLowerCase().includes(toRemove.foodName.toLowerCase())
                            );
                        }
                    }

                    for (const toAdd of aiPlan.foodsToAdd) {
                        if (!toAdd || !toAdd.name) continue;

                        let foodMatch = smartBuffet.find(f =>
                            f.name.toLowerCase().includes(toAdd.name.toLowerCase())
                        ) || findBestFoodMatch(toAdd.name, cachedFoods, userTargets);

                        if (foodMatch) {
                            foodMatch = normalizeFood(foodMatch);
                            const mealKey = findMealKey(toAdd.mealType || 'snacks');
                            if (!modifiedDay.meals[mealKey]) {
                                modifiedDay.meals[mealKey] = [];
                            }

                            // Determine quantity and unit based on servings if available
                            let qty = toAdd.quantity || 100;
                            let unit = foodMatch.category === 'drinks' ? 'ml' : 'grams';
                            let finalNutrition = {
                                calories: Math.round(foodMatch.cal * (qty / 100)) || 0,
                                protein: Math.round(foodMatch.p * (qty / 100)) || 0,
                                carbs: Math.round(foodMatch.c * (qty / 100)) || 0,
                                fats: Math.round(foodMatch.f * (qty / 100)) || 0
                            };

                            if (foodMatch.category === 'drinks' && foodMatch.servings && foodMatch.servings.length > 0) {
                                const serving = foodMatch.servings[0];
                                qty = 1;
                                unit = serving.size || 'serving';
                                finalNutrition = {
                                    calories: Math.round(serving.calories),
                                    protein: Math.round(serving.protein),
                                    carbs: Math.round(serving.carbs),
                                    fats: Math.round(serving.fat || serving.fats || 0)
                                };
                            }

                            modifiedDay.meals[mealKey].push({
                                foodId: foodMatch._id,
                                name: foodMatch.name,
                                mealType: mealKey, // Required by Plan schema
                                category: foodMatch.category,
                                quantity: qty,
                                unit: unit,
                                calories: finalNutrition.calories,
                                protein: finalNutrition.protein,
                                carbs: finalNutrition.carbs,
                                fats: finalNutrition.fats,
                                caloriesPer100g: foodMatch.cal,
                                proteinPer100g: foodMatch.p,
                                carbsPer100g: foodMatch.c,
                                fatsPer100g: foodMatch.f
                            });
                            changesMade.push(`Added ${foodMatch.name} to ${mealKey}`);

                        }
                    }
                }
                break;

            case 'add_meal':
                // Add new meal items
                if (aiPlan.foodsToAdd) {
                    for (const toAdd of aiPlan.foodsToAdd) {
                        if (!toAdd || !toAdd.name) continue;

                        let foodMatch = smartBuffet.find(f =>
                            f.name.toLowerCase().includes(toAdd.name.toLowerCase())
                        ) || findBestFoodMatch(toAdd.name, cachedFoods, userTargets);

                        if (foodMatch) {
                            foodMatch = normalizeFood(foodMatch);
                            console.log(`[DEBUG] AI Edit found match for ${toAdd.name}:`, {
                                name: foodMatch.name,
                                category: foodMatch.category,
                                hasServings: !!(foodMatch.servings && foodMatch.servings.length),
                                firstServing: foodMatch.servings?.[0]
                            });

                            const mealKey = findMealKey(toAdd.mealType);
                            if (!modifiedDay.meals[mealKey]) {
                                modifiedDay.meals[mealKey] = [];
                            }

                            // Determine quantity and unit based on servings if available
                            let qty = toAdd.quantity || 100;
                            let unit = foodMatch.category === 'drinks' ? 'ml' : 'grams';
                            let finalNutrition = {
                                calories: Math.round(foodMatch.cal * (qty / 100)) || 0,
                                protein: Math.round(foodMatch.p * (qty / 100)) || 0,
                                carbs: Math.round(foodMatch.c * (qty / 100)) || 0,
                                fats: Math.round(foodMatch.f * (qty / 100)) || 0
                            };

                            if (foodMatch.category === 'drinks' && foodMatch.servings && foodMatch.servings.length > 0) {
                                const serving = foodMatch.servings[0];
                                qty = 1;
                                unit = serving.size || 'serving';
                                finalNutrition = {
                                    calories: Math.round(serving.calories),
                                    protein: Math.round(serving.protein),
                                    carbs: Math.round(serving.carbs),
                                    fats: Math.round(serving.fat || serving.fats || 0)
                                };
                            }

                            modifiedDay.meals[mealKey].push({
                                foodId: foodMatch._id,
                                name: foodMatch.name,
                                mealType: mealKey, // Required by Plan schema
                                category: foodMatch.category,
                                quantity: qty,
                                unit: unit,
                                calories: finalNutrition.calories,
                                protein: finalNutrition.protein,
                                carbs: finalNutrition.carbs,
                                fats: finalNutrition.fats,
                                caloriesPer100g: foodMatch.cal,
                                proteinPer100g: foodMatch.p,
                                carbsPer100g: foodMatch.c,
                                fatsPer100g: foodMatch.f
                            });
                            changesMade.push(`Added ${foodMatch.name} (${qty}g) to ${mealKey}`);

                        }
                    }
                }
                break;

            case 'remove_meal':
                // Remove meal items
                if (aiPlan.foodsToRemove) {
                    for (const toRemove of aiPlan.foodsToRemove) {
                        const mealType = findMealKey(toRemove.mealType || aiPlan.target);
                        if (modifiedDay.meals[mealType]) {
                            const beforeCount = modifiedDay.meals[mealType].length;
                            modifiedDay.meals[mealType] = modifiedDay.meals[mealType].filter(
                                item => !item.name.toLowerCase().includes(toRemove.foodName.toLowerCase())
                            );
                            const afterCount = modifiedDay.meals[mealType].length;
                            if (beforeCount > afterCount) {
                                changesMade.push(`Removed ${toRemove.foodName} from ${mealType}`);
                            }
                        }
                    }
                } else if (aiPlan.target) {
                    // Remove entire meal section
                    const mealKey = findMealKey(aiPlan.target);
                    if (modifiedDay.meals[mealKey]) {
                        modifiedDay.meals[mealKey] = [];
                        changesMade.push(`Cleared all ${mealKey} items`);
                    }
                }
                break;

            case 'add_workout':
                // Add workouts
                console.log('[AI EDIT] Processing add_workout intent');
                console.log('[AI EDIT] aiPlan.workoutsToAdd:', aiPlan.workoutsToAdd);
                console.log('[AI EDIT] Available workouts count:', allWorkouts.length);

                // Log first workout structure to understand schema
                if (allWorkouts.length > 0) {
                    console.log('[AI EDIT] Sample workout structure:', {
                        name: allWorkouts[0].name,
                        category: allWorkouts[0].category,
                        muscle_group: allWorkouts[0].muscle_group,
                        type: allWorkouts[0].type,
                        muscleGroups: allWorkouts[0].muscleGroups
                    });
                }

                if (aiPlan.workoutsToAdd && aiPlan.workoutsToAdd.length > 0) {
                    for (const workoutName of aiPlan.workoutsToAdd) {
                        console.log('[AI EDIT] Looking for workout:', workoutName);
                        let lowerName = workoutName.toLowerCase().trim();

                        // normalize "walking" -> "walking (outdoor)" to avoid matching "walking lunge"
                        if (lowerName === 'walking' || lowerName === 'walk') {
                            lowerName = 'walking (outdoor)';
                        }

                        // 1. Try exact or close name match
                        let workoutMatch = allWorkouts.find(w =>
                            w.name.toLowerCase() === lowerName ||
                            w.name.toLowerCase().includes(lowerName) ||
                            lowerName.includes(w.name.toLowerCase())
                        );


                        // 2. Specialized Fallbacks for common terms
                        if (!workoutMatch) {
                            if (lowerName.includes('treadmill') || lowerName.includes('running')) {
                                workoutMatch = allWorkouts.find(w => w.name.toLowerCase().includes('treadmill') || w.name.toLowerCase().includes('running'));
                            } else if (lowerName.includes('bike') || lowerName.includes('cycling')) {
                                workoutMatch = allWorkouts.find(w => w.name.toLowerCase().includes('cycling') || w.name.toLowerCase().includes('bike'));
                            } else if (lowerName.includes('walk')) {
                                // Prefer outdoor walking if just 'walk' is requested
                                workoutMatch = allWorkouts.find(w => w.name.toLowerCase() === 'walking (outdoor)');
                                if (!workoutMatch) workoutMatch = allWorkouts.find(w => w.name.toLowerCase().includes('walking'));
                            }
                        }

                        // 3. Fallback by category
                        if (!workoutMatch) {
                            workoutMatch = allWorkouts.find(w => {
                                if (w.category && w.category.toLowerCase() === lowerName) return true;
                                if (w.muscle_group && w.muscle_group.toLowerCase() === lowerName) return true;
                                return false;
                            });
                        }

                        if (workoutMatch) {
                            console.log('[AI EDIT] Found workout match:', workoutMatch.name);
                            if (!modifiedDay.workouts) modifiedDay.workouts = [];

                            // Determine workoutType based on category
                            const isCardio = (workoutMatch.category && workoutMatch.category.toLowerCase() === 'cardio') ||
                                (workoutMatch.type && workoutMatch.type.toLowerCase() === 'cardio') ||
                                (workoutMatch.name.toLowerCase().includes('run') || workoutMatch.name.toLowerCase().includes('cardio'));

                            // Check if AI provided specific details for this new workout
                            const specificUpdate = aiPlan.workoutsToUpdate?.find(u =>
                                u.name.toLowerCase().includes(workoutMatch.name.toLowerCase()) ||
                                workoutMatch.name.toLowerCase().includes(u.name.toLowerCase())
                            );

                            const workoutEntry = {
                                workoutId: workoutMatch._id,
                                name: workoutMatch.name,
                                workoutType: isCardio ? 'cardio' : 'strength',
                                muscle_group: workoutMatch.muscle_group || '',
                            };

                            if (isCardio) {
                                let duration = 30;
                                if (specificUpdate?.duration) {
                                    duration = parseInt(specificUpdate.duration) || 30;
                                } else {
                                    // Try to extract duration from the requested name (e.g. "Running 25 mins")
                                    const durMatch = workoutName.match(/(\d+)\s*(min|minute)/i);
                                    if (durMatch) {
                                        duration = parseInt(durMatch[1]) || 30;
                                        console.log(`[AI EDIT] Extracted duration from name: ${duration} min`);
                                    }
                                }
                                workoutEntry.minutes = duration;
                                console.log(`[AI EDIT] Added as cardio with duration: ${workoutEntry.minutes} minutes`);
                            } else {
                                const numSets = Math.max(1, Math.min(10, parseInt(specificUpdate?.sets) || 3));
                                const repVal = Math.max(1, parseInt(specificUpdate?.reps) || 10);
                                const weightVal = Math.max(0, parseFloat(specificUpdate?.weight) || 0);

                                workoutEntry.sets = Array(isNaN(numSets) ? 3 : numSets).fill(null).map(() => ({
                                    reps: isNaN(repVal) ? 10 : repVal,
                                    weight: isNaN(weightVal) ? 0 : weightVal
                                }));
                                console.log(`[AI EDIT] Added as strength with ${numSets} sets of ${repVal} at ${weightVal}kg`);
                            }

                            modifiedDay.workouts.push(workoutEntry);
                            changesMade.push(`Added ${workoutMatch.name}`);
                        }
                        else {
                            console.warn('[AI EDIT] No workout found for:', workoutName);
                            console.warn('[AI EDIT] Available categories:', [...new Set(allWorkouts.map(w => w.category).filter(Boolean))]);
                            changesMade.push(`⚠️ Could not find workout: ${workoutName}`);
                        }
                    }
                } else {
                    console.warn('[AI EDIT] No workoutsToAdd in aiPlan');
                    // Try to add a generic cardio workout as fallback
                    const cardioWorkout = allWorkouts.find(w => w.category?.toLowerCase() === 'cardio' || w.type?.toLowerCase() === 'cardio');
                    if (cardioWorkout) {
                        if (!modifiedDay.workouts) modifiedDay.workouts = [];
                        modifiedDay.workouts.push({
                            workoutId: cardioWorkout._id,
                            name: cardioWorkout.name,
                            workoutType: 'cardio',
                            muscle_group: cardioWorkout.muscle_group || '',
                            minutes: 20,
                            isCompleted: false
                        });
                        changesMade.push(`Added ${cardioWorkout.name} (20 min)`);
                    } else {
                        changesMade.push('⚠️ No cardio workouts available in database');
                    }
                }
                break;

            case 'remove_workout':
                // Remove workouts
                if (aiPlan.workoutsToRemove && modifiedDay.workouts) {
                    for (const workoutName of aiPlan.workoutsToRemove) {
                        const beforeCount = modifiedDay.workouts.length;
                        modifiedDay.workouts = modifiedDay.workouts.filter(
                            w => !w.name.toLowerCase().includes(workoutName.toLowerCase())
                        );
                        const afterCount = modifiedDay.workouts.length;
                        if (beforeCount > afterCount) {
                            changesMade.push(`Removed ${workoutName}`);
                        }
                    }
                }
                break;

            case 'swap_workout':
                // Swap workout (remove old, add new)
                console.log('[AI EDIT] Processing swap_workout');
                if (modifiedDay.workouts && (aiPlan.workoutsToRemove || aiPlan.workoutsToAdd)) {
                    // Remove old workout
                    if (aiPlan.workoutsToRemove) {
                        for (const workoutName of aiPlan.workoutsToRemove) {
                            const beforeCount = modifiedDay.workouts.length;
                            modifiedDay.workouts = modifiedDay.workouts.filter(
                                w => !w.name.toLowerCase().includes(workoutName.toLowerCase())
                            );
                            if (modifiedDay.workouts.length < beforeCount) {
                                changesMade.push(`Removed ${workoutName}`);
                            }
                        }
                    }

                    // Add new workout
                    if (aiPlan.workoutsToAdd) {
                        for (const workoutName of aiPlan.workoutsToAdd) {
                            const lowerName = workoutName.toLowerCase().trim();
                            // INTELLIGENT MATCHING
                            // Use scoring to find the BEST match, not just the first one
                            const findBestWorkoutMatch = (query, workouts) => {
                                if (!query) return null;
                                const q = query.toLowerCase().trim();
                                const qWords = q.split(/\s+/).filter(w => w.length > 2);

                                let bestMatch = null;
                                let bestScore = 0;

                                for (const w of workouts) {
                                    const name = w.name.toLowerCase();
                                    let score = 0;

                                    // 1. Exact Match (Highest Priority)
                                    if (name === q) score += 100;

                                    // 2. Contains whole phrase
                                    else if (name.includes(q)) score += 60;

                                    // 3. Reverse contains (User typed more than name)
                                    else if (q.includes(name)) score += 50;

                                    // 4. Word Overlap (Fuzzy)
                                    else {
                                        let matches = 0;
                                        qWords.forEach(word => {
                                            if (name.includes(word)) matches++;
                                        });
                                        if (matches > 0) score += (matches * 10);
                                    }

                                    // Penalize "Incline" or "Decline" if user didn't ask for it
                                    if (!q.includes('incline') && name.includes('incline')) score -= 25;
                                    if (!q.includes('decline') && name.includes('decline')) score -= 25;

                                    // Penalize length difference (prefer concise matches)
                                    const lenDiff = Math.abs(name.length - q.length);
                                    score -= (lenDiff * 0.5);

                                    if (score > bestScore) {
                                        bestScore = score;
                                        bestMatch = w;
                                    }
                                }
                                return bestMatch;
                            };

                            let workoutMatch = findBestWorkoutMatch(workoutName, allWorkouts);

                            if (workoutMatch) {
                                const isCardio = (workoutMatch.category?.toLowerCase() === 'cardio') ||
                                    (workoutMatch.type?.toLowerCase() === 'cardio');

                                const workoutEntry = {
                                    workoutId: workoutMatch._id,
                                    name: workoutMatch.name,
                                    workoutType: isCardio ? 'cardio' : 'strength',
                                    muscle_group: workoutMatch.muscle_group || '',
                                };

                                if (isCardio) {
                                    workoutEntry.minutes = 30;
                                } else {
                                    workoutEntry.sets = Array(3).fill(null).map(() => ({
                                        reps: 10,
                                        weight: 0
                                    }));
                                }

                                modifiedDay.workouts.push(workoutEntry);
                                changesMade.push(`Added ${workoutMatch.name}`);
                            } else {
                                changesMade.push(`⚠️ Could not find workout: ${workoutName}`);
                            }
                        }
                    }
                } else {
                    console.warn('[AI EDIT] swap_workout: Missing workouts array or swap data');
                }
                break;

            case 'update_workout':
                // Update specific workout details
                console.log('[AI EDIT] Processing update_workout');
                if (aiPlan.workoutsToUpdate && modifiedDay.workouts && modifiedDay.workouts.length > 0) {
                    for (const updateDef of aiPlan.workoutsToUpdate) {
                        console.log('[AI EDIT] Looking for workout to update:', updateDef.name);
                        console.log('[AI EDIT] Available workouts:', modifiedDay.workouts.map(w => w.name));

                        let workoutToUpdate = modifiedDay.workouts.find(w =>
                            w.name.toLowerCase().includes(updateDef.name.toLowerCase()) ||
                            updateDef.name.toLowerCase().includes(w.name.toLowerCase())
                        );

                        // If no match found and the name is generic, use the last workout
                        if (!workoutToUpdate && (updateDef.name === 'workout' || updateDef.name.length < 5)) {
                            workoutToUpdate = modifiedDay.workouts[modifiedDay.workouts.length - 1];
                            console.log('[AI EDIT] Using last workout as fallback:', workoutToUpdate.name);
                        }

                        if (workoutToUpdate) {
                            const isCardio = workoutToUpdate.workoutType === 'cardio' || !!workoutToUpdate.minutes;

                            if (isCardio && updateDef.duration) {
                                workoutToUpdate.minutes = updateDef.duration;
                                changesMade.push(`Updated ${workoutToUpdate.name} duration to ${updateDef.duration} min`);
                            } else if (!isCardio) {
                                // Strength workout - preserve existing values if not specified
                                const currentSets = workoutToUpdate.sets || [];

                                // Determine how many sets we want
                                let targetSetCount = currentSets.length || 3;
                                if (Array.isArray(updateDef.sets)) {
                                    targetSetCount = updateDef.sets.length;
                                } else if (typeof updateDef.sets === 'number') {
                                    targetSetCount = updateDef.sets;
                                }

                                // Smart update: iterate and merge
                                const newSets = [];
                                for (let i = 0; i < targetSetCount; i++) {
                                    // Use existing set, or clone the last one, or default
                                    const existing = currentSets[i] || currentSets[currentSets.length - 1] || { reps: 10, weight: 0 };

                                    // Check if we have specific data for THIS set (from AI array)
                                    // Handle cases where AI returns a single array for all sets (e.g. weight: [10, 20, 30])
                                    // OR an array of objects (if structure matches)

                                    const explicitSetData = Array.isArray(updateDef.sets) ? updateDef.sets[i] : null;

                                    // Extract explicit value from parallel arrays if they exist
                                    const explicitWeight = Array.isArray(updateDef.weight) ? updateDef.weight[i] : updateDef.weight;
                                    const explicitReps = Array.isArray(updateDef.reps) ? updateDef.reps[i] : updateDef.reps;

                                    newSets.push({
                                        // Priority: Explicit object data > Explicit index in array > Global value > Existing
                                        reps: explicitSetData?.reps ?? explicitReps ?? updateDef.reps ?? existing.reps,
                                        weight: explicitSetData?.weight ?? explicitWeight ?? updateDef.weight ?? existing.weight,
                                        // Preserve metadata
                                        completed: existing.completed || false
                                    });
                                }
                                workoutToUpdate.sets = newSets;

                                let updateMsg = `Updated ${workoutToUpdate.name}`;
                                if (updateDef.sets) updateMsg += ` to ${updateDef.sets} sets`;
                                if (updateDef.reps) updateMsg += ` with ${updateDef.reps} reps`;
                                if (updateDef.weight !== undefined) updateMsg += ` at ${updateDef.weight}kg`;

                                changesMade.push(updateMsg);
                            }
                        } else {
                            console.warn('[AI EDIT] No workout found to update');
                            changesMade.push(`⚠️ Could not find workout to update: ${updateDef.name}`);
                        }
                    }
                }
                break;

            case 'adjust_macros':
                // Intelligent macro adjustment
                const currentMacros = calculateDayMacros(modifiedDay.meals);
                const deficit = {
                    protein: userTargets.protein - currentMacros.protein,
                    calories: userTargets.calories - currentMacros.calories
                };

                if (deficit.protein > 10) {
                    // Add high-protein food
                    const proteinFood = smartBuffet.find(f => f.p > 20 && f.name.toLowerCase().includes('chicken'));
                    if (proteinFood && modifiedDay.meals.lunch) {
                        const qty = Math.ceil((deficit.protein / proteinFood.p) * 100);
                        const ratio = qty / 100;
                        modifiedDay.meals.lunch.push({
                            foodId: proteinFood._id,
                            name: proteinFood.name,
                            quantity: qty,
                            unit: 'grams',
                            calories: Math.round(proteinFood.cal * ratio),
                            protein: Math.round(proteinFood.p * ratio),
                            carbs: Math.round(proteinFood.c * ratio),
                            fats: Math.round(proteinFood.f * ratio),
                            caloriesPer100g: proteinFood.cal,
                            proteinPer100g: proteinFood.p,
                            carbsPer100g: proteinFood.c,
                            fatsPer100g: proteinFood.f
                        });
                        changesMade.push(`Added ${proteinFood.name} (${qty}g) to boost protein`);
                    }
                }
                break;

            case 'general_edit':
            default:
                // General AI-driven edit
                changesMade.push("Applied general modifications based on your request");
                break;
        }

        const responseMessage = changesMade.length > 0
            ? `✅ ${changesMade.join('. ')}\n${aiPlan.reasoning || ''}`
            : `⚠️ No changes made. ${aiPlan.reasoning || 'Try being more specific.'}`;

        res.json({
            success: changesMade.length > 0,
            modifiedDay,
            message: responseMessage,
            changes: changesMade,
            aiReasoning: aiPlan.reasoning
        });

    } catch (error) {
        console.error('[AI EDIT] Critical Error:', error);
        res.status(500).json({
            success: false,
            message: `AI edit failed: ${error.message}`,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.suggestPlanImprovements = async (req, res) => res.status(501).json({ message: 'Not implemented' });

// Helper function to find best food match
function findBestFoodMatch(query, buffet, targets) {
    const lowerQuery = query.toLowerCase().trim();

    console.log(`[FOOD MATCH] Searching for: "${lowerQuery}"`);

    // Exact match
    let match = buffet.find(f => f.name.toLowerCase() === lowerQuery);
    if (match) {
        console.log(`[FOOD MATCH] Exact match found: ${match.name}`);
        return match;
    }

    // Partial match - check if query is contained in food name
    match = buffet.find(f => f.name.toLowerCase().includes(lowerQuery));
    if (match) {
        console.log(`[FOOD MATCH] Partial match found: ${match.name}`);
        return match;
    }

    // Reverse - check if food name is contained in query (for longer queries)
    match = buffet.find(f => lowerQuery.includes(f.name.toLowerCase()));
    if (match) {
        console.log(`[FOOD MATCH] Reverse match found: ${match.name}`);
        return match;
    }

    // Word-by-word match (handles "diet coke" matching "Diet Cola")
    const queryWords = lowerQuery.split(/\s+/);
    match = buffet.find(f => {
        const foodWords = f.name.toLowerCase().split(/\s+/);
        // Check if all query words appear in the food name
        return queryWords.every(qw => foodWords.some(fw => fw.includes(qw) || qw.includes(fw)));
    });
    if (match) {
        console.log(`[FOOD MATCH] Word-by-word match found: ${match.name}`);
        return match;
    }

    // Special handling for common drink keywords
    const drinkKeywords = {
        'coke': 'cola',
        'pepsi': 'pepsi',
        'diet': 'diet',
        'water': 'water',
        'tea': 'tea',
        'coffee': 'coffee',
        'juice': 'juice',
        'milk': 'milk'
    };

    for (const [keyword, searchTerm] of Object.entries(drinkKeywords)) {
        if (lowerQuery.includes(keyword)) {
            // Priority 1: Strict match (must be in drinks category)
            let drinkMatch = buffet.find(f =>
                f.category === 'drinks' &&
                f.name.toLowerCase().includes(searchTerm)
            );

            // Priority 2: Lenient match (any category, maybe misclassified)
            if (!drinkMatch) {
                drinkMatch = buffet.find(f =>
                    f.name.toLowerCase().includes(searchTerm) &&
                    (f.category === 'drinks' || f.cal < 50) // Sanity check: drinks are usually low cal
                );
            }

            if (drinkMatch) {
                console.log(`[FOOD MATCH] Drink keyword match found: ${drinkMatch.name}`);
                return drinkMatch;
            }
        }
    }

    // If query mentions protein, return high-protein food
    if (lowerQuery.includes('protein')) {
        match = buffet.find(f => f.p > 20);
        if (match) {
            console.log(`[FOOD MATCH] High-protein fallback: ${match.name}`);
            return match;
        }
    }

    // Return a balanced food as last resort
    match = buffet.find(f => f.p > 15 && f.cal < 200);
    console.log(`[FOOD MATCH] Last resort fallback: ${match?.name || 'none'}`);
    return match;
}

// Helper to calculate day macros
function calculateDayMacros(meals) {
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    if (!meals) return totals;

    Object.values(meals).forEach(mealArray => {
        if (Array.isArray(mealArray)) {
            mealArray.forEach(item => {
                totals.calories += item.calories || 0;
                totals.protein += item.protein || 0;
                totals.carbs += item.carbs || 0;
                totals.fats += item.fats || 0;
            });
        }
    });

    return totals;
}


