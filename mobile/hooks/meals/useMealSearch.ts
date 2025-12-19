// hooks/meals/useMealSearch.ts
import { useCallback } from 'react';
import { API_URLS } from '../../constants/api';

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
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error('Invalid data format:', data);
          continue;
        }
        
        console.log(`✅ Found ${data.length} foods from ${baseUrl}`);
        
        // Map backend response to frontend structure
        return data.map((food: any) => ({
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
        }));
      } catch (error) {
        console.error(`❌ Error with ${baseUrl}:`, error);
        // Continue to next URL
      }
    }
    
    console.error('❌ All API URLs failed');
    return [];
  }, []); // Empty dependency array since API_URLS is constant
  
  return { searchMeals };
}
