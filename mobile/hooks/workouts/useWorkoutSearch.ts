import { useCallback } from 'react';
import { API_URLS } from '../../constants/api';

export function useWorkoutSearch() {
  const searchWorkouts = useCallback(async (query: string) => {
    if (!query) return [];
    for (const baseUrl of API_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        const apiUrl = `${baseUrl}/api/workouts?name=${encodeURIComponent(query)}`;
        console.log('🔍 Searching for workout:', query);
        console.log('🌐 Trying API URL:', apiUrl);
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          console.error('API Error:', response.status, response.statusText);
          continue;
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('Invalid data format:', data);
          continue;
        }
        console.log(`✅ Found ${data.length} workouts from ${baseUrl}`);
        // Map backend response to frontend structure
        return data.map((workout: any) => ({
          id: workout._id,
          name: workout.name,
          description: workout.description,
          category: workout.category,
          muscle_group: workout.muscle_group,
          equipment: workout.equipment,
        }));
      } catch (error) {
        console.error(`❌ Error with ${baseUrl}:`, error);
        // Continue to next URL
      }
    }
    console.error('❌ All API URLs failed');
    return [];
  }, []);

  return { searchWorkouts };
}
