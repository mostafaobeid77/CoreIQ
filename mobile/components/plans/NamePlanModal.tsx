import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface NamePlanModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    isLoading?: boolean;
    title?: string;
    placeholder?: string;
}

export default function NamePlanModal({
    visible,
    onClose,
    onSubmit,
    isLoading = false,
    title = "Create New Plan",
    placeholder = "e.g., Summer Body 2025"
}: NamePlanModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [name, setName] = useState('');

    useEffect(() => {
        if (visible) {
            setName('');
        }
    }, [visible]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit(name.trim());
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <View style={[styles.content, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Give your plan a name to identify it easily.
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                backgroundColor: theme === 'light' ? '#f1f5f9' : '#1e1e1e',
                                borderColor: colors.border
                            }
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        autoFocus={true}
                        maxLength={40}
                    />

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.createButton,
                                { backgroundColor: name.trim() ? '#2563eb' : '#94a3b8' }
                            ]}
                            onPress={handleSubmit}
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.createButtonText}>Create Plan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    label: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#94a3b8',
    },
    createButton: {
        // Background color handled dynamically
    },
    cancelButtonText: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 16,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
