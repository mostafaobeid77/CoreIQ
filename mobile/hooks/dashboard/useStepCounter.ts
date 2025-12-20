import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export function useStepCounter() {
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let interval: any = null;

    const fetchTodaySteps = async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();

        const result = await Pedometer.getStepCountAsync(start, end);
        if (result && typeof result.steps === 'number') {
          console.log(`[STEPS] Found ${result.steps} steps`);
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
        console.log(`[STEPS] Pedometer isAvailableAsync: ${isAvailable}`);

        if (isAvailable) {
          const { status } = await Pedometer.requestPermissionsAsync();
          console.log(`[STEPS] Pedometer permission status: ${status}`);
          if (status === 'granted') {
            await fetchTodaySteps();

            subscription = Pedometer.watchStepCount(() => {
              console.log('[STEPS] Pedometer watcher triggered');
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