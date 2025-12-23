import { format } from 'date-fns';

export type DashboardStats = {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: number;
  sleep: number;
  mental: string;
  walking: number;
  workouts: number;
  workoutsCompleted?: number;
  workoutsTotal?: number;
  weight: number;
  height: number;
  activityLevel: string;
  goalWeight: string;
  age: number;
  sex: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  caloriesBurnedWorkouts?: number;
  caloriesBurnedSteps?: number;
  totalCaloriesBurned?: number;
};

export const defaultStats: DashboardStats = {
  water: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  meals: 0,
  sleep: 0,
  mental: 'Neutral',
  walking: 0,
  workouts: 0,
  workoutsCompleted: 0,
  workoutsTotal: 0,
  weight: 0,
  height: 0,
  activityLevel: 'Moderate',
  goalWeight: 'Not set',
  age: 25,
  sex: 'male',
};

export function getMostRecentValues(statsByDate: { [date: string]: DashboardStats }) {
  const dates = Object.keys(statsByDate).sort();
  let mostRecentWeight = 0;
  let mostRecentHeight = 0;
  let mostRecentActivityLevel = 'Moderate';
  let mostRecentGoalWeight = 'Not set';
  for (let i = dates.length - 1; i >= 0; i--) {
    const dateStats = statsByDate[dates[i]];
    if (dateStats.weight > 0 && mostRecentWeight === 0) {
      mostRecentWeight = dateStats.weight;
    }
    if (dateStats.height > 0 && mostRecentHeight === 0) {
      mostRecentHeight = dateStats.height;
    }
    if (dateStats.activityLevel && mostRecentActivityLevel === 'Moderate') {
      mostRecentActivityLevel = dateStats.activityLevel;
    }
    if (dateStats.goalWeight && mostRecentGoalWeight === 'Not set') {
      mostRecentGoalWeight = dateStats.goalWeight;
    }
    if (mostRecentWeight > 0 && mostRecentHeight > 0 && mostRecentActivityLevel !== 'Moderate' && mostRecentGoalWeight !== 'Not set') break;
  }
  return { mostRecentWeight, mostRecentHeight, mostRecentActivityLevel, mostRecentGoalWeight };
}

export function getStatsForDate(
  dateKey: string,
  statsByDate: { [date: string]: DashboardStats },
  mostRecent: { mostRecentWeight: number, mostRecentHeight: number, mostRecentActivityLevel: string, mostRecentGoalWeight: string }
) {
  const dateStats = statsByDate[dateKey];
  const isFutureDate = new Date(dateKey) > new Date();
  if (dateStats) {
    return {
      ...dateStats,
      weight: dateStats.weight > 0 ? dateStats.weight : (isFutureDate ? mostRecent.mostRecentWeight : 0),
      height: dateStats.height > 0 ? dateStats.height : (isFutureDate ? mostRecent.mostRecentHeight : 0),
      activityLevel: dateStats.activityLevel || (isFutureDate ? mostRecent.mostRecentActivityLevel : 'Moderate'),
      goalWeight: dateStats.goalWeight || (isFutureDate ? mostRecent.mostRecentGoalWeight : 'Not set'),
      workoutsCompleted: dateStats.workoutsCompleted ?? 0,
      workoutsTotal: dateStats.workoutsTotal ?? 0,
    };
  }
  return {
    ...defaultStats,
    weight: isFutureDate ? mostRecent.mostRecentWeight : 0,
    height: isFutureDate ? mostRecent.mostRecentHeight : 0,
    activityLevel: isFutureDate ? mostRecent.mostRecentActivityLevel : 'Moderate',
    goalWeight: isFutureDate ? mostRecent.mostRecentGoalWeight : 'Not set',
  };
}

export function getMealsPerDay(goalWeight: string | undefined): { min: number, max: number } {
  if (!goalWeight) return { min: 4, max: 5 };
  if (goalWeight.includes('Lose Weight')) return { min: 3, max: 4 }; // 3 meals + light snack
  if (goalWeight.includes('Gain Weight')) return { min: 5, max: 6 }; // 3 meals + 2-3 snacks
  return { min: 4, max: 5 }; // 3 meals + 1-2 snacks
}

export function calculateDailyTargets(stats: DashboardStats) {
  // --- Default fallback if missing data ---
  if (stats.weight <= 0 || stats.height <= 0 || stats.age <= 0) {
    return {
      calories: 2000,
      protein: 120,
      carbs: 250,
      fats: 70,
      water: 2500,
      steps: 10000,
    };
  }

  // --- Step 1: BMR (Mifflin-St Jeor) ---
  let bmr = stats.sex === 'male'
    ? 10 * stats.weight + 6.25 * stats.height - 5 * stats.age + 5
    : 10 * stats.weight + 6.25 * stats.height - 5 * stats.age - 161;

  // --- Step 2: TDEE based on activity level ---
  const activityMultipliers = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Active': 1.725,
    'Very Active': 1.9,
  };
  const tdee = bmr * (activityMultipliers[stats.activityLevel as keyof typeof activityMultipliers] || 1.55);

  // --- Step 3: Adjust for goal ---
  let targetCalories = tdee;
  let proteinPerKg = 2.0;
  let fatPercent = 0.25;
  let waterMultiplier = 40; // ml per kg

  if (stats.goalWeight && stats.goalWeight.includes('Lose')) {
    targetCalories -= 500;       // caloric deficit
    proteinPerKg = 2.2;          // higher protein to preserve muscle
    fatPercent = 0.20;           // lower fat
    waterMultiplier += 5;        // extra hydration
  } else if (stats.goalWeight && stats.goalWeight.includes('Gain')) {
    targetCalories += 300;       // caloric surplus
    proteinPerKg = 1.8;          // slightly lower protein
    fatPercent = 0.30;           // higher fat for hormones
    waterMultiplier += 10;       // extra hydration
  }

  // --- Ensure minimum calories ---
  const minCalories = stats.sex === 'male' ? 1800 : 1400;
  if (targetCalories < minCalories) targetCalories = minCalories;

  // --- Step 4: Macros ---
  const proteins = Math.round(stats.weight * proteinPerKg);
  const fats = Math.round((targetCalories * fatPercent) / 9);
  const carbs = Math.round((targetCalories - (proteins * 4) - (fats * 9)) / 4);

  // --- Step 5: Water (ml/day) ---
  const water = Math.max(Math.round(stats.weight * waterMultiplier), 1500);

  // --- Step 6: Steps based on activity ---
  const stepsMap = {
    'Sedentary': 5000,
    'Light': 7500,
    'Moderate': 10000,
    'Active': 12500,
    'Very Active': 15000,
  };
  const steps = stepsMap[stats.activityLevel as keyof typeof stepsMap] || 10000;

  return {
    calories: Math.round(targetCalories),
    protein: Math.max(proteins, 50),
    carbs: Math.max(carbs, 100),
    fats: Math.max(fats, 30),
    water: water,
    steps: steps,
  };
}
