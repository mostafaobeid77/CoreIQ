import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Animated, Alert, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import MealsHeader from '../components/meals/sections/MealsHeader';
import { useDatePicker } from '../hooks/dashboard/useDatePicker';
import { createDashboardStyles } from '../components/dashboard/sections/dashboardStyles';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatsForDate, getMostRecentValues, DashboardStats, calculateDailyTargets } from '../components/dashboard/dashboardUtils';
import { useStats } from '../context/StatsContext';
import { useMeals } from '../context/MealsContext';
import { useMealSearch } from '../hooks/meals/useMealSearch';
import { useMealModals } from '../hooks/meals/useMealModals';
import { useDebounce } from '../hooks/meals/useDebounce';
import { format } from 'date-fns';

import FoodDetailsModal from '../components/meals/modals/FoodDetailsModal';
import AddFoodModal from '../components/submissions/AddFoodModal';
import { Swipeable } from 'react-native-gesture-handler';

export function getMealSections(goalWeight: string | undefined) {
  if (!goalWeight || goalWeight === 'Not set' || goalWeight === 'Maintain Weight') {
    return ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
  }
  if (goalWeight.includes('Lose Weight')) {
    return ['Breakfast', 'Snack', 'Lunch', 'Dinner'];
  }
  if (goalWeight.includes('Gain Weight')) {
    return ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
  }
  return ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
}

const macroIcons = {
  calories: { icon: 'flame', label: 'kcal' },
  protein: { icon: 'fitness', label: 'Protein' },
  carbs: { icon: 'leaf', label: 'Carbs' },
  fats: { icon: 'water', label: 'Fats' },
} as const;

const macroColors = {
  calories: '#f59e42',
  protein: '#38bdf8',
  carbs: '#fbbf24',
  fats: '#f472b6',
};

const MealsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectedDate, isDatePickerVisible, showDatePicker, hideDatePicker, handleConfirm, changeDay } = useDatePicker();
  const { searchMeals } = useMealSearch();
  const {
    addMealItem,
    getMealsForDate,
    toggleMealCompletion,
    removeMealItem,
    loadMealsForDate,
    loadingDates,
    updateMealItem,
    removeAllMealsForDate
  } = useMeals();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  const {
    isFoodDetailsModalVisible,
    selectedFood,
    editingItem,
    openFoodDetailsModal,
    closeFoodDetailsModal,
    handleAddToMeal
  } = useMealModals();

  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false);
  const [activeMealSection, setActiveMealSection] = useState<string | undefined>();
  const searchInputRef = useRef<TextInput>(null);

  const handleSearchInput = (text: string) => setSearch(text);

  const handleClearSearch = () => {
    setSearch('');
    setResults([]);
    setLoading(false);
  };

  const clearSearchAfterAdd = () => {
    setSearch('');
    setResults([]);
    setLoading(false);
  };

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length > 2) {
        setLoading(true);
        const foods = await searchMeals(debouncedSearch);
        setResults(foods);
        setLoading(false);
      } else {
        setResults([]);
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch, searchMeals]);

  const { statsByDate, loadStatsForDate } = useStats();
  const mostRecent = getMostRecentValues(statsByDate);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const stats: DashboardStats = getStatsForDate(dateKey, statsByDate, mostRecent);
  const targets = calculateDailyTargets(stats);

  useEffect(() => {
    loadStatsForDate(dateKey);
    loadMealsForDate(dateKey);
  }, [dateKey, loadStatsForDate, loadMealsForDate]);

  const goalWeight = stats.goalWeight;
  const mealSections = getMealSections(goalWeight);
  const mealsForDate = getMealsForDate(dateKey);

  const hasAnyMeals = Object.values(mealsForDate).some(list => (list as any[]).length > 0);

  const handleDeleteAll = () => {
    Alert.alert(
      'Clear All Meals',
      'Are you sure you want to delete all meal entries for this day? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAllMealsForDate(dateKey);
            } catch (error: any) {
              Alert.alert('Error clearing meals', error?.message || 'Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAddFoodToMeal = async (food: any, quantity: number, mealType: string, inputMode: 'grams' | 'servings') => {
    try {
      if (editingItem) {
        await updateMealItem(dateKey, editingItem.mealType, editingItem.id, {
          quantity,
          unit: inputMode,
          mealType: mealType !== editingItem.mealType ? mealType : undefined
        });
      } else {
        await addMealItem(dateKey, mealType, food, quantity, inputMode);
      }
      clearSearchAfterAdd();
      closeFoodDetailsModal();
    } catch (error) {
      throw error;
    }
  };

  const handleEditMealPress = (mealType: string, item: any) => {
    const foodToEdit = {
      ...item,
      unit: item.unit || (item.grams ? 'grams' : 'servings'),
      quantity: item.quantity || item.grams,
      mealType: mealType
    };
    openFoodDetailsModal(foodToEdit, { id: item.id, mealType });
  };

  const handleToggleMealCompletion = async (mealType: string, itemId: string) => {
    try {
      await toggleMealCompletion(dateKey, mealType, itemId);
    } catch (error: any) {
      Alert.alert('Unable to update meal', error?.message || 'Please try again.');
    }
  };

  const getAnimatedStyle = (isCompleted: boolean) => {
    const animatedValue = new Animated.Value(isCompleted ? 1 : 0);

    Animated.timing(animatedValue, {
      toValue: isCompleted ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme === 'light' ? '#ffffff' : '#1e1e1e', theme === 'light' ? '#f0fdf4' : '#142018'],
    });

    return { backgroundColor };
  };

  const dashboardStyles = React.useMemo(() => createDashboardStyles(theme === 'light'), [theme]);

  return (
    <View style={[dashboardStyles.container, { backgroundColor: dashboardStyles.colors.bg }]}>
      <SafeAreaView style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#181818' }} edges={['top']}>
        <MealsHeader
          selectedDate={selectedDate}
          showDatePicker={showDatePicker}
          changeDay={changeDay}
          isDatePickerVisible={isDatePickerVisible}
          handleConfirm={handleConfirm}
          hideDatePicker={hideDatePicker}
          styles={dashboardStyles}
        />
      </SafeAreaView>

      {/* SEARCH BAR */}
      <View style={{ paddingHorizontal: 16, marginTop: 12, marginBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme === 'light' ? '#f8fafc' : '#222',
            borderRadius: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: theme === 'light' ? '#e5e7eb' : '#333',
          }}
        >
          <Ionicons name="search" size={20} color={theme === 'light' ? '#667085' : '#888'} style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            style={{ flex: 1, color: theme === 'light' ? '#111' : '#fff', height: 40 }}
            placeholder="Search for foods..."
            placeholderTextColor={theme === 'light' ? '#98a2b3' : '#888'}
            value={search}
            onChangeText={handleSearchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={{ marginLeft: 8 }}>
              <Ionicons name="close-circle" size={20} color={theme === 'light' ? '#98a2b3' : '#888'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SEARCH RESULTS */}
      {loading && <ActivityIndicator size="small" color={theme === 'light' ? '#667085' : '#888'} style={{ marginTop: 8 }} />}
      {results.length > 0 && (
        <ScrollView
          style={{
            maxHeight: 250,
            marginHorizontal: 16,
            backgroundColor: theme === 'light' ? '#ffffff' : '#222',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme === 'light' ? '#e5e7eb' : '#333',
          }}
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme === 'light' ? '#e5e7eb' : '#333' }}
              onPress={() => openFoodDetailsModal(item)}
            >
              <Text style={{ color: theme === 'light' ? '#111' : '#fff', fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12, marginTop: 2 }}>{item.description}</Text>
              <Text style={{ color: theme === 'light' ? '#667085' : '#888', fontSize: 11, marginTop: 2 }}>Category: {item.category}</Text>
              <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12, marginTop: 4 }}>
                {item.calories} kcal | Protein: {item.protein}g Carbs: {item.carbs}g Fats: {item.fats}g
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* MEALS LIST */}
      <ScrollView contentContainerStyle={dashboardStyles.scrollContent}>
        {loadingDates[dateKey] && <ActivityIndicator style={{ marginVertical: 12 }} color="#2563eb" />}

        {/* Nutrition Summary Card (Premium) */}
        {!loadingDates[dateKey] && (
          <View style={{
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 20,
            backgroundColor: dashboardStyles.colors.bg2,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: dashboardStyles.colors.border2,
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: theme === 'light' ? 0.04 : 0.3,
            shadowRadius: 20,
            elevation: theme === 'light' ? 3 : 5,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: theme === 'light' ? '#f5f3ff' : '#2d264a',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                borderColor: theme === 'light' ? '#ddd6fe' : '#3c305c',
                borderWidth: 1
              }}>
                <Ionicons name="pie-chart" size={22} color="#8b5cf6" />
              </View>
              <View>
                <Text style={{ color: dashboardStyles.colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 }}>Daily Nutrition</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ color: '#8b5cf6', fontSize: 14, fontWeight: '700' }}>
                    {Object.values(mealsForDate).reduce((acc: number, list: any) => acc + list.reduce((c: number, i: any) => c + i.calories, 0), 0)}
                    <Text style={{ color: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 14, fontWeight: '500' }}>/{targets.calories} kcal</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Macro Bars */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { label: 'Prot', value: Object.values(mealsForDate).reduce((acc: number, l: any) => acc + l.reduce((p: number, i: any) => p + (i.protein || 0), 0), 0), target: targets.protein, color: macroColors.protein },
                { label: 'Carb', value: Object.values(mealsForDate).reduce((acc: number, l: any) => acc + l.reduce((c: number, i: any) => c + (i.carbs || 0), 0), 0), target: targets.carbs, color: macroColors.carbs },
                { label: 'Fat', value: Object.values(mealsForDate).reduce((acc: number, l: any) => acc + l.reduce((f: number, i: any) => f + (i.fats || 0), 0), 0), target: targets.fats, color: macroColors.fats },
              ].map((macro) => {
                const progress = Math.min(100, (macro.value / (macro.target || 1)) * 100);
                return (
                  <View key={macro.label} style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>{macro.label}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: theme === 'light' ? '#334155' : '#e2e8f0' }}>
                        {Math.round(macro.value)}/{Math.round(macro.target || 0)}g
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: theme === 'light' ? '#f1f5f9' : '#2d2d2d', borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ width: `${progress}%`, height: '100%', backgroundColor: macro.color, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </View>

            {hasAnyMeals && (
              <TouchableOpacity
                onPress={handleDeleteAll}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  padding: 8,
                  backgroundColor: '#ef444410', // slightly lighter red bg
                  borderRadius: 12
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Meal Sections */}
        {mealSections.map((mealType) => {
          const mealItems = mealsForDate[mealType] || [];

          return (
            <View key={mealType} style={{ marginBottom: 24 }}>
              {/* Clean Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 12
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: theme === 'light' ? '#0f172a' : '#fff',
                    letterSpacing: -0.5,
                    marginRight: 8
                  }}>
                    {mealType}
                  </Text>
                  <View style={{
                    backgroundColor: theme === 'light' ? '#f1f5f9' : '#2d2d2d',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                      {mealItems.reduce((acc: number, i: any) => acc + i.calories, 0)} kcal
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setActiveMealSection(mealType);
                    searchInputRef.current?.focus();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#8b5cf6', fontSize: 13, fontWeight: '700', marginRight: 4 }}>Add Item</Text>
                  <Ionicons name="add-circle" size={20} color="#8b5cf6" />
                </TouchableOpacity>
              </View>

              {/* Items List */}
              <View style={{ paddingHorizontal: 16 }}>
                {mealItems.length === 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      setActiveMealSection(mealType);
                      searchInputRef.current?.focus();
                    }}
                    style={{
                      padding: 16,
                      borderWidth: 2,
                      borderColor: theme === 'light' ? '#f1f5f9' : '#262626',
                      borderStyle: 'dashed',
                      borderRadius: 16,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: theme === 'light' ? '#94a3b8' : '#525252', fontSize: 13, fontWeight: '600' }}>
                      Add {mealType.toLowerCase()}...
                    </Text>
                  </TouchableOpacity>
                ) : (
                  mealItems.map((item) => (
                    <Swipeable
                      key={item.id}
                      renderRightActions={() => (
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#ef4444',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                            height: '100%',
                            borderRadius: 16,
                            marginBottom: 12,
                          }}
                          onPress={async () => {
                            try {
                              await removeMealItem(dateKey, mealType, item.id);
                            } catch (error: any) {
                              Alert.alert('Unable to delete meal', error?.message || 'Please try again.');
                            }
                          }}
                        >
                          <Ionicons name="trash" size={24} color="#fff" />
                        </TouchableOpacity>
                      )}
                    >
                      <Animated.View
                        style={{
                          ...getAnimatedStyle(item.isCompleted),
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderRadius: 20,
                          marginBottom: 12,
                          padding: 14,
                          borderWidth: 1,
                          borderColor: item.isCompleted
                            ? theme === 'light' ? '#dcfce7' : '#14532d'
                            : theme === 'light' ? '#f1f5f9' : '#2d2d2d',
                          backgroundColor: item.isCompleted
                            ? theme === 'light' ? '#f0fdf4' : '#052e16'
                            : theme === 'light' ? '#fff' : '#1e1e1e',
                          shadowColor: '#000',
                          shadowOpacity: theme === 'light' ? 0.05 : 0.2,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 2,
                        }}
                      >
                        {/* Checkbox (Updated visual) */}
                        <TouchableOpacity
                          onPress={() => handleToggleMealCompletion(mealType, item.id)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 10,
                            backgroundColor: item.isCompleted ? '#22c55e' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: item.isCompleted ? '#22c55e' : (theme === 'light' ? '#cbd5e1' : '#444'),
                            marginRight: 14,
                          }}
                        >
                          {item.isCompleted && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </TouchableOpacity>

                        {/* Content */}
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => handleEditMealPress(mealType, item)}
                        >
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: theme === 'light' ? '#0f172a' : '#fff',
                            marginBottom: 4,
                            opacity: item.isCompleted ? 0.5 : 1,
                          }}>{item.name}</Text>

                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: theme === 'light' ? '#64748b' : '#94a3b8', marginRight: 8 }}>
                              {item.calories} kcal
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: '500', color: theme === 'light' ? '#94a3b8' : '#64748b', marginRight: 12 }}>
                              {item.quantity}{item.unit === 'servings' ? ' srv' : 'g'}
                            </Text>

                            {/* Macros without separators, just spaced */}
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <Text style={{ fontSize: 11, color: macroColors.protein, fontWeight: '700' }}>{Math.round(item.protein || 0)}p</Text>
                              <Text style={{ fontSize: 11, color: macroColors.carbs, fontWeight: '700' }}>{Math.round(item.carbs || 0)}c</Text>
                              <Text style={{ fontSize: 11, color: macroColors.fats, fontWeight: '700' }}>{Math.round(item.fats || 0)}f</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    </Swipeable>
                  ))
                )}
              </View>
            </View>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>

      <FoodDetailsModal
        visible={isFoodDetailsModalVisible}
        onClose={closeFoodDetailsModal}
        food={selectedFood}
        onAddToMeal={handleAddFoodToMeal}
        mealSections={mealSections}
        defaultMealType={activeMealSection}
      />

      <AddFoodModal
        visible={isAddFoodModalVisible}
        onClose={() => setIsAddFoodModalVisible(false)}
        onSuccess={() => { }}
      />
    </View>
  );
};

export default MealsScreen;
