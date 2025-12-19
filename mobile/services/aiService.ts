import { api } from './api';

export type Message = {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
};

export type Conversation = {
    _id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
};

export const aiService = {
    getConversations: async (): Promise<Conversation[]> => {
        return api.get<Conversation[]>('/ai');
    },

    getConversation: async (id: string): Promise<Conversation> => {
        return api.get<Conversation>(`/ai/${id}`);
    },

    createConversation: async (): Promise<{ message: string; conversation: Conversation }> => {
        return api.post<{ message: string; conversation: Conversation }>('/ai');
    },

    sendMessage: async (
        id: string,
        content: string
    ): Promise<{ message: string; conversation: Conversation; aiResponse: Message; action?: string }> => {
        return api.post<{ message: string; conversation: Conversation; aiResponse: Message; action?: string }>(
            `/ai/${id}/messages`,
            { role: 'user', content }
        );
    },

    generatePlan: async (
        id: string,
        requirements: any = {}
    ): Promise<{ message: string; plan: any; conversation: Conversation }> => {
        return api.post<{ message: string; plan: any; conversation: Conversation }>(
            `/ai/${id}/generate-plan`,
            { requirements, startDate: new Date().toISOString() }
        );
    },

    deleteConversation: async (id: string): Promise<void> => {
        return api.delete(`/ai/${id}`);
    },

    editPlan: async (
        currentDay: any,
        instruction: string,
        planContext?: string
    ): Promise<{ success: boolean; modifiedDay: any }> => {
        return api.post<{ success: boolean; modifiedDay: any }>('/ai/edit-plan', { currentDay, instruction, planContext });
    },
};
