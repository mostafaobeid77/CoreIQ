import { API_URLS } from '../constants/api';

class WorkoutTemplatesService {
    async getAll() {
        const response = await fetch(`${API_URLS[0]}/api/workout-templates/templates`);
        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Failed to fetch templates');
        return data.templates;
    }

    async getById(templateId: string) {
        const response = await fetch(`${API_URLS[0]}/api/workout-templates/templates/${templateId}`);
        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Failed to fetch template');
        return data.template;
    }

    async getRecommended(goal: string) {
        const response = await fetch(
            `${API_URLS[0]}/api/workout-templates/templates/recommend/${encodeURIComponent(goal)}`
        );
        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Failed to fetch recommendations');
        return data.templates;
    }

    applyTemplateToPlan(template: any): any[] {
        const planDays: any[] = [];
        const holdExercises = ['plank', 'wall sit', 'dead hang', 'hollow hold'];

        for (let day = 1; day <= 14; day++) {
            const dayKey = `day${((day - 1) % 7) + 1}`;
            const workoutName = template?.schedule?.[dayKey];

            if (!workoutName || workoutName === 'Rest') {
                planDays.push({ workouts: [] });
                continue;
            }

            const exercises = template?.workouts?.[workoutName] ?? [];

            planDays.push({
                workouts: exercises.map((ex: any) => {
                    const nameLower = (ex?.name ?? '').toLowerCase();
                    const isHold = holdExercises.some(h => nameLower.includes(h));

                    return {
                        workoutId: '000000000000000000000000',
                        name: ex.name,
                        workoutType: ['cardio', 'plyo'].includes(ex.type) ? 'cardio' : 'strength',
                        muscle_group: ex.muscleGroup,
                        sets: isHold ? [] : Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: 0 })),
                        minutes: isHold ? (ex.reps / 60) * ex.sets : 0,
                        completed: false,
                    };
                }),
            });
        }

        return planDays;
    }
}

export const workoutTemplatesService = new WorkoutTemplatesService();
