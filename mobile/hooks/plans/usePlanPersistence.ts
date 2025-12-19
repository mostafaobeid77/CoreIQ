import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PLAN_KEY = '@coreiq_draft_plan';

export interface DraftPlan {
    name: string;
    days: { [key: number]: any }; // simplified structure for storage
    lastUpdated: number;
}

export function usePlanPersistence() {
    const [hasDraft, setHasDraft] = useState(false);
    const [isLoadingDraft, setIsLoadingDraft] = useState(true);

    // Check for existing draft on mount
    useEffect(() => {
        checkDraft();
    }, []);

    const checkDraft = async () => {
        try {
            const draft = await AsyncStorage.getItem(DRAFT_PLAN_KEY);
            setHasDraft(!!draft);
        } catch (error) {
            console.error('Error checking draft:', error);
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const saveDraft = useCallback(async (name: string, days: any[]) => {
        try {
            const draft: DraftPlan = {
                name,
                days: days.reduce((acc, day) => ({ ...acc, [day.day]: day }), {}),
                lastUpdated: Date.now(),
            };
            await AsyncStorage.setItem(DRAFT_PLAN_KEY, JSON.stringify(draft));
            setHasDraft(true);
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }, []);

    const loadDraft = useCallback(async (): Promise<{ name: string; days: any[] } | null> => {
        try {
            const json = await AsyncStorage.getItem(DRAFT_PLAN_KEY);
            if (!json) return null;

            const draft: DraftPlan = JSON.parse(json);
            // Convert back to array format expected by PlansScreen
            const daysArray = Object.values(draft.days).sort((a: any, b: any) => a.day - b.day);

            return {
                name: draft.name,
                days: daysArray
            };
        } catch (error) {
            console.error('Error loading draft:', error);
            return null;
        }
    }, []);

    const clearDraft = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(DRAFT_PLAN_KEY);
            setHasDraft(false);
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    }, []);

    return {
        hasDraft,
        isLoadingDraft,
        saveDraft,
        loadDraft,
        clearDraft
    };
}
