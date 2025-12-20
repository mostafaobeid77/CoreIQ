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
    const isLight = theme === 'light';

    // Calculate nutrition totals
    const allMeals = Object.values(meals).flat();
    const totals = allMeals.reduce((acc, meal) => {
        return {
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fats: acc.fats + (meal.fats || 0),
        };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const workoutCount = workouts.length;
    const totalMinutes = workouts.reduce((acc, w) => acc + (w.minutes || 0), 0);
    const hasWorkouts = workouts.length > 0;

    // Macro progress bars helper
    const renderMacro = (label: string, value: number, color: string) => (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: isLight ? '#64748b' : '#94a3b8' }}>{label}</Text>
                <Text style={{ fontSize: 11, fontWeight: '800', color: isLight ? '#334155' : '#e2e8f0' }}>{Math.round(value)}g</Text>
            </View>
            <View style={{ height: 6, backgroundColor: isLight ? '#f1f5f9' : '#2d2d2d', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '100%', height: '100%', backgroundColor: color, borderRadius: 3 }} />
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>

            {/* Header / Main Stats - VIOLET THEME as requested */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: isLight ? '#f5f3ff' : '#2e1065', // Violet bg
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                    borderColor: isLight ? '#ddd6fe' : '#4c1d95', // Violet border
                    borderWidth: 1
                }}>
                    <Ionicons name="pie-chart" size={22} color="#8b5cf6" />
                </View>
                <View>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 }}>Daily Overview</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 }}>
                        <Text style={{ color: '#8b5cf6', fontSize: 14, fontWeight: '700' }}>
                            {Math.round(totals.calories)} kcal
                        </Text>
                        {hasWorkouts && (
                            <>
                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary }} />
                                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
                                    {workoutCount} workout{workoutCount !== 1 ? 's' : ''} ({totalMinutes}m)
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {/* Macros Row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                {renderMacro('Protein', totals.protein, '#8b5cf6')}
                {renderMacro('Carbs', totals.carbs, '#fbbf24')}
                {renderMacro('Fats', totals.fats, '#ec4899')}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
});
