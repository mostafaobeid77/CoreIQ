import { api } from './api';
import type { Food } from '../types/food';

export interface FoodFavorite {
  _id: string;
  foodId: Food;
  createdAt: Date;
}

class FavoritesService {
  async getFavorites(): Promise<FoodFavorite[]> {
    return api.get<FoodFavorite[]>('/favorites');
  }

  async addFavorite(foodId: string): Promise<{ favorite: FoodFavorite; message: string }> {
    return api.post('/favorites', { foodId });
  }

  async removeFavorite(foodId: string): Promise<{ message: string }> {
    return api.delete(`/favorites/${foodId}`);
  }
}

export const favoritesService = new FavoritesService();

