import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../constants/api';

const TOKEN_KEY = '@coreiq_token';
export const BASE_URL = 'https://coreiq-backend.onrender.com/api';

/**
 * Ensures profile photo URLs point to the current active host.
 * This handles cases where absolute URLs (with old IPs) were cached.
 */
export function fixProfilePhotoUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath) return null;

  // If it's already a base64 string, keep it as is
  if (photoPath.startsWith('data:')) return photoPath;

  const host = BASE_URL.replace(/\/api\/?$/, '');

  // If it's a relative path, prepend host
  if (photoPath.startsWith('/')) {
    return `${host}${photoPath}`;
  }

  // If it's an absolute URL but points to our internal API structure
  if (photoPath.includes('/api/users/') && photoPath.includes('/photo')) {
    // Match the path including any query parameters (like ?v=timestamp)
    const internalPathMatch = photoPath.match(/\/api\/users\/[^\/]+\/photo(\?.*)?$/);
    if (internalPathMatch) {
      return `${host}${internalPathMatch[0]}`;
    }
  }

  return photoPath;
}

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
    const url = `${BASE_URL}${endpoint}`;

    console.log('Fetching:', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('JSON Parse Error. Raw body:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }

      return data as T;
    } catch (error) {
      console.error('Fetch error:', error);
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


