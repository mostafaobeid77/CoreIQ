/**
 * Calorie Calculator Utility
 * Calculates calories burned from workouts and steps
 */

/**
 * Calculate calories burned from steps
 * Formula: steps * 0.04 (100 steps ≈ 4 calories for average adult)
 * @param {number} steps - Number of steps
 * @returns {number} Calories burned
 */
function calculateCaloriesFromSteps(steps) {
    const CALORIES_PER_STEP = 0.04;
    return Math.round(steps * CALORIES_PER_STEP);
}

/**
 * MET (Metabolic Equivalent of Task) values for different workout types
 * MET represents energy cost of physical activities
 */
const MET_VALUES = {
    // Cardio
    'running': 10,
    'jogging': 7,
    'cycling': 8,
    'swimming': 9,
    'walking': 3.5,
    'hiking': 6,
    'rowing': 8.5,

    // Strength Training
    'weightlifting': 6,
    'strength': 5,
    'resistance': 5,
    'bodyweight': 5,
    'crossfit': 8,

    // HIIT & Intensive
    'hiit': 12,
    'circuit': 8,
    'boxing': 9,
    'kickboxing': 10,
    'mma': 10,

    // Low Intensity
    'yoga': 2.5,
    'pilates': 3,
    'stretching': 2,
    'tai chi': 3,

    // Sports
    'basketball': 8,
    'soccer': 10,
    'tennis': 8,
    'volleyball': 4,
    'badminton': 5.5,

    // Default
    'general': 5,
    'other': 5
};

/**
 * Calculate calories burned from workout
 * Formula: (MET * weight_kg * duration_hours)
 * @param {Object} params
 * @param {string} params.workoutType - Type/category of workout
 * @param {number} params.durationMinutes - Duration in minutes
 * @param {number} [params.userWeight=70] - User weight in kg (default 70kg/154lb)
 * @returns {number} Calories burned
 */
function calculateCaloriesFromWorkout({ workoutType, durationMinutes, userWeight = 70 }) {
    if (!durationMinutes || durationMinutes <= 0) {
        return 0;
    }

    // Convert duration to hours
    const durationHours = durationMinutes / 60;

    // Find MET value - check for partial matches in workout type
    let met = MET_VALUES.general;
    const workoutTypeLower = (workoutType || '').toLowerCase();

    for (const [key, value] of Object.entries(MET_VALUES)) {
        if (workoutTypeLower.includes(key)) {
            met = value;
            break;
        }
    }

    // Calculate calories: MET * weight (kg) * time (hours)
    const calories = met * userWeight * durationHours;

    return Math.round(calories);
}

/**
 * Get descriptive calorie burn level
 * @param {number} calories - Calories burned
 * @returns {string} Description
 */
function getCalorieBurnLevel(calories) {
    if (calories < 100) return 'Light activity';
    if (calories < 300) return 'Moderate activity';
    if (calories < 500) return 'High activity';
    return 'Intense activity';
}

module.exports = {
    calculateCaloriesFromSteps,
    calculateCaloriesFromWorkout,
    getCalorieBurnLevel,
    MET_VALUES
};
