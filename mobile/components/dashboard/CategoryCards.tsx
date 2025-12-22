import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type for mental health option
interface MentalHealthOption {
  label: string;
  icon: string;
  color: string;
}

// Props interface
interface CategoryCardsProps {
  stats: any;
  dailyTargets: any;
  consumedNutrients: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  };
  completedMealsCount: number;
  openSheetSafely: (category: 'nutritions' | 'mind' | 'activity') => void;
  setIsEditingWater: (val: boolean) => void;
  setIsWaterModalVisible: (val: boolean) => void;
  mentalHealthOptions: MentalHealthOption[];
  styles: { [key: string]: any };
  isFutureDate?: boolean; // Disable interactions for future dates
}

const CategoryCards: React.FC<CategoryCardsProps> = ({
  stats,
  dailyTargets,
  consumedNutrients,
  completedMealsCount,
  openSheetSafely,
  setIsEditingWater,
  setIsWaterModalVisible,
  mentalHealthOptions,
  styles,
  isFutureDate = false
}) => {
  // Determine meals target (range or value)
  let mealsTarget = dailyTargets.meals;
  if (typeof mealsTarget === 'object' && mealsTarget !== null) {
    mealsTarget = `${mealsTarget.min}-${mealsTarget.max}`;
  }

  return (
    <View style={styles.categoryGrid}>
      <TouchableOpacity
        style={[styles.categoryCard, isFutureDate && { opacity: 0.6 }]}
        onPress={() => !isFutureDate && openSheetSafely('nutritions')}
        disabled={isFutureDate}
      >
        <Ionicons name="nutrition" size={36} color="#f59e0b" />
        <Text style={styles.categoryTitle}>Nutritions</Text>
        <Text style={styles.categorySummary}>
          {consumedNutrients.totalCalories - (stats.totalCaloriesBurned || 0)} / {dailyTargets.calories} kcal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.categoryCard, isFutureDate && { opacity: 0.6 }]}
        onPress={() => !isFutureDate && openSheetSafely('mind')}
        disabled={isFutureDate}
      >
        <Ionicons
          name={mentalHealthOptions.find((option) => option.label === stats.mental)?.icon as any}
          size={36}
          color={mentalHealthOptions.find((option) => option.label === stats.mental)?.color}
        />
        <Text style={styles.categoryTitle}>Mind & Sleep</Text>
        <Text style={styles.categorySummary}>{stats.sleep}h, {stats.mental}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.categoryCard, isFutureDate && { opacity: 0.6 }]}
        onPress={() => !isFutureDate && openSheetSafely('activity')}
        disabled={isFutureDate}
      >
        <Ionicons name="walk" size={36} color="#34d399" />
        <Text style={styles.categoryTitle}>Activity</Text>
        <Text style={styles.categorySummary}>{stats.walking} / {dailyTargets.steps.toLocaleString()} steps</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.categoryCard, isFutureDate && { opacity: 0.6 }]}
        onPress={() => {
          if (!isFutureDate) {
            if (stats.water > 0) setIsEditingWater(true);
            setIsWaterModalVisible(true);
          }
        }}
        disabled={isFutureDate}
      >
        <Ionicons name="water" size={36} color="#60a5fa" />
        <Text style={styles.categoryTitle}>Water</Text>
        <Text style={styles.categorySummary}>{stats.water} / {dailyTargets.water}ml</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CategoryCards; 