import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// BlurView removed for performance
import { statsService } from '../../../services/statsService';
import { format, subDays, parseISO } from 'date-fns';
import { useTheme } from '../../../context/themeContext';

interface ProgressAnalysisModalProps {
    visible: boolean;
    onClose: () => void;
    onWeightUpdated?: () => void; // NEW: callback to refresh dashboard
}

const ProgressAnalysisModal = ({ visible, onClose, onWeightUpdated }: ProgressAnalysisModalProps) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // DYNAMIC THEME
    const THEME = useMemo(() => ({
        bg: isLight ? '#ffffff' : '#000000',
        card: isLight ? '#f3f4f6' : '#121212',
        primary: '#8B5CF6',
        text: isLight ? '#1f2937' : '#FFFFFF',
        textSec: isLight ? '#6b7280' : '#A0A0A0',
        border: isLight ? '#e5e7eb' : '#2A2A2A',
        success: isLight ? '#22c55e' : '#4ADE80',
        error: '#F87171',
        warning: '#FBBF24'
    }), [isLight]);

    // Dynamic Styles Generator
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        content: {
            backgroundColor: THEME.bg,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 0,
            maxHeight: '85%',
            borderWidth: 1,
            borderColor: THEME.border
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
        },
        title: {
            fontSize: 24,
            fontWeight: '800',
            color: THEME.text,
            letterSpacing: -0.5
        },
        closeBtn: {
            padding: 8,
            backgroundColor: THEME.card,
            borderRadius: 50
        },
        scoreCard: {
            backgroundColor: THEME.card,
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            marginBottom: 30
        },
        scoreStatus: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
        scoreAdvice: { fontSize: 16, color: THEME.textSec, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },

        section: { marginBottom: 30 },
        sectionTitle: { color: THEME.textSec, fontSize: 13, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },

        statRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: THEME.card,
            padding: 16,
            borderRadius: 24,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: THEME.border
        },
        iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
        statLabel: { fontSize: 16, fontWeight: '700', color: THEME.text },
        statSub: { fontSize: 12, color: THEME.textSec, marginTop: 2, fontWeight: '600' },
        statValue: { fontSize: 18, fontWeight: '800' },

        noteCard: {
            backgroundColor: isLight ? '#f9fafb' : '#111',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: THEME.border,
            borderStyle: 'dashed'
        },
        noteTitle: { color: THEME.primary, fontSize: 12, fontWeight: '800', marginBottom: 10, letterSpacing: 1 },
        noteText: { color: THEME.text, fontSize: 15, lineHeight: 22 },

        suggestionCard: {
            backgroundColor: isLight ? '#f3f4f6' : '#1A1A1A',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: THEME.primary,
            marginBottom: 30
        },

        center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }
    }), [THEME, isLight]);

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<any>(null);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            setLoading(true);
            loadReport();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            setReport(null);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const loadReport = async () => {
        try {
            const endDate = new Date();
            const startDate = subDays(endDate, 13);
            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');

            const data = await statsService.getAdherenceReport(startStr, endStr);
            setReport(data);
        } catch (error) {
            console.error('Failed to load progress report', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyEst = async () => {
        const suggestion = report?.suggestion;
        if (!suggestion) return;
        try {
            setLoading(true);
            const today = format(new Date(), 'yyyy-MM-dd');
            console.log('[SmartAnalysis] Updating weight to:', suggestion.estimatedWeight);

            // Use the FAST patchStats endpoint instead of slow applyEstimatedWeight
            await statsService.patchStats(today, { weight: suggestion.estimatedWeight });

            console.log('[SmartAnalysis] Weight updated successfully');

            // Close modal first
            onClose();

            // Then refresh dashboard
            if (onWeightUpdated) {
                await onWeightUpdated();
            }
        } catch (e) {
            console.error('[SmartAnalysis] Failed:', e);
            setLoading(false);
        }
    };

    // Use Backend Verdict directly
    const card = report?.verdict || { status: 'Loading...', color: THEME.textSec, advice: '' };
    const suggestion = report?.suggestion;

    const Skeleton = () => (
        <View style={{ opacity: 0.5 }}>
            <View style={{ height: 150, backgroundColor: THEME.card, borderRadius: 24, marginBottom: 20 }} />
            <View style={{ height: 80, backgroundColor: THEME.card, borderRadius: 24, marginBottom: 10 }} />
        </View>
    );

    const StatRow = ({ label, value, icon, color, subValue }: any) => (
        <View style={styles.statRow}>
            <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statSub}>{subValue}</Text>
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
    );

    return (
        <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
            <View style={styles.container}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
                </TouchableOpacity>

                <Animated.View style={[styles.content, {
                    opacity: fadeAnim,
                    transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }]
                }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Weekly Report</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={THEME.text} />
                        </TouchableOpacity>
                    </View>

                    {loading && !report ? (
                        <Skeleton />
                    ) : report ? (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                            {/* 1. Main Score Card (From Backend Logic) */}
                            <View style={[styles.scoreCard, { borderColor: card.color }]}>
                                <Text style={[styles.scoreStatus, { color: card.color }]}>{card.status}</Text>
                                <View style={{ height: 1, width: '100%', backgroundColor: THEME.border, marginVertical: 15 }} />
                                <Text style={styles.scoreAdvice}>{card.advice}</Text>
                            </View>

                            {/* 2. Weight Suggestion Card */}
                            {suggestion && (
                                <View style={styles.suggestionCard}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <Ionicons name="scale-outline" size={24} color={THEME.primary} />
                                        <Text style={[styles.sectionTitle, { color: THEME.primary, marginBottom: 0, marginLeft: 10 }]}>UPDATE YOUR WEIGHT?</Text>
                                    </View>
                                    <Text style={styles.noteText}>
                                        Based on your {suggestion.daysSince} days of tracking ({suggestion.netCalories > 0 ? '+' : ''}{suggestion.netCalories} kcal net), your weight should now be:
                                    </Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                                        <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF' }}>{suggestion.estimatedWeight} kg</Text>
                                        <TouchableOpacity onPress={handleApplyEst} style={{ backgroundColor: THEME.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
                                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Update Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* 3. Simple Metrics Lists */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>KEY METRICS</Text>

                                <StatRow
                                    label="Nutrition"
                                    subValue="Daily Average Intake"
                                    value={`${report.data.avgDailyIn} kcal`}
                                    icon="fast-food"
                                    color={THEME.primary}
                                />

                                <StatRow
                                    label="Weight Trend"
                                    subValue="Last 14 Days Change"
                                    value={`${report.weightChange > 0 ? '+' : ''}${report.weightChange} kg`}
                                    icon="trending-up"
                                    color={report.weightChange > 0 ? THEME.success : THEME.text}
                                />

                                <StatRow
                                    label="Projected Goal"
                                    subValue={`Reach ${report.userGoal.split(':')[1] || 'Goal'}`}
                                    value={report.projection?.projectedGoalDate ? format(parseISO(report.projection.projectedGoalDate), 'MMM d, yyyy') : 'Calculating...'}
                                    icon="calendar"
                                    color={THEME.textSec}
                                />
                            </View>

                            {/* 4. Coach Note */}
                            <View style={styles.noteCard}>
                                <Text style={styles.noteTitle}>COACH'S NOTE</Text>
                                <Text style={styles.noteText}>
                                    "Your consistency is key. At this rate, you are expected to reach your goal in approximately {Math.round((report.projection?.daysToGoal || 0) / 30)} months."
                                </Text>
                            </View>

                        </ScrollView>
                    ) : (
                        <View style={styles.center}><Text style={{ color: THEME.textSec }}>No data available.</Text></View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

// styles moved inside component for dynamic theming
export default ProgressAnalysisModal;
