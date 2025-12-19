import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';

export function useStepCounter() {
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: any = null;
    Pedometer.isAvailableAsync().then(setIsPedometerAvailable, () => setIsPedometerAvailable(false));
    subscription = Pedometer.watchStepCount(result => setCurrentStepCount(result.steps));
    return () => { if (subscription) subscription.remove(); };
  }, []);

  return { currentStepCount, isPedometerAvailable };
} 