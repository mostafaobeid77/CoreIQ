
export const getMealSections = (goalWeight: string | undefined): string[] => {
    if (!goalWeight) return ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

    const normalizedGoal = goalWeight.toLowerCase();
    if (normalizedGoal.includes('lose')) {
        // Cutting: fewer meals/snacks generally preferred, but could be personal preference. 
        // Let's stick to standard 3 + 1 snack for consistency with "min: 3, max: 4" logic
        return ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
    } else if (normalizedGoal.includes('gain')) {
        // Bulking: more frequent meals
        return ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];
    }

    // Maintenance / Default
    return ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
};
