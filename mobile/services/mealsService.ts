import { api } from './api';

export interface MealItem {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  unit: 'grams' | 'servings' | 'ml';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isCompleted: boolean;
  addedAt: Date;
}

export interface MealsByType {
  [mealType: string]: MealItem[];
}

class MealsService {
  async getMealsByDate(date: string): Promise<MealsByType> {
    return api.get<MealsByType>(`/meals/${date}`);
  }

  async addMeal(data: {
    date: string;
    mealType: string;
    foodId: string;
    quantity: number;
    unit: 'grams' | 'servings' | 'ml';
  }): Promise<{ meal: MealItem; message: string }> {
    return api.post('/meals', data);
  }

  async updateMeal(id: string, data: Partial<MealItem>): Promise<{ meal: MealItem; message: string }> {
    return api.patch(`/meals/${id}`, data);
  }

  async toggleMeal(id: string): Promise<{ meal: MealItem; message: string }> {
    return api.post(`/meals/${id}/toggle`);
  }

  async deleteMeal(id: string): Promise<{ message: string }> {
    return api.delete(`/meals/${id}`);
  }

  async deleteMealsByDate(date: string): Promise<{ message: string }> {
    return api.delete(`/meals/date/${date}`);
  }

  async getTotalNutrients(date: string): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }> {
    return api.get(`/meals/${date}/nutrients`);
  }
}

export const mealsService = new MealsService();

