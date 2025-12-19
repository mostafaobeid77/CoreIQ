import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { mealTemplateService, MealTemplateType } from '../../services/mealTemplateService';
import { workoutTemplatesService } from '../../services/workoutTemplatesService';
import { planService } from '../../services/planService';
import { getMealSections } from '../../screens/MealsScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CreatePlanWizardProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (planId: string) => void;
    userGoal?: string;
    userGoalWeight?: string; // Added to get meal sections
    userTargets?: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
    };
}

export default function CreatePlanWizard({
    visible,
    onClose,
    onSuccess,
    userGoal = '',
    userGoalWeight,
    userTargets
}: CreatePlanWizardProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    // State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    // Data
    const [name, setName] = useState('');
    const [mealTypes, setMealTypes] = useState<MealTemplateType[]>([]);
    const [workoutTemplates, setWorkoutTemplates] = useState<any[]>([]);

    // Selection
    const [selectedMealType, setSelectedMealType] = useState<MealTemplateType | null>(null);
    const [selectedWorkoutTemplate, setSelectedWorkoutTemplate] = useState<any | null>(null);
    const [selectedDays, setSelectedDays] = useState<number>(4); // Default to 4 days

    // Load data on open
    useEffect(() => {
        if (visible) {
            setStep(1);
            setName('');
            setName('');
            setSelectedMealType(null);
            setSelectedWorkoutTemplate(null);
            setSelectedDays(4);
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mTypes, wTemplates] = await Promise.all([
                mealTemplateService.getTypes(),
                workoutTemplatesService.getAll()
            ]);
            setMealTypes(mTypes);
            setWorkoutTemplates(wTemplates);
        } catch (error) {
            console.error('Wizard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleCreate = async () => {
        if (!selectedMealType || !selectedWorkoutTemplate) return;

        try {
            setCreating(true);

            // 1. Get Target Macros
            // Use user's calculated targets from their profile
            const targetCals = userTargets?.calories || 2200;
            const targetProtein = userTargets?.proteins || Math.round(targetCals * 0.30 / 4);
            const targetCarbs = userTargets?.carbs || Math.round(targetCals * 0.40 / 4);
            const targetFats = userTargets?.fats || Math.round(targetCals * 0.30 / 9);

            // Get user's meal sections based on their goal
            const mealSections = getMealSections(userGoalWeight);

            const mealPlan = await mealTemplateService.generatePlan(
                selectedMealType.id,
                targetCals,
                targetProtein,
                targetCarbs,
                targetFats,
                mealSections
            );

            // 2. Generate Workout Plan (Frontend Helper)
            const workoutPlan = workoutTemplatesService.applyTemplateToPlan(selectedWorkoutTemplate);

            // 3. Create Plan
            const startDate = new Date();
            const res = await planService.createPlan({
                name: name || 'My Custom Plan',
                startDate: startDate.toISOString(),
                status: 'draft',
                mealPlan,
                workoutPlan,
                metadata: {
                    goal: userGoal,
                    workoutSplit: selectedWorkoutTemplate.name
                }
            });

            onSuccess(res.plan._id);
            onClose();

        } catch (error) {
            console.error('Wizard create error:', error);
            // Alert user?
        } finally {
            setCreating(false);
        }
    };

    const renderStep1_Name = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Let's start locally.</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Give your new plan a name.</Text>

            <TextInput
                style={[
                    styles.input,
                    {
                        color: colors.text,
                        backgroundColor: theme === 'light' ? '#f1f5f9' : '#1e1e1e',
                        borderColor: colors.border
                    }
                ]}
                placeholder="e.g. Summer Shred 2025"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoFocus
            />
        </View>
    );

    const renderStep2_Meals = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Choose a Diet Style</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>We'll generate meals based on this.</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {mealTypes.map(type => {
                        const isSelected = selectedMealType?.id === type.id;
                        const isRecommended = type.goal.some(g => userGoal.includes(g));

                        return (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.card,
                                    {
                                        borderColor: isSelected ? '#2563eb' : colors.border,
                                        backgroundColor: isSelected ? (theme === 'light' ? '#eff6ff' : '#1e3a8a30') : colors.card
                                    }
                                ]}
                                onPress={() => setSelectedMealType(type)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>{type.name}</Text>
                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                                </View>
                                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{type.description}</Text>
                                {isRecommended && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>Recommended</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );

    const renderStep3_Workouts = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Pick a Routine</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>How many days can you train?</Text>

            {/* Days Filter */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                {[3, 4, 5, 6].map(days => (
                    <TouchableOpacity
                        key={days}
                        onPress={() => {
                            setSelectedDays(days);
                            setSelectedWorkoutTemplate(null);
                        }}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: selectedDays === days ? '#2563eb' : colors.card,
                            borderWidth: 1,
                            borderColor: selectedDays === days ? '#2563eb' : colors.border
                        }}
                    >
                        <Text style={{
                            fontWeight: '700',
                            color: selectedDays === days ? '#FFF' : colors.text
                        }}>
                            {days} Days
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.list}>
                    {workoutTemplates
                        .filter(t => t.daysPerWeek === selectedDays)
                        .map(template => {
                            const isSelected = selectedWorkoutTemplate?.id === template.id;
                            const isRecommended = template.goal.some((g: any) => userGoal.includes(g));

                            return (
                                <TouchableOpacity
                                    key={template.id}
                                    style={[
                                        styles.listItem,
                                        {
                                            borderColor: isSelected ? '#2563eb' : colors.border,
                                            backgroundColor: isSelected ? (theme === 'light' ? '#eff6ff' : '#1e3a8a30') : colors.card
                                        }
                                    ]}
                                    onPress={() => setSelectedWorkoutTemplate(template)}
                                >
                                    <View style={styles.row}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: colors.text }]}>{template.name}</Text>
                                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{template.daysPerWeek} Days / Week • {template.difficulty}</Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#2563eb" />}
                                    </View>
                                    {isRecommended && (
                                        <Text style={[styles.recText, { color: '#10b981' }]}>Recommended for your goal</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                </View>
            </ScrollView>
        </View>
    );

    const renderStep4_Review = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Ready to Build?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Review your choices.</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Name</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{name || 'My Custom Plan'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Diet</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedMealType?.name}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Workout</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedWorkoutTemplate?.name}</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#64748b" />
                <Text style={styles.infoText}>
                    We will generate a full 14-day plan. You can edit any day using our new AI Assistant later!
                </Text>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#2563eb" />
                    ) : (
                        <>
                            {step === 1 && renderStep1_Name()}
                            {step === 2 && renderStep2_Meals()}
                            {step === 3 && renderStep3_Workouts()}
                            {step === 4 && renderStep4_Review()}
                        </>
                    )}
                </View>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    {step > 1 ? (
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn} disabled={creating}>
                            <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    {step < 4 ? (
                        <TouchableOpacity
                            onPress={handleNext}
                            style={[
                                styles.nextBtn,
                                {
                                    opacity: (step === 1 && !name.trim()) || (step === 2 && !selectedMealType) || (step === 3 && !selectedWorkoutTemplate) ? 0.5 : 1
                                }
                            ]}
                            disabled={
                                (step === 1 && !name.trim()) ||
                                (step === 2 && !selectedMealType) ||
                                (step === 3 && !selectedWorkoutTemplate)
                            }
                        >
                            <Text style={styles.nextText}>Next</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleCreate}
                            style={styles.createBtn}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.createText}>Create Plan</Text>
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    progressContainer: {
        flex: 1,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2563eb',
    },
    content: {
        flex: 1,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        marginBottom: 32,
    },
    input: {
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 18,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 20,
    },
    card: {
        width: (SCREEN_WIDTH - 48 - 12) / 2, // 2 columns
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 140,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    cardDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    badge: {
        marginTop: 12,
        backgroundColor: '#10b98120',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#10b981',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    list: {
        gap: 12,
        paddingBottom: 20,
    },
    listItem: {
        padding: 20,
        borderWidth: 1,
        borderRadius: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemSub: {
        fontSize: 13,
    },
    recText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextBtn: {
        flex: 2,
        height: 56,
        backgroundColor: '#2563eb',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    createBtn: {
        flex: 2,
        height: 56,
        backgroundColor: '#10b981',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    createText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    summaryCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryLabel: {
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
        lineHeight: 20,
    },
});
