import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { mealTemplateService, MealTemplateType } from '../../services/mealTemplateService';
import { workoutTemplatesService } from '../../services/workoutTemplatesService';
import { planService } from '../../services/planService';
import { getMealSections } from '../../screens/MealsScreen';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, addDays } from 'date-fns';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CreatePlanWizardProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (planId: string) => void;
    userGoal?: string;
    userGoalWeight?: string;
    userTargets?: {
        calories: number;
        protein: number;
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
    const [selectedDays, setSelectedDays] = useState<number>(4);
    const [startDate, setStartDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // Load data on open
    useEffect(() => {
        if (visible) {
            setStep(1);
            setName('');
            setSelectedMealType(null);
            setSelectedWorkoutTemplate(null);
            setSelectedDays(4);
            setStartDate(new Date());
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
        if (step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleCreate = async () => {
        if (!selectedMealType || !selectedWorkoutTemplate) return;

        try {
            setCreating(true);

            const targetCals = userTargets?.calories || 2200;

            // Adjust macros based on selected meal template type
            let targetProtein, targetCarbs, targetFats;

            const templateId = selectedMealType.id.toLowerCase();
            if (templateId.includes('low') && (templateId.includes('carb') || templateId.includes(' carb'))) {
                // LOW CARB: <100g carbs, high fat, moderate protein
                targetProtein = userTargets?.protein || Math.round(targetCals * 0.25 / 4); // 25% protein
                targetCarbs = 80; // Fixed low carbs (~80g/day)
                targetFats = Math.round((targetCals - (targetProtein * 4) - (targetCarbs * 4)) / 9); // Fill rest with fats
            } else if (templateId.includes('high') && (templateId.includes('protein') || templateId.includes(' protein'))) {
                // HIGH PROTEIN: High protein, moderate carbs, lower fat
                targetProtein = Math.round(targetCals * 0.35 / 4); // 35% protein
                targetCarbs = userTargets?.carbs || Math.round(targetCals * 0.35 / 4); // 35% carbs
                targetFats = Math.round(targetCals * 0.30 / 9); // 30% fats
            } else {
                // BALANCED/DEFAULT: Use user targets or balanced macros
                targetProtein = userTargets?.protein || Math.round(targetCals * 0.30 / 4); // 30% protein
                targetCarbs = userTargets?.carbs || Math.round(targetCals * 0.40 / 4); // 40% carbs
                targetFats = userTargets?.fats || Math.round(targetCals * 0.30 / 9); // 30% fats
            }

            const mealSections = getMealSections(userGoalWeight);

            const mealPlan = await mealTemplateService.generatePlan(
                selectedMealType.id,
                targetCals,
                targetProtein,
                targetCarbs,
                targetFats,
                mealSections
            );

            const workoutPlan = workoutTemplatesService.applyTemplateToPlan(selectedWorkoutTemplate);

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
        } finally {
            setCreating(false);
        }
    };

    const renderStep1_Name = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Let's start.</Text>
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
                                        borderColor: isSelected ? '#8b5cf6' : colors.border,
                                        backgroundColor: isSelected ? (theme === 'light' ? '#f5f3ff' : 'rgba(139, 92, 246, 0.1)') : colors.card
                                    }
                                ]}
                                onPress={() => setSelectedMealType(type)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>{type.name}</Text>
                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />}
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
                            backgroundColor: selectedDays === days ? '#8b5cf6' : colors.card,
                            borderWidth: 1,
                            borderColor: selectedDays === days ? '#8b5cf6' : colors.border
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
                                            borderColor: isSelected ? '#8b5cf6' : colors.border,
                                            backgroundColor: isSelected ? (theme === 'light' ? '#f5f3ff' : 'rgba(139, 92, 246, 0.1)') : colors.card
                                        }
                                    ]}
                                    onPress={() => setSelectedWorkoutTemplate(template)}
                                >
                                    <View style={styles.row}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemTitle, { color: colors.text }]}>{template.name}</Text>
                                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{template.daysPerWeek} Days / Week • {template.difficulty}</Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />}
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

    const renderStep4_Schedule = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>When do we start?</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Pick a start date for your 14-day plan.</Text>

            <View style={styles.scheduleGrid}>
                {[
                    { label: 'Today', date: new Date(), icon: 'today-outline' },
                    { label: 'Tomorrow', date: addDays(new Date(), 1), icon: 'calendar-outline' },
                    { label: 'Next Monday', date: addDays(new Date(), (8 - new Date().getDay()) % 7 || 7), icon: 'calendar-number-outline' },
                ].map((option, idx) => {
                    const isSelected = format(startDate, 'yyyy-MM-dd') === format(option.date, 'yyyy-MM-dd');
                    return (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: isSelected ? '#8b5cf6' : colors.border,
                                }
                            ]}
                            onPress={() => setStartDate(option.date)}
                        >
                            <Ionicons name={option.icon as any} size={24} color={isSelected ? '#8b5cf6' : colors.textSecondary} />
                            <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                            <Text style={[styles.optionDate, { color: colors.textSecondary }]}>{format(option.date, 'MMM d')}</Text>
                            {isSelected && <View style={styles.selectedDot} />}
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity
                    style={[
                        styles.optionCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: isDatePickerVisible ? '#8b5cf6' : colors.border,
                        }
                    ]}
                    onPress={() => setDatePickerVisibility(true)}
                >
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.textSecondary} />
                    <Text style={[styles.optionLabel, { color: colors.text }]}>Custom</Text>
                    <Text style={[styles.optionDate, { color: colors.textSecondary }]}>Choose date</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.summaryBox, { backgroundColor: theme === 'light' ? '#f8fafc' : '#1e1e1e', borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>Plan Range:</Text>
                    <Text style={[styles.summaryDate, { color: colors.text }]}>
                        {format(startDate, 'MMM d')} - {format(addDays(startDate, 13), 'MMM d, yyyy')}
                    </Text>
                </View>
                <Text style={[styles.infoText, { marginTop: 8 }]}>
                    Your plan will last exactly 14 days. You can prepare it now and it will be waiting for you!
                </Text>
            </View>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date: Date) => {
                    setStartDate(date);
                    setDatePickerVisibility(false);
                }}
                onCancel={() => setDatePickerVisibility(false)}
                minimumDate={new Date()}
            />
        </View>
    );

    const renderStep5_Review = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Create</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>Everything looks solid.</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Plan Name</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{name || 'My Custom Plan'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Diet Style</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedMealType?.name}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Workout Routine</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedWorkoutTemplate?.name}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Starts On</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{format(startDate, 'EEEE, MMM d')}</Text>
                        <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600' }}>
                            {format(startDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'Today' : 'Scheduled'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Ionicons name="rocket-outline" size={20} color="#8b5cf6" />
                <Text style={styles.infoText}>
                    Ready for a lifestyle upgrade? Hit create below to build your 14-day blueprint.
                </Text>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${(step / 5) * 100}%` }]} />
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#8b5cf6" />
                    ) : (
                        <>
                            {step === 1 && renderStep1_Name()}
                            {step === 2 && renderStep2_Meals()}
                            {step === 3 && renderStep3_Workouts()}
                            {step === 4 && renderStep4_Schedule()}
                            {step === 5 && renderStep5_Review()}
                        </>
                    )}
                </View>

                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    {step > 1 ? (
                        <TouchableOpacity onPress={handleBack} style={styles.backBtn} disabled={creating}>
                            <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    {step < 5 ? (
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
                                    <Text style={styles.createText}>Create Blueprint</Text>
                                    <Ionicons name="sparkles" size={20} color="#fff" />
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
        backgroundColor: '#8b5cf6',
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
        borderWidth: 1.1,
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
        width: (SCREEN_WIDTH - 48 - 12) / 2,
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
        backgroundColor: '#8b5cf6',
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
        fontSize: 15,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#f5f3ff',
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#ede9fe',
    },
    infoText: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
        lineHeight: 18,
        fontWeight: '500',
    },
    scheduleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    optionCard: {
        width: (SCREEN_WIDTH - 48 - 12) / 2,
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 8,
    },
    optionDate: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    selectedDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8b5cf6',
    },
    summaryBox: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryDate: {
        fontSize: 14,
        fontWeight: '700',
    },
});
