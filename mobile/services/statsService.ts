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

  async getStatsRange(startDate: string, endDate: string): Promise<any[]> {
    return api.get<any[]>(`/stats/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getAdherenceReport(startDate: string, endDate: string): Promise<any> {
    return api.get<any>(`/stats/progress-report?startDate=${startDate}&endDate=${endDate}`);
  }

  async updateStats(date: string, data: Partial<DailyStats>): Promise<{ stats: DailyStats; message: string }> {
    return api.put(`/stats/${date}`, data);
  }

  async patchStats(date: string, stats: Partial<DailyStats>): Promise<{ stats: DailyStats; message: string }> {
    return api.patch(`/stats/${date}`, stats);
  }

  async applyEstimatedWeight(data: { weight: number; netCalories: number; daysSince: number; date?: string }): Promise<any> {
    return api.post('/stats/apply-estimated-weight', data);
  }
}

export const statsService = new StatsService();










