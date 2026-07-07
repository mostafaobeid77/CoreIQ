export interface Food {
  id?: string;
  _id?: string;
  name: string;
  brand?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  servingSize?: string;
  servings?: Array<{
    label?: string;
    grams?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  }>;
}
