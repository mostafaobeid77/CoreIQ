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

// Cache setup
const planCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

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

                const contextStr = `User: ${user.firstName || 'User'}, Goal: ${userTargets.goalWeight || 'Fitness'}, Targets: ${userTargets.calories}kcal, ${userTargets.protein}g Protein`;
                const systemPrompt = `You are CoreIQ, a fitness coach. 
Context: ${contextStr}
Mission: concise, encouraging, actionable advice.
Return JSON: { "reply": "text", "intent": "chat" | "generate_plan" }`;

                const messages = conversation.messages.map(m => ({ role: m.role, content: m.content }));
                messages.unshift({ role: 'system', content: systemPrompt });

                const result = await groqProvider.generateJson(systemPrompt, JSON.stringify(messages.slice(-5))); // Simplified call

                aiResponseContent = result.reply || "I didn't catch that.";
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
exports.editPlan = async (req, res) => res.status(501).json({ message: 'Not implemented' });
exports.suggestPlanImprovements = async (req, res) => res.status(501).json({ message: 'Not implemented' });

