import { api } from './api';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  profilePhoto?: string | null;
  emailVerified?: boolean;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  email?: string;
  profilePhoto?: string | null;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    const profile = await api.get<UserProfile>('/users/profile');
    return {
      ...profile,
      id: profile.id || (profile as any)._id || profile.email,
    };
  }

  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> {
    return api.put('/users/profile', data);
  }

  async updateUserStats(data: {
    weight?: number;
    height?: number;
    activityLevel?: string;
    goalWeight?: string;
  }): Promise<{ message: string; user: any }> {
    return api.patch('/users/stats', data);
  }

  async deleteAccount(): Promise<{ message: string }> {
    return api.delete('/users/account');
  }
}

export const userService = new UserService();




