import React, { useState, useMemo } from 'react';
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
import { useTheme } from '../../context/themeContext';

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
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // DYNAMIC THEME PALETTE
    const PALETTE = useMemo(() => ({
        backdrop: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.8)',
        sheetBg: isLight ? ['#ffffff', '#f8fafc'] : ['rgba(25, 25, 30, 0.95)', 'rgba(20, 20, 25, 0.97)'],
        borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        textMain: isLight ? '#0f172a' : '#ffffff',
        textSub: isLight ? '#64748b' : 'rgba(255, 255, 255, 0.5)',
        closeBtnBg: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)',
        closeBtnIcon: isLight ? '#000' : 'rgba(255,255,255,0.7)',
        inputBg: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
        inputBorder: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
        inputText: isLight ? '#0f172a' : '#ffffff',
        inputPlaceholder: isLight ? '#94a3b8' : 'rgba(255,255,255,0.3)',
        cancelBtnBg: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
        cancelBtnBorder: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.12)',
        cancelBtnText: isLight ? '#64748b' : 'rgba(255, 255, 255, 0.85)',
        warningBg: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.08)',
        warningBorder: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)',
        warningText: isLight ? '#7f1d1d' : 'rgba(255, 255, 255, 0.85)',
    }), [isLight]);

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
                    style={[styles.backdrop, { backgroundColor: isLight ? 'rgba(0,0,0,0.2)' : 'transparent' }]}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Bottom Sheet with Keyboard Support */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.sheetWrapper}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[styles.sheet, { borderColor: PALETTE.borderColor }]}>
                            {/* Single Glass Layer */}
                            <LinearGradient
                                colors={PALETTE.sheetBg as [string, string]}
                                style={styles.glassContainer}
                            >
                                {/* Header */}
                                <View style={styles.header}>
                                    <View>
                                        <Text style={[styles.title, { color: PALETTE.textMain }]}>Delete account</Text>
                                        <Text style={[styles.subtitle, { color: PALETTE.textSub }]}>This action is permanent</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        disabled={deleting}
                                        style={[styles.closeButton, { backgroundColor: PALETTE.closeBtnBg }]}
                                    >
                                        <Ionicons name="close" size={24} color={PALETTE.closeBtnIcon} />
                                    </TouchableOpacity>
                                </View>

                                {/* Soft Warning Card */}
                                <View style={[styles.warningCard, { backgroundColor: PALETTE.warningBg, borderColor: PALETTE.warningBorder }]}>
                                    <View style={styles.warningIconContainer}>
                                        <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
                                    </View>
                                    <Text style={[styles.warningText, { color: PALETTE.warningText }]}>
                                        All your data including meals, workouts, plans, and progress will be permanently deleted.
                                    </Text>
                                </View>

                                {/* Confirmation Input */}
                                <View style={styles.inputSection}>
                                    <Text style={[styles.inputLabel, { color: PALETTE.textSub }]}>
                                        Type <Text style={[styles.usernameText, { color: PALETTE.textMain }]}>{username}</Text> to confirm
                                    </Text>

                                    <View style={[styles.glassInput, { backgroundColor: PALETTE.inputBg, borderColor: PALETTE.inputBorder }]}>
                                        <TextInput
                                            style={[styles.input, { color: PALETTE.inputText }]}
                                            placeholder="Username"
                                            placeholderTextColor={PALETTE.inputPlaceholder}
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
                                        style={[styles.cancelButton, { backgroundColor: PALETTE.cancelBtnBg, borderColor: PALETTE.cancelBtnBorder }]}
                                        onPress={onClose}
                                        disabled={deleting}
                                    >
                                        <Text style={[styles.cancelText, { color: PALETTE.cancelBtnText }]}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.deleteButton, { opacity: canDelete ? 1 : 0.4 }]}
                                        onPress={handleDelete}
                                        disabled={!canDelete}
                                    >
                                        <LinearGradient
                                            colors={canDelete ? ['#dc2626', '#991b1b'] : isLight ? ['#94a3b8', '#64748b'] : ['#4a4a4a', '#3a3a3a']}
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
        // backgroundColor: 'rgba(0, 0, 0, 0.8)', // moved to dynamic
        justifyContent: 'flex-end',
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
        // borderColor: 'rgba(255, 255, 255, 0.08)', // moved to dynamic
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15, // lighter shadow
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
        // color: '#ffffff', // moved to dynamic
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        // color: 'rgba(255, 255, 255, 0.5)', // moved to dynamic
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        // backgroundColor: 'rgba(255, 255, 255, 0.05)', // moved to dynamic
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningCard: {
        flexDirection: 'row',
        // backgroundColor: 'rgba(239, 68, 68, 0.08)', // moved to dynamic
        borderRadius: 16,
        borderWidth: 1,
        // borderColor: 'rgba(239, 68, 68, 0.2)', // moved to dynamic
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
        // color: 'rgba(255, 255, 255, 0.85)', // moved to dynamic
        lineHeight: 20,
    },
    inputSection: {
        marginBottom: 28,
    },
    inputLabel: {
        fontSize: 14,
        // color: 'rgba(255, 255, 255, 0.7)', // moved to dynamic
        marginBottom: 12,
    },
    usernameText: {
        fontWeight: '700',
        // color: '#ffffff', // moved to dynamic
    },
    glassInput: {
        // backgroundColor: 'rgba(255, 255, 255, 0.05)', // moved to dynamic
        borderRadius: 12,
        borderWidth: 1,
        // borderColor: 'rgba(255, 255, 255, 0.1)', // moved to dynamic
        overflow: 'hidden',
    },
    input: {
        height: 52,
        paddingHorizontal: 16,
        fontSize: 16,
        // color: '#ffffff', // moved to dynamic
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
        // backgroundColor: 'rgba(255, 255, 255, 0.08)', // moved to dynamic
        borderWidth: 1,
        // borderColor: 'rgba(255, 255, 255, 0.12)', // moved to dynamic
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        // color: 'rgba(255, 255, 255, 0.85)', // moved to dynamic
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
