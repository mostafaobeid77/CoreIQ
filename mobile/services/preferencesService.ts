import { api } from './api';

export interface UserPreferences {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  waterRemindersEnabled: boolean;
  wellnessRemindersEnabled: boolean;
}

class PreferencesService {
  async getPreferences(): Promise<UserPreferences> {
    return api.get<UserPreferences>('/preferences');
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{
    preferences: UserPreferences;
    message: string;
  }> {
    return api.put('/preferences', preferences);
  }
}

export const preferencesService = new PreferencesService();










