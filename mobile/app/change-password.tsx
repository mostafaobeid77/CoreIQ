import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  const onSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      await userService.changePassword(oldPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'User email not found');
      return;
    }

    Alert.alert(
      'Reset Password',
      'A verification code will be sent to your email. You will need to verify it and then set a new password.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Code',
          onPress: async () => {
            try {
              setSendingResetEmail(true);
              await authService.forgotPassword(user.email);
              Alert.alert(
                'Email Sent',
                'Check your email for the verification code',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push(`/confirm-code?email=${encodeURIComponent(user.email)}`),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to send reset email');
            } finally {
              setSendingResetEmail(false);
            }
          },
        },
      ]
    );
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <SafeAreaView style={{ backgroundColor: '#0f0f0f' }} edges={['top']} />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1d1d1d' }}>
        <TouchableOpacity onPress={navigateBack} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Change Password</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ color: '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Old password</Text>
        <View style={{ position: 'relative', marginBottom: 14 }}>
          <TextInput
            style={{ height: 50, backgroundColor: '#1f1f1f', borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontSize: 16, paddingRight: 40 }}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOld}
            placeholder="Old password"
            placeholderTextColor="#777"
          />
          <TouchableOpacity style={{ position: 'absolute', right: 14, top: 14 }} onPress={() => setShowOld(!showOld)}>
            <Ionicons name={showOld ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#9aa0a6', fontSize: 12, marginBottom: 6 }}>New password</Text>
        <View style={{ position: 'relative', marginBottom: 14 }}>
          <TextInput
            style={{ height: 50, backgroundColor: '#1f1f1f', borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontSize: 16, paddingRight: 40 }}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            placeholder="New password"
            placeholderTextColor="#777"
          />
          <TouchableOpacity style={{ position: 'absolute', right: 14, top: 14 }} onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Confirm new password</Text>
        <View style={{ position: 'relative', marginBottom: 14 }}>
          <TextInput
            style={{ height: 50, backgroundColor: '#1f1f1f', borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontSize: 16, paddingRight: 40 }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            placeholder="Confirm password"
            placeholderTextColor="#777"
          />
          <TouchableOpacity style={{ position: 'absolute', right: 14, top: 14 }} onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          style={{ backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForgotPassword}
          disabled={sendingResetEmail}
          style={{ alignItems: 'center', marginTop: 16 }}
        >
          {sendingResetEmail ? (
            <ActivityIndicator size="small" color="#60a5fa" />
          ) : (
            <Text style={{ color: '#60a5fa', fontSize: 15, fontWeight: '600' }}>Forgot password?</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
