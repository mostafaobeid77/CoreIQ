import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DayTimelineProps {
    days: number[];
    currentDay: number;
    onSelectDay: (day: number) => void;
    planDays: any[]; // Using any for now to avoid circular deps, ideally define shared type
}

export default function DayTimeline({ days, currentDay, onSelectDay, planDays }: DayTimelineProps) {
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to active day
    useEffect(() => {
        if (scrollViewRef.current && currentDay > 2) {
            scrollViewRef.current.scrollTo({ x: (currentDay - 2) * 70, animated: true });
        }
    }, [currentDay]);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {days.map((day) => {
                    const isActive = currentDay === day;
                    const dayData = planDays[day - 1];
                    const hasMeals = Object.values(dayData?.meals || {}).some((m: any) => m.length > 0);
                    const hasWorkouts = dayData?.workouts?.length > 0;
                    const isCompleted = false; // Logic to be implemented based on data

                    return (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayCapsule,
                                isActive && styles.activeCapsule,
                                !isActive && isCompleted && styles.completedCapsule
                            ]}
                            onPress={() => onSelectDay(day)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dayLabel, isActive && styles.activeText]}>DAY</Text>
                            <Text style={[styles.dayNumber, isActive && styles.activeText]}>{day}</Text>

                            {/* Indicators */}
                            <View style={styles.indicatorRow}>
                                {hasMeals && (
                                    <View style={[styles.dot, { backgroundColor: isActive ? '#fff' : '#10b981' }]} />
                                )}
                                {hasWorkouts && (
                                    <View style={[styles.dot, { backgroundColor: isActive ? '#fff' : '#f59e0b' }]} />
                                )}
                            </View>

                            {isActive && <View style={styles.activeGlow} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 90,
        backgroundColor: '#0f0f0f',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    dayCapsule: {
        width: 60,
        height: 66,
        borderRadius: 16,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative',
        overflow: 'hidden',
    },
    activeCapsule: {
        backgroundColor: '#2563eb',
        borderColor: '#3b82f6',
        transform: [{ scale: 1.05 }],
    },
    completedCapsule: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    dayLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 2,
    },
    dayNumber: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    activeText: {
        color: '#fff',
    },
    indicatorRow: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 6,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    activeGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
});
