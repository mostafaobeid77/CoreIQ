import { API_URLS } from '../constants/api';

class WorkoutTemplatesService {
    async getAll() {
        try {
            const response = await fetch(`${API_URLS[0]}/api/workout-templates/templates`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch templates');
            }

            return data.templates;
        } catch (error) {
            console.error('Error fetching workout templates:', error);
            throw error;
        }
    }

    async getById(templateId: string) {
        try {
            const response = await fetch(`${API_URLS[0]}/api/workout-templates/templates/${templateId}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch template');
            }

            return data.template;
        } catch (error) {
            console.error('Error fetching workout template:', error);
            throw error;
        }
    }

    async getRecommended(goal: string) {
        try {
            const response = await fetch(`${API_URLS[0]}/api/workout-templates/templates/recommend/${encodeURIComponent(goal)}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch recommendations');
            }

            return data.templates;
        } catch (error) {
            console.error('Error fetching recommended templates:', error);
            throw error;
        }
    }

    // Helper to apply a template to a 14-day plan
    applyTemplateToPlan(template: any): any[] {
        const planDays = [];

        // Repeat the weekly schedule across 14 days
        for (let day = 1; day <= 14; day++) {
            const dayKey = `day${((day - 1) % 7) + 1}`;
            const workoutName = template.schedule[dayKey];

            if (workoutName === 'Rest') {
                planDays.push({ workouts: [] });
            } else {
                const exercises = template.workouts[workoutName] || [];
                planDays.push({
                    workouts: exercises.map((ex: any) => {
                        const holdExercises = ['plank', 'wall sit', 'dead hang', 'hollow hold'];
                        const isHold = holdExercises.some(h => ex.name.toLowerCase().includes(h));
                        return {
                            // Schema requires workoutId (fake it for template items)
                            workoutId: '000000000000000000000000',
                            name: ex.name,
                            // Schema requires workoutType: 'strength' | 'cardio'
                            workoutType: ['cardio', 'plyo'].includes(ex.type) ? 'cardio' : 'strength',
                            muscle_group: ex.muscleGroup,
                            // For hold exercises: use minutes, for others: use sets
                            sets: isHold ? [] : Array(ex.sets).fill({ reps: ex.reps, weight: 0 }),
                            minutes: isHold ? (ex.reps / 60) * ex.sets : 0,
                            completed: false
                        };
                    }))
            });
        }
    }

        return planDays;
    }
}

export const workoutTemplatesService = new WorkoutTemplatesService();
