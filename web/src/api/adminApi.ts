import { adminCache } from '../utils/adminCache';

const getApiBase = () => {
    let url = import.meta.env.VITE_API_URL || 'https://coreiq-backend.onrender.com/api'; // 'http://localhost:5000/api';
    // Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // Append /api if missing (heuristic: if it doesn't end in /api)
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
    }
    return url;
};

const API_BASE = getApiBase();

interface LoginResponse {
    message: string;
    token: string;
    admin: {
        id: string;
        username: string;
        email: string;
        role: 'superadmin' | 'admin';
    };
}

export interface AdminInfo {
    id: string; // Virtual or mapped
    _id?: string; // Raw Mongo ID
    username: string;
    email: string;
    role: 'superadmin' | 'admin';
    isActive: boolean;
    createdAt: string;
}

// Stats & Content Types
export interface UserStats {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    isActive: boolean;
}

export interface Workout {
    _id: string;
    name: string;
    description: string;
    category: string;
    muscle_group: string;
    equipment?: string;
    status: 'pending' | 'official' | 'approved' | 'rejected';
    createdBy?: { username: string };
    reviewedBy?: { username: string };
    createdAt: string;
}

export interface Food {
    _id: string;
    name: string;
    category: string;
    nutrients: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    baseQuantity: {
        amount: number;
        unit: string;
    };
    createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
    totalUsers: number;
    activeAdmins: number;
    totalAdmins: number;
    activePlans: number;
    totalWorkouts: number;
    pendingWorkouts: number;
    pendingAdminRequests: number;
    totalMeals: number;
}

export interface AuditEvent {
    _id: string;
    action: string;
    actorType: 'user' | 'admin' | 'system';
    actorName: string;
    details?: string;
    createdAt: string;
}

export interface UserDetail {
    _id: string;
    username: string;
    email: string;
    weight?: number;
    height?: number;
    targetCalories?: number;
    targetProtein?: number;
    activityLevel?: string;
    createdAt: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const adminApi = {
    // --- Auth ---
    login: async (identifier: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${API_BASE}/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    getMe: async (): Promise<{ admin: AdminInfo }> => {
        const response = await fetch(`${API_BASE}/admin/auth/me`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get admin info');
        return data;
    },

    updateProfile: async (payload: { username?: string; password?: string }) => {
        const response = await fetch(`${API_BASE}/admin/auth/update-profile`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // --- Users (Read Only) ---
    getUsers: async (params: { page?: number; limit?: number; search?: string }) => {
        const queryString = new URLSearchParams(params as any).toString();
        const response = await fetch(`${API_BASE}/admin/users?${queryString}`, { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // --- Workouts ---
    getWorkouts: async (params: { page?: number; limit?: number; search?: string; status?: string; muscle_group?: string }) => {
        // Check cache first
        const cached = adminCache.get<any>('workouts', params);
        if (cached) return cached;

        // Filter out empty/undefined values
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'All')
        );
        const queryString = new URLSearchParams(cleanParams as any).toString();
        const response = await fetch(`${API_BASE}/admin/content/workouts?${queryString}`, { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // Store in cache
        adminCache.set('workouts', params, data);
        return data;
    },

    createWorkout: async (payload: any) => {
        const response = await fetch(`${API_BASE}/admin/content/workouts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        adminCache.invalidate('workouts'); // Clear cache after create
        return data;
    },

    updateWorkout: async (id: string, payload: Partial<Workout>) => {
        const response = await fetch(`${API_BASE}/admin/content/workouts/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        adminCache.invalidate('workouts');
        return data;
    },

    updateWorkoutStatus: async (id: string, status: 'approved' | 'rejected', reason?: string) => {
        const response = await fetch(`${API_BASE}/admin/content/workouts/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, rejectionReason: reason })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    deleteWorkout: async (id: string) => {
        const response = await fetch(`${API_BASE}/admin/content/workouts/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete workout');
        adminCache.invalidate('workouts'); // Clear cache after delete
    },

    // --- Meals ---
    getFoods: async (params: { page?: number; limit?: number; search?: string; category?: string }) => {
        // Check cache first
        const cached = adminCache.get<any>('foods', params);
        if (cached) return cached;

        // Filter out empty/undefined values
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'All')
        );
        const queryString = new URLSearchParams(cleanParams as any).toString();
        const response = await fetch(`${API_BASE}/admin/content/meals?${queryString}`, { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // Store in cache
        adminCache.set('foods', params, data);
        return data;
    },

    createFood: async (payload: any) => {
        const response = await fetch(`${API_BASE}/admin/content/meals`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        adminCache.invalidate('foods'); // Clear cache after create
        return data;
    },

    deleteFood: async (id: string) => {
        const response = await fetch(`${API_BASE}/admin/content/meals/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete meal');
        adminCache.invalidate('foods'); // Clear cache after delete
    },

    // --- Team (Superadmin) ---
    listAdmins: async (): Promise<{ admins: AdminInfo[] }> => {
        const response = await fetch(`${API_BASE}/admin/auth/list`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to list admins');
        return data;
    },

    createAdmin: async (payload: any) => {
        const response = await fetch(`${API_BASE}/admin/auth/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    deactivateAdmin: async (adminId: string) => {
        const response = await fetch(`${API_BASE}/admin/auth/deactivate/${adminId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    deleteAdmin: async (adminId: string) => {
        const response = await fetch(`${API_BASE}/admin/auth/delete/${adminId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('adminToken');
    },

    getStoredUser: (): AdminInfo | null => {
        const userStr = localStorage.getItem('adminUser');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },

    // --- Dashboard Stats ---
    getDashboardStats: async (): Promise<{ stats: DashboardStats; generatedAt: string }> => {
        const response = await fetch(`${API_BASE}/admin/stats/dashboard`, {
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    getRecentEvents: async (limit = 50): Promise<{ events: AuditEvent[]; count: number }> => {
        const response = await fetch(`${API_BASE}/admin/stats/events?limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // SSE connection for live events
    createEventsStream: (): EventSource => {
        const token = localStorage.getItem('adminToken');
        return new EventSource(`${API_BASE}/admin/stats/events/stream?token=${token}`);
    },

    getReportStats: async (startDate: Date, endDate: Date) => {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        const response = await fetch(`${API_BASE}/admin/stats/reports?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data as {
            range: { start: string, end: string },
            metrics: {
                acquisition: { newUsers: number, label: string },
                engagement: { newPlans: number, loginSessions: number, label: string },
                content: { newWorkouts: number, newMeals: number, label: string },
                team: { decisionsMade: number, label: string }
            }
        };
    },

    getUserDetails: async (userId: string): Promise<{ user: UserDetail; plans: any[]; recentActivity: AuditEvent[] }> => {
        const response = await fetch(`${API_BASE}/admin/stats/users/${userId}`, {
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    // --- Invite Codes (Superadmin) ---

    // --- Admin Requests ---
    submitAdminRequest: async (payload: { username: string; email: string; reason: string }) => {
        // Public endpoint, no auth headers needed
        const response = await fetch(`${API_BASE}/admin/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    getAdminRequests: async (status?: string) => {
        const url = status ? `${API_BASE}/admin/requests?status=${status}` : `${API_BASE}/admin/requests`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data as { requests: any[] };
    },

    approveAdminRequest: async (id: string) => {
        const response = await fetch(`${API_BASE}/admin/requests/${id}/approve`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    rejectAdminRequest: async (id: string, reason: string) => {
        const response = await fetch(`${API_BASE}/admin/requests/${id}/reject`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reason })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    deleteAdminRequest: async (id: string) => {
        const response = await fetch(`${API_BASE}/admin/requests/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};
