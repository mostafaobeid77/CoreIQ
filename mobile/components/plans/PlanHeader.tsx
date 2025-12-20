import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { format, isAfter, startOfDay } from 'date-fns';

interface PlanHeaderProps {
    planName: string;
    onNameChange: (name: string) => void;
    onSave: () => void;
    onActivate: () => void;
    onGenerateAI: () => void;
    onAiAssist: () => void;
    onOpenPlansList: () => void;
    onDelete: () => void;
    onChooseWorkoutRoutine?: () => void;
    isSaving: boolean;
    isGenerating: boolean;
    status: 'draft' | 'active' | 'completed';
    hasChanges: boolean;
    plan: any;
    startDate?: Date;
}

export default function PlanHeader({
    planName,
    onNameChange,
    onSave,
    onActivate,
    onGenerateAI,
    onAiAssist,
    onOpenPlansList,
    onDelete,
    onChooseWorkoutRoutine,
    isSaving,
    isGenerating,
    status,
    hasChanges,
    plan,
    startDate = new Date()
}: PlanHeaderProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const navigation = useNavigation();
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(planName);

    useEffect(() => {
        setTempName(planName);
    }, [planName]);

    const handleNameSubmit = () => {
        if (tempName.trim()) {
            onNameChange(tempName);
        } else {
            setTempName(planName);
        }
        setIsEditing(false);
    };

    const navigateToAI = () => {
        // @ts-ignore - Navigation type
        navigation.navigate('AI');
    };

    const isFuture = isAfter(startOfDay(startDate), startOfDay(new Date()));

    return (
        <View style={styles.container}>
            {/* Top Row: Title & Status */}
            <View style={styles.topRow}>
                <View style={styles.titleContainer}>
                    {isEditing ? (
                        <TextInput
                            style={[styles.titleInput, { color: colors.text }]}
                            value={tempName}
                            onChangeText={setTempName}
                            onBlur={handleNameSubmit}
                            onSubmitEditing={handleNameSubmit}
                            autoFocus
                            selectionColor={colors.primary}
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.titleWrapper}>
                            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                                {planName}
                            </Text>
                            <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Status Badge */}
                <View style={styles.badgeRow}>
                    {isFuture && status === 'draft' && (
                        <View style={[styles.statusBadge, { backgroundColor: '#f59e0b20', marginRight: 8 }]}>
                            <Text style={[styles.statusText, { color: '#f59e0b' }]}>
                                SCHEDULED: {format(startDate, 'MMM d')}
                            </Text>
                        </View>
                    )}
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: status === 'active'
                                ? '#8b5cf6' + '30'
                                : status === 'completed'
                                    ? '#22c55e' + '30'
                                    : colors.textSecondary + '30'
                        }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            {
                                color: status === 'active'
                                    ? '#8b5cf6'
                                    : status === 'completed'
                                        ? '#22c55e'
                                        : colors.textSecondary
                            }
                        ]}>
                            {status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>





            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12
                }}
            >
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.card }]}
                    onPress={onOpenPlansList}
                >
                    <Ionicons name="list" size={18} color={colors.text} />
                    <Text style={[styles.actionText, { color: colors.text }]}>Plans</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.card }]}
                    onPress={onAiAssist}
                >
                    <Ionicons name="sparkles" size={18} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.text }]}>AI Assist</Text>
                </TouchableOpacity>

                {status !== 'active' ? (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                        onPress={onActivate}
                    >
                        <Ionicons name="play" size={16} color="#FFF" />
                        <Text style={styles.primaryButtonText}>Start Plan</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.activeBadge, { backgroundColor: '#22c55e20' }]}>
                        <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                        <Text style={[styles.activeText, { color: '#22c55e' }]}>Active</Text>
                    </View>
                )}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        flex: 1,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: '700',
        padding: 0,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    aiBadge: {
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    aiBadgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
