import { api } from './api';

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  birthDate: Date;
  gender: 'male' | 'female';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUserSummary {
  id: string;
  fullName: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUserSummary;
}

export interface CurrentUser extends AuthUserSummary {
  _id?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  profilePhoto?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_CACHE_KEY = '@coreiq_user_cache';

class AuthService {
  async saveUserCache(user: CurrentUser): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user cache', error);
    }
  }

  async getUserCache(): Promise<CurrentUser | null> {
    try {
      const json = await AsyncStorage.getItem(USER_CACHE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      return null;
    }
  }

  async clearUserCache(): Promise<void> {
    await AsyncStorage.removeItem(USER_CACHE_KEY);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      await api.setToken(response.token);
      if (response.user) {
        await this.saveUserCache(response.user);
      }
    }
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.token) {
      await api.setToken(response.token);
      if (response.user) {
        await this.saveUserCache(response.user);
      }
    }
    return response;
  }

  async logout(): Promise<void> {
    await api.removeToken();
    await this.clearUserCache();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post('/auth/forgot-password', { email });
  }

  async verifyCode(email: string, code: string): Promise<{ message: string; token: string }> {
    return api.post('/auth/verify-code', { email, code });
  }

  async requestEmailVerification(email: string): Promise<{ message: string }> {
    return api.post('/auth/request-email-verification', { email });
  }

  async verifyEmailCode(email: string, code: string): Promise<{ message: string }> {
    return api.post('/auth/verify-email', { email, code });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post('/auth/reset-password', { token, newPassword });
  }

  async getCurrentUser(): Promise<CurrentUser> {
    const profile = await api.get<CurrentUser>('/auth/me');
    const user = {
      ...profile,
      id: profile.id || profile._id || profile.email,
    };
    await this.saveUserCache(user);
    return user;
  }

  isAuthenticated(): Promise<boolean> {
    return api.getToken().then(token => !!token);
  }
}

export const authService = new AuthService();










