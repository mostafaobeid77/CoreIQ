import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_START_TIME_KEY = '@CoreIQ:stepCounterStartTime';

export function useStepCounter() {
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let interval: any = null;

    const getStepCounterStartTime = async (): Promise<Date> => {
      try {
        const stored = await AsyncStorage.getItem(STEP_START_TIME_KEY);
        if (stored) {
          return new Date(stored);
        }

        // First time - store current time as start
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If it's past 4 AM, count from midnight; otherwise from now
        const startTime = now.getHours() >= 4 ? today : now;
        await AsyncStorage.setItem(STEP_START_TIME_KEY, startTime.toISOString());
        return startTime;
      } catch (error) {
        console.error('[STEPS] Error getting start time:', error);
        const fallback = new Date();
        fallback.setHours(0, 0, 0, 0);
        return fallback;
      }
    };

    const resetStartTimeIfNewDay = async () => {
      try {
        const stored = await AsyncStorage.getItem(STEP_START_TIME_KEY);
        if (stored) {
          const storedDate = new Date(stored);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // If stored date is from a previous day, reset to today's midnight
          if (storedDate < today) {
            await AsyncStorage.setItem(STEP_START_TIME_KEY, today.toISOString());
          }
        }
      } catch (error) {
        console.error('[STEPS] Error resetting start time:', error);
      }
    };

    const fetchTodaySteps = async () => {
      try {
        await resetStartTimeIfNewDay();
        const start = await getStepCounterStartTime();
        const end = new Date();

        const result = await Pedometer.getStepCountAsync(start, end);
        if (result && typeof result.steps === 'number') {
          setCurrentStepCount(result.steps);
        }
      } catch (error) {
        console.error('[STEPS] Error fetching step count:', error);
      }
    };

    const startPedometer = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (isAvailable) {
          const { status } = await Pedometer.requestPermissionsAsync();
          if (status === 'granted') {
            await fetchTodaySteps();

            subscription = Pedometer.watchStepCount(() => {
              fetchTodaySteps();
            });

            // More frequent fallback for Android
            interval = setInterval(fetchTodaySteps, 5000);
          } else {
            console.warn('[STEPS] Pedometer permission denied');
          }
        }
      } catch (error) {
        console.error('[STEPS] Pedometer error:', error);
        setIsPedometerAvailable(false);
      }
    };

    startPedometer();

    return () => {
      if (subscription) subscription.remove();
      if (interval) clearInterval(interval);
    };
  }, []);

  return { currentStepCount, isPedometerAvailable };
}