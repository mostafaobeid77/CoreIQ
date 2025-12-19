import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface AiEditModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (instruction: string) => void;
    isLoading: boolean;
    context?: string; // Optional context like "Day 1"
}

export default function AiEditModal({
    visible,
    onClose,
    onSubmit,
    isLoading,
    context
}: AiEditModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [instruction, setInstruction] = useState('');

    const handleSubmit = () => {
        if (!instruction.trim()) return;
        onSubmit(instruction);
        setInstruction(''); // Clear after submit
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.modal, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="sparkles" size={24} color="#8b5cf6" />
                            <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {context ? `Editing ${context}` : 'Modify your plan'} with natural language.
                    </Text>

                    {/* Input Area */}
                    <View style={[styles.inputContainer, { backgroundColor: theme === 'light' ? '#f1f5f9' : '#1e1e1e', borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="e.g. 'Swap all chicken for salmon', 'Add a protein shake in the afternoon', 'Remove breakfast'"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            value={instruction}
                            onChangeText={setInstruction}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Suggestions */}
                    <View style={styles.suggestions}>
                        <TouchableOpacity
                            style={[styles.chip, { borderColor: colors.border }]}
                            onPress={() => setInstruction("Add more protein")}
                        >
                            <Text style={[styles.chipText, { color: colors.text }]}>Add protein</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.chip, { borderColor: colors.border }]}
                            onPress={() => setInstruction("Make it vegetarian")}
                        >
                            <Text style={[styles.chipText, { color: colors.text }]}>Vegetarian</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.chip, { borderColor: colors.border }]}
                            onPress={() => setInstruction("Fix calorie deficit")}
                        >
                            <Text style={[styles.chipText, { color: colors.text }]}>Fix calories</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: !instruction.trim() || isLoading ? colors.border : '#8b5cf6',
                            }
                        ]}
                        onPress={handleSubmit}
                        disabled={!instruction.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>Apply Changes</Text>
                                <Ionicons name="arrow-up" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        padding: 24,
        paddingBottom: 40,
        minHeight: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        minHeight: 120,
    },
    input: {
        fontSize: 16,
        lineHeight: 24,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    suggestions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    chip: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
