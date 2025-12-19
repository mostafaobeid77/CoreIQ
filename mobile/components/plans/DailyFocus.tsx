import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface DailyFocusProps {
    day: number;
    meals: any; // Using any for simplicity, should be typed
    workouts: any[];
    mealSections: string[];
    onAddMeal: (type: string) => void;
    onAddWorkout: () => void;
    onRemoveMeal: (type: string, index: number) => void;
    onRemoveWorkout: (index: number) => void;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    searchResults: any[];
    onSelectSearchResult: (item: any, type: 'meal' | 'workout') => void;
}

const macroIcons = {
    calories: { icon: 'flame', label: 'kcal' },
    protein: { icon: 'fitness', label: 'Protein' },
    carbs: { icon: 'leaf', label: 'Carbs' },
    fats: { icon: 'water', label: 'Fats' },
} as const;

const macroColors = {
    calories: '#f59e42',
    protein: '#38bdf8',
    carbs: '#fbbf24',
    fats: '#f472b6',
};

export default function DailyFocus({
    day,
    meals,
    workouts,
    mealSections,
    onAddMeal,
    onAddWorkout,
    onRemoveMeal,
    onRemoveWorkout,
    searchQuery,
    onSearchChange,
    searchResults,
    onSelectSearchResult
}: DailyFocusProps) {
    const [activeTab, setActiveTab] = useState<'fuel' | 'force'>('fuel');

    const renderRightActions = (progress: any, dragX: any, onPress: () => void) => {
        return (
            <TouchableOpacity style={styles.deleteAction} onPress={onPress}>
                <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.dayTitle}>Day {day} Focus</Text>
                    <Text style={styles.daySubtitle}>
                        {activeTab === 'fuel' ? 'Nutrition & Recovery' : 'Training & Intensity'}
                    </Text>
                </View>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'fuel' && styles.activeTab]}
                        onPress={() => setActiveTab('fuel')}
                    >
                        <Text style={[styles.tabText, activeTab === 'fuel' && styles.activeTabText]}>Fuel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'force' && styles.activeTab]}
                        onPress={() => setActiveTab('force')}
                    >
                        <Text style={[styles.tabText, activeTab === 'force' && styles.activeTabText]}>Force</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Add ${activeTab === 'fuel' ? 'Food' : 'Workout'}...`}
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                    {searchResults.map((item) => (
                        <TouchableOpacity
                            key={item._id || item.id}
                            style={styles.resultItem}
                            onPress={() => onSelectSearchResult(item, activeTab === 'fuel' ? 'meal' : 'workout')}
                        >
                            <Text style={styles.resultName}>{item.name}</Text>
                            <Text style={styles.resultSub}>
                                {activeTab === 'fuel'
                                    ? `${item.calories} kcal • P:${item.protein} C:${item.carbs} F:${item.fats}`
                                    : `${item.muscle_group} • ${item.category}`
                                }
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'fuel' ? (
                    <View>
                        {/* Macro Summary Row could go here */}

                        {mealSections.map((section) => {
                            const sectionMeals = meals[section] || [];
                            return (
                                <View key={section} style={styles.sectionContainer}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>{section}</Text>
                                        <TouchableOpacity onPress={() => onAddMeal(section)}>
                                            <Ionicons name="add-circle" size={24} color="#4f46e5" />
                                        </TouchableOpacity>
                                    </View>

                                    {sectionMeals.length === 0 ? (
                                        <Text style={styles.emptyText}>No fuel added</Text>
                                    ) : (
                                        sectionMeals.map((meal: any, idx: number) => (
                                            <Swipeable
                                                key={`${section}-${idx}`}
                                                renderRightActions={(p, d) => renderRightActions(p, d, () => onRemoveMeal(section, idx))}
                                            >
                                                <View style={styles.card}>
                                                    <View style={styles.cardContent}>
                                                        <Text style={styles.cardTitle}>{meal.name}</Text>
                                                        <View style={styles.macroRow}>
                                                            <View style={styles.macroItem}>
                                                                <Ionicons name="flame" size={12} color={macroColors.calories} />
                                                                <Text style={[styles.macroText, { color: macroColors.calories }]}>{meal.calories}</Text>
                                                            </View>
                                                            <View style={styles.macroItem}>
                                                                <Text style={[styles.macroText, { color: macroColors.protein }]}>P: {meal.protein}g</Text>
                                                            </View>
                                                            <View style={styles.macroItem}>
                                                                <Text style={[styles.macroText, { color: macroColors.carbs }]}>C: {meal.carbs}g</Text>
                                                            </View>
                                                            <View style={styles.macroItem}>
                                                                <Text style={[styles.macroText, { color: macroColors.fats }]}>F: {meal.fats}g</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <Text style={styles.quantityText}>{meal.quantity}{meal.unit}</Text>
                                                </View>
                                            </Swipeable>
                                        ))
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View>
                        {workouts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="barbell-outline" size={48} color="#333" />
                                <Text style={styles.emptyStateText}>Rest Day or No Workouts Planned</Text>
                                <TouchableOpacity style={styles.addWorkoutBtn} onPress={onAddWorkout}>
                                    <Text style={styles.addWorkoutText}>Add Workout Session</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            workouts.map((workout: any, idx: number) => (
                                <Swipeable
                                    key={idx}
                                    renderRightActions={(p, d) => renderRightActions(p, d, () => onRemoveWorkout(idx))}
                                >
                                    <View style={styles.workoutCard}>
                                        <View style={styles.workoutHeader}>
                                            <Text style={styles.cardTitle}>{workout.name}</Text>
                                            <View style={styles.muscleBadge}>
                                                <Text style={styles.muscleText}>{workout.muscle_group}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.workoutStats}>
                                            <Ionicons name="layers-outline" size={16} color="#888" />
                                            <Text style={styles.workoutStatText}>
                                                {workout.sets ? `${workout.sets.length} Sets` : `${workout.minutes} Mins`}
                                            </Text>
                                        </View>
                                    </View>
                                </Swipeable>
                            ))
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    dayTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    daySubtitle: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#333',
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 12,
    },
    activeTabText: {
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
    },
    searchResults: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
        maxHeight: 200,
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    resultName: {
        color: '#fff',
        fontWeight: '600',
    },
    resultSub: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        color: '#444',
        fontStyle: 'italic',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    macroRow: {
        flexDirection: 'row',
        gap: 12,
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    macroText: {
        fontSize: 12,
        fontWeight: '500',
    },
    quantityText: {
        color: '#666',
        fontSize: 12,
        marginLeft: 12,
    },
    deleteAction: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 16,
        marginLeft: 8,
    },
    workoutCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    muscleBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    muscleText: {
        color: '#ccc',
        fontSize: 10,
        fontWeight: '600',
    },
    workoutStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    workoutStatText: {
        color: '#888',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyStateText: {
        color: '#666',
        fontSize: 16,
    },
    addWorkoutBtn: {
        marginTop: 12,
        backgroundColor: '#333',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addWorkoutText: {
        color: '#fff',
        fontWeight: '600',
    },
});
