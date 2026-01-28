import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { userService } from '../../services/userService';

interface AdminRequestModalProps {
    visible: boolean;
    onClose: () => void;
    initialUsername?: string;
    initialEmail?: string;
}

const AdminRequestModal: React.FC<AdminRequestModalProps> = ({ visible, onClose, initialUsername = '', initialEmail = '' }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(initialUsername);
    const [email, setEmail] = useState(initialEmail);

    useEffect(() => {
        if (visible) {
            setUsername(initialUsername);
            setEmail(initialEmail);
            setReason('');
        }
    }, [visible, initialUsername, initialEmail]);

    const handleSubmit = async () => {
        if (!reason || reason.length < 10) {
            Alert.alert('Error', 'Please provide a valid reason (min 10 chars).');
            return;
        }
        setLoading(true);
        try {
            await userService.submitAdminRequest({ username, email, reason });
            Alert.alert('Success', 'Request submitted successfully!');
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Join Admin Team</Text>

                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Username</Text>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#f9f9f9' }}
                    />

                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#f9f9f9' }}
                    />

                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Reason</Text>
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, height: 100, marginBottom: 24, textAlignVertical: 'top' }}
                        placeholder="Why do you want to join?"
                    />

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={onClose} style={{ flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' }}>
                            <Text style={{ color: '#374151', fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={{ flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#8b5cf6', alignItems: 'center' }}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Submit</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AdminRequestModal;
