import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, Animated, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MealScreen from './MealsScreen';
import WorkoutScreen from './WorkoutScreen';
import PlansScreen from './PlansScreen';
import AiScreen from './AiScreen';
import SettingScreen from './SettingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { Pedometer } from 'expo-sensors';
import CategoryCards from '../components/dashboard/CategoryCards';
import BottomSheetContent from '../components/dashboard/BottomSheetContent';
import WaterModal from '../components/dashboard/modals/WaterModal';
import MentalModal from '../components/dashboard/modals/MentalModal';
import WeightModal from '../components/dashboard/modals/WeightModal';
import HeightModal from '../components/dashboard/modals/HeightModal';
import ActivityModal from '../components/dashboard/modals/ActivityModal';
import GoalWeightModal from '../components/dashboard/modals/GoalWeightModal';
import SleepModal from '../components/dashboard/modals/SleepModal';
import ProgressAnalysisModal from '../components/dashboard/modals/ProgressAnalysisModal';
import { useStatsByDate } from '../hooks/dashboard/useStatsbyDate';
import {
  getMostRecentValues,
  getStatsForDate,
  getMealsPerDay,
  calculateDailyTargets,
  DashboardStats,
  defaultStats
} from '../components/dashboard/dashboardUtils';
import PhysicalStatsSection from '../components/dashboard/sections/PhysicalStatsSection';
import GoalsSection from '../components/dashboard/sections/GoalsSection';
import DashboardHeader from '../components/dashboard/sections/DashboardHeader';
import DashboardNavbar from '../components/dashboard/sections/DashboardNavbar';
import { createDashboardStyles } from '../components/dashboard/sections/dashboardStyles';
import { useTheme } from '../context/themeContext';
import { useStepCounter } from '../hooks/dashboard/useStepCounter';
import { useDatePicker } from '../hooks/dashboard/useDatePicker';
import { useDashboardModals } from '../hooks/dashboard/useDashboardModals';
import { useStats } from '../context/StatsContext';
import { useMeals } from '../context/MealsContext';
import { useAuth } from '../context/AuthContext';

const sheetHeight = 500; // Increased height for better scrolling

const TABS = [
  { label: 'Home', icon: 'home' },
  { label: 'Meals', icon: 'fast-food' },
  { label: 'Workouts', icon: 'barbell' },
  { label: 'Plans', icon: 'calendar' },
  { label: 'AI', icon: 'rocket' },
  { label: 'Settings', icon: 'settings' },
];

const DashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const { user } = useAuth();
  const userName = user?.fullName?.split(' ')[0] || 'there';
  const greetingEmoji = '👋';
  const { theme } = useTheme();

  // Get avatar source - user's profile photo or default logo
  const avatarSource = React.useMemo(() => {
    if (user?.profilePhoto) {
      return { uri: user.profilePhoto };
    }
    return require('../assets/images/logo.png');
  }, [user?.profilePhoto]);
  const styles = React.useMemo(() => createDashboardStyles(theme === 'light'), [theme]);
  const [autoOpenWizard, setAutoOpenWizard] = useState(false);
  const [waterInput, setWaterInput] = useState('');
  const [isEditingWater, setIsEditingWater] = useState(false);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const [mentalHealthOptions, setMentalHealthOptions] = useState([
    { label: 'Motivated', icon: 'rocket', color: '#10b981' },
    { label: 'Neutral', icon: 'happy', color: '#6b7280' },
    { label: 'Stressed', icon: 'alert-circle', color: '#f59e0b' },
    { label: 'Tired', icon: 'bed', color: '#8b5cf6' },
    { label: 'Sad', icon: 'sad', color: '#3b82f6' },
    { label: 'Confident', icon: 'trophy', color: '#fbbf24' },
    { label: 'Overwhelmed', icon: 'warning', color: '#ef4444' },
  ]);
  const [selectedWeightGoal, setSelectedWeightGoal] = useState('');
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [sleepInput, setSleepInput] = useState('');
  const { currentStepCount, isPedometerAvailable } = useStepCounter(user?.id, user?.createdAt);
  const screenHeight = Dimensions.get('window').height;
  // const sheetAnim = useState(new Animated.Value(screenHeight))[0]; // Removed

  const {
    selectedDate,
    isDatePickerVisible,
    showDatePicker,
    hideDatePicker,
    handleConfirm,
    changeDay,
    setSelectedDate
  } = useDatePicker();

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Check if selected date is in the future
  const isFutureDate = React.useMemo(() => {
    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  }, [selectedDate]);


  const { statsByDate, loadStatsForDate, updateStatsForDate } = useStats();
  const { getTotalNutrientsForDate, mealsByDate, getCompletedMealsCountForDate, loadMealsForDate } = useMeals();

  React.useEffect(() => {
    loadStatsForDate(dateKey);
    loadMealsForDate(dateKey);
  }, [dateKey, loadMealsForDate, loadStatsForDate]);

  // Get the most recent weight and height values for defaults
  const { mostRecentWeight, mostRecentHeight, mostRecentActivityLevel, mostRecentGoalWeight } = getMostRecentValues(statsByDate);
  const mostRecent = { mostRecentWeight, mostRecentHeight, mostRecentActivityLevel, mostRecentGoalWeight };
  const stats: DashboardStats = getStatsForDate(dateKey, statsByDate, mostRecent);

  // Calculate consumed nutrients directly from mealsByDate to ensure reactivity
  const consumedNutrients = React.useMemo(() => {
    const meals = mealsByDate[dateKey] || {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        console.log('📝 Dashboard checking item:', { name: item.name, isCompleted: item.isCompleted, calories: item.calories });
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
    return result;
  }, [mealsByDate, dateKey]);



  // Force re-render when meals change
  React.useEffect(() => {
  }, [mealsByDate]);

  // Add function to determine meals per day based on goal
  const dailyTargets = calculateDailyTargets(stats);

  // Sync live step count to stats.walking ONLY for TODAY (not past dates!)
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
  React.useEffect(() => {
    if (isToday && isPedometerAvailable && currentStepCount !== stats.walking) {
      void updateStatsForDate(dateKey, { walking: currentStepCount });
    }
  }, [currentStepCount, dateKey, isToday, isPedometerAvailable, stats.walking, updateStatsForDate]);

  // Display steps: 0 for future dates, current count for today, saved count for past dates
  const displaySteps = isFutureDate ? 0 : (dateKey === format(new Date(), 'yyyy-MM-dd') ? currentStepCount : stats.walking);

  const {
    handleWaterAdd, handleWaterSubtract,
    handleMentalSelect,
    handleWeightSave,
    handleHeightSave,
    handleActivityLevelSave,
    handleGoalWeightSave,
    handleWeightGoalSelect: baseHandleWeightGoalSelect,
    handleSleepSave,
    handleSleepAdd,
    handleSleepSubtract,
    errors,
    setErrors
  } = useStatsByDate(dateKey, stats, setIsEditingWater, updateStatsForDate, waterInput, weightInput, heightInput, sleepInput);

  const handleWeightGoalSelect = (goal: string, targetWeight: number) => {
    setGoalWeightInput(''); // Clear input when transitioning between goal types
    baseHandleWeightGoalSelect(goal, targetWeight);
  };

  const {
    isWaterModalVisible, setIsWaterModalVisible,
    isMentalModalVisible, setIsMentalModalVisible,
    isWeightModalVisible, setIsWeightModalVisible,
    isHeightModalVisible, setIsHeightModalVisible,
    isActivityModalVisible, setIsActivityModalVisible,
    isGoalWeightModalVisible, setIsGoalWeightModalVisible,
    isSleepModalVisible, setIsSleepModalVisible,
    openSheet, setOpenSheet
  } = useDashboardModals();

  // --- Water Modal Logic ---
  const handleOutsideTap = () => {
    setIsWaterModalVisible(false);
    // Don't clear waterInput - let it persist
  };

  const openGoalWeightModal = () => {
    // Pre-populate with current goal
    if (stats.goalWeight && stats.goalWeight !== 'Not set') {
      if (stats.goalWeight.includes(':')) {
        const parts = stats.goalWeight.split(':');
        setSelectedWeightGoal(parts[0].trim());
        setGoalWeightInput(parts[1].replace('kg', '').trim());
      } else {
        setSelectedWeightGoal(stats.goalWeight);
      }
    }
    // Clear any previous errors when opening
    setErrors(prev => ({ ...prev, goalWeight: '' }));
    setIsGoalWeightModalVisible(true);
  };

  const openSheetSafely = (category: 'nutritions' | 'mind' | 'activity') => {
    // First close any existing sheet
    setOpenSheet(null);

    // Small delay to ensure previous modal is fully closed
    setTimeout(() => {
      setOpenSheet(category);
    }, 100);
  };

  const closeSheetSafely = () => {
    setOpenSheet(null);
  };

  const handleWeightGoalSave = () => {
    const targetWeight = parseFloat(goalWeightInput) || 0;

    if (targetWeight > 0) {
      // Validate target weight based on current weight and goal
      let isValid = true;
      let errorMessage = '';

      if (selectedWeightGoal === 'Lose Weight' && targetWeight >= stats.weight) {
        isValid = false;
        errorMessage = `Target weight must be less than your current weight (${stats.weight}kg)`;
      } else if (selectedWeightGoal === 'Gain Weight' && targetWeight <= stats.weight) {
        isValid = false;
        errorMessage = `Target weight must be greater than your current weight (${stats.weight}kg)`;
      }

      if (isValid) {
        const goalWithTarget = `${selectedWeightGoal}: ${targetWeight}kg`;
        void updateStatsForDate(dateKey, { goalWeight: goalWithTarget });
        setIsGoalWeightModalVisible(false);
        setSelectedWeightGoal('');
        setGoalWeightInput('');
      } else {
        // Show inline error message instead of alert
        setErrors(prev => ({ ...prev, goalWeight: errorMessage }));
        return; // Stop here so modal stays open
      }
    }

    // Only close if we didn't return early (e.g. valid input or cancel)
    if (targetWeight > 0) {
      // If we got here, it was valid and handled above. 
      // Or logic flow needs to be cleaner.
      // Actually, let's restructure slightly to be safe.
    } else {
      // Empty/Zero input -> Close modal implies cancel/clear?
      // Or if user just pressed save with 0? 
      // Let's assume 0 means "haven't typed yet" which shouldn't happen if button disabled?
      // But if they typed 0?
      setIsGoalWeightModalVisible(false);
      setSelectedWeightGoal('');
      setGoalWeightInput('');
    }
  };



  // --- Main content ---
  let content;
  if (activeTab === 'Home') {
    content = (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeader, { marginHorizontal: 20, marginBottom: 15, marginTop: 10 }]}>Today's Overview</Text>

        {/* Smart Progress Banner */}
        <TouchableOpacity
          onPress={() => setIsProgressModalVisible(true)}
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            padding: 20,
            borderRadius: 20,
            backgroundColor: theme === 'dark' ? '#121212' : '#fff',
            borderWidth: 1,
            borderColor: styles.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 4
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MaterialCommunityIcons name="auto-fix" size={20} color={styles.colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: styles.colors.text }}>Smart Analysis</Text>
            </View>
            <Text style={{ fontSize: 13, color: styles.colors.textMuted }}>
              Get AI insights on your calorie deficit and predicted weight trace.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={styles.colors.textMuted} />
        </TouchableOpacity>

        <CategoryCards
          stats={{ ...stats, walking: displaySteps }}
          dailyTargets={dailyTargets}
          consumedNutrients={consumedNutrients}
          completedMealsCount={getCompletedMealsCountForDate(dateKey)}
          openSheetSafely={openSheetSafely}
          setIsEditingWater={setIsEditingWater}
          setIsWaterModalVisible={setIsWaterModalVisible}
          mentalHealthOptions={mentalHealthOptions}
          styles={styles}
          isFutureDate={isFutureDate}
        />

        {/* Physical Stats Section */}
        <PhysicalStatsSection
          stats={stats}
          setWeightInput={setWeightInput}
          setIsWeightModalVisible={setIsWeightModalVisible}
          setHeightInput={setHeightInput}
          setIsHeightModalVisible={setIsHeightModalVisible}
          styles={styles}
        />

        {/* Goals & Activity Section */}
        <GoalsSection
          stats={stats}
          setIsActivityModalVisible={setIsActivityModalVisible}
          setIsGoalWeightModalVisible={openGoalWeightModal}
          styles={styles}
        />
      </ScrollView>
    );
  } else if (activeTab === 'Meals') {
    content = <MealScreen />;
  } else if (activeTab === 'Workouts') {
    content = <WorkoutScreen />;
  } else if (activeTab === 'Plans') {
    content = <PlansScreen autoOpenWizard={autoOpenWizard} onWizardReset={() => setAutoOpenWizard(false)} />;
  } else if (activeTab === 'AI') {
    content = <AiScreen onTriggerWizard={() => {
      setAutoOpenWizard(true);
      setActiveTab('Plans');
    }} />;
  } else if (activeTab === 'Settings') {
    content = <SettingScreen />;
  }

  // --- Bottom Sheet Modal ---
  return (
    <View style={[styles.container, { backgroundColor: styles.colors.bg }]}>
      {activeTab === 'Home' && (
        <SafeAreaView
          style={{ backgroundColor: styles.colors.bg }}
          edges={['top']}
        >
          <DashboardHeader
            userName={userName}
            greetingEmoji={greetingEmoji}
            avatarSource={avatarSource}
            isDefaultAvatar={!user?.profilePhoto || user.profilePhoto === 'undefined' || user.profilePhoto === 'null' || user.profilePhoto.trim() === ''}
            selectedDate={selectedDate}
            showDatePicker={showDatePicker}
            changeDay={changeDay}
            isDatePickerVisible={isDatePickerVisible}
            handleConfirm={handleConfirm}
            hideDatePicker={hideDatePicker}
            styles={styles}
          />
        </SafeAreaView>
      )}
      {content}
      <DashboardNavbar
        TABS={TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
      />

      {/* Water Modal */}
      <WaterModal
        visible={isWaterModalVisible}
        onClose={handleOutsideTap}
        waterInput={waterInput}
        setWaterInput={setWaterInput}
        stats={stats}
        handleWaterAdd={() => {
          handleWaterAdd(waterInput);
          if (!errors.water) {
            setIsWaterModalVisible(false);
            setWaterInput('');
          }
        }}
        handleWaterSubtract={() => {
          handleWaterSubtract(waterInput);
          if (!errors.water) {
            setIsWaterModalVisible(false);
            setWaterInput('');
          }
        }}
        setIsEditingWater={setIsEditingWater}
        styles={styles}
        error={errors.water}
      />

      {/* Mental Health Modal */}
      <MentalModal
        visible={isMentalModalVisible}
        onClose={() => setIsMentalModalVisible(false)}
        stats={stats}
        mentalHealthOptions={mentalHealthOptions}
        handleMentalSelect={handleMentalSelect}
        styles={styles}
      />

      {/* Bottom Sheet Modal */}
      <Modal
        visible={!!openSheet}
        transparent
        animationType="slide"
        onRequestClose={closeSheetSafely}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Backdrop/Close Overlay - sibling behind the sheet */}
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={closeSheetSafely}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <View style={{ flex: 1 }}>
              <BottomSheetContent
                openSheet={openSheet}
                stats={{
                  ...stats,
                  getMealsPerDay
                }}
                dailyTargets={dailyTargets}
                consumedNutrients={consumedNutrients}
                completedMealsCount={getCompletedMealsCountForDate(dateKey)}
                mentalHealthOptions={mentalHealthOptions}
                setSleepInput={setSleepInput}
                setIsSleepModalVisible={setIsSleepModalVisible}
                closeSheetSafely={closeSheetSafely}
                setIsMentalModalVisible={setIsMentalModalVisible}
                styles={styles}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Weight Modal */}
      <WeightModal
        visible={isWeightModalVisible}
        onClose={() => setIsWeightModalVisible(false)}
        weightInput={weightInput}
        setWeightInput={setWeightInput}
        stats={stats}
        handleWeightSave={() => {
          handleWeightSave(weightInput);
          if (!errors.weight) {
            setIsWeightModalVisible(false);
            setWeightInput('');
          }
        }}
        styles={styles}
        error={errors.weight}
      />

      {/* Height Modal */}
      <HeightModal
        visible={isHeightModalVisible}
        onClose={() => setIsHeightModalVisible(false)}
        heightInput={heightInput}
        setHeightInput={setHeightInput}
        stats={stats}
        handleHeightSave={(value) => {
          handleHeightSave(value);
          if (!errors.height) {
            setIsHeightModalVisible(false);
            setHeightInput('');
          }
        }}
        styles={styles}
        error={errors.height}
      />

      {/* Activity Level Modal */}
      <ActivityModal
        visible={isActivityModalVisible}
        onClose={() => setIsActivityModalVisible(false)}
        stats={stats}
        handleActivityLevelSave={handleActivityLevelSave}
        styles={styles}
      />

      {/* Goal Weight Modal */}
      <GoalWeightModal
        visible={isGoalWeightModalVisible}
        onClose={() => {
          setIsGoalWeightModalVisible(false);
          setSelectedWeightGoal('');
          setGoalWeightInput('');
        }}
        stats={stats}
        selectedWeightGoal={selectedWeightGoal}
        setSelectedWeightGoal={(goal) => {
          if (goal !== selectedWeightGoal) {
            setGoalWeightInput('');
          }
          setSelectedWeightGoal(goal);
          if (goal === 'Maintain Weight') {
            void updateStatsForDate(dateKey, { goalWeight: 'Maintain Weight' });
            setIsGoalWeightModalVisible(false);
            setSelectedWeightGoal('');
            setGoalWeightInput('');
          }
        }}
        goalWeightInput={goalWeightInput}
        setGoalWeightInput={(text) => {
          setGoalWeightInput(text);
          if (errors.goalWeight) {
            setErrors(prev => ({ ...prev, goalWeight: '' }));
          }
        }}
        handleWeightGoalSelect={(goal, targetWeight) => {
          handleWeightGoalSelect(goal, targetWeight);
          if (!errors.goalWeight) {
            setIsGoalWeightModalVisible(false);
            setSelectedWeightGoal('');
            setGoalWeightInput('');
          }
        }}
        handleWeightGoalSave={() => {
          handleWeightGoalSave();
          if (!errors.goalWeight) {
            setIsGoalWeightModalVisible(false);
            setSelectedWeightGoal('');
            setGoalWeightInput('');
          }
        }}
        styles={styles}
        error={errors.goalWeight}
      />

      {/* Sleep Modal */}
      <SleepModal
        visible={isSleepModalVisible}
        onClose={() => {
          setIsSleepModalVisible(false);
          setSleepInput('');
        }}
        sleepInput={sleepInput}
        setSleepInput={setSleepInput}
        stats={stats}
        handleSleepSave={(val) => {
          handleSleepSave(val);
          if (!errors.sleep) {
            setIsSleepModalVisible(false);
            setSleepInput('');
          }
        }}
        styles={styles}
        error={errors.sleep}
      />

      {/* Progress Analysis Modal - Smart Tracker */}
      <ProgressAnalysisModal
        visible={isProgressModalVisible}
        onClose={() => setIsProgressModalVisible(false)}
        onWeightUpdated={async () => {
          console.log('[Dashboard] onWeightUpdated called, refreshing data for:', dateKey);
          // FORCE refresh by resetting the cache then reloading
          await loadMealsForDate(dateKey, true);
          console.log('[Dashboard] Meals reloaded');
          await loadStatsForDate(dateKey, true);
          console.log('[Dashboard] Stats reloaded, switching to Home tab');
          setActiveTab('Home');
        }}
      />
    </View>
  );
};

export default DashboardScreen; 
