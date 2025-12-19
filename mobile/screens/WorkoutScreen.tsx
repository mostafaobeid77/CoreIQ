import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import WorkoutHeader from '../components/workouts/sections/WorkoutHeader';
import WorkoutSearchBar from '../components/workouts/sections/WorkoutSearchBar';
import { useDatePicker } from '../hooks/dashboard/useDatePicker';
import { createDashboardStyles } from '../components/dashboard/sections/dashboardStyles';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatsForDate, getMostRecentValues, DashboardStats } from '../components/dashboard/dashboardUtils';
import { useStats } from '../context/StatsContext';
import { useDebounce } from '../hooks/meals/useDebounce';
import { useWorkoutSearch } from '../hooks/workouts/useWorkoutSearch';
import WorkoutDetailsModal from '../components/workouts/WorkoutDetailsModal';
import AddWorkoutModal from '../components/submissions/AddWorkoutModal';
import { useWorkouts } from '../context/WorkoutsContext';

const WorkoutScreen = () => {
  const router = useRouter();
  const {
    selectedDate,
    isDatePickerVisible,
    showDatePicker,
    hideDatePicker,
    handleConfirm,
    changeDay
  } = useDatePicker();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(search, 500);

  const { searchWorkouts } = useWorkoutSearch();

  // Modal state
  const [isWorkoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isAddWorkoutModalVisible, setIsAddWorkoutModalVisible] = useState(false);

  // Context for workouts
  const {
    getStrengthByGroupForDate,
    getCardioForDate,
    addStrengthEntry,
    addCardioEntry,
    toggleStrengthCompletion: ctxToggleStrength,
    toggleCardioCompletion: ctxToggleCardio,
    getCompletedVsTotal,
    clearDate,
  } = useWorkouts();

  // stats context for updating workouts count
  const { statsByDate, loadStatsForDate, updateStatsForDate } = useStats();

  // Handle search input changes (immediate UI update)
  const handleSearchInput = (text: string) => {
    setSearch(text);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearch('');
    setResults([]);
    setLoading(false);
  };

  // Effect to handle debounced search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length > 2) {
        setLoading(true);
        const workouts = await searchWorkouts(debouncedSearch);
        setResults(workouts);
        setLoading(false);
      } else {
        setResults([]);
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch, searchWorkouts]);

  const mostRecent = getMostRecentValues(statsByDate);
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const stats: DashboardStats = getStatsForDate(dateKey, statsByDate, mostRecent);

  useEffect(() => {
    loadStatsForDate(dateKey);
  }, [dateKey, loadStatsForDate]);

  // Get current workouts for this date from context BEFORE effects that depend on them
  const strengthByGroup = getStrengthByGroupForDate(dateKey);
  const cardioEntries = getCardioForDate(dateKey);

  // Completed/Total derived values to stabilize dependencies
  const { completed, total } = useMemo(
    () => getCompletedVsTotal(dateKey),
    [dateKey, strengthByGroup, cardioEntries]
  );

  // Update workouts count in stats (completed and total)
  useEffect(() => {
    void updateStatsForDate(dateKey, {
      workoutsCompleted: completed,
      workoutsTotal: total,
      workouts: completed,
    });
  }, [completed, dateKey, total, updateStatsForDate]);

  // Modal save handler
  const handleSaveWorkout = (
    payload:
      | { type: 'sets'; sets: { reps: number; weight: number }[] }
      | { type: 'duration'; minutes: number }
  ) => {
    if (!selectedWorkout) return;
    const isCardio =
      selectedWorkout.category?.toLowerCase() === 'cardio' ||
      selectedWorkout.muscle_group?.toLowerCase() === 'cardio';

    if (payload.type === 'duration' || isCardio) {
      addCardioEntry(dateKey, {
        name: selectedWorkout.name,
        minutes: payload.type === 'duration' ? payload.minutes : 0,
      });
    } else if (payload.type === 'sets') {
      addStrengthEntry(dateKey, {
        name: selectedWorkout.name,
        description: selectedWorkout.description,
        muscle_group: selectedWorkout.muscle_group || 'Other',
        sets: payload.sets,
      });
    }
    // Clear search and close modal
    setSearch('');
    setResults([]);
    setLoading(false);
    setWorkoutModalVisible(false);
  };

  const toggleStrengthCompletion = (group: string, entryId: string) =>
    ctxToggleStrength(dateKey, group, entryId);
  const toggleCardioCompletion = (entryId: string) =>
    ctxToggleCardio(dateKey, entryId);

  const { theme } = useTheme();
  const dashboardStyles = React.useMemo(
    () => createDashboardStyles(theme === 'light'),
    [theme]
  );

  return (
    <View
      style={[
        dashboardStyles.container,
        { backgroundColor: theme === 'light' ? '#ffffff' : '#0f0f0f' },
      ]}
    >
      <SafeAreaView
        style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#181818' }}
        edges={['top']}
      >
        <WorkoutHeader
          selectedDate={selectedDate}
          showDatePicker={showDatePicker}
          changeDay={changeDay}
          isDatePickerVisible={isDatePickerVisible}
          handleConfirm={handleConfirm}
          hideDatePicker={hideDatePicker}
          styles={dashboardStyles}
        />
      </SafeAreaView>

      {/* Search Bar */}
      <WorkoutSearchBar
        search={search}
        onSearchChange={handleSearchInput}
        onClearSearch={handleClearSearch}
      />

      {/* Search Results */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={theme === 'light' ? '#667085' : '#888'}
          style={{ marginTop: 8 }}
        />
      )}
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
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme === 'light' ? '#e5e7eb' : '#333',
              }}
              onPress={() => {
                setSelectedWorkout(item);
                setWorkoutModalVisible(true);
              }}
            >
              <Text
                style={{
                  color: theme === 'light' ? '#111' : '#fff',
                  fontWeight: '600',
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  color: theme === 'light' ? '#475467' : '#aaa',
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {item.description}
              </Text>
              <Text
                style={{ color: '#8b5cf6', fontSize: 12, marginTop: 2 }}
              >
                Target: {item.muscle_group}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Chosen Workouts */}
      <ScrollView contentContainerStyle={dashboardStyles.scrollContent}>
        {/* Strength by muscle group */}
        {Object.keys(strengthByGroup).map((group) => (
          <View
            key={group}
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
            <View
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
            >
              <Ionicons
                name="barbell"
                size={20}
                color="#8b5cf6"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme === 'light' ? '#111' : '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {group}
              </Text>
            </View>
            {strengthByGroup[group].length === 0 ? (
              <Text
                style={{
                  color: theme === 'light' ? '#667085' : '#888',
                  fontSize: 14,
                }}
              >
                No workouts added yet.
              </Text>
            ) : (
              <View>
                {strengthByGroup[group].map((entry) => (
                  <View
                    key={entry.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      borderRadius: 16,
                      marginBottom: 14,
                      backgroundColor: entry.isCompleted
                        ? theme === 'light'
                          ? '#e8f3ec'
                          : '#1e2d24'
                        : theme === 'light'
                          ? '#ffffff'
                          : '#232323',
                      padding: 12,
                    }}
                  >
                    {/* Check toggle */}
                    <View
                      style={{
                        width: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          toggleStrengthCompletion(group, entry.id)
                        }
                        style={{
                          backgroundColor: entry.isCompleted
                            ? '#22c55e'
                            : theme === 'light'
                              ? '#ffffff'
                              : '#232323',
                          borderRadius: 16,
                          padding: 7,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: entry.isCompleted
                            ? '#22c55e'
                            : theme === 'light'
                              ? '#e5e7eb'
                              : '#444',
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            entry.isCompleted
                              ? 'checkmark-done'
                              : 'ellipse-outline'
                          }
                          size={20}
                          color={
                            entry.isCompleted
                              ? '#fff'
                              : theme === 'light'
                                ? '#667085'
                                : '#888'
                          }
                        />
                      </TouchableOpacity>
                    </View>
                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: entry.isCompleted
                            ? theme === 'light'
                              ? '#166534'
                              : '#b3e6c1'
                            : theme === 'light'
                              ? '#111'
                              : '#fff',
                          fontSize: 15,
                          fontWeight: '700',
                        }}
                        numberOfLines={1}
                      >
                        {entry.name}
                      </Text>
                      <Text
                        style={{
                          color:
                            theme === 'light' ? '#475467' : '#aaa',
                          fontSize: 12,
                          marginTop: 2,
                        }}
                        numberOfLines={2}
                      >
                        {entry.description}
                      </Text>
                      {/* Sets Summary */}
                      <View style={{ marginTop: 6 }}>
                        {entry.sets.map((s, idx) => (
                          <Text
                            key={idx}
                            style={{
                              color:
                                theme === 'light'
                                  ? '#475467'
                                  : '#bbb',
                              fontSize: 12,
                            }}
                          >
                            Set {idx + 1}: {s.reps} reps ({s.weight} kg)
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Cardio section */}
        <View
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
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
          >
            <Ionicons
              name="fitness"
              size={20}
              color="#8b5cf6"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: theme === 'light' ? '#111' : '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Cardio
            </Text>
          </View>
          {getCardioForDate(dateKey).length === 0 ? (
            <Text
              style={{
                color: theme === 'light' ? '#667085' : '#888',
                fontSize: 14,
              }}
            >
              No workouts added yet.
            </Text>
          ) : (
            <View>
              {getCardioForDate(dateKey).map((entry) => (
                <View
                  key={entry.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 16,
                    marginBottom: 12,
                    backgroundColor: entry.isCompleted
                      ? theme === 'light'
                        ? '#e8f3ec'
                        : '#1e2d24'
                      : theme === 'light'
                        ? '#ffffff'
                        : '#232323',
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => toggleCardioCompletion(entry.id)}
                      style={{
                        backgroundColor: entry.isCompleted
                          ? '#22c55e'
                          : theme === 'light'
                            ? '#ffffff'
                            : '#232323',
                        borderRadius: 16,
                        padding: 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: entry.isCompleted
                          ? '#22c55e'
                          : theme === 'light'
                            ? '#e5e7eb'
                            : '#444',
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          entry.isCompleted
                            ? 'checkmark-done'
                            : 'ellipse-outline'
                        }
                        size={20}
                        color={
                          entry.isCompleted
                            ? '#fff'
                            : theme === 'light'
                              ? '#667085'
                              : '#888'
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: entry.isCompleted
                          ? theme === 'light'
                            ? '#166534'
                            : '#b3e6c1'
                          : theme === 'light'
                            ? '#111'
                            : '#fff',
                        fontSize: 15,
                        fontWeight: '700',
                      }}
                      numberOfLines={1}
                    >
                      {entry.name}
                    </Text>
                    <Text
                      style={{
                        color:
                          theme === 'light' ? '#475467' : '#bbb',
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Duration: {entry.minutes} min
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={{
            margin: 24,
            backgroundColor: '#2563eb',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
          onPress={() => setIsAddWorkoutModalVisible(true)}
        >
          <Text
            style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}
          >
            + Add Workout
          </Text>
        </TouchableOpacity>
        {/* Plan button removed here */}
      </ScrollView>

      {/* Workout Details Modal */}
      <WorkoutDetailsModal
        visible={isWorkoutModalVisible}
        onClose={() => setWorkoutModalVisible(false)}
        workout={selectedWorkout}
        onSave={handleSaveWorkout}
      />

      {/* Add Workout Submission Modal */}
      <AddWorkoutModal
        visible={isAddWorkoutModalVisible}
        onClose={() => setIsAddWorkoutModalVisible(false)}
        onSuccess={() => {
          // Optionally refresh the workout list or show a success message
        }}
      />
    </View>
  );
};

export default WorkoutScreen;
