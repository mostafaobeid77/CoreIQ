import { useState, useEffect } from 'react';
import { DashboardStats } from '../../components/dashboard/dashboardUtils';
import { usePreferences } from '../../context/PreferencesContext';

export function useStatsByDate(
  dateKey: string,
  stats: DashboardStats,
  setIsEditingWater: (val: boolean) => void,
  updateStatsForDate: (date: string, updates: Partial<DashboardStats>) => Promise<void>,
  waterInput?: string,
  weightInput?: string,
  heightInput?: string,
  sleepInput?: string
) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toKg, units } = usePreferences();

  // ---------------- Water ----------------
  useEffect(() => {
    if (typeof waterInput === 'string') {
      const amount = parseInt(waterInput) || 0;
      if (waterInput.length === 0) {
        setErrors(prev => ({ ...prev, water: '' }));
      } else if (amount <= 0 || amount > 10000) {
        setErrors(prev => ({ ...prev, water: 'Please enter a valid amount (1-10000ml)' }));
      } else {
        setErrors(prev => ({ ...prev, water: '' }));
      }
    }
  }, [waterInput]);

  // ---------------- Weight ----------------
  useEffect(() => {
    if (typeof weightInput === 'string') {
      const raw = parseFloat(weightInput) || 0;
      const weight = toKg(raw);
      if (weightInput.length === 0) {
        setErrors(prev => ({ ...prev, weight: '' }));
      } else if (weight < 20 || weight > 300) {
        setErrors(prev => ({ ...prev, weight: 'Please enter a valid weight (20-300kg)' }));
      } else {
        setErrors(prev => ({ ...prev, weight: '' }));
      }
    }
  }, [weightInput]);

  // ---------------- Height ----------------
  useEffect(() => {
    if (typeof heightInput === 'string') {
      if (units === 'imperial') {
        // Do not set cm error in imperial mode; modal handles ft/in validation
        setErrors(prev => ({ ...prev, height: '' }));
        return;
      }
      const cm = parseFloat(heightInput) || 0; // Always cm
      if (heightInput.length === 0) {
        setErrors(prev => ({ ...prev, height: '' }));
      } else if (cm < 50 || cm > 250) {
        setErrors(prev => ({ ...prev, height: 'Please enter a valid height (50-250 cm)' }));
      } else {
        setErrors(prev => ({ ...prev, height: '' }));
      }
    }
  }, [heightInput, units]);

  // ---------------- Sleep ----------------
  useEffect(() => {
    if (typeof sleepInput === 'string') {
      const sleepHours = parseFloat(sleepInput) || 0;
      if (sleepInput.length === 0) {
        setErrors(prev => ({ ...prev, sleep: '' }));
      } else if (sleepHours < 0 || sleepHours > 24) {
        setErrors(prev => ({ ...prev, sleep: 'Please enter a valid number of hours (0-24)' }));
      } else {
        setErrors(prev => ({ ...prev, sleep: '' }));
      }
    }
  }, [sleepInput]);

  // ---------------- Handlers ----------------

  // Water
  const handleWaterAdd = (waterInput: string) => {
    const amount = parseInt(waterInput) || 0;
    if (amount <= 0 || amount > 10000) {
      setErrors(prev => ({ ...prev, water: 'Please enter a valid amount (1-10000ml)' }));
      return;
    }
    void updateStatsForDate(dateKey, { water: stats.water + amount });
    setErrors(prev => ({ ...prev, water: '' }));
    setIsEditingWater(false);
  };

  const handleWaterSubtract = (waterInput: string) => {
    const amount = parseInt(waterInput) || 0;
    if (amount <= 0 || amount > stats.water) {
      setErrors(prev => ({ ...prev, water: 'Please enter a valid amount to subtract' }));
      return;
    }
    void updateStatsForDate(dateKey, { water: Math.max(0, stats.water - amount) });
    setErrors(prev => ({ ...prev, water: '' }));
    setIsEditingWater(false);
  };

  // Mental
  const handleMentalSelect = (label: string) => {
    void updateStatsForDate(dateKey, { mental: label });
    setErrors(prev => ({ ...prev, mental: '' }));
  };

  // Weight
  const handleWeightSave = (weightInput: string) => {
    const raw = parseFloat(weightInput) || 0;
    const weight = toKg(raw);
    if (weight < 20 || weight > 300) {
      setErrors(prev => ({ ...prev, weight: 'Please enter a valid weight (20-300kg)' }));
      return;
    }
    void updateStatsForDate(dateKey, { weight });
    setErrors(prev => ({ ...prev, weight: '' }));
  };

  // Height
  const handleHeightSave = (heightInput: string) => {
    const cm = parseFloat(heightInput) || 0; // Always cm
    if (cm < 50 || cm > 250) {
      setErrors(prev => ({
        ...prev,
        height: 'Please enter a valid height (50-250 cm)',
      }));
      return;
    }
    void updateStatsForDate(dateKey, { height: cm });
    setErrors(prev => ({ ...prev, height: '' }));
  };

  // Activity Level
  const handleActivityLevelSave = (activityLevel: string) => {
    void updateStatsForDate(dateKey, { activityLevel });
    setErrors(prev => ({ ...prev, activityLevel: '' }));
  };

  // Goal Weight
  const handleGoalWeightSave = (goal: string) => {
    void updateStatsForDate(dateKey, { goalWeight: goal });
    setErrors(prev => ({ ...prev, goalWeight: '' }));
  };

  const handleWeightGoalSelect = (goal: string, targetWeight: number) => {
    if (goal === 'Lose Weight' && targetWeight >= stats.weight) {
      setErrors(prev => ({ ...prev, goalWeight: 'Target weight must be less than your current weight' }));
      return;
    }
    if (goal === 'Gain Weight' && targetWeight <= stats.weight) {
      setErrors(prev => ({ ...prev, goalWeight: 'Target weight must be greater than your current weight' }));
      return;
    }
    void updateStatsForDate(dateKey, { goalWeight: `${goal}: ${targetWeight}kg` });
    setErrors(prev => ({ ...prev, goalWeight: '' }));
  };

  // Sleep
  const handleSleepSave = (sleepInput: string) => {
    const sleepHours = parseFloat(sleepInput) || 0;
    if (sleepHours < 0 || sleepHours > 24) {
      setErrors(prev => ({ ...prev, sleep: 'Please enter a valid number of hours (0-24)' }));
      return;
    }
    void updateStatsForDate(dateKey, { sleep: sleepHours });
    setErrors(prev => ({ ...prev, sleep: '' }));
  };

  const handleSleepAdd = (sleepInput: string) => {
    const hours = parseFloat(sleepInput) || 0;
    if (hours <= 0 || stats.sleep + hours > 24) {
      setErrors(prev => ({ ...prev, sleep: 'Total sleep cannot exceed 24 hours' }));
      return;
    }
    void updateStatsForDate(dateKey, { sleep: Math.min(24, stats.sleep + hours) });
    setErrors(prev => ({ ...prev, sleep: '' }));
  };

  const handleSleepSubtract = (sleepInput: string) => {
    const hours = parseFloat(sleepInput) || 0;
    if (hours <= 0 || stats.sleep - hours < 0) {
      setErrors(prev => ({ ...prev, sleep: 'Sleep cannot be negative' }));
      return;
    }
    void updateStatsForDate(dateKey, { sleep: Math.max(0, stats.sleep - hours) });
    setErrors(prev => ({ ...prev, sleep: '' }));
  };

  return {
    handleWaterAdd,
    handleWaterSubtract,
    handleMentalSelect,
    handleWeightSave,
    handleHeightSave,
    handleActivityLevelSave,
    handleGoalWeightSave,
    handleWeightGoalSelect,
    handleSleepSave,
    handleSleepAdd,
    handleSleepSubtract,
    errors,
    setErrors,
  };
}
