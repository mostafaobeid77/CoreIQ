import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../constants/api';

const TOKEN_KEY = '@coreiq_token';

class ApiService {
  private lastWorkingBaseUrl: string | null = null;

  constructor() { }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const url = `http://192.168.1.101:5000/api${endpoint}`;

    console.log('Fetching:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'An error occurred');
      }

      return data as T;
    } catch (error) {
      console.error('Simple Fetch Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();


