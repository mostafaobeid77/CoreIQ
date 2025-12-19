const workoutTemplates = {
    PPL: {
        name: 'Push/Pull/Legs',
        description: 'Classic 6-day split focusing on push, pull, and leg movements',
        daysPerWeek: 6,
        difficulty: 'intermediate',
        goal: ['Gain Weight', 'Maintain Weight'],
        schedule: {
            day1: 'Push',
            day2: 'Pull',
            day3: 'Legs',
            day4: 'Push',
            day5: 'Pull',
            day6: 'Legs',
            day7: 'Rest'
        },
        workouts: {
            Push: [
                { name: 'Bench Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'chest' },
                { name: 'Overhead Press', sets: 3, reps: 10, type: 'compound', muscleGroup: 'shoulders' },
                { name: 'Incline Dumbbell Press', sets: 3, reps: 12, type: 'compound', muscleGroup: 'chest' },
                { name: 'Lateral Raises', sets: 3, reps: 15, type: 'isolation', muscleGroup: 'shoulders' },
                { name: 'Tricep Pushdowns', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'triceps' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'triceps' }
            ],
            Pull: [
                { name: 'Deadlifts', sets: 4, reps: 6, type: 'compound', muscleGroup: 'back' },
                { name: 'Pull-ups', sets: 3, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Barbell Rows', sets: 4, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Face Pulls', sets: 3, reps: 15, type: 'isolation', muscleGroup: 'rear-delts' },
                { name: 'Barbell Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Hammer Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'biceps' }
            ],
            Legs: [
                { name: 'Squats', sets: 4, reps: 8, type: 'compound', muscleGroup: 'quads' },
                { name: 'Romanian Deadlifts', sets: 3, reps: 10, type: 'compound', muscleGroup: 'hamstrings' },
                { name: 'Leg Press', sets: 3, reps: 12, type: 'compound', muscleGroup: 'quads' },
                { name: 'Leg Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'hamstrings' },
                { name: 'Calf Raises', sets: 4, reps: 15, type: 'isolation', muscleGroup: 'calves' }
            ]
        }
    },

    Arnold: {
        name: 'Arnold Split',
        description: 'Arnold Schwarzenegger\'s famous 6-day split',
        daysPerWeek: 6,
        difficulty: 'advanced',
        goal: ['Gain Weight'],
        schedule: {
            day1: 'Chest/Back',
            day2: 'Shoulders/Arms',
            day3: 'Legs',
            day4: 'Chest/Back',
            day5: 'Shoulders/Arms',
            day6: 'Legs',
            day7: 'Rest'
        },
        workouts: {
            'Chest/Back': [
                { name: 'Bench Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'chest' },
                { name: 'Barbell Rows', sets: 4, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Incline Dumbbell Press', sets: 3, reps: 10, type: 'compound', muscleGroup: 'chest' },
                { name: 'Pull-ups', sets: 3, reps: 10, type: 'compound', muscleGroup: 'back' },
                { name: 'Dumbbell Flyes', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'chest' },
                { name: 'Cable Rows', sets: 3, reps: 12, type: 'compound', muscleGroup: 'back' }
            ],
            'Shoulders/Arms': [
                { name: 'Overhead Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'shoulders' },
                { name: 'Lateral Raises', sets: 4, reps: 12, type: 'isolation', muscleGroup: 'shoulders' },
                { name: 'Front Raises', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'shoulders' },
                { name: 'Barbell Curls', sets: 4, reps: 10, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Tricep Dips', sets: 4, reps: 10, type: 'compound', muscleGroup: 'triceps' },
                { name: 'Hammer Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'triceps' }
            ],
            Legs: [
                { name: 'Squats', sets: 5, reps: 8, type: 'compound', muscleGroup: 'quads' },
                { name: 'Leg Press', sets: 4, reps: 12, type: 'compound', muscleGroup: 'quads' },
                { name: 'Leg Extensions', sets: 3, reps: 15, type: 'isolation', muscleGroup: 'quads' },
                { name: 'Leg Curls', sets: 4, reps: 12, type: 'isolation', muscleGroup: 'hamstrings' },
                { name: 'Calf Raises', sets: 5, reps: 15, type: 'isolation', muscleGroup: 'calves' }
            ]
        }
    },

    UpperLower: {
        name: 'Upper/Lower',
        description: '4-day split alternating upper and lower body',
        daysPerWeek: 4,
        difficulty: 'beginner',
        goal: ['Gain Weight', 'Maintain Weight', 'Lose Weight'],
        schedule: {
            day1: 'Upper',
            day2: 'Lower',
            day3: 'Rest',
            day4: 'Upper',
            day5: 'Lower',
            day6: 'Rest',
            day7: 'Rest'
        },
        workouts: {
            Upper: [
                { name: 'Bench Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'chest' },
                { name: 'Barbell Rows', sets: 4, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Overhead Press', sets: 3, reps: 10, type: 'compound', muscleGroup: 'shoulders' },
                { name: 'Pull-ups', sets: 3, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Dumbbell Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Tricep Pushdowns', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'triceps' }
            ],
            Lower: [
                { name: 'Squats', sets: 4, reps: 8, type: 'compound', muscleGroup: 'quads' },
                { name: 'Romanian Deadlifts', sets: 3, reps: 10, type: 'compound', muscleGroup: 'hamstrings' },
                { name: 'Leg Press', sets: 3, reps: 12, type: 'compound', muscleGroup: 'quads' },
                { name: 'Leg Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'hamstrings' },
                { name: 'Calf Raises', sets: 4, reps: 15, type: 'isolation', muscleGroup: 'calves' }
            ]
        }
    },

    FullBody: {
        name: 'Full Body',
        description: '3-day full body workout covering all major muscle groups',
        daysPerWeek: 3,
        difficulty: 'beginner',
        goal: ['Lose Weight', 'Maintain Weight'],
        schedule: {
            day1: 'Full Body',
            day2: 'Rest',
            day3: 'Full Body',
            day4: 'Rest',
            day5: 'Full Body',
            day6: 'Rest',
            day7: 'Rest'
        },
        workouts: {
            'Full Body': [
                { name: 'Squats', sets: 4, reps: 8, type: 'compound', muscleGroup: 'quads' },
                { name: 'Bench Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'chest' },
                { name: 'Barbell Rows', sets: 4, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Overhead Press', sets: 3, reps: 10, type: 'compound', muscleGroup: 'shoulders' },
                { name: 'Romanian Deadlifts', sets: 3, reps: 10, type: 'compound', muscleGroup: 'hamstrings' },
                { name: 'Pull-ups', sets: 3, reps: 8, type: 'compound', muscleGroup: 'back' }
            ]
        }
    },

    BroSplit: {
        name: 'Bro Split',
        description: 'Classic 5-day bodybuilding split, one muscle group per day',
        daysPerWeek: 5,
        difficulty: 'intermediate',
        goal: ['Gain Weight'],
        schedule: {
            day1: 'Chest',
            day2: 'Back',
            day3: 'Shoulders',
            day4: 'Arms',
            day5: 'Legs',
            day6: 'Rest',
            day7: 'Rest'
        },
        workouts: {
            Chest: [
                { name: 'Bench Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'chest' },
                { name: 'Incline Dumbbell Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'chest' },
                { name: 'Cable Flyes', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'chest' },
                { name: 'Dips', sets: 3, reps: 10, type: 'compound', muscleGroup: 'chest' }
            ],
            Back: [
                { name: 'Deadlifts', sets: 4, reps: 6, type: 'compound', muscleGroup: 'back' },
                { name: 'Pull-ups', sets: 4, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Barbell Rows', sets: 4, reps: 8, type: 'compound', muscleGroup: 'back' },
                { name: 'Cable Rows', sets: 3, reps: 12, type: 'compound', muscleGroup: 'back' },
                { name: 'Face Pulls', sets: 3, reps: 15, type: 'isolation', muscleGroup: 'rear-delts' }
            ],
            Shoulders: [
                { name: 'Overhead Press', sets: 4, reps: 8, type: 'compound', muscleGroup: 'shoulders' },
                { name: 'Lateral Raises', sets: 4, reps: 12, type: 'isolation', muscleGroup: 'shoulders' },
                { name: 'Front Raises', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'shoulders' },
                { name: 'Rear Delt Flyes', sets: 3, reps: 15, type: 'isolation', muscleGroup: 'rear-delts' }
            ],
            Arms: [
                { name: 'Barbell Curls', sets: 4, reps: 10, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Tricep Pushdowns', sets: 4, reps: 10, type: 'isolation', muscleGroup: 'triceps' },
                { name: 'Hammer Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'triceps' },
                { name: 'Preacher Curls', sets: 3, reps: 12, type: 'isolation', muscleGroup: 'biceps' },
                { name: 'Tricep Dips', sets: 3, reps: 10, type: 'compound', muscleGroup: 'triceps' }
            ],
            Legs: [
                { name: 'Squats', sets: 5, reps: 8, type: 'compound', muscleGroup: 'quads' },
                { name: 'Leg Press', sets: 4, reps: 12, type: 'compound', muscleGroup: 'quads' },
                { name: 'Leg Extensions', sets: 3, reps: 15, type: 'isolation', muscleGroup: 'quads' },
                { name: 'Leg Curls', sets: 4, reps: 12, type: 'isolation', muscleGroup: 'hamstrings' },
                { name: 'Calf Raises', sets: 5, reps: 15, type: 'isolation', muscleGroup: 'calves' }
            ]
        }
    },

    CardioBurn: {
        name: 'Cardio & Tone',
        description: '5-day mix of HIIT, steady state cardio, and light resistance for maximum calorie burn.',
        daysPerWeek: 5,
        difficulty: 'intermediate',
        goal: ['Lose Weight', 'General Health'],
        schedule: {
            day1: 'HIIT',
            day2: 'Steady Cardio',
            day3: 'Full Body Tone',
            day4: 'HIIT',
            day5: 'Steady Cardio',
            day6: 'Rest',
            day7: 'Rest'
        },
        workouts: {
            HIIT: [
                { name: 'Burpees', sets: 4, reps: 15, type: 'cardio', muscleGroup: 'full' },
                { name: 'Mountain Climbers', sets: 4, reps: 30, type: 'cardio', muscleGroup: 'core' },
                { name: 'Jump Squats', sets: 4, reps: 15, type: 'plyo', muscleGroup: 'legs' },
                { name: 'High Knees', sets: 4, reps: 45, type: 'cardio', muscleGroup: 'legs' },
                { name: 'Plank', sets: 3, reps: 60, type: 'core', muscleGroup: 'core' }
            ],
            'Steady Cardio': [
                { name: 'Running / Jogging', sets: 1, reps: 30, type: 'cardio', muscleGroup: 'legs' }, // 30 mins
                { name: 'Walking Lunges', sets: 3, reps: 20, type: 'resistance', muscleGroup: 'legs' },
                { name: 'Crunches', sets: 3, reps: 20, type: 'core', muscleGroup: 'core' }
            ],
            'Full Body Tone': [
                { name: 'Push-ups', sets: 3, reps: 15, type: 'compound', muscleGroup: 'chest' },
                { name: 'Bodyweight Squats', sets: 3, reps: 20, type: 'compound', muscleGroup: 'legs' },
                { name: 'Dumbbell Rows', sets: 3, reps: 15, type: 'compound', muscleGroup: 'back' },
                { name: 'Shoulder Press', sets: 3, reps: 15, type: 'compound', muscleGroup: 'shoulders' },
                { name: 'Glute Bridges', sets: 3, reps: 20, type: 'isolation', muscleGroup: 'glutes' }
            ]
        }
    }
};

module.exports = workoutTemplates;
