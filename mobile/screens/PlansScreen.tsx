import React, { useState, useCallback } from 'react';
import PlanSkeleton from '../components/plans/PlanSkeleton';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import Colors from '../constants/Colors';
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
import AiEditModal from '../components/plans/AiEditModal';
import { aiService } from '../services/aiService';

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);

export default function PlansScreen() {
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
        currentDay,
        planDays,
        hasChanges,
        allPlans,
        setPlanName,
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

    const handleOpenCreateModal = useCallback(() => {
        setIsPlansListVisible(false);
        setIsWizardVisible(true);
    }, []);

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

    const handleAiAssist = useCallback(() => {
        setIsAiEditVisible(true);
    }, []);

    const handleAiEditSubmit = useCallback(async (instruction: string) => {
        try {
            setAiLoading(true);
            const dayData = planDays.find(d => d.day === currentDay);
            if (!dayData) return;

            // Prepare validation context
            const planContext = `Goal: ${stats.goalWeight}. Plan: ${currentPlan.name}. Day: ${currentDay}`;

            // Call Backend
            const result = await aiService.editPlan(dayData, instruction, planContext);

            if (result.success && result.modifiedDay) {
                // Update local state
                handleUpdateDay(currentDay, result.modifiedDay);
                setIsAiEditVisible(false);
            } else {
                // Error handling
                console.error('AI Edit Failed');
            }
        } catch (error) {
            console.error('AI Edit Error:', error);
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

    const onEditMealPress = useCallback((meal: any, section: string, index: number) => {
        setSelectedMealSection(section);
        setSelectedItem({ ...meal, _index: index, _section: section });
        setIsFoodDetailsVisible(true);
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: '#0f0f0f' }]}>
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
                    onOpenPlansList={() => setIsPlansListVisible(true)}
                    onDelete={() => handleDeletePlan()}
                    onChooseWorkoutRoutine={() => setIsWorkoutRoutineVisible(true)}
                    isSaving={saving}
                    isGenerating={generating}
                    status={planStatus}
                    hasChanges={hasChanges}
                    plan={currentPlan}
                />

                <PlanTimeline
                    days={DAYS}
                    currentDay={currentDay}
                    onSelectDay={setCurrentDay}
                    planDays={planDays}
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
                        onAiAssist={handleAiAssist}
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
                onAddToMeal={(food, qty, type, unit) => handleAddItem(food, 'meal', { quantity: qty, unit }, selectedMealSection)}
                mealSections={mealSections}
                defaultMealType={selectedMealSection}
                styles={styles}
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
                onSelectPlan={(id) => {
                    loadFullPlan(id);
                    setIsPlansListVisible(false);
                }}
                onDeletePlan={handleDeletePlan}
                onCreateNew={handleOpenCreateModal}
            />

            <CreatePlanWizard
                visible={isWizardVisible}
                onClose={() => setIsWizardVisible(false)}
                onSuccess={handleWizardSuccess}
                userGoal={stats.goalWeight}
                userGoalWeight={stats.goalWeight}
                userTargets={calculateDailyTargets(stats)}
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
});
