import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface PlanTimelineProps {
    days: number[];
    currentDay: number;
    onSelectDay: (day: number) => void;
    planDays: any[];
}

const PlanTimeline = React.memo(function PlanTimeline({
    days,
    currentDay,
    onSelectDay,
    planDays
}: PlanTimelineProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to current day
    useEffect(() => {
        if (scrollViewRef.current) {
            const scrollPosition = (currentDay - 1) * 80 - 100;
            scrollViewRef.current.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
        }
    }, [currentDay]);

    const hasContent = (dayData: any) => {
        if (!dayData) return false;

        const hasMeals = dayData.meals && Object.values(dayData.meals).some((m: any) => m.length > 0);
        const hasWorkouts = dayData.workouts && dayData.workouts.length > 0;

        return hasMeals || hasWorkouts;
    };

    // Group days by month
    const getDayInfo = (day: number) => {
        const date = new Date();
        date.setDate(date.getDate() + (day - 1));
        return {
            date,
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            isFirstOfMonth: date.getDate() === 1 || day === 1
        };
    };

    return (
        <View style={styles.container}>
            {/* Month indicator */}
            <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
                {getDayInfo(currentDay).month} {getDayInfo(currentDay).date.getFullYear()}
            </Text>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {days.map((day) => {
                    const isSelected = currentDay === day;
                    const dayData = planDays.find(d => d.day === day);
                    const dayHasContent = hasContent(dayData);
                    const { weekday, dayNum } = getDayInfo(day);

                    return (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayItem,
                                isSelected && { backgroundColor: '#2563eb' },
                                !isSelected && { backgroundColor: colors.card },
                                !isSelected && dayHasContent && { borderColor: '#2563eb', borderWidth: 2 }
                            ]}
                            onPress={() => onSelectDay(day)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.weekday,
                                { color: isSelected ? '#FFF' : colors.textSecondary }
                            ]}>
                                {weekday}
                            </Text>
                            <Text style={[
                                styles.dayNumber,
                                { color: isSelected ? '#FFF' : colors.text }
                            ]}>
                                {day}
                            </Text>
                            <Text style={[
                                styles.dateNum,
                                { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary }
                            ]}>
                                {dayNum}
                            </Text>
                            {dayHasContent && !isSelected && (
                                <View style={[styles.dot, { backgroundColor: '#2563eb' }]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
});

export default PlanTimeline;

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    monthLabel: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 20,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 10,
    },
    dayItem: {
        width: 60,
        height: 75,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    weekday: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    dayNumber: {
        fontSize: 20,
        fontWeight: '700',
    },
    dateNum: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    dot: {
        position: 'absolute',
        bottom: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});
