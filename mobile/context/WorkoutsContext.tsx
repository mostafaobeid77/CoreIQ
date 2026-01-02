import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { workoutsService, WorkoutEntry as ServiceEntry } from '../services/workoutsService';
import { useAuth } from './AuthContext';

export interface StrengthWorkoutEntry {
  id: string;
  name: string;
  description?: string;
  muscle_group?: string;
  sets: { reps: number; weight: number }[];
  isCompleted: boolean;
}

export interface CardioWorkoutEntry {
  id: string;
  name: string;
  minutes: number;
  isCompleted: boolean;
}

export type WorkoutsDay = {
  strengthByGroup: Record<string, StrengthWorkoutEntry[]>;
  cardioEntries: CardioWorkoutEntry[];
};

export type WorkoutsByDate = Record<string, WorkoutsDay>;

interface WorkoutsContextType {
  workoutsByDate: WorkoutsByDate;
  loadingDates: Record<string, boolean>;
  loadWorkoutsForDate: (dateKey: string, force?: boolean) => Promise<void>;
  getStrengthByGroupForDate: (dateKey: string) => Record<string, StrengthWorkoutEntry[]>;
  getCardioForDate: (dateKey: string) => CardioWorkoutEntry[];
  addStrengthEntry: (dateKey: string, entry: Omit<StrengthWorkoutEntry, 'id' | 'isCompleted'> & { workoutId?: string }) => Promise<void>;
  addCardioEntry: (dateKey: string, entry: Omit<CardioWorkoutEntry, 'id' | 'isCompleted'> & { workoutId?: string }) => Promise<void>;
  toggleStrengthCompletion: (dateKey: string, group: string, id: string) => Promise<void>;
  toggleCardioCompletion: (dateKey: string, id: string) => Promise<void>;
  removeWorkoutEntry: (dateKey: string, id: string) => Promise<void>;
  updateWorkoutEntry: (dateKey: string, id: string, updates: { sets?: { reps: number; weight: number }[]; minutes?: number }) => Promise<void>;
  getCompletedVsTotal: (dateKey: string) => { completed: number; total: number };
  clearDate: (dateKey: string) => Promise<void>;
  resetWorkouts: () => void;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

export const WorkoutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutsByDate, setWorkoutsByDate] = useState<WorkoutsByDate>({});
  const [loadingDates, setLoadingDates] = useState<Record<string, boolean>>({});
  const loadedDatesRef = useRef<Record<string, boolean>>({});
  const loadingDatesRef = useRef<Record<string, boolean>>({});
  const { user } = useAuth();

  const resetWorkouts = useCallback(() => {
    setWorkoutsByDate({});
    setLoadingDates({});
    loadedDatesRef.current = {};
    loadingDatesRef.current = {};
  }, []);

  useEffect(() => {
    // Reset when user changes
    resetWorkouts();
  }, [user?.id, resetWorkouts]);

  const normalizeStrength = useCallback((entry: any): StrengthWorkoutEntry => ({
    id: entry._id || entry.id,
    name: entry.name,
    description: entry.description || '',
    muscle_group: entry.muscle_group || 'Other',
    sets: entry.sets || [],
    isCompleted: !!entry.isCompleted
  }), []);

  const normalizeCardio = useCallback((entry: any): CardioWorkoutEntry => ({
    id: entry._id || entry.id,
    name: entry.name,
    minutes: entry.minutes || 0,
    isCompleted: !!entry.isCompleted
  }), []);

  const loadWorkoutsForDate = useCallback(async (dateKey: string, force = false) => {
    if (!user || (!force && (loadedDatesRef.current[dateKey] || loadingDatesRef.current[dateKey]))) {
      return;
    }

    setLoadingDates(prev => ({ ...prev, [dateKey]: true }));
    loadingDatesRef.current[dateKey] = true;

    try {
      const response = await workoutsService.getWorkoutEntriesByDate(dateKey);

      const normalizedStrength: Record<string, StrengthWorkoutEntry[]> = {};
      Object.entries(response.strengthByGroup || {}).forEach(([group, items]) => {
        normalizedStrength[group] = (items as any[]).map(normalizeStrength);
      });

      const normalizedCardio = (response.cardioEntries || []).map(normalizeCardio);

      setWorkoutsByDate(prev => ({
        ...prev,
        [dateKey]: {
          strengthByGroup: normalizedStrength,
          cardioEntries: normalizedCardio
        }
      }));
      loadedDatesRef.current[dateKey] = true;
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoadingDates(prev => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
      delete loadingDatesRef.current[dateKey];
    }
  }, [user, normalizeStrength, normalizeCardio]);

  const getStrengthByGroupForDate = useCallback((dateKey: string) =>
    workoutsByDate[dateKey]?.strengthByGroup || {}, [workoutsByDate]);

  const getCardioForDate = useCallback((dateKey: string) =>
    workoutsByDate[dateKey]?.cardioEntries || [], [workoutsByDate]);

  const addStrengthEntry = useCallback(async (dateKey: string, entry: any) => {
    if (!user) return;
    const response = await workoutsService.addWorkoutEntry({
      date: dateKey,
      workoutId: entry.workoutId || entry.id,
      sets: entry.sets,
      workoutType: 'strength',
      name: entry.name,
      description: entry.description,
      muscle_group: entry.muscle_group
    } as any);

    const normalized = normalizeStrength(response.entry);
    setWorkoutsByDate(prev => {
      const day = prev[dateKey] || { strengthByGroup: {}, cardioEntries: [] };
      const group = normalized.muscle_group || 'Other';
      const groupList = day.strengthByGroup[group] ? [...day.strengthByGroup[group], normalized] : [normalized];
      return { ...prev, [dateKey]: { ...day, strengthByGroup: { ...day.strengthByGroup, [group]: groupList } } };
    });
  }, [user, normalizeStrength]);

  const addCardioEntry = useCallback(async (dateKey: string, entry: any) => {
    if (!user) return;
    const response = await workoutsService.addWorkoutEntry({
      date: dateKey,
      workoutId: entry.workoutId || entry.id,
      minutes: entry.minutes,
      workoutType: 'cardio',
      name: entry.name,
      description: entry.description,
      muscle_group: 'Cardio'
    } as any);

    const normalized = normalizeCardio(response.entry);
    setWorkoutsByDate(prev => {
      const day = prev[dateKey] || { strengthByGroup: {}, cardioEntries: [] };
      return { ...prev, [dateKey]: { ...day, cardioEntries: [...day.cardioEntries, normalized] } };
    });
  }, [user, normalizeCardio]);

  const toggleStrengthCompletion = useCallback(async (dateKey: string, group: string, id: string) => {
    if (!user) return;
    const response = await workoutsService.toggleWorkout(id);
    setWorkoutsByDate(prev => {
      const day = prev[dateKey];
      if (!day || !day.strengthByGroup[group]) return prev;
      const updated = day.strengthByGroup[group].map(e => e.id === id ? { ...e, isCompleted: response.entry.isCompleted } : e);
      return { ...prev, [dateKey]: { ...day, strengthByGroup: { ...day.strengthByGroup, [group]: updated } } };
    });
  }, [user]);

  const toggleCardioCompletion = useCallback(async (dateKey: string, id: string) => {
    if (!user) return;
    const response = await workoutsService.toggleWorkout(id);
    setWorkoutsByDate(prev => {
      const day = prev[dateKey];
      if (!day) return prev;
      const updated = day.cardioEntries.map(e => e.id === id ? { ...e, isCompleted: response.entry.isCompleted } : e);
      return { ...prev, [dateKey]: { ...day, cardioEntries: updated } };
    });
  }, [user]);

  const removeWorkoutEntry = useCallback(async (dateKey: string, id: string) => {
    if (!user) return;
    await workoutsService.deleteWorkoutEntry(id);
    setWorkoutsByDate(prev => {
      const day = prev[dateKey];
      if (!day) return prev;

      const newStrength = { ...day.strengthByGroup };
      Object.keys(newStrength).forEach(group => {
        newStrength[group] = newStrength[group].filter(e => e.id !== id);
        if (newStrength[group].length === 0) delete newStrength[group];
      });

      return {
        ...prev,
        [dateKey]: {
          ...day,
          strengthByGroup: newStrength,
          cardioEntries: day.cardioEntries.filter(e => e.id !== id)
        }
      };
    });
  }, [user]);

  const updateWorkoutEntry = useCallback(async (dateKey: string, id: string, updates: { sets?: { reps: number; weight: number }[]; minutes?: number }) => {
    if (!user) return;
    const response = await workoutsService.updateWorkoutEntry(id, updates);

    setWorkoutsByDate(prev => {
      const day = prev[dateKey];
      if (!day) return prev;

      if (response.entry.workoutType === 'strength') {
        const normalized = normalizeStrength(response.entry);
        const group = normalized.muscle_group || 'Other';
        const updated = day.strengthByGroup[group]?.map(e => e.id === id ? normalized : e) || [];
        return { ...prev, [dateKey]: { ...day, strengthByGroup: { ...day.strengthByGroup, [group]: updated } } };
      } else {
        const normalized = normalizeCardio(response.entry);
        const updated = day.cardioEntries.map(e => e.id === id ? normalized : e);
        return { ...prev, [dateKey]: { ...day, cardioEntries: updated } };
      }
    });
  }, [user, normalizeStrength, normalizeCardio]);

  const getCompletedVsTotal = useCallback((dateKey: string) => {
    const day = workoutsByDate[dateKey];
    if (!day) return { completed: 0, total: 0 };
    const totalStrength = Object.values(day.strengthByGroup).reduce((acc, arr) => acc + arr.length, 0);
    const completedStrength = Object.values(day.strengthByGroup).reduce((acc, arr) => acc + arr.filter(e => e.isCompleted).length, 0);
    const totalCardio = day.cardioEntries.length;
    const completedCardio = day.cardioEntries.filter(e => e.isCompleted).length;
    return { completed: completedStrength + completedCardio, total: totalStrength + totalCardio };
  }, [workoutsByDate]);

  const clearDate = useCallback(async (dateKey: string) => {
    if (!user) return;
    // We don't have a specific "clear daily workouts" bulk endpoint in service yet,
    // so we'll just implement it locally for now or we could add it to service.
    // For now, let's assume clearDate clears local and we could potentially 
    // add a service call if needed.
    setWorkoutsByDate(prev => ({ ...prev, [dateKey]: { strengthByGroup: {}, cardioEntries: [] } }));
  }, [user]);

  const value = useMemo(() => ({
    workoutsByDate,
    loadingDates,
    loadWorkoutsForDate,
    getStrengthByGroupForDate,
    getCardioForDate,
    addStrengthEntry,
    addCardioEntry,
    toggleStrengthCompletion,
    toggleCardioCompletion,
    removeWorkoutEntry,
    updateWorkoutEntry,
    getCompletedVsTotal,
    clearDate,
    resetWorkouts,
  }), [
    workoutsByDate,
    loadingDates,
    loadWorkoutsForDate,
    getStrengthByGroupForDate,
    getCardioForDate,
    addStrengthEntry,
    addCardioEntry,
    toggleStrengthCompletion,
    toggleCardioCompletion,
    removeWorkoutEntry,
    updateWorkoutEntry,
    getCompletedVsTotal,
    clearDate,
    resetWorkouts,
  ]);

  return (
    <WorkoutsContext.Provider value={value}>
      {children}
    </WorkoutsContext.Provider>
  );
};

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error('useWorkouts must be used within a WorkoutsProvider');
  return ctx;
}
