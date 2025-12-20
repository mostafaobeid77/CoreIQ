import { api, BASE_URL, fixProfilePhotoUrl } from './api';

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
  birthDate?: string;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    const profile = await api.get<UserProfile>('/users/profile');

    // Fix profile photo URL using standard utility
    profile.profilePhoto = fixProfilePhotoUrl(profile.profilePhoto);

    return {
      ...profile,
      id: profile.id || (profile as any)._id || profile.email,
    };
  }

  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> {
    const response = await api.put<{ message: string; user: UserProfile }>('/users/profile', data);

    if (response.user) {
      response.user.profilePhoto = fixProfilePhotoUrl(response.user.profilePhoto);
    }

    return response;
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




