import { api } from './api';

export interface FoodSubmissionData {
  name: string;
  description: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings?: Array<{
    size: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    grams?: number;
  }>;
}

export interface WorkoutSubmissionData {
  name: string;
  description: string;
  category: string;
  muscle_group: string;
  equipment?: string;
}

class SubmissionService {
  async submitFood(data: FoodSubmissionData): Promise<{ message: string; submission: any }> {
    return api.post('/submissions/food', data);
  }

  async submitWorkout(data: WorkoutSubmissionData): Promise<{ message: string; submission: any }> {
    return api.post('/submissions/workout', data);
  }

  async getMySubmissions(): Promise<{ food: any[]; workouts: any[] }> {
    return api.get('/submissions/my-submissions');
  }
}

export const submissionService = new SubmissionService();




