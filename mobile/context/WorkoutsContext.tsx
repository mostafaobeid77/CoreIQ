import React, { createContext, useContext, useState } from 'react';

export interface StrengthWorkoutEntry {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
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
  getStrengthByGroupForDate: (dateKey: string) => Record<string, StrengthWorkoutEntry[]>;
  getCardioForDate: (dateKey: string) => CardioWorkoutEntry[];
  addStrengthEntry: (dateKey: string, entry: Omit<StrengthWorkoutEntry, 'id' | 'isCompleted'>) => void;
  addCardioEntry: (dateKey: string, entry: Omit<CardioWorkoutEntry, 'id' | 'isCompleted'>) => void;
  toggleStrengthCompletion: (dateKey: string, group: string, id: string) => void;
  toggleCardioCompletion: (dateKey: string, id: string) => void;
  getCompletedVsTotal: (dateKey: string) => { completed: number; total: number };
  clearDate: (dateKey: string) => void;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

export const WorkoutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workoutsByDate, setWorkoutsByDate] = useState<WorkoutsByDate>({});

  const ensureDay = (dateKey: string) => {
    setWorkoutsByDate(prev => {
      if (prev[dateKey]) return prev;
      return { ...prev, [dateKey]: { strengthByGroup: {}, cardioEntries: [] } };
    });
  };

  const getStrengthByGroupForDate = (dateKey: string) => workoutsByDate[dateKey]?.strengthByGroup || {};
  const getCardioForDate = (dateKey: string) => workoutsByDate[dateKey]?.cardioEntries || [];

  const addStrengthEntry = (dateKey: string, entry: Omit<StrengthWorkoutEntry, 'id' | 'isCompleted'>) => {
    setWorkoutsByDate(prev => {
      const day: WorkoutsDay = prev[dateKey] || { strengthByGroup: {}, cardioEntries: [] };
      const group = entry.muscle_group || 'Other';
      const newEntry: StrengthWorkoutEntry = { ...entry, id: `${Date.now()}-${Math.random()}`, isCompleted: false };
      const groupList = day.strengthByGroup[group] ? [...day.strengthByGroup[group], newEntry] : [newEntry];
      return { ...prev, [dateKey]: { ...day, strengthByGroup: { ...day.strengthByGroup, [group]: groupList } } };
    });
  };

  const addCardioEntry = (dateKey: string, entry: Omit<CardioWorkoutEntry, 'id' | 'isCompleted'>) => {
    setWorkoutsByDate(prev => {
      const day: WorkoutsDay = prev[dateKey] || { strengthByGroup: {}, cardioEntries: [] };
      const newEntry: CardioWorkoutEntry = { ...entry, id: `${Date.now()}-${Math.random()}`, isCompleted: false };
      return { ...prev, [dateKey]: { ...day, cardioEntries: [...day.cardioEntries, newEntry] } };
    });
  };

  const toggleStrengthCompletion = (dateKey: string, group: string, id: string) => {
    setWorkoutsByDate(prev => {
      const day = prev[dateKey];
      if (!day || !day.strengthByGroup[group]) return prev;
      const updated = day.strengthByGroup[group].map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e);
      return { ...prev, [dateKey]: { ...day, strengthByGroup: { ...day.strengthByGroup, [group]: updated } } };
    });
  };

  const toggleCardioCompletion = (dateKey: string, id: string) => {
    setWorkoutsByDate(prev => {
      const day = prev[dateKey];
      if (!day) return prev;
      const updated = day.cardioEntries.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e);
      return { ...prev, [dateKey]: { ...day, cardioEntries: updated } };
    });
  };

  const getCompletedVsTotal = (dateKey: string) => {
    const day = workoutsByDate[dateKey];
    if (!day) return { completed: 0, total: 0 };
    const totalStrength = Object.values(day.strengthByGroup).reduce((acc, arr) => acc + arr.length, 0);
    const completedStrength = Object.values(day.strengthByGroup).reduce((acc, arr) => acc + arr.filter(e => e.isCompleted).length, 0);
    const totalCardio = day.cardioEntries.length;
    const completedCardio = day.cardioEntries.filter(e => e.isCompleted).length;
    return { completed: completedStrength + completedCardio, total: totalStrength + totalCardio };
  };

  const clearDate = (dateKey: string) => {
    setWorkoutsByDate(prev => ({ ...prev, [dateKey]: { strengthByGroup: {}, cardioEntries: [] } }));
  };

  return (
    <WorkoutsContext.Provider value={{
      workoutsByDate,
      getStrengthByGroupForDate,
      getCardioForDate,
      addStrengthEntry,
      addCardioEntry,
      toggleStrengthCompletion,
      toggleCardioCompletion,
      getCompletedVsTotal,
      clearDate,
    }}>
      {children}
    </WorkoutsContext.Provider>
  );
};

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error('useWorkouts must be used within a WorkoutsProvider');
  return ctx;
}
