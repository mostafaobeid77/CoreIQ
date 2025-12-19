/**
 * GENERATE DETERMINISTIC WORKOUTS
 * 
 * Generates a 14-day workout plan based on user goal and activity level.
 */

function generateDeterministicWorkouts(activityLevel, goal, availableWorkouts) {
    // 1. Determine Split
    let split = 'Full Body';
    let daysPerWeek = 3;

    if (activityLevel === 'Active' || activityLevel === 'Very Active') {
        split = 'Upper/Lower';
        daysPerWeek = 4;
        if (goal.includes('Gain')) {
            split = 'PPL';
            daysPerWeek = 6;
        }
    } else if (goal.includes('Gain')) {
        split = 'Upper/Lower';
        daysPerWeek = 4;
    }

    const template = getSplitTemplate(split);
    const plan = [];

    // Filter workouts by type
    const strengthWorkouts = availableWorkouts.filter(w => w.type === 'strength');
    const cardioWorkouts = availableWorkouts.filter(w => w.type === 'cardio');

    for (let day = 1; day <= 14; day++) {
        const dayOfWeek = (day - 1) % 7; // 0-6
        const splitDay = template[dayOfWeek]; // e.g. "Upper", "Rest", "Cardio"

        const dayWorkouts = [];

        if (splitDay === 'Rest') {
            // No workouts
        } else if (splitDay === 'Cardio' || splitDay === 'Active Recovery') {
            const cardio = cardioWorkouts[Math.floor(Math.random() * cardioWorkouts.length)];
            if (cardio) {
                dayWorkouts.push({
                    workoutId: cardio._id,
                    workoutType: 'cardio',
                    name: cardio.name,
                    minutes: 30
                });
            }
        } else {
            // Strength Day
            const targetMuscle = splitDay; // "Upper", "Lower", "Push"
            const suitable = strengthWorkouts.filter(w => w.muscle_group.includes(targetMuscle) || w.muscle_group === 'Full Body');

            // Pick 1 main workout
            const pick = suitable.length > 0
                ? suitable[Math.floor(Math.random() * suitable.length)]
                : strengthWorkouts[0];

            if (pick) {
                dayWorkouts.push({
                    workoutId: pick._id,
                    workoutType: 'strength',
                    name: pick.name,
                    sets: [
                        { reps: 12, weight: 0 },
                        { reps: 12, weight: 0 },
                        { reps: 10, weight: 0 }
                    ]
                });
            }
        }

        plan.push({
            day: day,
            workouts: dayWorkouts
        });
    }

    return plan;
}

function getSplitTemplate(split) {
    // 7-day templates
    const templates = {
        'Full Body': ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Active Recovery'],
        'Upper/Lower': ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Cardio'],
        'PPL': ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Rest'] // modified slightly to fit 6 day
    };
    return templates[split] || templates['Full Body'];
}

module.exports = generateDeterministicWorkouts;
