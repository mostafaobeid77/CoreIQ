import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { planService } from '../../services/planService';
import { aiService } from '../../services/aiService';
import { api } from '../../services/api';
import { usePlanPersistence } from './usePlanPersistence';
import { getMealSections } from '../../utils/mealUtils';

// Helper to generate day numbers array
const generateDays = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

import { useMeals } from '../../context/MealsContext';
import { useWorkouts } from '../../context/WorkoutsContext';

export const usePlanState = (goalWeight: string) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    const { resetMeals } = useMeals();
    const { resetWorkouts } = useWorkouts();

    const mealSections = useMemo(() => getMealSections(goalWeight), [goalWeight]);

    // Plan Data
    const [planId, setPlanId] = useState<string | null>(null);
    const [planName, setPlanName] = useState('My 14-Day Plan');
    const [planStatus, setPlanStatus] = useState<'draft' | 'active' | 'completed'>('draft');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [currentDay, setCurrentDay] = useState(1);
    const [planDays, setPlanDays] = useState<any[]>(generateDays(14).map(day => ({
        day,
        meals: mealSections.reduce((acc, section) => ({ ...acc, [section]: [] }), {}),
        workouts: []
    })));
    const [hasChanges, setHasChanges] = useState(false);

    // List Data
    const [allPlans, setAllPlans] = useState<any[]>([]);

    const currentPlan = useMemo(() => {
        return allPlans.find(p => p._id === planId) || {
            name: planName,
            status: planStatus,
            metadata: {} // Default empty metadata for draft
        };
    }, [allPlans, planId, planName, planStatus]);

    const { hasDraft, saveDraft, loadDraft, clearDraft, isActivePlanCached, loadActiveCache, saveActiveCache } = usePlanPersistence();

    // Refs for stable callback access
    const planIdRef = useRef(planId);
    const hasChangesRef = useRef(hasChanges);
    const hasDraftRef = useRef(hasDraft);
    const planDaysRef = useRef(planDays);
    const mealSectionsRef = useRef(mealSections);

    useEffect(() => { planIdRef.current = planId; }, [planId]);
    useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);
    useEffect(() => { hasDraftRef.current = hasDraft; }, [hasDraft]);
    useEffect(() => { planDaysRef.current = planDays; }, [planDays]);
    useEffect(() => { mealSectionsRef.current = mealSections; }, [mealSections]);

    const loadFullPlan = useCallback(async (id: string, showLoading: boolean = true) => {
        try {
            if (showLoading) setLoading(true);

            const fullPlan = await planService.getPlan(id);
            setPlanId(fullPlan._id);
            setPlanName(fullPlan.name);
            setPlanStatus(fullPlan.status);
            const planStartDate = fullPlan.startDate ? new Date(fullPlan.startDate) : new Date();
            setStartDate(planStartDate);

            const currentSections = mealSectionsRef.current;

            // Use actual plan duration from backend
            const planDuration = fullPlan.duration || fullPlan.mealPlan?.length || 14;
            const dynamicDays = generateDays(planDuration);

            // Auto-navigate to today's day based on plan start date
            const today = new Date();
            const diffTime = today.getTime() - planStartDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            // Day 1 is the start date, clamp between 1 and duration
            const calculatedCurrentDay = Math.max(1, Math.min(diffDays + 1, planDuration));
            setCurrentDay(calculatedCurrentDay);

            const mappedDays = dynamicDays.map(dayNum => {
                const mealDay = fullPlan.mealPlan?.find((d: any) => d.day === dayNum);
                const workoutDay = fullPlan.workoutPlan?.find((d: any) => d.day === dayNum);

                const mealsByType = currentSections.reduce((acc, section) => {
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
            if (showLoading) setLoading(false);
        }
    }, []);

    const loadPlan = useCallback(async (showLoading: boolean = true) => {
        const currentPlanId = planIdRef.current;
        const currentHasChanges = hasChangesRef.current;
        const currentHasDraft = hasDraftRef.current;
        const currentPlanDays = planDaysRef.current;
        const currentSections = mealSectionsRef.current;

        if (currentHasChanges && currentPlanId) {
            console.log('⏳ Skipping server load to preserve local changes');
            return;
        }

        try {
            // CACHE-FIRST STRATEGY DISABLED (Fixing Persistence Issues)
            // 1. If we have no data, try to load from cache immediately to show SOMETHING
            /*
            const hasData = currentPlanDays.length > 0 && currentPlanDays[0].meals;
            let cacheLoaded = false;

            if (!hasData && !currentPlanId) {
                const cachedPlan = await loadActiveCache();
                if (cachedPlan) {
                    console.log('⚡ Loaded plan from cache (instant)');
                    // Populate state immediately
                    setPlanId(cachedPlan._id);
                    setPlanName(cachedPlan.name);
                    setPlanStatus(cachedPlan.status);
                    setStartDate(cachedPlan.startDate ? new Date(cachedPlan.startDate) : new Date());

                    // Reconstruct days
                    const planDuration = cachedPlan.duration || cachedPlan.mealPlan?.length || 14;
                    const dynamicDays = generateDays(planDuration);
                    const mappedDays = dynamicDays.map(dayNum => {
                        const mealDay = cachedPlan.mealPlan?.find((d: any) => d.day === dayNum);
                        const workoutDay = cachedPlan.workoutPlan?.find((d: any) => d.day === dayNum);
                        const mealsByType = currentSections.reduce((acc, section) => {
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
                    // Don't show loading if we have cache
                    cacheLoaded = true;
                }
            }
            */
            const cacheLoaded = false; // Forced false to ensure fresh data

            // 2. Only show loading spinner if we didn't load cache and have no data
            const shouldLoading = showLoading && !cacheLoaded && currentPlanDays.length === 0;
            if (shouldLoading) setLoading(true);

            // 3. Fetch fresh data from network (Background Revalidation)
            const [plans, draft] = await Promise.all([
                planService.getAllPlans(),
                (!currentPlanId && currentHasDraft) ? loadDraft() : Promise.resolve(null)
            ]);

            setAllPlans(plans);

            if (draft) {
                // Draft takes precedence
                setPlanName(draft.name);
                setPlanDays(draft.days);
                setPlanStatus('draft');
                setStartDate(draft.startDate ? new Date(draft.startDate) : new Date());
                setHasChanges(true);
                setLoading(false);
                return;
            }

            const active = plans.find((p: any) => p.status === 'active');
            const targetPlan = active || plans.find((p: any) => p.status === 'draft');

            if (targetPlan) {
                // If the fresh plan is different or newer, update state
                // Note: In a real app we might check 'updatedAt' timestamps to avoid overwriting user edits
                // For now, we assume network is truth.
                await loadFullPlan(targetPlan._id, shouldLoading);

                // Update Cache (even if we didn't use it, keep it fresh)
                /*
                if (active && active._id === targetPlan._id) {
                    const fullPlanData = await planService.getPlan(targetPlan._id);
                    saveActiveCache(fullPlanData);
                }
                */
            } else {
                // No plans found from server
                if (!cacheLoaded) {
                    // Initialize new if nothing found (default 14 days)
                    setPlanDays(generateDays(14).map(day => ({
                        day,
                        meals: currentSections.reduce((acc, section) => ({ ...acc, [section]: [] }), {}),
                        workouts: []
                    })));
                }
                if (shouldLoading) setLoading(false);
            }
        } catch (error) {
            console.error('Failed to load plan:', error);
            if (showLoading) setLoading(false);
        }
    }, [loadFullPlan, loadDraft, loadActiveCache, saveActiveCache]);


    // Auto-save: Draft (local) and Sync (server)
    useEffect(() => {
        if (hasChanges) {
            const timeoutId = setTimeout(async () => {
                if (planStatus === 'draft' || !planId) {
                    // Save local backup
                    await saveDraft(planName, planDays, startDate?.toISOString());
                }

                // If it's an existing plan, sync to server in background
                if (planId && !saving) {
                    try {
                        const mealPlan = planDays.map((d: any) => ({
                            day: d.day,
                            date: d.date,
                            meals: Object.values(d.meals).flat()
                        }));
                        const workoutPlan = planDays.map((d: any) => ({
                            day: d.day,
                            date: d.date,
                            workouts: d.workouts
                        }));

                        console.log('🔄 Syncing plan to server...');
                        await planService.updatePlan(planId, {
                            name: planName,
                            mealPlan,
                            workoutPlan
                        });
                        setHasChanges(false); // Sync complete
                        console.log('✅ Auto-sync success');

                        // Update allPlans locally so My Plans modal shows the new name
                        setAllPlans((prev: any[]) => prev.map(p =>
                            p._id === planId ? { ...p, name: planName } : p
                        ));
                    } catch (err) {
                        console.warn('❌ Auto-sync failed:', err);
                    }
                }
            }, 2000); // 2s debounce for better performance, especially on Android
            return () => clearTimeout(timeoutId);
        }
    }, [hasChanges, planName, planDays, planId, planStatus, saving, saveDraft]);

    const handleSavePlan = useCallback(async () => {
        try {
            setSaving(true);
            const start = startDate || new Date();

            const mealPlan = planDays.map((d: any, idx: number) => {
                const dayDate = new Date(start);
                dayDate.setDate(start.getDate() + idx);
                return {
                    day: d.day,
                    date: dayDate,
                    meals: Object.values(d.meals).flat()
                };
            });

            const workoutPlan = planDays.map((d: any, idx: number) => {
                const dayDate = new Date(start);
                dayDate.setDate(start.getDate() + idx);
                return {
                    day: d.day,
                    date: dayDate,
                    workouts: d.workouts
                };
            });

            const planData = {
                name: planName,
                duration: planDays.length, // Send actual plan duration
                startDate: start.toISOString(),
                mealPlan,
                workoutPlan
            };

            const isNewPlan = !planId;

            if (planId) {
                await planService.updatePlan(planId, planData);

                // CRITIAL FIX: If plan is active, FORCE reset daily screens to show changes
                if (planStatus === 'active') {
                    console.log('🔄 Active plan updated, resetting daily contexts...');
                    resetMeals();
                    resetWorkouts();
                }
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

            await loadPlan(false); // Reload strict from server
        } catch (error) {
            console.error('Save plan error:', error);
            Alert.alert('Error', 'Failed to save plan. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [planDays, planName, planId, planStatus, loadPlan, clearDraft]);

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
                            // Pass LOCAL start date to ensure server aligns with user's timezone
                            // e.g. "2024-01-01"
                            const localDate = new Date();
                            const offset = localDate.getTimezoneOffset();
                            const localDateStr = new Date(localDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

                            await planService.activatePlan(planId, { startDate: localDateStr });
                            setPlanStatus('active');

                            // FORCE REFRESH of Meals/Workouts screens
                            resetMeals();
                            resetWorkouts();

                            Alert.alert(
                                'Plan Started! 🎉',
                                `Your ${currentPlan?.duration || 14}-day plan is now active! Check your Meals and Workouts screens to see your daily plan.`,
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
    }, [planId, planDays, loadPlan, resetMeals, resetWorkouts, currentPlan]);

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
        setStartDate(new Date());
        setPlanDays(generateDays(14).map(day => ({
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

                            // If we deleted the active plan (or any plan really to be safe), reset global context
                            // Check if it was active or current
                            const wasActive = allPlans.find(p => p._id === targetId)?.status === 'active';
                            if (wasActive || targetId === planId) {
                                resetMeals();
                                resetWorkouts();
                            }

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
    }, [planId, loadPlan, handleCreateNewPlan, allPlans, resetMeals, resetWorkouts]);

    const handleAddItem = useCallback((item: any, type: 'meal' | 'workout', details?: any, section?: string) => {
        setPlanDays(prev => prev.map(d => {
            if (d.day === currentDay) {
                if (type === 'meal' && section) {
                    const isEditing = item._index !== undefined;
                    const targetSection = item._section || section;

                    // Preserve base macros (per 100g) for proper calculation
                    const quantity = Number(details?.quantity || item.quantity || 1);
                    const unit = details?.unit || item.unit || 'grams';

                    // Get base macros - check multiple possible sources
                    // For editing: item already has caloriesPer100g, proteinPer100g
                    // For new: item has nutrients.calories or just calories
                    const baseCal = Number(item.caloriesPer100g || item.nutrients?.calories || item.calories || 0);
                    const basePro = Number(item.proteinPer100g || item.nutrients?.protein || item.protein || 0);
                    const baseCarbs = Number(item.carbsPer100g || item.nutrients?.carbs || item.carbs || 0);
                    const baseFats = Number(item.fatsPer100g || item.nutrients?.fat || item.nutrients?.fats || item.fats || 0);

                    // Debug logging - check mobile console/debugger
                    console.log('[PLAN] Food item raw:', {
                        name: item.name,
                        isEditing: item._index !== undefined,
                        item_caloriesPer100g: item.caloriesPer100g,
                        item_nutrients: item.nutrients,
                        item_calories: item.calories,
                        extracted: { baseCal, basePro, baseCarbs, baseFats },
                        quantity,
                        unit
                    });

                    // Validate that we have base macros
                    if (baseCal === 0 && basePro === 0 && !item.name.toLowerCase().includes('zero') && !item.name.toLowerCase().includes('diet') && !item.name.toLowerCase().includes('water')) {
                        console.warn('[PLAN] Warning: No base macros found for:', item.name);
                    }

                    // Calculate ratio based on unit type
                    let ratio = 1;
                    let actualCal = baseCal;
                    let actualPro = basePro;
                    let actualCarbs = baseCarbs;
                    let actualFats = baseFats;

                    if (unit === 'grams' || unit === 'g') {
                        // For grams: calculate based on quantity/100
                        ratio = quantity / 100;
                        actualCal = baseCal * ratio;
                        actualPro = basePro * ratio;
                        actualCarbs = baseCarbs * ratio;
                        actualFats = baseFats * ratio;
                    } else if (unit === 'serving' || unit === 'servings') {
                        // For servings: use the selected index or default to 0
                        const sIdx = (details && typeof details.servingIndex === 'number') ? details.servingIndex : 0;
                        const serving = item.servings?.[sIdx] || item.servings?.[0];

                        console.log(`[PLAN] Calculating for serving index ${sIdx}:`, serving);

                        if (serving) {
                            actualCal = (Number(serving.calories) || 0) * quantity;
                            actualPro = (Number(serving.protein) || 0) * quantity;
                            actualCarbs = (Number(serving.carbs) || 0) * quantity;
                            actualFats = (Number(serving.fat) || Number(serving.fats) || 0) * quantity;
                        } else {
                            // Fallback: assume base macros are per serving
                            actualCal = baseCal * quantity;
                            actualPro = basePro * quantity;
                            actualCarbs = baseCarbs * quantity;
                            actualFats = baseFats * quantity;
                        }
                    } else {
                        // For other units (eggs, cups, medium, large, etc.): assume base macros are per unit
                        actualCal = baseCal * quantity;
                        actualPro = basePro * quantity;
                        actualCarbs = baseCarbs * quantity;
                        actualFats = baseFats * quantity;
                    }

                    // Ensure no NaN values
                    actualCal = isNaN(actualCal) ? 0 : actualCal;
                    actualPro = isNaN(actualPro) ? 0 : actualPro;
                    actualCarbs = isNaN(actualCarbs) ? 0 : actualCarbs;
                    actualFats = isNaN(actualFats) ? 0 : actualFats;

                    const mealData = {
                        name: item.name,
                        foodId: item._id || item.foodId,
                        id: item._id || item.foodId, // For FoodDetailsModal compatibility
                        brand: item.brand || '', // For FoodDetailsModal
                        category: item.category, // Added category for display logic
                        mealType: targetSection,
                        quantity,
                        unit,
                        servingIndex: (details && typeof details.servingIndex === 'number') ? details.servingIndex : 0,
                        // Store base macros per 100g (for calculations)
                        caloriesPer100g: baseCal,
                        proteinPer100g: basePro,
                        carbsPer100g: baseCarbs,
                        fatsPer100g: baseFats,
                        // Also store in nutrients format for FoodDetailsModal editing
                        nutrients: {
                            calories: baseCal,
                            protein: basePro,
                            carbs: baseCarbs,
                            fat: baseFats
                        },
                        // Preserve servings if available
                        servings: item.servings || [],
                        // Store actual calculated macros for this portion
                        calories: Math.round(actualCal),
                        protein: Math.round(actualPro),
                        carbs: Math.round(actualCarbs),
                        fats: Math.round(actualFats),
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
                        workoutId: item._id || item.id || item.workoutId,
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
        Alert.alert('Success', `"${template.name}" routine applied to your ${currentPlan?.duration || 14}-day plan!`);
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



    return {
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
        currentPlan,
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
        mealSections
    };
};
