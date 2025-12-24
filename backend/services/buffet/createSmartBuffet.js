/**
 * CREATE SMART BUFFET
 * 
 * Creates limited, BALANCED food selection for AI
 * GUARANTEES at least 15 high-protein and 10 calorie-dense foods
 */
function createSmartBuffet(foods, count = 60) {
    const proteinFoods = [];
    const calorieBoosters = [];
    const balancedFoods = [];
    const carbFoods = [];
    const drinks = []; // NEW: Track drinks separately
    const otherFoods = [];

    foods.forEach(food => {
        const nutrients = food.nutrients || food.nutrients_per_100g || {};
        const p = nutrients.protein || 0;
        const c = nutrients.carbs || 0;
        const cal = nutrients.calories || 0;
        const category = food.category || '';

        // Drinks get special treatment - always include them
        if (category === 'drinks') {
            drinks.push(food);
            return; // Skip other categorization
        }

        if (p >= 18) proteinFoods.push(food);
        if (cal >= 250) calorieBoosters.push(food);
        if (p >= 10 && p <= 25 && cal >= 150 && cal <= 400) balancedFoods.push(food);
        if (c > 40 && p < 10) carbFoods.push(food);
        if (p < 18 && cal < 250) otherFoods.push(food);
    });

    console.log(`🔍 [BUFFET DEBUG] Total foods: ${foods.length}, Drinks found: ${drinks.length}, First drink:`, drinks[0] ? { name: drinks[0].name, category: drinks[0].category } : 'none');

    const selected = [];

    // GUARANTEE: At least 15 high-protein foods
    const proteinToAdd = proteinFoods
        .sort((a, b) => (b.nutrients?.protein || 0) - (a.nutrients?.protein || 0))
        .slice(0, Math.max(15, Math.floor(count * 0.25)));
    selected.push(...proteinToAdd);

    // GUARANTEE: At least 10 calorie boosters
    const boostersToAdd = calorieBoosters
        .filter(f => !selected.includes(f))
        .sort((a, b) => (b.nutrients?.calories || 0) - (a.nutrients?.calories || 0))
        .slice(0, Math.max(10, Math.floor(count * 0.15)));
    selected.push(...boostersToAdd);

    // GUARANTEE: STAPLE CARBS/FATS (Emergency Balancers)
    const staples = ['Rice', 'Oats', 'Potato', 'Pasta', 'Avocado', 'Nuts', 'Olive Oil'];
    const stapleFoods = foods.filter(f =>
        staples.some(s => f.name.includes(s)) && !selected.includes(f)
    );
    selected.push(...stapleFoods.slice(0, 8));

    // GUARANTEE: ALL DRINKS (Essential for meal plans)
    selected.push(...drinks);

    // Fill rest with balanced and carbs
    const remaining = count - selected.length;
    const balancedToAdd = balancedFoods.filter(f => !selected.includes(f)).slice(0, Math.floor(remaining * 0.6));
    const carbsToAdd = carbFoods.filter(f => !selected.includes(f)).slice(0, Math.floor(remaining * 0.4));
    selected.push(...balancedToAdd, ...carbsToAdd);

    // Fill remaining slots
    if (selected.length < count) {
        const fillFoods = otherFoods.filter(f => !selected.includes(f)).slice(0, count - selected.length);
        selected.push(...fillFoods);
    }

    const finalSelection = selected.slice(0, count);

    console.log(`📊 Buffet: ${proteinToAdd.length} high-protein (≥18g), ${boostersToAdd.length} calorie-boosters (≥250kcal), ${drinks.length} drinks, ${finalSelection.length} total`);

    return finalSelection.map((food, index) => {
        const n = food.nutrients || food.nutrients_per_100g || {};
        return {
            idx: index + 1,
            _id: food._id.toString(),
            name: food.name,
            category: food.category, // NEW: Include category for drink filtering
            cal: Math.round(n.calories || 0),
            p: Math.round(n.protein || 0),
            c: Math.round(n.carbs || 0),
            f: Math.round(n.fat || 0)
        };
    });
}

module.exports = createSmartBuffet;
