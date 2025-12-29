import { api } from './api';

export type Plan = {
    _id: string;
    name: string;
    duration: number; // Plan length in days (14, 30, 60, 90)
    startDate: string;
    endDate: string;
    status: 'draft' | 'active' | 'completed';
    progress: {
        mealsCompleted: number;
        mealsTotal: number;
        workoutsCompleted: number;
        workoutsTotal: number;
        daysCompleted: number;
        completionPercentage: number;
    };
    mealPlan?: any[];
    workoutPlan?: any[];
    metadata?: any;
};

export const planService = {
    getAllPlans: async (): Promise<Plan[]> => {
        const response: any = await api.get<any>('/plans');
        // Handle paginated response { data: Plan[], pagination: ... }
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        // Handle legacy array response
        if (Array.isArray(response)) {
            return response;
        }
        return [];
    },

    getPlan: async (id: string): Promise<Plan> => {
        return api.get<Plan>(`/plans/${id}`);
    },

    activatePlan: async (id: string): Promise<{ message: string; plan: Plan }> => {
        return api.post<{ message: string; plan: Plan }>(`/plans/${id}/activate`);
    },

    createPlan: async (data: any): Promise<{ message: string; plan: Plan }> => {
        return api.post<{ message: string; plan: Plan }>('/plans', data);
    },

    deactivatePlan: async (id: string): Promise<{ message: string; plan: Plan }> => {
        return api.post<{ message: string; plan: Plan }>(`/plans/${id}/deactivate`);
    },

    deletePlan: async (id: string): Promise<void> => {
        return api.delete(`/plans/${id}`);
    },

    updatePlan: async (id: string, data: any): Promise<{ message: string; plan: Plan }> => {
        return api.put<{ message: string; plan: Plan }>(`/plans/${id}`, data);
    },
};
