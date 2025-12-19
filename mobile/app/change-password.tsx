import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSave = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    alert('Password changed');
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

        <TouchableOpacity onPress={onSave} style={{ backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/confirm-code')} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: '#60a5fa', fontSize: 15, fontWeight: '600' }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
