import { api } from './api';

export const statsService = {
    /**
     * Get stats for a specific date
     */
    getStats: async (date: string) => {
        return api.get<any>(`/stats/${date}`);
    },

    /**
     * Get adherence report for a date range
     */
    getAdherenceReport: async (startDate: string, endDate: string) => {
        return api.get<any>(`/stats/progress-report?startDate=${startDate}&endDate=${endDate}`);
    },

    /**
     * Patch stats for a specific date (e.g. update weight)
     */
    patchStats: async (date: string, data: any) => {
        return api.patch<any>(`/stats/${date}`, data);
    }
};
