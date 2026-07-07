import React, { useState, useCallback, useEffect } from 'react';
import PlanSkeleton from '../components/plans/PlanSkeleton';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useStats } from '../context/StatsContext';
import { getMostRecentValues, getStatsForDate, calculateDailyTargets } from '../components/dashboard/dashboardUtils';
import { usePlanState } from '../hooks/plans/usePlanState';
import { planService } from '../services/planService';

// Components
import PlanHeader from '../components/plans/PlanHeader';
import PlanTimeline from '../components/plans/PlanTimeline';
import PlanDayView from '../components/plans/PlanDayView';
import PlanDaySummary from '../components/plans/PlanDaySummary';
import FoodDetailsModal from '../components/meals/modals/FoodDetailsModal';
import WorkoutDetailsModal from '../components/workouts/WorkoutDetailsModal';
import SearchModal from '../components/common/SearchModal';
import PlansListModal from '../components/plans/PlansListModal';
import CopyMealsModal from '../components/plans/CopyMealsModal';
import WorkoutRoutineModal from '../components/plans/WorkoutRoutineModal';
import CreatePlanWizard from '../components/plans/CreatePlanWizard';
import ChainPlanModal from '../components/plans/ChainPlanModal';
import AiEditModal from '../components/plans/AiEditModal';
import { aiService } from '../services/aiService';
import { useMealSearch } from '../hooks/meals/useMealSearch';

interface PlansScreenProps {
    autoOpenWizard?: boolean;
    onWizardReset?: () => void;
}

export default function PlansScreen({ autoOpenWizard, onWizardReset }: PlansScreenProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    // Context Data for Meal Sections
    const { statsByDate } = useStats();
    const mostRecent = getMostRecentValues(statsByDate);
    const stats = getStatsForDate(new Date().toISOString().split('T')[0], statsByDate, mostRecent);

    // Use Custom Hook
    const {
        loading,
        saving,
        generating,
        planId,
        planName,
        planStatus,
        startDate,
        currentDay,
        planDays,
        hasChanges,
        allPlans,
        setPlanName,
        setStartDate,
        setCurrentDay,
        setHasChanges,
        loadPlan,
        loadFullPlan,
        handleSavePlan,
        handleActivatePlan,
        handleGenerateAI,
        handleCreateNewPlan,
        handleDeletePlan,
        handleAddItem,
        handleRemoveItem,
        handleCopyMeals,
        handleApplyWorkoutRoutine,
        handleUpdateDay,
        mealSections,
        currentPlan
    } = usePlanState(stats.goalWeight);

    // Local UI State
    const [isPlansListVisible, setIsPlansListVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isAiEditVisible, setIsAiEditVisible] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [searchType, setSearchType] = useState<'meal' | 'workout'>('meal');
    const [selectedMealSection, setSelectedMealSection] = useState<string>('');
    const [isFoodDetailsVisible, setIsFoodDetailsVisible] = useState(false);
    const [isWorkoutDetailsVisible, setIsWorkoutDetailsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isCopyMealsVisible, setIsCopyMealsVisible] = useState(false);
    const [isWorkoutRoutineVisible, setIsWorkoutRoutineVisible] = useState(false);
    const [isWizardVisible, setIsWizardVisible] = useState(false);
    const [isChainModalVisible, setIsChainModalVisible] = useState(false); // Chain plan modal
    const [chainStartDate, setChainStartDate] = useState<Date | null>(null);
    const [chainLoading, setChainLoading] = useState(false);

    const handleOpenCreateModal = useCallback(() => {
        setChainStartDate(null); // Reset for fresh plan
        setIsPlansListVisible(false);
        setIsWizardVisible(true);
    }, []);

    // Open chain modal when user clicks Chain Plan
    const handleChainPlan = useCallback(() => {
        if (currentPlan?.endDate) {
            setIsChainModalVisible(true);
        }
    }, [currentPlan]);

    // Handle "Keep Same Settings" option - auto-create chained plan
    const handleChainKeepSame = useCallback(async (newName: string) => {
        if (!currentPlan?.endDate) return;

        setChainLoading(true);
        try {
            const nextDay = new Date(currentPlan.endDate);
            nextDay.setDate(nextDay.getDate() + 1);

            // Use planDays (which has full meal/workout data) instead of currentPlan
            const mealPlan = planDays.map((d: any, index: number) => {
                const dayDate = new Date(nextDay.getTime() + index * 24 * 60 * 60 * 1000);
                return {
                    day: index + 1,
                    date: dayDate,
                    meals: Object.values(d.meals || {}).flat()
                };
            });

            const workoutPlan = planDays.map((d: any, index: number) => {
                const dayDate = new Date(nextDay.getTime() + index * 24 * 60 * 60 * 1000);
                return {
                    day: index + 1,
                    date: dayDate,
                    workouts: d.workouts || []
                };
            });

            const newPlanData = {
                name: newName,
                startDate: nextDay.toISOString(),
                duration: planDays.length || 14,
                status: 'draft' as const,
                mealPlan,
                workoutPlan
            };

            const res = await planService.createPlan(newPlanData);
            setIsChainModalVisible(false);
            await loadPlan();
            loadFullPlan(res.plan._id);
        } catch (error) {
            console.error('Chain plan error:', error);
        } finally {
            setChainLoading(false);
        }
    }, [currentPlan, planDays, loadPlan, loadFullPlan]);

    // Handle "Customize" option - open wizard with pre-set start date
    const handleChainCustomize = useCallback(() => {
        if (currentPlan?.endDate) {
            const nextDay = new Date(currentPlan.endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setChainStartDate(nextDay);
            setIsChainModalVisible(false);
            setIsWizardVisible(true);
        }
    }, [currentPlan]);

    const handleWizardSuccess = useCallback(async (newPlanId: string) => {
        setIsWizardVisible(false);
        // Refresh plans list
        await loadPlan();
        // Load the new plan
        loadFullPlan(newPlanId);
    }, [loadPlan, loadFullPlan]);

    /*
        setIsNamePlanModalVisible(false);
        try {
            // Initialize 14 days of empty data to satisfy backend validation
            const startDate = new Date();
            const emptyDays = Array.from({ length: 14 }, (_, i) => {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                return {
                    day: i + 1,
                    date: d.toISOString(),
                };
            });

            const emptyMealPlan = emptyDays.map(d => ({
                day: d.day,
                date: d.date,
                meals: []
            }));

            const emptyWorkoutPlan = emptyDays.map(d => ({
                day: d.day,
                date: d.date,
                workouts: []
            }));

            // Create empty plan in DB immediately so it appears in list
            const res = await planService.createPlan({
                name,
                startDate: startDate.toISOString(),
                status: 'draft',
                mealPlan: emptyMealPlan,
                workoutPlan: emptyWorkoutPlan
            });

            // Reload list and select the new plan
            await loadPlan();
            loadFullPlan(res.plan._id);
        } catch (error) {
            console.error('Create plan error:', error);
            // Fallback to local draft if offline/error
            handleCreateNewPlan(name);
        }
    */

    useFocusEffect(
        useCallback(() => {
            loadPlan();
        }, [loadPlan])
    );

    // Auto-open wizard logic for AI redirection
    useEffect(() => {
        if (autoOpenWizard) {
            console.log('[PLANS] Auto-opening wizard from AI redirection');
            handleOpenCreateModal();
            // Reset the flag in parent
            onWizardReset?.();
        }
    }, [autoOpenWizard, handleOpenCreateModal, onWizardReset]);

    const handleAiAssist = useCallback(() => {
        setIsAiEditVisible(true);
    }, []);

    const handleAiEditSubmit = useCallback(async (instruction: string) => {
        try {
            console.log('[PLANS] AI Edit Submit called with:', instruction);
            setAiLoading(true);
            const dayData = planDays.find(d => d.day === currentDay);
            if (!dayData) {
                console.error('[PLANS] Day data not found for day:', currentDay);
                alert('Error: Could not find day data');
                return;
            }

            console.log('[PLANS] Day data found:', dayData.day);

            // Prepare validation context
            const planContext = `Goal: ${stats.goalWeight}. Plan: ${currentPlan.name}. Day: ${currentDay}`;

            console.log('[PLANS] Calling aiService.editPlan...');
            // Call Backend
            const result = await aiService.editPlan(dayData, instruction, planContext);

            console.log('[PLANS] AI Edit result:', result);

            if (result.success && result.modifiedDay) {
                console.log('[PLANS] Success! Updating day...');
                // Update local state
                handleUpdateDay(currentDay, result.modifiedDay);
                setIsAiEditVisible(false);
            } else {
                // Error handling
                console.error('[PLANS] AI Edit Failed:', result);
                alert('AI Edit failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('[PLANS] AI Edit Error:', error);
            console.error('[PLANS] Error details:', error.message, error.stack);
            alert('Error: ' + (error.message || 'Failed to edit plan'));
        } finally {
            setAiLoading(false);
        }
    }, [planDays, currentDay, stats, currentPlan, handleUpdateDay]);

    const onAddMealPress = useCallback((section: string) => {
        setSearchType('meal');
        setSelectedMealSection(section);
        setIsSearchVisible(true);
    }, []);

    const onAddWorkoutPress = useCallback(() => {
        setSearchType('workout');
        setIsSearchVisible(true);
    }, []);

    const onEditWorkoutPress = useCallback((workout: any, index: number) => {
        setSelectedItem({ ...workout, _index: index });
        setIsWorkoutDetailsVisible(true);
    }, []);

    const { searchMeals } = useMealSearch();

    const onEditMealPress = useCallback(async (meal: any, section: string, index: number) => {
        setSelectedMealSection(section);

        // Try to fetch fresh data for this food to ensure servings are up to date
        let fullFoodData = { ...meal };
        try {
            const results = await searchMeals(meal.name);
            const exactMatch = results.find((r: any) => r.name.toLowerCase() === meal.name.toLowerCase() || r.id === meal.foodId);
            if (exactMatch) {
                // Merge fresh servings data into our editing item
                fullFoodData = {
                    ...exactMatch,
                    ...meal, // Keep saved quantity and unit
                    servings: exactMatch.servings || [], // Ensure fresh servings are used
                };
                console.log('🔄 [EDIT] Fetched fresh food data with servings:', fullFoodData.servings?.length);
            }
        } catch (e) {
            console.warn('Failed to fetch fresh food data for edit', e);
        }

        setSelectedItem({ ...fullFoodData, _index: index, _section: section });
        setIsFoodDetailsVisible(true);
    }, [searchMeals]);

    // Handle "Repeat Plan" - clone an old plan starting today
    const handleRepeatPlan = useCallback(async (targetPlanId: string) => {
        setChainLoading(true);
        try {
            console.log('[PLANS] Repeating plan:', targetPlanId);
            // 1. Fetch full plan data
            const sourcePlan = await planService.getPlan(targetPlanId);
            if (!sourcePlan) throw new Error("Plan not found");

            // 2. Prepare new dates starting Today
            const startDate = new Date();
            const duration = sourcePlan.duration || 14;

            // 3. Clone Meals (strip _id)
            const mealPlan = (sourcePlan.mealPlan || []).map((day: any, index: number) => {
                const dayDate = new Date(startDate);
                dayDate.setDate(startDate.getDate() + index);

                const meals = (day.meals || []).map((m: any) => {
                    const { _id, ...rest } = m;
                    return rest;
                });

                return {
                    day: index + 1,
                    date: dayDate.toISOString(),
                    meals: meals
                };
            });

            // 4. Clone Workouts (strip _id)
            const workoutPlan = (sourcePlan.workoutPlan || []).map((day: any, index: number) => {
                const dayDate = new Date(startDate);
                dayDate.setDate(startDate.getDate() + index);

                const workouts = (day.workouts || []).map((w: any) => {
                    const { _id, ...rest } = w;
                    return rest;
                });

                return {
                    day: index + 1,
                    date: dayDate.toISOString(),
                    workouts: workouts
                };
            });

            // 5. Create New Plan
            const newPlanData = {
                name: `${sourcePlan.name} (Repeat)`,
                startDate: startDate.toISOString(),
                duration: duration,
                status: 'draft' as const,
                mealPlan,
                workoutPlan,
                metadata: sourcePlan.metadata
            };

            const res = await planService.createPlan(newPlanData);

            // 6. Reload & Open
            setIsPlansListVisible(false);
            await loadPlan();
            loadFullPlan(res.plan._id);

        } catch (error) {
            console.error('Repeat plan error:', error);
            alert('Failed to repeat plan');
        } finally {
            setChainLoading(false);
        }
    }, [loadPlan, loadFullPlan]);

    if (loading && planDays.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <PlanSkeleton />
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <PlanHeader
                    planName={planName}
                    onNameChange={(name) => { setPlanName(name); setHasChanges(true); }}
                    onSave={handleSavePlan}
                    onActivate={handleActivatePlan}
                    onGenerateAI={handleGenerateAI}
                    onAiAssist={handleAiAssist}
                    onOpenPlansList={() => setIsPlansListVisible(true)}
                    onDelete={() => handleDeletePlan()}
                    onChooseWorkoutRoutine={() => setIsWorkoutRoutineVisible(true)}
                    onChainPlan={handleChainPlan}
                    isSaving={saving}
                    isGenerating={generating}
                    status={planStatus}
                    hasChanges={hasChanges}
                    plan={currentPlan}
                    startDate={startDate}
                />

                <PlanTimeline
                    days={Array.from({ length: planDays.length || currentPlan?.duration || 14 }, (_, i) => i + 1)}
                    currentDay={currentDay}
                    onSelectDay={setCurrentDay}
                    planDays={planDays}
                    startDate={startDate}
                />

                <View style={styles.dayContent}>
                    <PlanDaySummary
                        meals={planDays[currentDay - 1]?.meals || {}}
                        workouts={planDays[currentDay - 1]?.workouts || []}
                    />

                    <PlanDayView
                        day={currentDay}
                        meals={planDays[currentDay - 1]?.meals || {}}
                        workouts={planDays[currentDay - 1]?.workouts || []}
                        onAddMeal={onAddMealPress}
                        onAddWorkout={onAddWorkoutPress}
                        onRemoveMeal={(section, index) => handleRemoveItem('meal', index, section)}
                        onRemoveWorkout={(index) => handleRemoveItem('workout', index)}
                        onEditWorkout={onEditWorkoutPress}
                        onEditMeal={onEditMealPress}
                        onCopyMeals={() => setIsCopyMealsVisible(true)}
                        mealSections={mealSections}
                    />
                </View>
            </SafeAreaView>


            {isSearchVisible && (
                <SearchModal
                    visible={isSearchVisible}
                    onClose={() => setIsSearchVisible(false)}
                    type={searchType}
                    onSelect={(item) => {
                        setSelectedItem(item);
                        setIsSearchVisible(false);
                        if (searchType === 'meal') setIsFoodDetailsVisible(true);
                        else setIsWorkoutDetailsVisible(true);
                    }}
                />
            )}

            <FoodDetailsModal
                visible={isFoodDetailsVisible}
                onClose={() => setIsFoodDetailsVisible(false)}
                food={selectedItem}
                onAddToMeal={(food, qty, type, unit, sIdx) => handleAddItem(food, 'meal', { quantity: qty, unit, servingIndex: sIdx }, selectedMealSection)}
                mealSections={mealSections}
                defaultMealType={selectedMealSection}
            />

            <WorkoutDetailsModal
                visible={isWorkoutDetailsVisible}
                onClose={() => setIsWorkoutDetailsVisible(false)}
                workout={selectedItem}
                onSave={(details) => handleAddItem(selectedItem, 'workout', details)}
            />

            <PlansListModal
                visible={isPlansListVisible}
                onClose={() => setIsPlansListVisible(false)}
                plans={allPlans}
                currentPlanId={planId || ''}
                currentDay={currentDay}
                onSelectPlan={(id) => {
                    loadFullPlan(id);
                    setIsPlansListVisible(false);
                }}
                onDeletePlan={handleDeletePlan}
                onRepeatPlan={handleRepeatPlan}
                onCreateNew={handleOpenCreateModal}
                isLoading={chainLoading}
            />

            <CreatePlanWizard
                visible={isWizardVisible}
                onClose={() => { setIsWizardVisible(false); setChainStartDate(null); }}
                onSuccess={handleWizardSuccess}
                userGoal={stats.goalWeight}
                userGoalWeight={stats.goalWeight}
                userTargets={calculateDailyTargets(stats)}
                initialStartDate={chainStartDate}
            />

            <ChainPlanModal
                visible={isChainModalVisible}
                onClose={() => setIsChainModalVisible(false)}
                onKeepSame={handleChainKeepSame}
                onCustomize={handleChainCustomize}
                currentPlanEndDate={currentPlan?.endDate ? new Date(currentPlan.endDate) : new Date()}
                currentPlanName={planName}
                isLoading={chainLoading}
            />

            <AiEditModal
                visible={isAiEditVisible}
                onClose={() => setIsAiEditVisible(false)}
                onSubmit={handleAiEditSubmit}
                isLoading={aiLoading}
                context={`Day ${currentDay}`}
            />

            <CopyMealsModal
                visible={isCopyMealsVisible}
                onClose={() => setIsCopyMealsVisible(false)}
                currentDay={currentDay}
                planDays={planDays}
                onCopyMeals={handleCopyMeals}
            />

            <WorkoutRoutineModal
                visible={isWorkoutRoutineVisible}
                onClose={() => setIsWorkoutRoutineVisible(false)}
                userGoal={stats.goalWeight}
                onApplyRoutine={handleApplyWorkoutRoutine}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    dayContent: {
        flex: 1,
    },
    aiFab: {
        position: 'absolute',
        bottom: 100,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        zIndex: 1000,
    },
    aiFabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
