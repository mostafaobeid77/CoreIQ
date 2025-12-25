import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { format, addDays } from 'date-fns';

interface ChainPlanModalProps {
    visible: boolean;
    onClose: () => void;
    onKeepSame: (planName: string) => void;
    onCustomize: () => void;
    currentPlanEndDate: Date;
    currentPlanName: string;
    isLoading?: boolean;
}

export default function ChainPlanModal({
    visible,
    onClose,
    onKeepSame,
    onCustomize,
    currentPlanEndDate,
    currentPlanName,
    isLoading = false
}: ChainPlanModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [planName, setPlanName] = useState('');

    const nextStartDate = addDays(currentPlanEndDate, 1);

    const handleKeepSame = () => {
        const name = planName.trim() || `${currentPlanName} (Continued)`;
        onKeepSame(name);
    };

    // Reset name when modal opens
    React.useEffect(() => {
        if (visible) {
            setPlanName('');
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: '#8b5cf620' }]}>
                            <Ionicons name="link" size={28} color="#8b5cf6" />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Continue Your Journey
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            "{currentPlanName}" ends {format(currentPlanEndDate, 'MMM d')}.
                        </Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.nameSection}>
                        <Text style={[styles.nameLabel, { color: colors.textSecondary }]}>
                            New Plan Name
                        </Text>
                        <TextInput
                            style={[styles.nameInput, {
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border
                            }]}
                            placeholder={`${currentPlanName} (Continued)`}
                            placeholderTextColor={colors.textSecondary}
                            value={planName}
                            onChangeText={setPlanName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Options */}
                    <View style={styles.options}>
                        {/* Keep Same */}
                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.background, borderColor: '#8b5cf650' }]}
                            onPress={handleKeepSame}
                            disabled={isLoading}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons name="copy-outline" size={24} color="#8b5cf6" />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    Keep Same Settings
                                </Text>
                                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                                    Same meals & workouts • Starts {format(nextStartDate, 'MMM d')}
                                </Text>
                            </View>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#8b5cf6" />
                            ) : (
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            )}
                        </TouchableOpacity>

                        {/* Customize */}
                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.background }]}
                            onPress={onCustomize}
                            disabled={isLoading}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Ionicons name="sparkles-outline" size={24} color="#f59e0b" />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    Customize New Plan
                                </Text>
                                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                                    Choose new goals & templates
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Cancel */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        disabled={isLoading}
                    >
                        <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    container: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 20,
        padding: 24
    },
    header: {
        alignItems: 'center',
        marginBottom: 20
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20
    },
    nameSection: {
        marginBottom: 20
    },
    nameLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    nameInput: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1
    },
    options: {
        gap: 12,
        marginBottom: 20
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    optionContent: {
        flex: 1
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2
    },
    optionDesc: {
        fontSize: 12,
        lineHeight: 16
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '500'
    }
});
