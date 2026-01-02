import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { Swipeable } from 'react-native-gesture-handler';
import { format } from 'date-fns';


if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const WorkoutScreen = () => {
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
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const [isAddWorkoutModalVisible, setIsAddWorkoutModalVisible] = useState(false);

  // Expanded sets state
  const [expandedSetIds, setExpandedSetIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newSet = new Set(expandedSetIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedSetIds(newSet);
  };

  // Context for workouts
  const {
    getStrengthByGroupForDate,
    getCardioForDate,
    addStrengthEntry,
    addCardioEntry,
    toggleStrengthCompletion: ctxToggleStrength,
    toggleCardioCompletion: ctxToggleCardio,
    getCompletedVsTotal,
    loadWorkoutsForDate,
    removeWorkoutEntry,
    updateWorkoutEntry,
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

  const { theme } = useTheme();
  const mostRecent = getMostRecentValues(statsByDate);
  const styles = React.useMemo(() => createDashboardStyles(theme === 'light'), [theme]);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const stats: DashboardStats = getStatsForDate(dateKey, statsByDate, mostRecent);

  useEffect(() => {
    loadStatsForDate(dateKey);
    loadWorkoutsForDate(dateKey);
  }, [dateKey, loadStatsForDate, loadWorkoutsForDate]);

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

    // Smart duplication check
    const existingWorkouts = [
      ...Object.values(strengthByGroup).flat(),
      ...cardioEntries
    ];
    const isAlreadyAdded = existingWorkouts.some(
      w => w.name.toLowerCase() === selectedWorkout.name.toLowerCase()
    );

    if (editingEntryId) {
      processSave(payload);
    } else if (isAlreadyAdded) {
      Alert.alert(
        'Duplicate Workout',
        `"${selectedWorkout.name}" is already in your log for today. Are you sure you want to add it again?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add anyway',
            onPress: () => processSave(payload)
          }
        ]
      );
    } else {
      processSave(payload);
    }
  };

  const processSave = async (
    payload:
      | { type: 'sets'; sets: { reps: number; weight: number }[] }
      | { type: 'duration'; minutes: number }
  ) => {
    try {
      if (editingEntryId) {
        // Find existing entry to get original ID if needed, 
        // though context usually handles update by ID directly.
        // Assuming updateWorkoutEntry supports partial updates or full replacement

        let updatePayload: any = { ...selectedWorkout };
        if (payload.type === 'sets') {
          updatePayload.sets = payload.sets;
          updatePayload.workoutType = 'Strength';
        } else {
          updatePayload.minutes = payload.minutes;
          updatePayload.workoutType = 'Cardio';
        }

        await updateWorkoutEntry(dateKey, editingEntryId, updatePayload);
      } else {
        // Add new
        if (payload.type === 'sets') {
          await addStrengthEntry(dateKey, {
            ...selectedWorkout,
            muscle_group: selectedWorkout.muscle_group || 'Other',
            sets: payload.sets,
            workoutType: 'Strength',
          });
        } else {
          await addCardioEntry(dateKey, {
            ...selectedWorkout,
            minutes: payload.minutes,
            workoutType: 'Cardio',
          });
        }
      }

      setWorkoutModalVisible(false);
      setSelectedWorkout(null);
      setEditingEntryId(null);

      // Clear search ONLY if we added from search (not from "Add Workout" modal)
      if (!isAddWorkoutModalVisible) {
        handleClearSearch();
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const handleWorkoutPress = (workout: any) => {
    setSelectedWorkout(workout);
    setEditingEntryId(null); // Adding new
    setWorkoutModalVisible(true);
  };

  const handleEditWorkout = (existingEntry: any) => {
    setSelectedWorkout(existingEntry);
    setEditingEntryId(existingEntry.id);
    setWorkoutModalVisible(true);
  };

  const toggleStrengthCompletion = async (group: string, id: string) => {
    try {
      await ctxToggleStrength(dateKey, group, id);
    } catch (error) {
      console.error('Failed to toggle strength:', error);
    }
  };

  const toggleCardioCompletion = async (id: string) => {
    try {
      await ctxToggleCardio(dateKey, id);
    } catch (error) {
      console.error('Failed to toggle cardio:', error);
    }
  };

  // New handler for "Add Custom Workout"
  const handleAddNewWorkout = () => {
    setIsAddWorkoutModalVisible(true);
  };



  // Render Logic
  // If loading: show spinner
  // If search active: show results list
  // If no search: show daily log + "Add Workout" button (if empty) or just log

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      );
    }

    if (results.length > 0 || search.length > 2) {
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {results.length === 0 && search.length > 2 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: styles.colors.textMuted, fontSize: 16 }}>No workouts found matching "{search}"</Text>
              <TouchableOpacity onPress={handleAddNewWorkout} style={{ marginTop: 16 }}>
                <Text style={{ color: '#8b5cf6', fontWeight: '600' }}>Create Custom Workout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            results.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: theme === 'light' ? 0.08 : 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: theme === 'light' ? '#e2e8f0' : 'transparent',
                }}
                onPress={() => handleWorkoutPress(item)}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: styles.colors.text, marginBottom: 4 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: styles.colors.textMuted, fontWeight: '500' }}>
                    {item.muscle_group} • {item.equipment || 'No Eq'}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={28} color="#8b5cf6" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    // Default View: Daily Log
    const hasWorkouts = Object.values(strengthByGroup).some(arr => arr.length > 0) || cardioEntries.length > 0;

    return (
      <View style={{ flex: 1 }}>
        {!hasWorkouts ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: theme === 'light' ? '#ede9fe' : '#2e1065',
              justifyContent: 'center', alignItems: 'center', marginBottom: 20
            }}>
              <Ionicons name="barbell" size={40} color="#8b5cf6" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: styles.colors.text, marginBottom: 8, textAlign: 'center' }}>
              No workouts yet
            </Text>
            <Text style={{ fontSize: 15, color: styles.colors.textMuted, textAlign: 'center', lineHeight: 22 }}>
              Search above to add exercises to your daily log.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Strength Sections */}
            {Object.entries(strengthByGroup).map(([group, entries]) => (
              entries.length > 0 && (
                <View key={group} style={{ marginBottom: 24, paddingHorizontal: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="fitness" size={18} color="#8b5cf6" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: styles.colors.text }}>{group}</Text>
                  </View>

                  <View style={{ gap: 12 }}>
                    {entries.map((entry) => (
                      <Swipeable
                        key={entry.id}
                        renderRightActions={() => (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#ef4444',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: 80,
                              height: '100%',
                              borderRadius: 16,
                              marginLeft: 12,
                            }}
                            onPress={async () => {
                              try {
                                await removeWorkoutEntry(dateKey, entry.id);
                              } catch (e) {
                                Alert.alert("Error", "Could not delete workout.");
                              }
                            }}
                          >
                            <Ionicons name="trash" size={24} color="#fff" />
                          </TouchableOpacity>
                        )}
                      >
                        <View
                          style={{
                            backgroundColor: styles.colors.bg2,
                            borderRadius: 20,
                            padding: 16,
                            shadowColor: '#000',
                            shadowOpacity: theme === 'light' ? 0.03 : 0.2,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 2,
                            borderWidth: 1,
                            borderColor: entry.isCompleted
                              ? styles.colors.successBorder
                              : styles.colors.border,
                          }}
                        >
                          <TouchableOpacity
                            activeOpacity={0.9}
                            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}
                            onPress={() => handleEditWorkout(entry)}
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
                                    : 'transparent',
                                  borderRadius: 10,
                                  width: 32,
                                  height: 32,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderWidth: 2,
                                  borderColor: entry.isCompleted
                                    ? '#22c55e'
                                    : theme === 'light' ? '#cbd5e1' : '#444',
                                }}
                                activeOpacity={0.7}
                              >
                                {entry.isCompleted && (
                                  <Ionicons name="checkmark" size={18} color="#fff" />
                                )}
                              </TouchableOpacity>
                            </View>
                            {/* Content */}
                            <TouchableOpacity
                              style={{ flex: 1 }}
                              activeOpacity={0.7}
                              onPress={() => handleEditWorkout(entry)}
                            >
                              <Text
                                style={{
                                  color: entry.isCompleted
                                    ? theme === 'light'
                                      ? '#64748b'
                                      : '#94a3b8'
                                    : theme === 'light'
                                      ? '#334155'
                                      : '#ffffff',
                                  fontSize: 16,
                                  fontWeight: '700',
                                  opacity: entry.isCompleted ? 0.7 : 1,
                                }}
                                numberOfLines={1}
                              >
                                {entry.name}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Text
                                  style={{
                                    color: theme === 'light' ? '#64748b' : '#64748b',
                                    fontSize: 12,
                                    fontWeight: '600',
                                  }}
                                >
                                  {entry.muscle_group || group}
                                </Text>
                                <Text style={{ color: theme === 'light' ? '#cbd5e1' : '#475569', marginHorizontal: 6 }}>•</Text>
                                <Text style={{
                                  color: theme === 'light' ? '#8b5cf6' : '#a78bfa',
                                  fontSize: 12,
                                  fontWeight: '700'
                                }}>
                                  {entry.sets.length} {entry.sets.length === 1 ? 'Set' : 'Sets'}
                                </Text>
                              </View>

                              {/* Refined Wrapped Sets Summary (No Scroll) with Smart Scale */}
                              {entry.sets && entry.sets.length > 0 && (
                                <View style={{
                                  marginTop: 10,
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  gap: 6
                                }}>
                                  {(() => {
                                    const EXPAND_THRESHOLD = 6;
                                    const isExpanded = expandedSetIds.has(entry.id);
                                    const allSets = entry.sets;
                                    const displayedSets = isExpanded ? allSets : allSets.slice(0, EXPAND_THRESHOLD);
                                    const remainingSets = Math.max(0, allSets.length - EXPAND_THRESHOLD);
                                    const showExpandButton = allSets.length > EXPAND_THRESHOLD;

                                    return (
                                      <>
                                        {displayedSets.map((s: any, idx: number) => (
                                          <View key={idx} style={{
                                            backgroundColor: theme === 'light' ? '#f1f5f9' : '#1a1a1a',
                                            borderRadius: 8,
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            borderWidth: 1,
                                            borderColor: theme === 'light' ? '#e2e8f0' : '#2d2d2d',
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                          }}>
                                            <Text style={{ color: theme === 'light' ? '#64748b' : '#64748b', fontSize: 10, fontWeight: '800', marginRight: 4 }}>
                                              {idx + 1}
                                            </Text>
                                            <Text style={{ color: theme === 'light' ? '#334155' : '#e2e8f0', fontSize: 12, fontWeight: '700' }}>
                                              {s.reps}×{s.weight}kg
                                            </Text>
                                          </View>
                                        ))}

                                        {/* Expand/Collapse Button */}
                                        {showExpandButton && (
                                          <TouchableOpacity
                                            onPress={(e) => {
                                              e.stopPropagation(); // prevent card click
                                              toggleExpand(entry.id);
                                            }}
                                            style={{
                                              backgroundColor: theme === 'light' ? '#ede9fe' : '#2e1065',
                                              borderRadius: 8,
                                              paddingHorizontal: 10,
                                              paddingVertical: 6,
                                              borderWidth: 1,
                                              borderColor: '#8b5cf6',
                                              flexDirection: 'row',
                                              alignItems: 'center'
                                            }}
                                          >
                                            <Text style={{ color: '#8b5cf6', fontSize: 11, fontWeight: '700' }}>
                                              {isExpanded ? 'Show Less' : `+${remainingSets} More`}
                                            </Text>
                                          </TouchableOpacity>
                                        )}
                                      </>
                                    );
                                  })()}
                                </View>
                              )}
                            </TouchableOpacity>
                          </TouchableOpacity>
                        </View>
                      </Swipeable>
                    ))}
                  </View>
                </View>
              )
            ))}

            {/* Cardio section */}
            {cardioEntries.length > 0 && (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 12,
                  backgroundColor: styles.colors.bg2,
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOpacity: theme === 'light' ? 0.08 : 0.2,
                  shadowRadius: 10,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: theme === 'light' ? '#e2e8f0' : '#2d2d2d',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="speedometer" size={20} color="#f43f5e" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: '700', color: styles.colors.text }}>Cardio</Text>
                </View>

                {cardioEntries.map((entry, index) => (
                  <Swipeable
                    key={entry.id}
                    renderRightActions={() => (
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#ef4444',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 80,
                          height: '100%',
                          borderRadius: 16,
                          marginLeft: 12,
                          marginTop: 0,
                        }}
                        onPress={async () => {
                          try {
                            await removeWorkoutEntry(dateKey, entry.id);
                          } catch (e) {
                            Alert.alert("Error", "Could not delete cardio.");
                          }
                        }}
                      >
                        <Ionicons name="trash" size={24} color="#fff" />
                      </TouchableOpacity>
                    )}
                  >
                    <TouchableOpacity
                      key={entry.id}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: index === cardioEntries.length - 1 ? 0 : 16,
                        backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e', // Ensure bg for swipeable
                      }}
                      onPress={() => handleEditWorkout(entry)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <TouchableOpacity
                          onPress={() =>
                            toggleCardioCompletion(entry.id)
                          }
                          style={{
                            backgroundColor: entry.isCompleted
                              ? '#22c55e'
                              : 'transparent',
                            borderRadius: 10,
                            width: 32,
                            height: 32,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: entry.isCompleted
                              ? '#22c55e'
                              : '#444',
                          }}
                        >
                          {entry.isCompleted && (
                            <Ionicons name="checkmark" size={18} color="#fff" />
                          )}
                        </TouchableOpacity>

                        <View>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: styles.colors.text, opacity: entry.isCompleted ? 0.6 : 1 }}>
                            {entry.name}
                          </Text>
                          <Text style={{ fontSize: 13, color: styles.colors.textMuted, marginTop: 4, fontWeight: '500' }}>
                            {entry.minutes} mins • {Math.round(entry.minutes * 8)} kcal
                          </Text>
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={16} color={styles.colors.textMuted} />
                    </TouchableOpacity>
                  </Swipeable>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.colors.bg }} edges={['top']}>
      <WorkoutHeader
        changeDay={changeDay}

        selectedDate={selectedDate}
        showDatePicker={showDatePicker}
        hideDatePicker={hideDatePicker}
        isDatePickerVisible={isDatePickerVisible}
        handleConfirm={handleConfirm}
        styles={styles}
      />

      <WorkoutSearchBar
        value={search}
        onChangeText={handleSearchInput}
        onClear={handleClearSearch}
        onAddPress={handleAddNewWorkout}
      />

      {/* Daily Progress Card */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: styles.colors.bg }}>
        <View style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
          borderRadius: 28,
          padding: 20,
          paddingBottom: 22,
          borderWidth: 1,
          borderColor: theme === 'light' ? '#e2e8f0' : '#2d2d2d',
          // Purple Shadow Glow
          shadowColor: '#8b5cf6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme === 'light' ? 0.08 : 0.3,
          shadowRadius: 12,
          elevation: theme === 'light' ? 4 : 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {/* Icon */}
              <View style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: theme === 'light' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.12)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 14
              }}>
                <Ionicons name="stats-chart" size={26} color="#8b5cf6" />
              </View>

              {/* Title and Subtitle */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: theme === 'light' ? styles.colors.text : '#ffffff', marginBottom: 3, letterSpacing: -0.3 }}>
                  Daily Progress
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#8b5cf6', letterSpacing: -0.2 }}>
                  {completed} / {total} Exercises
                </Text>
              </View>
            </View>

            {/* Percentage */}
            <View style={{ alignItems: 'flex-end', paddingTop: 2 }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: theme === 'light' ? styles.colors.text : '#ffffff', lineHeight: 36, letterSpacing: -1 }}>
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#8b5cf6', letterSpacing: 1.2, marginTop: -2 }}>
                OVERALL
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={{ height: 5, backgroundColor: 'rgba(139, 92, 246, 0.15)', borderRadius: 2.5, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                backgroundColor: '#8b5cf6',
                borderRadius: 2.5,
              }}
            />
          </View>
        </View>
      </View>

      {renderContent()}

      <WorkoutDetailsModal
        visible={isWorkoutModalVisible}
        onClose={() => {
          setWorkoutModalVisible(false);
          setSelectedWorkout(null);
          setEditingEntryId(null);
        }}
        workout={selectedWorkout}
        onSave={handleSaveWorkout}
      />

      <AddWorkoutModal
        visible={isAddWorkoutModalVisible}
        onClose={() => setIsAddWorkoutModalVisible(false)}
        onSuccess={() => {
          // Success is now handled visually inside the modal itself
        }}
      />

      {/* Date Picker Modal */}
      {/* Assuming DatePickerModal is handled by hook or parent logic, 
          but actually hooks/dashboard/useDatePicker usually returns props for a DateTimePicker modal component 
          OR handles it internally. Looking at imports, it seems we might need to render it if it's a component, 
          but current code structure implies it might be outside or handled. 
          Actually, standard pattern is to use the hook's visibility boolean to render DateTimePicker if needed.
          But based on imports, I don't see DateTimePicker imported. 
          It might be that showDatePicker opens system picker on Android/iOS.
      */}

    </SafeAreaView>
  );
};

export default WorkoutScreen;
