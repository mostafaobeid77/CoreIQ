import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface CopyMealsModalProps {
    visible: boolean;
    onClose: () => void;
    currentDay: number;
    planDays: any[];
    onCopyMeals: (fromDay: number, toDay: number) => void;
}

export default function CopyMealsModal({
    visible,
    onClose,
    currentDay,
    planDays,
    onCopyMeals
}: CopyMealsModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const handleCopyFrom = (fromDay: number) => {
        const fromMeals = planDays[fromDay - 1]?.meals || {};
        const mealCount = Object.values(fromMeals).flat().length;

        if (mealCount === 0) {
            Alert.alert('No Meals', `Day ${fromDay} has no meals to copy.`);
            return;
        }

        Alert.alert(
            'Copy Meals',
            `Copy all meals from Day ${fromDay} to Day ${currentDay}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Copy',
                    onPress: () => {
                        onCopyMeals(fromDay, currentDay);
                        onClose();
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Copy Meals</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Select a day to copy meals from to Day {currentDay}
                    </Text>

                    {/* Days List */}
                    <ScrollView style={styles.daysList} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 14 }, (_, i) => i + 1).map(day => {
                            const meals = planDays[day - 1]?.meals || {};
                            const mealCount = Object.values(meals).flat().length;
                            const isCurrentDay = day === currentDay;

                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayItem,
                                        {
                                            backgroundColor: isCurrentDay ? colors.border : colors.card,
                                            borderColor: colors.border,
                                            opacity: isCurrentDay ? 0.5 : 1
                                        }
                                    ]}
                                    onPress={() => !isCurrentDay && handleCopyFrom(day)}
                                    disabled={isCurrentDay}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.dayInfo}>
                                        <Text style={[styles.dayNumber, { color: colors.text }]}>
                                            Day {day}
                                        </Text>
                                        <Text style={[styles.mealCount, { color: colors.textSecondary }]}>
                                            {mealCount} meal{mealCount !== 1 ? 's' : ''}
                                        </Text>
                                    </View>

                                    {!isCurrentDay && mealCount > 0 && (
                                        <Ionicons name="copy-outline" size={20} color="#2563eb" />
                                    )}
                                    {isCurrentDay && (
                                        <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
                                            Current
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    daysList: {
        paddingHorizontal: 20,
    },
    dayItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    dayInfo: {
        flex: 1,
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    mealCount: {
        fontSize: 13,
    },
    currentLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
});
