import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface PlanDaySummaryProps {
    meals: { [key: string]: any[] };
    workouts: any[];
}

export default function PlanDaySummary({ meals, workouts }: PlanDaySummaryProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    // Calculate nutrition totals
    // The backend solver already calculates exact totals, so we just sum them
    const allMeals = Object.values(meals).flat();
    const totals = allMeals.reduce((acc, meal) => {
        // Use the pre-calculated totals from the backend
        // These are already computed by the solver with precise gram portions
        const calories = meal.calories || 0;
        const protein = meal.protein || 0;
        const carbs = meal.carbs || 0;
        const fats = meal.fats || 0;

        return {
            calories: acc.calories + calories,
            protein: acc.protein + protein,
            carbs: acc.carbs + carbs,
            fats: acc.fats + fats,
        };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    // Calculate workout totals
    const workoutCount = workouts.length;
    const totalMinutes = workouts.reduce((acc, w) => acc + (w.minutes || 0), 0);

    const hasMeals = allMeals.length > 0;
    const hasWorkouts = workouts.length > 0;

    if (!hasMeals && !hasWorkouts) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Nutrition Section */}
            {hasMeals && (
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Ionicons name="nutrition" size={18} color="#2563eb" />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nutrition</Text>
                    </View>
                    <View style={styles.stats}>
                        <View style={styles.stat}>
                            <Text style={[styles.value, { color: colors.text }]}>{Math.round(totals.calories)}</Text>
                            <Text style={[styles.unit, { color: colors.textSecondary }]}>kcal</Text>
                        </View>
                        <View style={styles.macros}>
                            <Text style={[styles.macro, { color: colors.textSecondary }]}>
                                {Math.round(totals.protein)}g P
                            </Text>
                            <Text style={[styles.macro, { color: colors.textSecondary }]}>
                                {Math.round(totals.carbs)}g C
                            </Text>
                            <Text style={[styles.macro, { color: colors.textSecondary }]}>
                                {Math.round(totals.fats)}g F
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Divider */}
            {hasMeals && hasWorkouts && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}

            {/* Workout Section */}
            {hasWorkouts && (
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Ionicons name="barbell" size={18} color="#2563eb" />
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Workouts</Text>
                    </View>
                    <View style={styles.stats}>
                        <View style={styles.stat}>
                            <Text style={[styles.value, { color: colors.text }]}>{workoutCount}</Text>
                            <Text style={[styles.unit, { color: colors.textSecondary }]}>
                                {workoutCount === 1 ? 'workout' : 'workouts'}
                            </Text>
                        </View>
                        {totalMinutes > 0 && (
                            <View style={styles.stat}>
                                <Text style={[styles.value, { color: colors.text }]}>{totalMinutes}</Text>
                                <Text style={[styles.unit, { color: colors.textSecondary }]}>mins</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    section: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingLeft: 26,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
    unit: {
        fontSize: 12,
        fontWeight: '500',
    },
    macros: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
        flexWrap: 'wrap',
    },
    macro: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
});
