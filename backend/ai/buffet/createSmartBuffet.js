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
    const otherFoods = [];

    foods.forEach(food => {
        const p = food.nutrients?.protein || 0;
        const c = food.nutrients?.carbs || 0;
        const cal = food.nutrients?.calories || 0;

        if (p >= 18) proteinFoods.push(food);
        if (cal >= 250) calorieBoosters.push(food);
        if (p >= 10 && p <= 25 && cal >= 150 && cal <= 400) balancedFoods.push(food);
        if (c > 40 && p < 10) carbFoods.push(food);
        if (p < 18 && cal < 250) otherFoods.push(food);
    });

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

    console.log(`📊 Buffet: ${proteinToAdd.length} high-protein (≥18g), ${boostersToAdd.length} calorie-boosters (≥250kcal), ${finalSelection.length} total`);

    return finalSelection.map((food, index) => ({
        idx: index + 1,
        _id: food._id.toString(),
        name: food.name,
        cal: Math.round(food.nutrients?.calories || 0),
        p: Math.round(food.nutrients?.protein || 0),
        c: Math.round(food.nutrients?.carbs || 0),
        f: Math.round(food.nutrients?.fat || 0)
    }));
}

module.exports = createSmartBuffet;
