import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { workoutTemplatesService } from '../../services/workoutTemplatesService';

interface WorkoutRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    userGoal: string;
    onApplyRoutine: (template: any) => void;
}

export default function WorkoutRoutineModal({
    visible,
    onClose,
    userGoal,
    onApplyRoutine
}: WorkoutRoutineModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    useEffect(() => {
        if (visible) {
            loadTemplates();
        }
    }, [visible]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            // Fetch ALL templates instead of filtering
            const data = await workoutTemplatesService.getAll();

            // Sort: Recommended first
            data.sort((a: any, b: any) => {
                const aRec = a.goal.some((g: string) => userGoal.includes(g));
                const bRec = b.goal.some((g: string) => userGoal.includes(g));
                if (aRec && !bRec) return -1;
                if (!aRec && bRec) return 1;
                return 0;
            });

            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
            Alert.alert('Error', 'Failed to load workout templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (template: any) => {
        setSelectedTemplate(template);
    };

    const handleApply = () => {
        if (!selectedTemplate) return;

        Alert.alert(
            'Apply Routine',
            `Apply "${selectedTemplate.name}" to your plan? This will replace all current workouts.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    onPress: () => {
                        onApplyRoutine(selectedTemplate);
                        onClose();
                    }
                }
            ]
        );
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return '#22c55e';
            case 'intermediate': return '#f59e42';
            case 'advanced': return '#ef4444';
            default: return colors.textSecondary;
        }
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
                        <Text style={[styles.title, { color: colors.text }]}>Workout Routines</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Choose a workout routine based on your goal
                    </Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    ) : (
                        <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
                            {templates.map(template => {
                                const isSelected = selectedTemplate?.id === template.id;
                                const isRecommended = template.goal.some((g: string) => userGoal.includes(g));

                                return (
                                    <TouchableOpacity
                                        key={template.id}
                                        style={[
                                            styles.templateItem,
                                            {
                                                backgroundColor: isSelected ? '#2563eb15' : colors.card,
                                                borderColor: isSelected ? '#2563eb' : colors.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            }
                                        ]}
                                        onPress={() => handleSelectTemplate(template)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.templateHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.templateName, { color: colors.text }]}>
                                                    {template.name}
                                                </Text>
                                                {isRecommended && (
                                                    <View style={[styles.badge, { backgroundColor: '#10b98120', alignSelf: 'flex-start', marginTop: 4, marginBottom: 4 }]}>
                                                        <Text style={[styles.badgeText, { color: '#10b981' }]}>Recommended</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.badges}>
                                                <View style={[styles.badge, { backgroundColor: getDifficultyColor(template.difficulty) + '30' }]}>
                                                    <Text style={[styles.badgeText, { color: getDifficultyColor(template.difficulty) }]}>
                                                        {template.difficulty}
                                                    </Text>
                                                </View>
                                                <View style={[styles.badge, { backgroundColor: '#2563eb30' }]}>
                                                    <Text style={[styles.badgeText, { color: '#2563eb' }]}>
                                                        {template.daysPerWeek} days/week
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>
                                            {template.description}
                                        </Text>

                                        {/* Show exercises preview */}
                                        <View style={styles.exercisesPreview}>
                                            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                                                Workout Days:
                                            </Text>
                                            <View style={styles.workoutDays}>
                                                {Object.keys(template.schedule).slice(0, 7).map(dayKey => {
                                                    const workoutName = template.schedule[dayKey];
                                                    if (workoutName === 'Rest') return null;
                                                    return (
                                                        <View key={dayKey} style={[styles.dayChip, { backgroundColor: colors.border }]}>
                                                            <Text style={[styles.dayChipText, { color: colors.text }]}>
                                                                {workoutName}
                                                            </Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        {isSelected && (
                                            <View style={styles.selectedIndicator}>
                                                <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                                                <Text style={[styles.selectedText, { color: '#2563eb' }]}>Selected</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    {/* Apply Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.applyButton,
                                {
                                    backgroundColor: selectedTemplate ? '#2563eb' : colors.border,
                                    opacity: selectedTemplate ? 1 : 0.5
                                }
                            ]}
                            onPress={handleApply}
                            disabled={!selectedTemplate}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.applyButtonText}>Apply Routine</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingBottom: 20,
        maxHeight: '85%',
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
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    templatesList: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    templateItem: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    templateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    templateName: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    badges: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    templateDesc: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    exercisesPreview: {
        marginTop: 8,
    },
    previewLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    workoutDays: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    dayChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    dayChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    selectedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2563eb30',
    },
    selectedText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    applyButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
