import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import aiCoachService from '../../services/aiCoachService';

interface SwapFoodModalProps {
    visible: boolean;
    onClose: () => void;
    planId: string;
    dayIndex: number;
    mealType: string;
    foodId: string;
    foodName: string;
    onSwapComplete: () => void;
}

export default function SwapFoodModal({
    visible,
    onClose,
    planId,
    dayIndex,
    mealType,
    foodId,
    foodName,
    onSwapComplete
}: SwapFoodModalProps) {
    const [userMessage, setUserMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<any>(null);

    const handleGetSuggestion = async () => {
        if (!userMessage.trim() && !suggestion) {
            Alert.alert('Tell me what you want', 'E.g., "I want chicken instead" or "Give me something vegetarian"');
            return;
        }

        setLoading(true);
        try {
            const result = await aiCoachService.suggestFoodSwap(
                planId,
                dayIndex,
                mealType,
                foodId,
                userMessage
            );

            if (result.success && result.replacement) {
                setSuggestion(result);
            } else {
                Alert.alert('No alternatives found', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get AI suggestion. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplySwap = async () => {
        if (!suggestion?.replacement) return;

        setLoading(true);
        try {
            const result = await aiCoachService.applyFoodSwap(
                planId,
                dayIndex,
                mealType,
                foodId,
                suggestion.replacement.foodId,
                suggestion.replacement.suggestedQuantity
            );

            if (result.success) {
                Alert.alert('Success!', 'Food swapped successfully');
                onSwapComplete();
                handleClose();
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to apply swap. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuggestion(null);
        setUserMessage('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>🤖 AI Food Swap</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Current Food */}
                    <View style={styles.currentFood}>
                        <Text style={styles.label}>Swapping:</Text>
                        <Text style={styles.foodName}>{foodName}</Text>
                    </View>

                    {!suggestion ? (
                        <>
                            {/* Input */}
                            <TextInput
                                style={styles.input}
                                placeholder="What do you want instead? (e.g., 'chicken' or 'vegetarian')"
                                placeholderTextColor="#666"
                                value={userMessage}
                                onChangeText={setUserMessage}
                                multiline
                            />

                            {/* Quick suggestions */}
                            <View style={styles.quickActions}>
                                <TouchableOpacity
                                    style={styles.quickButton}
                                    onPress={() => setUserMessage('Give me chicken instead')}
                                >
                                    <Text style={styles.quickText}>🍗 Chicken</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.quickButton}
                                    onPress={() => setUserMessage('Something vegetarian')}
                                >
                                    <Text style={styles.quickText}>🥗 Vegetarian</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.quickButton}
                                    onPress={() => setUserMessage('Less fat')}
                                >
                                    <Text style={styles.quickText}>💪 Lean</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Get Suggestion Button */}
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={handleGetSuggestion}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Get AI Suggestion</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* AI Suggestion */}
                            <View style={styles.suggestion}>
                                <Text style={styles.suggestionTitle}>✨ AI suggests:</Text>
                                <Text style={styles.suggestionFood}>{suggestion.replacement.name}</Text>
                                <Text style={styles.suggestionReason}>{suggestion.aiReason}</Text>

                                <View style={styles.macros}>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>
                                            {Math.round(suggestion.replacement.caloriesPer100g * suggestion.replacement.suggestedQuantity / 100)}
                                        </Text>
                                        <Text style={styles.macroLabel}>kcal</Text>
                                    </View>
                                    <View style={styles.macroItem}>
                                        <Text style={styles.macroValue}>
                                            {Math.round(suggestion.replacement.proteinPer100g * suggestion.replacement.suggestedQuantity / 100)}g
                                        </Text>
                                        <Text style={styles.macroLabel}>protein</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.button, styles.secondaryButton]}
                                    onPress={() => setSuggestion(null)}
                                >
                                    <Text style={styles.secondaryButtonText}>Try Again</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.primaryButton, { flex: 1 }]}
                                    onPress={handleApplySwap}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Apply Swap</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end'
    },
    modal: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff'
    },
    currentFood: {
        backgroundColor: '#2a2a2a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4
    },
    foodName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff'
    },
    input: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 16
    },
    quickActions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20
    },
    quickButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    quickText: {
        color: '#fff',
        fontSize: 12
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    primaryButton: {
        backgroundColor: '#6c5ce7'
    },
    secondaryButton: {
        backgroundColor: '#2a2a2a',
        flex: 0.4
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    secondaryButtonText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600'
    },
    suggestion: {
        backgroundColor: '#2a2a2a',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
    },
    suggestionTitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8
    },
    suggestionFood: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8
    },
    suggestionReason: {
        fontSize: 14,
        color: '#aaa',
        lineHeight: 20,
        marginBottom: 16
    },
    macros: {
        flexDirection: 'row',
        gap: 16
    },
    macroItem: {
        alignItems: 'center'
    },
    macroValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6c5ce7'
    },
    macroLabel: {
        fontSize: 12,
        color: '#888'
    },
    actions: {
        flexDirection: 'row',
        gap: 12
    }
});
