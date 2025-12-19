import { api } from './api';

export interface DailyStats {
  water: number;
  calories: number;
  proteins: number;
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
}

class StatsService {
  async getStats(date: string): Promise<DailyStats> {
    return api.get<DailyStats>(`/stats/${date}`);
  }

  async getStatsRange(startDate: string, endDate: string): Promise<DailyStats[]> {
    return api.get<DailyStats[]>(`/stats?startDate=${startDate}&endDate=${endDate}`);
  }

  async updateStats(date: string, stats: Partial<DailyStats>): Promise<{ stats: DailyStats; message: string }> {
    return api.put(`/stats/${date}`, stats);
  }

  async patchStats(date: string, stats: Partial<DailyStats>): Promise<{ stats: DailyStats; message: string }> {
    return api.patch(`/stats/${date}`, stats);
  }
}

export const statsService = new StatsService();










