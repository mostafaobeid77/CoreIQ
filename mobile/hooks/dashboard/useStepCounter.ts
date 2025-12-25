import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_START_TIME_KEY = '@CoreIQ:stepCounterStartTime';

// userId and userCreatedAt are passed to ensure isolation
export function useStepCounter(userId?: string, userCreatedAt?: string) {
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let interval: any = null;

    const getStartTime = (): Date => {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // If we have user info, check if account was created today
      if (userCreatedAt) {
        const createdDate = new Date(userCreatedAt);
        const createdDay = new Date(createdDate);
        createdDay.setHours(0, 0, 0, 0);

        // If created today, start counting from creation time (or shortly after)
        // This effectively "ignores" steps taken before the account existed today
        if (createdDay.getTime() === today.getTime()) {
          return createdDate;
        }
      }

      // Default: count from midnight today
      return today;
    };

    const fetchTodaySteps = async () => {
      try {
        const start = getStartTime();
        const end = new Date();

        // Safety: ensure start is before end
        if (start > end) {
          setCurrentStepCount(0);
          return;
        }

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

            // More frequent fallback for Android/updates
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
  }, [userId, userCreatedAt]); // Re-run if user changes

  return { currentStepCount, isPedometerAvailable };
}