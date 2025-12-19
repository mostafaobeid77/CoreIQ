import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
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
    const colors = Colors[theme];

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
                <Text style={styles.deleteText}>Delete</Text>
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
                    <TouchableOpacity
                        onPress={() => onAddMeal(section)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={[styles.addButton, { backgroundColor: '#2563eb' }]}
                    >
                        <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {sectionMeals.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No meals planned
                    </Text>
                ) : (
                    sectionMeals.map((meal, index) => {
                        let swipeableRow: Swipeable | null = null;
                        const close = () => swipeableRow?.close();

                        // Get quantity info
                        const quantity = meal.quantity || 1;
                        const unit = meal.unit || 'serving';

                        // Backend already calculates exact totals for each item
                        // meal.calories = total calories for this portion
                        // meal.caloriesPer100g = base value (for reference only)
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
                                    <View style={styles.mealAccent} />
                                    <View style={styles.itemContent}>
                                        <View style={styles.itemNameRow}>
                                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                                {meal.name}
                                            </Text>
                                            <Text style={[styles.quantityBadge, { color: colors.textSecondary }]}>
                                                {quantity}{unit === 'grams' ? 'g' : 'x'}
                                            </Text>
                                        </View>
                                        <View style={styles.macrosRow}>
                                            <View style={styles.macroItem}>
                                                <Ionicons name="flame" size={13} color="#f59e42" />
                                                <Text style={[styles.macroValue, { color: '#f59e42' }]}>{calories}</Text>
                                                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>kcal</Text>
                                            </View>
                                            <View style={styles.macroItem}>
                                                <Ionicons name="fitness" size={13} color="#38bdf8" />
                                                <Text style={[styles.macroValue, { color: '#38bdf8' }]}>{protein}g</Text>
                                                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>P</Text>
                                            </View>
                                            <View style={styles.macroItem}>
                                                <Ionicons name="leaf" size={13} color="#fbbf24" />
                                                <Text style={[styles.macroValue, { color: '#fbbf24' }]}>{carbs}g</Text>
                                                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>C</Text>
                                            </View>
                                            <View style={styles.macroItem}>
                                                <Ionicons name="water" size={13} color="#f472b6" />
                                                <Text style={[styles.macroValue, { color: '#f472b6' }]}>{fats}g</Text>
                                                <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>F</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ alignSelf: 'center', marginRight: 8 }} />
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
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={[styles.dayTitle, { color: colors.text }]}>Day {day}</Text>
                <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>{fullDate}</Text>
            </View>

            {/* Workouts Section */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="barbell" size={20} color="#8b5cf6" />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Workouts</Text>
                    </View>
                    <TouchableOpacity
                        onPress={onAddWorkout}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={[styles.addButton, { backgroundColor: '#2563eb' }]}
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

                        return (
                            <Swipeable
                                key={`workout-${index}`}
                                ref={ref => { swipeableRow = ref; }}
                                renderRightActions={() => renderRightActions('workout', index, undefined, close)}
                                overshootRight={false}
                            >
                                <TouchableOpacity
                                    style={[styles.itemCard, { backgroundColor: colors.background }]}
                                    onPress={() => onEditWorkout && onEditWorkout(workout, index)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.workoutAccent} />
                                    <View style={styles.itemContent}>
                                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                            {workout.name}
                                        </Text>
                                        <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
                                            {workout.sets ? `${workout.sets.length} sets` : `${workout.minutes} mins`} • {workout.muscle_group || workout.workoutType}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </Swipeable>
                        );
                    })
                )}
            </View>

            {/* Meals Sections */}
            <View style={styles.mealsHeader}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Meals</Text>
                {onCopyMeals && (
                    <TouchableOpacity
                        onPress={onCopyMeals}
                        style={[styles.copyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="copy-outline" size={16} color="#2563eb" />
                        <Text style={[styles.copyButtonText, { color: '#2563eb' }]}>Copy from Day</Text>
                    </TouchableOpacity>
                )}
            </View>
            {mealSections.map(renderMealSection)}

            <View style={styles.bottomSpacer} />

            {/* AI Assistant FAB */}
            {onAiAssist && (
                <TouchableOpacity
                    style={[styles.aiFab, { backgroundColor: colors.primary || '#8b5cf6' }]}
                    onPress={onAiAssist}
                    activeOpacity={0.9}
                >
                    <Ionicons name="sparkles" size={22} color="#fff" />
                    <Text style={styles.aiFabText}>AI Assistant</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
});

export default PlanDayView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 16,
        marginTop: 8,
    },
    dayTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    dateSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    section: {
        marginBottom: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        marginTop: 4,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderRadius: 18,
        marginBottom: 16,
        marginTop: 2,
        marginHorizontal: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        minHeight: 72,
    },
    mealAccent: {
        width: 5,
        backgroundColor: '#8b5cf6',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        marginRight: 10,
    },
    workoutAccent: {
        width: 5,
        backgroundColor: '#8b5cf6',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        marginRight: 10,
    },
    itemContent: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 10,
        paddingRight: 10,
    },
    itemNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    quantityBadge: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    itemDetails: {
        fontSize: 13,
        fontWeight: '500',
    },
    macrosRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    macroValue: {
        fontSize: 12,
        fontWeight: '500',
    },
    macroLabel: {
        fontSize: 12,
    },
    deleteAction: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 16,
        marginBottom: 16,
        marginTop: 2,
    },
    deleteText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
    mealsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '700',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    copyButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 100,
    },
    aiFab: {
        position: 'absolute',
        bottom: 90,
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
        zIndex: 100,
    },
    aiFabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
