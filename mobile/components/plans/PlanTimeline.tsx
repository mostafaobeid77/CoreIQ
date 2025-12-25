import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface PlanTimelineProps {
    days: number[];
    currentDay: number;
    onSelectDay: (day: number) => void;
    planDays: any[];
    startDate?: Date;
}

const PlanTimeline = React.memo(function PlanTimeline({
    days,
    currentDay,
    onSelectDay,
    planDays,
    startDate = new Date()
}: PlanTimelineProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const isLight = theme === 'light';
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to current day
    useEffect(() => {
        if (scrollViewRef.current) {
            const scrollPosition = (currentDay - 1) * 70 - 100; // Adjusted for new width
            scrollViewRef.current.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
        }
    }, [currentDay]);

    const hasContent = (dayData: any) => {
        if (!dayData) return false;
        const hasMeals = dayData.meals && Object.values(dayData.meals).some((m: any) => m.length > 0);
        const hasWorkouts = dayData.workouts && dayData.workouts.length > 0;
        return hasMeals || hasWorkouts;
    };

    // Group days by month based on plan start date
    const getDayInfo = (day: number) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (day - 1));
        return {
            date,
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
            dayNum: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'long' }),
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
                                {
                                    backgroundColor: isSelected ? '#8b5cf6' : colors.card,
                                    borderColor: isSelected ? '#8b5cf6' : (dayHasContent ? '#8b5cf6' : colors.border),
                                    borderWidth: isSelected ? 0 : (dayHasContent ? 1.5 : 1),
                                },
                                isSelected && styles.selectedShadow
                            ]}
                            onPress={() => onSelectDay(day)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.weekday,
                                { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                            ]}>
                                {weekday}
                            </Text>
                            <Text style={[
                                styles.dayNumber,
                                { color: isSelected ? '#fff' : colors.text }
                            ]}>
                                {dayNum}
                            </Text>

                            {/* Dot indicator for content */}
                            {dayHasContent && !isSelected && (
                                <View style={styles.contentDot} />
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
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 4,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    scrollContent: {
        gap: 12,
        paddingRight: 20,
        paddingLeft: 4
    },
    dayItem: {
        width: 64,
        height: 84,
        borderRadius: 32, // Perfect pill shape (height/2 roughly)
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    selectedShadow: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    weekday: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    dayNumber: {
        fontSize: 22,
        fontWeight: '800',
    },
    contentDot: {
        position: 'absolute',
        bottom: 8,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#8b5cf6',
    }
});
