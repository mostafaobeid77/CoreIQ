// hooks/meals/useMealSearch.ts
import { useCallback } from 'react';
import { API_URLS } from '../../constants/api';
import { api } from '../../services/api';

export function useMealSearch() {
  const searchMeals = useCallback(async (query: string) => {
    if (!query) return [];

    // Try each API URL until one works
    for (const baseUrl of API_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const apiUrl = `${baseUrl}/api/foods?name=${encodeURIComponent(query)}`;
        console.log('🔍 Searching for:', query);
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
          continue; // Try next URL
        }

        const rawData = await response.json();

        // Handle both simple array and paginated { data: [] } response
        const foodsList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.data) ? rawData.data : null);

        if (!foodsList) {
          console.error('Invalid data format:', rawData);
          continue;
        }

        console.log(`✅ Found ${foodsList.length} foods from ${baseUrl}`);

        // Map backend response to frontend structure
        const mapped = foodsList.map((food: any) => {
          const result = {
            id: food._id,
            name: food.name,
            description: food.description,
            category: food.category,
            brand: food.category || "Generic",
            calories: food.nutrients?.calories || 0,
            protein: food.nutrients?.protein || 0,
            carbs: food.nutrients?.carbs || 0,
            fats: food.nutrients?.fat || 0, // Backend uses 'fat', not 'fats'
            servings: food.servings || [],
          };

          return result;
        });

        return mapped;
      } catch (error) {
        console.error(`❌ Error with ${baseUrl}:`, error);
        // Continue to next URL
      }
    }

    console.error('❌ All API URLs failed');
    return [];
  }, []); // Empty dependency array since API_URLS is constant

  const getSuggestions = useCallback(async () => {
    for (const baseUrl of API_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const apiUrl = `${baseUrl}/api/foods/suggestions`;
        console.log('💡 Fetching suggestions from:', apiUrl);

        const token = await api.getToken();

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();
        return {
          favorites: data.favorites || [],
          recent: data.recent || []
        };
      } catch (error) {
        console.error(`❌ Suggestion error with ${baseUrl}:`, error);
      }
    }
    return { favorites: [], recent: [] };
  }, []);

  return { searchMeals, getSuggestions };
}
