import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMealsPerDay } from './dashboardUtils';
import { getMealSections } from '../../screens/MealsScreen'; // Import getMealSections

interface MentalHealthOption {
  label: string;
  icon: string;
  color: string;
}

interface BottomSheetContentProps {
  openSheet: 'nutritions' | 'mind' | 'activity' | null;
  stats: any;
  dailyTargets: any;
  consumedNutrients: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  };
  completedMealsCount: number;
  mentalHealthOptions: MentalHealthOption[];
  setSleepInput: (val: string) => void;
  setIsSleepModalVisible: (val: boolean) => void;
  closeSheetSafely: () => void;
  setIsMentalModalVisible: (val: boolean) => void;
  styles: { [key: string]: any };
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  openSheet,
  stats,
  dailyTargets,
  consumedNutrients,
  completedMealsCount,
  mentalHealthOptions,
  setSleepInput,
  setIsSleepModalVisible,
  closeSheetSafely,
  setIsMentalModalVisible,
  styles
}) => {
  if (openSheet === 'nutritions') {
    // Use getMealSections to determine the number of meal slots for the day
    const mealSections = getMealSections(stats.goalWeight);
    const mealsTarget = mealSections.length;
    return (
      <>
        <Text style={styles.sheetTitle}>Nutritions</Text>
        <ScrollView
          style={styles.sheetScrollView}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.sheetCards}>
            <View style={styles.card}><Ionicons name="flame" size={24} color="#f97316" /><Text style={styles.cardTitle}>Calories</Text><Text style={styles.cardValue}>{consumedNutrients.totalCalories} / {dailyTargets.calories} kcal</Text></View>
            <View style={styles.card}><Ionicons name="restaurant" size={24} color="#8b5cf6" /><Text style={styles.cardTitle}>Meals</Text><Text style={styles.cardValue}>{completedMealsCount} / {mealsTarget} meals</Text></View>
            <View style={styles.card}><Ionicons name="fitness" size={24} color="#22c55e" /><Text style={styles.cardTitle}>Proteins</Text><Text style={styles.cardValue}>{consumedNutrients.totalProtein} / {dailyTargets.protein}g</Text></View>
            <View style={styles.card}><Ionicons name="leaf" size={24} color="#84cc16" /><Text style={styles.cardTitle}>Carbs</Text><Text style={styles.cardValue}>{consumedNutrients.totalCarbs} / {dailyTargets.carbs}g</Text></View>
            <View style={styles.card}><Ionicons name="water" size={24} color="#f59e0b" /><Text style={styles.cardTitle}>Fats</Text><Text style={styles.cardValue}>{consumedNutrients.totalFats} / {dailyTargets.fats}g</Text></View>
          </View>
        </ScrollView>
      </>
    );
  }
  if (openSheet === 'mind') {
    return (
      <View style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Mind & Sleep</Text>
        <View style={styles.sheetCards}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setSleepInput(stats.sleep > 0 ? stats.sleep.toString() : '');
              setIsSleepModalVisible(true);
              closeSheetSafely();
            }}
          >
            <Ionicons name="moon" size={24} color="#a78bfa" />
            <Text style={styles.cardTitle}>Sleep</Text>
            <Text style={styles.cardValue}>{stats.sleep} / 8h</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setIsMentalModalVisible(true);
              closeSheetSafely();
            }}
          >
            <Ionicons
              name={mentalHealthOptions.find((option) => option.label === stats.mental)?.icon as any}
              size={24}
              color={mentalHealthOptions.find((option) => option.label === stats.mental)?.color}
            />
            <Text style={styles.cardTitle}>Mental</Text>
            <Text style={styles.cardValue}>{stats.mental}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (openSheet === 'activity') {
    return (
      <View style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Activity</Text>
        <View style={styles.sheetCards}>
          <View style={styles.card}><Ionicons name="walk" size={24} color="#34d399" /><Text style={styles.cardTitle}>Walking</Text><Text style={styles.cardValue}>{stats.walking} / {dailyTargets.steps.toLocaleString()} steps</Text></View>
          <View style={styles.card}><Ionicons name="barbell" size={24} color="#f87171" /><Text style={styles.cardTitle}>Workouts</Text><Text style={styles.cardValue}>{(stats.workoutsCompleted ?? 0)} / {(stats.workoutsTotal ?? 0)}</Text></View>
        </View>
      </View>
    );
  }
  return null;
};

export default BottomSheetContent; 