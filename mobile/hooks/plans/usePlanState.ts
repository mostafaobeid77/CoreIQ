import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { planService } from '../../services/planService';
import { aiService } from '../../services/aiService';
import { api } from '../../services/api';
import { usePlanPersistence } from './usePlanPersistence';
import { getMealSections } from '../../screens/MealsScreen';

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);

export const usePlanState = (goalWeight: string) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Plan Data
    const [planId, setPlanId] = useState<string | null>(null);
    const [planName, setPlanName] = useState('My 14-Day Plan');
    const [planStatus, setPlanStatus] = useState<'draft' | 'active' | 'completed'>('draft');
    const [currentDay, setCurrentDay] = useState(1);
    const [planDays, setPlanDays] = useState<any[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // List Data
    const [allPlans, setAllPlans] = useState<any[]>([]);

    const { hasDraft, saveDraft, loadDraft, clearDraft } = usePlanPersistence();
    const mealSections = useMemo(() => getMealSections(goalWeight), [goalWeight]);



    // Auto-save draft
    useEffect(() => {
        if (hasChanges && planStatus === 'draft') {
            const timeoutId = setTimeout(() => {
                saveDraft(planName, planDays);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [hasChanges, planName, planDays, planStatus]);

    const loadFullPlan = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const fullPlan = await planService.getPlan(id);
            setPlanId(fullPlan._id);
            setPlanName(fullPlan.name);
            setPlanStatus(fullPlan.status);

            const mappedDays = DAYS.map(dayNum => {
                const mealDay = fullPlan.mealPlan?.find((d: any) => d.day === dayNum);
                const workoutDay = fullPlan.workoutPlan?.find((d: any) => d.day === dayNum);

                const mealsByType = mealSections.reduce((acc, section) => {
                    acc[section] = mealDay?.meals?.filter((m: any) => m.mealType === section) || [];
                    return acc;
                }, {} as any);

                return {
                    day: dayNum,
                    meals: mealsByType,
                    workouts: workoutDay?.workouts || []
                };
            });
            setPlanDays(mappedDays);
            setHasChanges(false);
        } catch (error) {
            console.error('Error loading full plan:', error);
            Alert.alert('Error', 'Failed to load plan details.');
        } finally {
            setLoading(false);
        }
    }, [mealSections]);

    const loadPlan = useCallback(async () => {
        try {
            setLoading(true);
            const plans = await planService.getAllPlans();
            setAllPlans(plans);

            if (!planId && hasDraft) {
                const draft = await loadDraft();
                if (draft) {
                    setPlanName(draft.name);
                    setPlanDays(draft.days);
                    setPlanStatus('draft');
                    setHasChanges(true);
                    setLoading(false);
                    return;
                }
            }

            const active = plans.find((p: any) => p.status === 'active');
            const draft = plans.find((p: any) => p.status === 'draft');
            const targetPlan = active || draft;

            if (targetPlan) {
                await loadFullPlan(targetPlan._id);
            } else {
                // Initialize new if nothing found
                setPlanDays(DAYS.map(day => ({
                    day,
                    meals: mealSections.reduce((acc, section) => ({ ...acc, [section]: [] }), {}),
                    workouts: []
                })));
            }
        } catch (error) {
            console.error('Failed to load plan:', error);
        } finally {
            setLoading(false);
        }
    }, [planId, hasDraft, loadFullPlan]);

    const handleSavePlan = useCallback(async () => {
        try {
            setSaving(true);
            const mealPlan = planDays.map(d => ({
                meals: Object.values(d.meals).flat()
            }));
            const workoutPlan = planDays.map(d => ({
                workouts: d.workouts
            }));

            const planData = {
                name: planName,
                startDate: new Date().toISOString(),
                mealPlan,
                workoutPlan
            };

            const isNewPlan = !planId;

            if (planId) {
                await planService.updatePlan(planId, planData);
            } else {
                const res = await planService.createPlan(planData);
                setPlanId(res.plan._id);
            }

            setHasChanges(false);
            if (planStatus === 'draft') {
                await clearDraft();
            }

            Alert.alert(
                isNewPlan ? 'Plan Created! 🎉' : 'Plan Saved ✓',
                isNewPlan
                    ? 'Your new plan has been created successfully. You can now activate it to start following it!'
                    : 'Your changes have been saved successfully.',
                [{ text: 'Got it!' }]
            );

            await loadPlan();
        } catch (error) {
            console.error('Save plan error:', error);
            Alert.alert('Error', 'Failed to save plan. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [planDays, planName, planId, planStatus, loadPlan]);

    const handleActivatePlan = useCallback(async () => {
        if (!planId) {
            Alert.alert('Error', 'Please save the plan first.');
            return;
        }

        Alert.alert(
            'Start Plan',
            'This will add all meals and workouts to your daily log starting today. Any existing active plan will be stopped.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    onPress: async () => {
                        try {
                            setSaving(true);

                            // First, activate the plan on the backend
                            await planService.activatePlan(planId);

                            // Then copy all plan data to daily entries
                            const startDate = new Date();

                            for (let dayIndex = 0; dayIndex < planDays.length; dayIndex++) {
                                const dayData = planDays[dayIndex];
                                const currentDate = new Date(startDate);
                                currentDate.setDate(startDate.getDate() + dayIndex);
                                const dateKey = currentDate.toISOString().slice(0, 10);

                                // Copy meals to daily entries
                                for (const section of Object.keys(dayData.meals)) {
                                    const meals = dayData.meals[section];
                                    for (const meal of meals) {
                                        try {
                                            // Use correct endpoint: POST /meals
                                            await api.post(`/meals`, {
                                                date: dateKey,
                                                mealType: section,
                                                foodId: meal.foodId || meal.id,
                                                quantity: meal.quantity || 100,
                                                unit: meal.unit || 'grams'
                                            });
                                        } catch (err) {
                                            console.error(`Failed to add meal for ${dateKey}:`, err);
                                        }
                                    }
                                }

                                // Copy workouts to daily entries
                                for (const workout of dayData.workouts) {
                                    try {
                                        // Use correct endpoint: POST /workout-entries
                                        await api.post(`/workout-entries`, {
                                            date: dateKey,
                                            workoutId: workout.workoutId || workout.id,
                                            sets: workout.sets || [],
                                            minutes: workout.minutes || 0
                                        });
                                    } catch (err) {
                                        console.error(`Failed to add workout for ${dateKey}:`, err);
                                    }
                                }
                            }

                            setPlanStatus('active');
                            Alert.alert(
                                'Plan Started! 🎉',
                                'Your 14-day plan is now active! Check your Meals and Workouts screens to see your daily plan.',
                                [{ text: 'Got it!' }]
                            );
                            await loadPlan();
                        } catch (error) {
                            console.error('Activate error:', error);
                            Alert.alert('Error', 'Failed to activate plan. Please try again.');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    }, [planId, planDays, loadPlan]);

    const handleGenerateAI = useCallback(async () => {
        Alert.alert(
            'AI Generation',
            'This will overwrite your current plan. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate',
                    onPress: async () => {
                        try {
                            setGenerating(true);
                            const convo = await aiService.createConversation();
                            await aiService.generatePlan(convo.conversation._id, { name: planName });
                            await loadPlan(); // Reload to get the generated plan
                        } catch (error) {
                            console.error('AI Generate error:', error);
                            Alert.alert('Error', 'Failed to generate plan.');
                        } finally {
                            setGenerating(false);
                        }
                    }
                }
            ]
        );
    }, [planName, loadPlan]);

    const handleCreateNewPlan = useCallback((initialName: string = 'New Plan') => {
        setPlanId(null);
        setPlanName(initialName);
        setPlanStatus('draft');
        setPlanDays(DAYS.map(day => ({
            day,
            meals: mealSections.reduce((acc, section) => ({ ...acc, [section]: [] }), {}),
            workouts: []
        })));
        setHasChanges(true);
    }, [mealSections]);

    const handleDeletePlan = useCallback(async (idToDelete?: string) => {
        const targetId = idToDelete || planId;
        if (!targetId) {
            if (!idToDelete) {
                await clearDraft();
                handleCreateNewPlan();
            }
            return;
        }

        Alert.alert(
            'Delete Plan',
            'Are you sure? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await planService.deletePlan(targetId);
                            if (targetId === planId) {
                                await clearDraft();
                                await loadPlan(); // Will load next available or create new
                            } else {
                                const plans = await planService.getAllPlans();
                                setAllPlans(plans);
                                setLoading(false);
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete plan.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }, [planId, loadPlan, handleCreateNewPlan]);

    const handleAddItem = useCallback((item: any, type: 'meal' | 'workout', details?: any, section?: string) => {
        setPlanDays(prev => prev.map(d => {
            if (d.day === currentDay) {
                if (type === 'meal' && section) {
                    const isEditing = item._index !== undefined;
                    const targetSection = item._section || section;

                    // Preserve base macros (per 100g) for proper calculation
                    const mealData = {
                        name: item.name,
                        foodId: item._id || item.foodId,
                        mealType: targetSection,
                        // Store base macros per 100g
                        calories_per_100g: item.calories_per_100g || item.calories,
                        protein_per_100g: item.protein_per_100g || item.protein,
                        carbs_per_100g: item.carbs_per_100g || item.carbs,
                        fats_per_100g: item.fats_per_100g || item.fats,
                        // Store quantity info
                        quantity: details?.quantity || item.quantity || 1,
                        unit: details?.unit || item.unit || 'serving',
                    };

                    if (isEditing) {
                        // Update existing meal
                        const updatedMeals = [...(d.meals[targetSection] || [])];
                        updatedMeals[item._index] = mealData;
                        return {
                            ...d,
                            meals: {
                                ...d.meals,
                                [targetSection]: updatedMeals
                            }
                        };
                    } else {
                        // Add new meal
                        return {
                            ...d,
                            meals: {
                                ...d.meals,
                                [targetSection]: [...(d.meals[targetSection] || []), mealData]
                            }
                        };
                    }
                } else if (type === 'workout') {
                    const newWorkouts = [...d.workouts];
                    const workoutData = {
                        ...item,
                        ...details,
                        workoutId: item._id || item.workoutId,
                        workoutType: item.type || item.workoutType || 'strength'
                    };

                    if (item._index !== undefined) {
                        newWorkouts[item._index] = workoutData;
                    } else {
                        newWorkouts.push(workoutData);
                    }
                    return { ...d, workouts: newWorkouts };
                }
            }
            return d;
        }));
        setHasChanges(true);
    }, [currentDay]);

    const handleRemoveItem = useCallback((type: 'meal' | 'workout', index: number, section?: string) => {
        setPlanDays(prev => prev.map(d => {
            if (d.day === currentDay) {
                if (type === 'meal' && section) {
                    const newMeals = [...(d.meals[section] || [])];
                    newMeals.splice(index, 1);
                    return {
                        ...d,
                        meals: { ...d.meals, [section]: newMeals }
                    };
                } else if (type === 'workout') {
                    const newWorkouts = [...d.workouts];
                    newWorkouts.splice(index, 1);
                    return { ...d, workouts: newWorkouts };
                }
            }
            return d;
        }));
        setHasChanges(true);
    }, [currentDay]);

    const handleCopyMeals = useCallback((fromDay: number, toDay: number) => {
        const sourceDayMeals = planDays[fromDay - 1]?.meals || {};

        setPlanDays(prev => prev.map((d, index) => {
            if (d.day === toDay) {
                // Deep clone the meals from source day
                const copiedMeals: any = {};
                Object.keys(sourceDayMeals).forEach(section => {
                    copiedMeals[section] = sourceDayMeals[section].map((meal: any) => ({ ...meal }));
                });

                return {
                    ...d,
                    meals: copiedMeals
                };
            }
            return d;
        }));
        setHasChanges(true);
        Alert.alert('Success', `Meals copied from Day ${fromDay} to Day ${toDay}`);
    }, [planDays]);

    const handleApplyWorkoutRoutine = useCallback((template: any) => {
        setPlanDays(prev => prev.map((d, index) => {
            const dayKey = `day${((index) % 7) + 1}`;
            const workoutName = template.schedule[dayKey];

            if (workoutName === 'Rest') {
                return {
                    ...d,
                    workouts: []
                };
            } else {
                const exercises = template.workouts[workoutName] || [];
                return {
                    ...d,
                    workouts: exercises.map((ex: any) => ({
                        name: ex.name,
                        sets: Array(ex.sets).fill({}).map(() => ({ reps: ex.reps, weight: 0 })),
                        muscle_group: ex.muscleGroup,
                        type: ex.type,
                        completed: false
                    }))
                };
            }
        }));
        setHasChanges(true);
        Alert.alert('Success', `"${template.name}" routine applied to your 14-day plan!`);
    }, []);

    const handleUpdateDay = useCallback((day: number, newData: any) => {
        setPlanDays(prev => prev.map(d => {
            if (d.day === day) {
                // newData might contain flat meals array, need to ensure correct structure if PlanDayView expects dictionary
                // Wait, PlanDayView usage in PlansScreen expects 'planDays' to be passed to it?
                // Actually PlansScreen passes 'currentDayData.meals' (dict) to PlanDayView.
                // So newData should respect the internal state structure (Meals Dict).

                // If AI returns array, we must convert here or expected caller to convert.
                // Caller (PlansScreen) will handle conversion. We just blindly update state here.
                return { ...d, ...newData };
            }
            return d;
        }));
        setHasChanges(true);
    }, []);

    const currentPlan = useMemo(() => {
        return allPlans.find(p => p._id === planId) || {
            name: planName,
            status: planStatus,
            metadata: {} // Default empty metadata for draft
        };
    }, [allPlans, planId, planName, planStatus]);

    return {
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
        currentPlan,
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
        mealSections
    };
};
