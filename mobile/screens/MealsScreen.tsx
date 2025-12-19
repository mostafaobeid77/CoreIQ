import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Animated, ViewStyle, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import MealsHeader from '../components/meals/sections/MealsHeader';
import { useDatePicker } from '../hooks/dashboard/useDatePicker';
import { createDashboardStyles } from '../components/dashboard/sections/dashboardStyles';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatsForDate, getMostRecentValues, DashboardStats } from '../components/dashboard/dashboardUtils';
import { useStats } from '../context/StatsContext';
import { useMeals } from '../context/MealsContext';
import { useMealSearch } from '../hooks/meals/useMealSearch';
import { useMealModals } from '../hooks/meals/useMealModals';
import { useDebounce } from '../hooks/meals/useDebounce';
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

  const { selectedDate, isDatePickerVisible, showDatePicker, hideDatePicker, handleConfirm, changeDay } = useDatePicker();
  const { searchMeals } = useMealSearch();

  const { addMealItem, getMealsForDate, toggleMealCompletion, removeMealItem, loadMealsForDate, loadingDates } = useMeals();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  const { isFoodDetailsModalVisible, selectedFood, openFoodDetailsModal, closeFoodDetailsModal, handleAddToMeal } = useMealModals();

  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false);

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
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const stats: DashboardStats = getStatsForDate(dateKey, statsByDate, mostRecent);

  useEffect(() => {
    loadStatsForDate(dateKey);
    loadMealsForDate(dateKey);
  }, [dateKey, loadMealsForDate, loadStatsForDate]);

  const goalWeight = stats.goalWeight;
  const mealSections = getMealSections(goalWeight);
  const mealsForDate = getMealsForDate(dateKey);

  const handleAddFoodToMeal = async (food: any, quantity: number, mealType: string, inputMode: 'grams' | 'servings') => {
    try {
      await addMealItem(dateKey, mealType, food, quantity, inputMode);
      clearSearchAfterAdd();
    } catch (error) {
      throw error;
    }
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
      outputRange: ['#232323', '#1e2d24'],
    });

    return { backgroundColor };
  };

  const { theme } = useTheme();
  const dashboardStyles = React.useMemo(() => createDashboardStyles(theme === 'light'), [theme]);

  return (
    <View style={[dashboardStyles.container, { backgroundColor: theme === 'light' ? '#ffffff' : '#0f0f0f' }]}>
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
        {loadingDates[dateKey] && <ActivityIndicator style={{ marginVertical: 12 }} color={theme === 'light' ? '#2563eb' : '#60a5fa'} />}

        {mealSections.map((mealType) => {
          const mealItems = mealsForDate[mealType] || [];
          const completedItems = mealItems.filter((item) => item.isCompleted).length;
          const totalItems = mealItems.length;
          const isMealCompleted = totalItems > 0 && completedItems === totalItems;

          return (
            <View
              key={mealType}
              style={{
                marginHorizontal: 4,
                marginTop: 16,
                backgroundColor: theme === 'light' ? '#f2f4f7' : '#1f1f1f',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme === 'light' ? '#e5e7eb' : '#333',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="restaurant" size={20} color="#8b5cf6" style={{ marginRight: 8 }} />
                <Text style={{ color: theme === 'light' ? '#111' : '#fff', fontSize: 16, fontWeight: '600' }}>{mealType}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" style={{ marginLeft: 8, opacity: isMealCompleted ? 1 : 0.3 }} />
              </View>

              {mealItems.length === 0 ? (
                <Text style={{ color: theme === 'light' ? '#667085' : '#888', fontSize: 14 }}>No foods added yet.</Text>
              ) : (
                <View>
                  {mealItems.map((item) => (
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
                          }}
                          onPress={async () => {
                            try {
                              await removeMealItem(dateKey, mealType, item.id);
                            } catch (error: any) {
                              Alert.alert('Unable to delete meal', error?.message || 'Please try again.');
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash" size={24} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    >
                      <Animated.View
                        style={{
                          ...getAnimatedStyle(item.isCompleted),
                          flexDirection: 'row',
                          alignItems: 'stretch',
                          borderRadius: 18,
                          marginBottom: 16,
                          marginTop: 2,
                          marginHorizontal: 2,
                          backgroundColor: item.isCompleted
                            ? theme === 'light'
                              ? '#e8f3ec'
                              : '#1e2d24'
                            : theme === 'light'
                              ? '#ffffff'
                              : '#232323',
                          shadowColor: '#000',
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 2,
                          opacity: item.isCompleted ? 0.85 : 1,
                          position: 'relative',
                          minHeight: 72,
                        } as ViewStyle}
                      >
                        {/* Accent */}
                        <View
                          style={{
                            width: 5,
                            height: '100%',
                            backgroundColor: '#8b5cf6',
                            borderTopLeftRadius: 18,
                            borderBottomLeftRadius: 18,
                            marginRight: 10,
                          }}
                        />

                        {/* Checkbox */}
                        <View style={{ width: 44, alignItems: 'center', justifyContent: 'center' }}>
                          <TouchableOpacity
                            onPress={() => handleToggleMealCompletion(mealType, item.id)}
                            style={{
                              backgroundColor: item.isCompleted ? '#22c55e' : theme === 'light' ? '#ffffff' : '#232323',
                              borderRadius: 16,
                              padding: 7,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 2,
                              borderColor: item.isCompleted ? '#22c55e' : theme === 'light' ? '#e5e7eb' : '#444',
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={item.isCompleted ? 'checkmark-done' : 'ellipse-outline'}
                              size={20}
                              color={item.isCompleted ? '#fff' : theme === 'light' ? '#667085' : '#888'}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <TouchableOpacity
                          style={{ flex: 1, justifyContent: 'center', paddingVertical: 10, paddingLeft: 2 }}
                          activeOpacity={0.8}
                          onPress={() => handleToggleMealCompletion(mealType, item.id)}
                        >
                          <Text
                            style={{
                              color: item.isCompleted
                                ? theme === 'light'
                                  ? '#166534'
                                  : '#b3e6c1'
                                : theme === 'light'
                                  ? '#111'
                                  : '#fff',
                              fontSize: 16,
                              fontWeight: '700',
                              marginBottom: 6,
                              letterSpacing: 0.1,
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.name}
                          </Text>

                          {/* Macros */}
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                            {/* Calories */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 2 }}>
                              <Ionicons name={macroIcons.calories.icon as any} size={13} color={macroColors.calories} style={{ marginRight: 2 }} />
                              <Text style={{ color: macroColors.calories, fontSize: 12, fontWeight: '500', marginRight: 2 }}>{item.calories}</Text>
                              <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12 }}>{macroIcons.calories.label}</Text>
                            </View>

                            {/* Protein */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 2 }}>
                              <Ionicons name={macroIcons.protein.icon as any} size={13} color={macroColors.protein} style={{ marginRight: 2 }} />
                              <Text style={{ color: macroColors.protein, fontSize: 12, fontWeight: '500', marginRight: 2 }}>{item.protein}</Text>
                              <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12 }}>{macroIcons.protein.label}</Text>
                            </View>

                            {/* Carbs */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 2 }}>
                              <Ionicons name={macroIcons.carbs.icon as any} size={13} color={macroColors.carbs} style={{ marginRight: 2 }} />
                              <Text style={{ color: macroColors.carbs, fontSize: 12, fontWeight: '500', marginRight: 2 }}>{item.carbs}</Text>
                              <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12 }}>{macroIcons.carbs.label}</Text>
                            </View>

                            {/* Fats */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 0, marginBottom: 2 }}>
                              <Ionicons name={macroIcons.fats.icon as any} size={13} color={macroColors.fats} style={{ marginRight: 2 }} />
                              <Text style={{ color: macroColors.fats, fontSize: 12, fontWeight: '500', marginRight: 2 }}>{item.fats}</Text>
                              <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12 }}>{macroIcons.fats.label}</Text>
                            </View>
                          </View>

                          {/* Quantity */}
                          <Text style={{ color: theme === 'light' ? '#475467' : '#aaa', fontSize: 12, marginTop: 2 }}>
                            {item.quantity}
                            {item.unit === 'servings' ? ' serving' : 'g'}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    </Swipeable>
                  ))}

                  {/* Summary */}
                  <View
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: theme === 'light' ? '#e5e7eb' : '#333',
                    }}
                  >
                    <Text style={{ color: theme === 'light' ? '#667085' : '#888', fontSize: 12 }}>
                      Total: {mealItems.reduce((sum, item) => sum + item.calories, 0)} kcal • Completed: {completedItems}/{totalItems}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* ADD FOOD BUTTON (still here) */}
        <TouchableOpacity
          style={{ margin: 24, backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center' }}
          onPress={() => setIsAddFoodModalVisible(true)}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>+ Add Meal</Text>
        </TouchableOpacity>

        {/* NOTE: Add Plan button has been removed */}
      </ScrollView>

      {/* Food Details Modal */}
      <FoodDetailsModal
        visible={isFoodDetailsModalVisible}
        onClose={closeFoodDetailsModal}
        food={selectedFood}
        onAddToMeal={handleAddFoodToMeal}
        styles={dashboardStyles}
        mealSections={mealSections}
      />

      {/* Add Food Modal */}
      <AddFoodModal
        visible={isAddFoodModalVisible}
        onClose={() => setIsAddFoodModalVisible(false)}
        onSuccess={() => { }}
      />
    </View>
  );
};

export default MealsScreen;
