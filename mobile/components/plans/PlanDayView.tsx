import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import { usePreferences } from '../../context/PreferencesContext';
import Colors from '../../constants/Colors';
import { Swipeable } from 'react-native-gesture-handler';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface PlanDayViewProps {
    day: number;
    meals: { [key: string]: any[] };
    workouts: any[];
    onAddMeal: (type: string) => void;
    onAddWorkout: () => void;
    onRemoveMeal: (type: string, index: number) => void;
    onRemoveWorkout: (index: number) => void;
    onEditWorkout?: (workout: any, index: number) => void;
    onEditMeal?: (meal: any, section: string, index: number) => void;
    onCopyMeals?: () => void;
    onAiAssist?: () => void;
    mealSections: string[];
}

const macroColors = {
    calories: '#f59e42',
    protein: '#38bdf8',
    carbs: '#fbbf24',
    fats: '#f472b6',
};

const EXPAND_THRESHOLD = 6;

const PlanDayView = React.memo(function PlanDayView({
    day,
    meals,
    workouts,
    onAddMeal,
    onAddWorkout,
    onRemoveMeal,
    onRemoveWorkout,
    onEditWorkout,
    onEditMeal,
    onCopyMeals,
    onAiAssist,
    mealSections
}: PlanDayViewProps) {
    const { theme } = useTheme();
    const { units } = usePreferences();
    const colors = Colors[theme];
    const isLight = theme === 'light';
    const weightUnit = units === 'imperial' ? 'lb' : 'kg';
    const [expandedSetIds, setExpandedSetIds] = useState<Set<number>>(new Set());

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newSet = new Set(expandedSetIds);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setExpandedSetIds(newSet);
    };

    const renderRightActions = (type: 'meal' | 'workout', index: number, section?: string, close?: () => void) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                    close && close();
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    if (type === 'meal' && section) {
                        onRemoveMeal(section, index);
                    } else {
                        onRemoveWorkout(index);
                    }
                }}
            >
                <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
        );
    };

    const renderMealSection = (section: string) => {
        const sectionMeals = meals[section] || [];

        return (
            <View key={section} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="restaurant" size={20} color="#8b5cf6" />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{section}</Text>
                    </View>
                </View>

                {sectionMeals.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No meals planned
                    </Text>
                ) : (
                    sectionMeals.map((meal, index) => {
                        let swipeableRow: Swipeable | null = null;
                        const close = () => swipeableRow?.close();

                        const quantity = meal.quantity || 1;
                        const unit = meal.unit || 'serving';
                        const calories = meal.calories || 0;
                        const protein = meal.protein || 0;
                        const carbs = meal.carbs || 0;
                        const fats = meal.fats || 0;

                        return (
                            <Swipeable
                                key={`${section}-${index}`}
                                ref={ref => { swipeableRow = ref; }}
                                renderRightActions={() => renderRightActions('meal', index, section, close)}
                                overshootRight={false}
                            >
                                <TouchableOpacity
                                    style={[styles.itemCard, { backgroundColor: colors.background }]}
                                    onPress={() => onEditMeal && onEditMeal(meal, section, index)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1, padding: 14 }}>
                                        {/* Matches MealsScreen card layout */}
                                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                            {meal.name}
                                        </Text>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                                            <Text style={{ fontSize: 13, fontWeight: '600', color: isLight ? '#64748b' : '#94a3b8', marginRight: 8 }}>
                                                {calories} kcal
                                            </Text>
                                            <Text style={{ fontSize: 13, fontWeight: '500', color: isLight ? '#94a3b8' : '#64748b', marginRight: 12 }}>
                                                {quantity}{((unit === 'grams' && meal.category === 'drinks') || unit === 'ml') ? ' ml' : (unit === 'grams' ? 'g' : (unit === 'servings' ? ' srv' : ` ${unit.replace(/^\d+\s+/, '')}`))}
                                            </Text>

                                            {/* Macros Row */}
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <Text style={{ fontSize: 11, color: macroColors.protein, fontWeight: '700' }}>{Math.round(protein)}p</Text>
                                                <Text style={{ fontSize: 11, color: macroColors.carbs, fontWeight: '700' }}>{Math.round(carbs)}c</Text>
                                                <Text style={{ fontSize: 11, color: macroColors.fats, fontWeight: '700' }}>{Math.round(fats)}f</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ justifyContent: 'center', paddingRight: 14 }}>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            </Swipeable>
                        );
                    })
                )}
            </View>
        );
    };

    const date = new Date();
    date.setDate(date.getDate() + (day - 1));
    const fullDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.dayTitle, { color: colors.text }]}>Day {day}</Text>
                    <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>{fullDate}</Text>
                </View>

                {/* WORKOUTS SECTION */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="barbell" size={20} color="#8b5cf6" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Workouts</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onAddWorkout}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={[styles.addButton, { backgroundColor: '#8b5cf6' }]}
                        >
                            <Ionicons name="add" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {workouts.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No workouts planned
                        </Text>
                    ) : (
                        workouts.map((workout, index) => {
                            let swipeableRow: Swipeable | null = null;
                            const close = () => swipeableRow?.close();

                            // Determine if cardio or strength
                            const isCardio = (workout.sets?.length === 0 || !workout.sets) && (workout.minutes > 0);

                            // Check if bodyweight exercise (no weight needed)
                            const bodyweightExercises = ['burpees', 'mountain climbers', 'jump squats', 'high knees', 'crunches', 'push-ups', 'push ups', 'pull-ups', 'pull ups', 'sit-ups', 'sit ups', 'jumping jacks', 'lunges', 'bodyweight squats', 'glute bridges'];
                            const isBodyweight = bodyweightExercises.some(ex => workout.name?.toLowerCase().includes(ex));

                            // Expand/Collapse logic
                            const allSets = workout.sets || [];
                            const isExpanded = expandedSetIds.has(index);
                            const displayedSets = isExpanded ? allSets : allSets.slice(0, EXPAND_THRESHOLD);
                            const remainingSets = Math.max(0, allSets.length - EXPAND_THRESHOLD);
                            const showExpandButton = allSets.length > EXPAND_THRESHOLD;

                            return (
                                <Swipeable
                                    key={`workout-${index}`}
                                    ref={ref => { swipeableRow = ref; }}
                                    renderRightActions={() => renderRightActions('workout', index, undefined, close)}
                                    overshootRight={false}
                                >
                                    <TouchableOpacity
                                        style={[styles.itemCard, { backgroundColor: colors.background, flexDirection: 'column', alignItems: 'flex-start', padding: 14 }]}
                                        onPress={() => onEditWorkout && onEditWorkout(workout, index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                                    {workout.name}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
                                                        {workout.muscle_group || workout.workoutType}
                                                    </Text>
                                                    <Text style={{ color: colors.textSecondary, marginHorizontal: 6 }}>•</Text>
                                                    <Text style={{ color: '#8b5cf6', fontSize: 13, fontWeight: '700' }}>
                                                        {isCardio ? `${workout.minutes || 0} mins` : `${allSets.length} Sets`}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                        </View>

                                        {/* Wrapped Sets View with Expansion */}
                                        {!isCardio && allSets.length > 0 && (
                                            <View style={{
                                                marginTop: 10,
                                                width: '100%',
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                                gap: 6
                                            }}>
                                                {displayedSets.map((s: any, idx: number) => (
                                                    <View key={idx} style={{
                                                        backgroundColor: isLight ? '#f8fafc' : '#1a1a1a',
                                                        borderRadius: 8,
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 6,
                                                        borderWidth: 1,
                                                        borderColor: isLight ? '#f1f5f9' : '#2d2d2d',
                                                        flexDirection: 'row',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Text style={{ color: isLight ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: '800', marginRight: 4 }}>
                                                            {idx + 1}
                                                        </Text>
                                                        <Text style={{ color: isLight ? '#334155' : '#e2e8f0', fontSize: 12, fontWeight: '700' }}>
                                                            {isBodyweight ? `${s.reps} reps` : `${s.reps}×${s.weight}${weightUnit}`}
                                                        </Text>
                                                    </View>
                                                ))}

                                                {/* Expand/Collapse Button */}
                                                {showExpandButton && (
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.stopPropagation(); // prevent card click
                                                            toggleExpand(index);
                                                        }}
                                                        style={{
                                                            backgroundColor: isLight ? '#ede9fe' : '#2e1065',
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
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </Swipeable>
                            );
                        })
                    )}
                </View>

                {/* MEALS SECTION header */}
                <View style={styles.mealsHeader}>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Meals</Text>
                    {onCopyMeals && (
                        <TouchableOpacity
                            onPress={onCopyMeals}
                            style={[styles.copyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="copy-outline" size={16} color="#8b5cf6" />
                            <Text style={[styles.copyButtonText, { color: '#8b5cf6' }]}>Copy from Day</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {mealSections.map(renderMealSection)}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
});

export default PlanDayView;

const styles = StyleSheet.create({
    wrapper: { flex: 1 },
    container: { flex: 1 },
    content: { paddingHorizontal: 16, paddingBottom: 100 },
    header: { marginBottom: 16, marginTop: 8 },
    dayTitle: { fontSize: 24, fontWeight: '700' },
    dateSubtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },
    section: {
        marginBottom: 16,
        marginTop: 16,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#8b5cf6',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '600' },
    addButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 14, marginTop: 4 },
    itemCard: {
        borderRadius: 20, // Matches MealsScreen
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    itemName: { fontSize: 16, fontWeight: '700' },
    deleteAction: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 16,
        marginBottom: 12,
        height: '85%' // Match card height roughly
    },
    mealsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8, paddingHorizontal: 4 },
    sectionLabel: { fontSize: 18, fontWeight: '700' },
    copyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
    copyButtonText: { fontSize: 13, fontWeight: '600' },
    bottomSpacer: { height: 100 },
});
