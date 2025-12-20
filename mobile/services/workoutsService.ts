import { api } from './api';

export interface WorkoutEntry {
  id: string;
  name: string;
  description?: string;
  muscle_group?: string;
  workoutType: 'strength' | 'cardio';
  sets?: { reps: number; weight: number }[];
  minutes?: number;
  isCompleted: boolean;
}

export interface WorkoutsByDate {
  strengthByGroup: { [group: string]: WorkoutEntry[] };
  cardioEntries: WorkoutEntry[];
}

class WorkoutsService {
  async getWorkoutEntriesByDate(date: string): Promise<WorkoutsByDate> {
    return api.get<WorkoutsByDate>(`/workout-entries/${date}`);
  }

  async addWorkoutEntry(data: {
    date: string;
    workoutId: string;
    sets?: { reps: number; weight: number }[];
    minutes?: number;
  }): Promise<{ entry: WorkoutEntry; message: string }> {
    return api.post('/workout-entries', data);
  }

  async toggleWorkout(id: string): Promise<{ entry: WorkoutEntry; message: string }> {
    return api.post(`/workout-entries/${id}/toggle`);
  }

  async updateWorkoutEntry(id: string, data: {
    sets?: { reps: number; weight: number }[];
    minutes?: number;
  }): Promise<{ entry: WorkoutEntry; message: string }> {
    return api.put(`/workout-entries/${id}`, data);
  }

  async deleteWorkoutEntry(id: string): Promise<{ message: string }> {
    return api.delete(`/workout-entries/${id}`);
  }
}

export const workoutsService = new WorkoutsService();










