import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
    username: string;
    onDelete: () => Promise<void>;
}

const { height } = Dimensions.get('window');

export default function DeleteAccountModal({
    visible,
    onClose,
    username,
    onDelete,
}: DeleteAccountModalProps) {
    const [confirmUsername, setConfirmUsername] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await onDelete();
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to delete account');
        } finally {
            setDeleting(false);
        }
    };

    const canDelete = confirmUsername === username && !deleting;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            {/* Cleaner dark overlay */}
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Bottom Sheet with Keyboard Support */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.sheetWrapper}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.sheet}>
                            {/* Single Glass Layer */}
                            <LinearGradient
                                colors={['rgba(25, 25, 30, 0.95)', 'rgba(20, 20, 25, 0.97)']}
                                style={styles.glassContainer}
                            >
                                {/* Header */}
                                <View style={styles.header}>
                                    <View>
                                        <Text style={styles.title}>Delete account</Text>
                                        <Text style={styles.subtitle}>This action is permanent</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        disabled={deleting}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
                                    </TouchableOpacity>
                                </View>

                                {/* Soft Warning Card */}
                                <View style={styles.warningCard}>
                                    <View style={styles.warningIconContainer}>
                                        <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
                                    </View>
                                    <Text style={styles.warningText}>
                                        All your data including meals, workouts, plans, and progress will be permanently deleted.
                                    </Text>
                                </View>

                                {/* Confirmation Input */}
                                <View style={styles.inputSection}>
                                    <Text style={styles.inputLabel}>
                                        Type <Text style={styles.usernameText}>{username}</Text> to confirm
                                    </Text>

                                    <View style={styles.glassInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Username"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            value={confirmUsername}
                                            onChangeText={setConfirmUsername}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={onClose}
                                        disabled={deleting}
                                    >
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.deleteButton, { opacity: canDelete ? 1 : 0.4 }]}
                                        onPress={handleDelete}
                                        disabled={!canDelete}
                                    >
                                        <LinearGradient
                                            colors={canDelete ? ['#dc2626', '#991b1b'] : ['#4a4a4a', '#3a3a3a']}
                                            style={styles.deleteGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            {deleting ? (
                                                <ActivityIndicator size="small" color="#ffffff" />
                                            ) : (
                                                <Text style={styles.deleteText}>Delete forever</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    backdrop: {
        flex: 1,
    },
    sheetWrapper: {
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: height * 0.75,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    glassContainer: {
        padding: 24,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    warningIconContainer: {
        marginTop: 1,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 20,
    },
    inputSection: {
        marginBottom: 28,
    },
    inputLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 12,
    },
    usernameText: {
        fontWeight: '700',
        color: '#ffffff',
    },
    glassInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    input: {
        height: 52,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.85)',
    },
    deleteButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        overflow: 'hidden',
    },
    deleteGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
});
