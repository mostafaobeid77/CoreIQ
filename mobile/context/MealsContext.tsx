import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mealsService } from "../services/mealsService";
import { useAuth } from "./AuthContext";

export interface MealItem {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  unit: 'grams' | 'servings';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isCompleted: boolean;
  addedAt: Date;
}

export interface MealsByDate {
  [date: string]: {
    [mealType: string]: MealItem[];
  };
}

interface MealsContextType {
  mealsByDate: MealsByDate;
  loadMealsForDate: (date: string, force?: boolean) => Promise<void>;
  addMealItem: (
    date: string,
    mealType: string,
    food: any,
    quantity: number,
    unit: "grams" | "servings"
  ) => Promise<void>;
  toggleMealCompletion: (date: string, mealType: string, itemId: string) => Promise<void>;
  removeMealItem: (date: string, mealType: string, itemId: string) => Promise<void>;
  removeAllMealsForDate: (date: string) => Promise<void>;
  updateMealItem: (date: string, mealType: string, itemId: string, data: { quantity: number; unit: 'grams' | 'servings'; mealType?: string }) => Promise<void>;
  getMealsForDate: (date: string) => { [mealType: string]: MealItem[] };
  getTotalNutrientsForDate: (date: string) => {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  };
  getCompletedMealsCountForDate: (date: string) => number;
  loadingDates: Record<string, boolean>;
  resetMeals: () => void;
}

const MealsContext = createContext<MealsContextType | undefined>(undefined);

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>({});
  const [loadingDates, setLoadingDates] = useState<Record<string, boolean>>({});
  const loadedDatesRef = useRef<Record<string, boolean>>({});
  const loadingDatesRef = useRef<Record<string, boolean>>({});
  const { user } = useAuth();

  const resetMeals = useCallback(() => {
    setMealsByDate({});
    setLoadingDates({});
    loadedDatesRef.current = {};
    loadingDatesRef.current = {};
  }, []);

  useEffect(() => {
    resetMeals();
  }, [resetMeals, user?.id]);

  const normalizeMeal = useCallback(
    (meal: any): MealItem => ({
      id: meal._id || meal.id,
      name: meal.name,
      brand: meal.brand || "Generic",
      quantity: meal.quantity,
      unit: meal.unit,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      isCompleted: !!meal.isCompleted,
      addedAt: meal.addedAt ? new Date(meal.addedAt) : new Date(),
    }),
    []
  );

  const loadMealsForDate = useCallback(
    async (date: string, force = false) => {
      if (
        !user ||
        (!force && (loadedDatesRef.current[date] || loadingDatesRef.current[date]))
      ) {
        return;
      }

      setLoadingDates((prev) => ({ ...prev, [date]: true }));
      loadingDatesRef.current[date] = true;
      try {
        const response = await mealsService.getMealsByDate(date);
        const normalized: MealsByDate[string] = {};
        Object.entries(response || {}).forEach(([mealType, items]) => {
          normalized[mealType] = items.map(normalizeMeal);
        });
        setMealsByDate((prev) => ({
          ...prev,
          [date]: normalized,
        }));
        loadedDatesRef.current[date] = true;
      } catch (error) {
        console.error("Failed to load meals:", (error as Error)?.message);
      } finally {
        setLoadingDates((prev) => {
          const next = { ...prev };
          delete next[date];
          return next;
        });
        delete loadingDatesRef.current[date];
      }
    },
    [normalizeMeal, user]
  );

  const addMealItem = useCallback(
    async (date: string, mealType: string, food: any, quantity: number, unit: "grams" | "servings") => {
      if (!user) {
        throw new Error("Please login to save meals.");
      }
      const foodId = food?.id || food?._id;
      if (!foodId) {
        throw new Error("Missing food identifier.");
      }

      const response = await mealsService.addMeal({
        date,
        mealType,
        foodId,
        quantity,
        unit,
      });

      const meal = normalizeMeal(response.meal);
      setMealsByDate((prev) => {
        const day = prev[date] || {};
        const list = day[mealType] || [];
        return {
          ...prev,
          [date]: {
            ...day,
            [mealType]: [...list, meal],
          },
        };
      });
    },
    [normalizeMeal, user]
  );

  const toggleMealCompletion = useCallback(
    async (date: string, mealType: string, itemId: string) => {
      if (!user) return;
      const response = await mealsService.toggleMeal(itemId);
      const updated = normalizeMeal(response.meal);

      setMealsByDate((prev) => {
        const day = prev[date];
        if (!day || !day[mealType]) return prev;
        return {
          ...prev,
          [date]: {
            ...day,
            [mealType]: day[mealType].map((item) =>
              item.id === itemId ? { ...item, ...updated } : item
            ),
          },
        };
      });
    },
    [normalizeMeal, user]
  );

  const removeMealItem = useCallback(
    async (date: string, mealType: string, itemId: string) => {
      if (!user) return;
      await mealsService.deleteMeal(itemId);

      setMealsByDate((prev) => {
        const day = prev[date];
        if (!day || !day[mealType]) return prev;
        return {
          ...prev,
          [date]: {
            ...day,
            [mealType]: day[mealType].filter((item) => item.id !== itemId),
          },
        };
      });
    },
    [user]
  );

  const removeAllMealsForDate = useCallback(
    async (date: string) => {
      if (!user) return;
      await mealsService.deleteMealsByDate(date);

      setMealsByDate((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
    },
    [user]
  );

  const updateMealItem = useCallback(
    async (date: string, mealType: string, itemId: string, data: { quantity: number; unit: 'grams' | 'servings'; mealType?: string }) => {
      if (!user) return;
      const response = await mealsService.updateMeal(itemId, data);
      const updated = normalizeMeal(response.meal);
      const newMealType = data.mealType || mealType;

      setMealsByDate((prev) => {
        const next = { ...prev };
        const day = { ...next[date] };

        if (newMealType !== mealType) {
          // Move item to different meal section
          day[mealType] = (day[mealType] || []).filter(i => i.id !== itemId);
          day[newMealType] = [...(day[newMealType] || []), updated];
        } else {
          // Update in place
          day[mealType] = (day[mealType] || []).map(i => i.id === itemId ? updated : i);
        }

        next[date] = day;
        return next;
      });
    },
    [normalizeMeal, user]
  );

  const getMealsForDate = useCallback(
    (date: string) => mealsByDate[date] || {},
    [mealsByDate]
  );

  const getTotalNutrientsForDate = useCallback((date: string) => {
    const meals = getMealsForDate(date);
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    console.log('🔍 Calculating total nutrients for date:', date);
    console.log('🍽️ Meals data:', meals);

    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        console.log('📝 Checking item:', { name: item.name, isCompleted: item.isCompleted, calories: item.calories });
        if (item.isCompleted) {
          totalCalories += item.calories;
          totalProtein += item.protein;
          totalCarbs += item.carbs;
          totalFats += item.fats;
        }
      });
    });

    const result = {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFats: Math.round(totalFats * 10) / 10,
    };

    console.log('📊 Total nutrients calculated:', result);
    return result;
  }, [getMealsForDate]);

  const getCompletedMealsCountForDate = useCallback((date: string) => {
    const meals = getMealsForDate(date);
    let count = 0;
    Object.values(meals).forEach(mealItems => {
      if (mealItems.some(item => item.isCompleted)) {
        count += 1;
      }
    });
    return count;
  }, [getMealsForDate]);

  const value = useMemo<MealsContextType>(
    () => ({
      mealsByDate,
      loadMealsForDate,
      addMealItem,
      toggleMealCompletion,
      removeMealItem,
      removeAllMealsForDate,
      updateMealItem,
      getMealsForDate,
      getTotalNutrientsForDate,
      getCompletedMealsCountForDate,
      loadingDates,
      resetMeals,
    }),
    [
      mealsByDate,
      loadMealsForDate,
      addMealItem,
      toggleMealCompletion,
      removeMealItem,
      removeAllMealsForDate,
      updateMealItem,
      loadingDates,
      getMealsForDate,
      getTotalNutrientsForDate,
      getCompletedMealsCountForDate,
      resetMeals,
    ]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
};

export function useMeals() {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
}

