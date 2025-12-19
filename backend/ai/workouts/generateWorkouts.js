/**
 * GENERATE DETERMINISTIC WORKOUTS
 * 
 * 100% deterministic workout generation (NO AI)
 * Based purely on activityLevel + goal
 */
function generateWorkouts(activityLevel, goal, availableWorkouts) {
    const workoutDays = [];

    // Define workout patterns based on activity level
    let pattern = [];

    switch (activityLevel) {
        case 'Sedentary':
        case 'Light':
            // 3 days/week - Full Body
            pattern = [
                { type: 'strength', focus: 'Full Body A' },
                { type: 'rest' },
                { type: 'strength', focus: 'Full Body B' },
                { type: 'rest' },
                { type: 'strength', focus: 'Full Body C' },
                { type: 'rest' },
                { type: 'rest' }
            ];
            break;

        case 'Moderate':
            // 4 days/week - Upper/Lower
            pattern = [
                { type: 'strength', focus: 'Upper Body', muscle: 'Chest' },
                { type: 'strength', focus: 'Lower Body', muscle: 'Legs' },
                { type: 'rest' },
                { type: 'strength', focus: 'Upper Body', muscle: 'Back' },
                { type: 'strength', focus: 'Lower Body', muscle: 'Legs' },
                { type: 'rest' },
                { type: 'rest' }
            ];
            break;

        case 'Active':
            // 5 days/week - PPL variation
            pattern = [
                { type: 'strength', focus: 'Push', muscle: 'Chest' },
                { type: 'strength', focus: 'Pull', muscle: 'Back' },
                { type: 'strength', focus: 'Legs', muscle: 'Legs' },
                { type: 'rest' },
                { type: 'strength', focus: 'Upper', muscle: 'Shoulders' },
                { type: 'strength', focus: 'Lower', muscle: 'Legs' },
                { type: 'rest' }
            ];
            break;

        case 'Very Active':
            // 6 days/week - PPL x2
            pattern = [
                { type: 'strength', focus: 'Push', muscle: 'Chest' },
                { type: 'strength', focus: 'Pull', muscle: 'Back' },
                { type: 'strength', focus: 'Legs', muscle: 'Legs' },
                { type: 'strength', focus: 'Push', muscle: 'Shoulders' },
                { type: 'strength', focus: 'Pull', muscle: 'Back' },
                { type: 'strength', focus: 'Legs', muscle: 'Legs' },
                { type: 'rest' }
            ];
            break;

        default:
            pattern = [
                { type: 'strength', focus: 'Full Body' },
                { type: 'rest' },
                { type: 'strength', focus: 'Full Body' },
                { type: 'rest' },
                { type: 'strength', focus: 'Full Body' },
                { type: 'rest' },
                { type: 'rest' }
            ];
    }

    // Add cardio for weight loss goals
    if (goal && goal.includes('Lose')) {
        pattern = pattern.map(d => {
            if (d.type === 'rest') {
                return { type: 'cardio', focus: 'LISS Cardio', minutes: 30 };
            }
            return d;
        });
    }

    // Generate 14 days
    for (let dayNum = 1; dayNum <= 14; dayNum++) {
        const patternDay = pattern[(dayNum - 1) % 7];
        const workouts = [];

        if (patternDay.type === 'strength') {
            // Find workout from database matching muscle group
            const muscleGroup = patternDay.muscle || 'Full Body';
            const workout = availableWorkouts.find(w =>
                w.muscle_group && w.muscle_group.toLowerCase().includes(muscleGroup.toLowerCase())
            ) || availableWorkouts[0];

            if (workout) {
                workouts.push({
                    workoutId: workout._id,
                    name: workout.name,
                    workoutType: 'strength',
                    muscle_group: muscleGroup,
                    sets: [
                        { reps: 10, weight: 0 },
                        { reps: 10, weight: 0 },
                        { reps: 10, weight: 0 }
                    ],
                    minutes: 0
                });
            }
        } else if (patternDay.type === 'cardio') {
            // Find cardio workout
            const cardioWorkout = availableWorkouts.find(w =>
                w.category && w.category.toLowerCase().includes('cardio')
            ) || availableWorkouts[0];

            if (cardioWorkout) {
                workouts.push({
                    workoutId: cardioWorkout._id,
                    name: patternDay.focus || 'Cardio',
                    workoutType: 'cardio',
                    muscle_group: 'Cardio',
                    sets: [],
                    minutes: patternDay.minutes || 20
                });
            }
        }
        // Rest days have empty workouts array

        workoutDays.push({
            day: dayNum,
            workouts: workouts
        });
    }

    return workoutDays;
}

module.exports = generateWorkouts;
