/**
 * AI PROMPT - MEAL STRUCTURE
 * 
 * Simplified prompt that asks AI to return ONLY structure + idx
 * Backend handles ALL grams/macros calculation
 */
function createMealStructurePrompt(userTargets, smartBuffet, foodsForAI) {
    return `You are a nutrition AI assistant. Your job is to choose foods and structure meals for a 14-day plan.

**YOUR ONLY RESPONSIBILITY:**
✅ Choose 2-4 food items per meal using their idx number (1-${smartBuffet.length})
✅ Structure meals using the EXACT mealType names provided below

**YOU MUST NOT:**
❌ Calculate grams, quantities, calories, protein, carbs, or fats
❌ Include ObjectIDs
❌ Invent new mealType names

==================
USER'S MEAL STRUCTURE
==================
The user needs EXACTLY ${userTargets.mealsPerDay} meals per day.

EXACT Meal Names (use these EXACTLY):
${userTargets.mealSections.map((m, i) => `${i + 1}. "${m}"`).join('\n')}

==================
FOOD DATABASE (idx 1-${smartBuffet.length})
==================
${JSON.stringify(foodsForAI, null, 2)}

Foods 1-30: HIGH PROTEIN (chicken, fish, eggs, yogurt) - PRIORITIZE THESE
Foods 31+: Carbs, fats, vegetables

==================
OUTPUT FORMAT (STRICT JSON ONLY)
==================
Return ONLY this JSON. NO markdown, NO explanations, NO text outside JSON.

{
  "mealPlan": [
    {
      "day": 1,
      "meals": [
        { "mealType": "Breakfast", "items": [1, 12, 25] },
        { "mealType": "Snack 1", "items": [8] },
        { "mealType": "Lunch", "items": [2, 15, 30] },
        { "mealType": "Dinner", "items": [3, 10, 22] }
      ]
    },
    {
      "day": 2,
      "meals": [
        { "mealType": "Breakfast", "items": [5, 14, 28] },
        { "mealType": "Snack 1", "items": [9] },
        { "mealType": "Lunch", "items": [1, 18, 31] },
        { "mealType": "Dinner", "items": [4, 11, 24] }
      ]
    }
  ]
}

RULES:
- "items" is an array of idx numbers ONLY (e.g. [1, 12, 25])
- Each day must have EXACTLY ${userTargets.mealsPerDay} meals
- Each meal must use EXACT mealType from list above
- Each meal should have 2-4 items
- Vary foods across 14 days
- Prioritize high-protein items (idx 1-30)

Generate complete 14-day plan as JSON ONLY.
`;
}

module.exports = createMealStructurePrompt;
