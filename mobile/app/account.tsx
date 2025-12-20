import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { userService } from '../services/userService';

export default function AccountScreen() {
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const isLight = theme === 'light';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    username: '',
    email: '',
    birthdate: new Date(),
    gender: 'male' as 'male' | 'female',
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getProfile();
      setUserData({
        fullName: profile.fullName || '',
        username: profile.username || '',
        email: profile.email || '',
        birthdate: profile.birthDate ? new Date(profile.birthDate) : new Date(),
        gender: profile.gender || 'male',
      });
      if (profile.profilePhoto) {
        setPhotoUri(profile.profilePhoto);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.6, // Lower quality to reduce size
        allowsEditing: true,
        aspect: [1, 1],
        base64: true, // Get base64 directly from picker
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // If base64 is available, use it directly; otherwise use URI
        if (asset.base64) {
          const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
          setPhotoUri(base64Uri);
        } else {
          setPhotoUri(asset.uri);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', `Failed to pick image: ${error?.message || 'Unknown error'}`);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      // Use expo-image-picker's base64 option or fetch + manual conversion
      // For React Native, we'll use fetch to get the file and convert
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Read as blob and convert to base64
      const blob = await response.blob();
      const reader = new (global as any).FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if (!base64String) {
            reject(new Error('Failed to convert image to base64'));
            return;
          }
          resolve(base64String);
        };
        reader.onerror = () => {
          reject(new Error('FileReader error while converting image'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      console.error('Image conversion error:', error);
      throw new Error(`Failed to process image: ${error?.message || 'Unknown error'}`);
    }
  };

  const onChangeBirthdate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selectedDate) setUserData(prev => ({ ...prev, birthdate: selectedDate }));
  };

  const navigateBack = () => {
    router.back();
  };

  const navigateChangePassword = () => {
    router.push('/change-password');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: any = {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        birthDate: userData.birthdate.toISOString(),
      };

      // Handle profile photo - if it's a data URI (base64), use it directly
      // If it's a file:// URI, convert it to base64
      if (photoUri) {
        if (photoUri.startsWith('data:')) {
          // Already base64 from picker
          // Limit size - if too large, show error
          if (photoUri.length > 2000000) { // ~2MB limit
            Alert.alert('Image Too Large', 'Please select a smaller image (max 2MB)');
            setSaving(false);
            return;
          }
          updateData.profilePhoto = photoUri;
        } else if (photoUri.startsWith('file://')) {
          // Local file - convert to base64
          try {
            const base64Image = await convertImageToBase64(photoUri);
            if (base64Image.length > 2000000) {
              Alert.alert('Image Too Large', 'Please select a smaller image (max 2MB)');
              setSaving(false);
              return;
            }
            updateData.profilePhoto = base64Image;
          } catch (imgError: any) {
            console.error('Image processing error:', imgError);
            Alert.alert('Image Error', `Failed to process image: ${imgError?.message || 'Unknown error'}`);
            setSaving(false);
            return;
          }
        }
        // If it's a URL (http/https/relative), we simply DO NOT include it in the update.
        // This prevents re-sending the URL text and corrupting the base64 field in DB.
      }

      await userService.updateProfile(updateData);
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Save profile error:', error);
      const errorMessage = error?.message || 'Failed to update profile';
      // Check if it's a network error
      if (errorMessage.includes('Network request failed') || errorMessage.includes('all bases failed')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and make sure the backend is running.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const getProfileImageSource = () => {
    if (photoUri) {
      return { uri: photoUri };
    }
    if (user?.profilePhoto) {
      return { uri: user.profilePhoto };
    }
    return require('../assets/images/icon.png');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: isLight ? '#ffffff' : '#0f0f0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isLight ? '#ffffff' : '#0f0f0f' }}>
      <SafeAreaView style={{ backgroundColor: isLight ? '#ffffff' : '#0f0f0f' }} edges={['top']} />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: isLight ? '#e5e7eb' : '#1d1d1d' }}>
        <TouchableOpacity onPress={navigateBack} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color={isLight ? '#111' : '#fff'} />
        </TouchableOpacity>
        <Text style={{ color: isLight ? '#111' : '#fff', fontSize: 18, fontWeight: '700' }}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image source={getProfileImageSource()} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 10 }} />
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={pickImage}>
            <Ionicons name="camera" size={16} color="#60a5fa" />
            <Text style={{ color: '#60a5fa', marginLeft: 6, fontWeight: '600' }}>Change photo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: isLight ? '#ffffff' : '#151515', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#222', marginBottom: 14 }}>
          <Text style={{ color: isLight ? '#6b7280' : '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Full name</Text>
          <TextInput
            value={userData.fullName}
            onChangeText={(t) => setUserData(prev => ({ ...prev, fullName: t }))}
            style={{ color: isLight ? '#111' : '#fff', fontSize: 16, backgroundColor: isLight ? '#f8fafc' : '#1c1c1c', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#2a2a2a' }}
            placeholder="Full name"
            placeholderTextColor={isLight ? '#98a2b3' : '#666'}
          />
        </View>
        <View style={{ backgroundColor: isLight ? '#ffffff' : '#151515', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#222', marginBottom: 14 }}>
          <Text style={{ color: isLight ? '#6b7280' : '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Username</Text>
          <TextInput
            value={userData.username}
            onChangeText={(t) => setUserData(prev => ({ ...prev, username: t }))}
            style={{ color: isLight ? '#111' : '#fff', fontSize: 16, backgroundColor: isLight ? '#f8fafc' : '#1c1c1c', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#2a2a2a' }}
            placeholder="Username"
            placeholderTextColor={isLight ? '#98a2b3' : '#666'}
            autoCapitalize="none"
          />
        </View>
        <View style={{ backgroundColor: isLight ? '#ffffff' : '#151515', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#222', marginBottom: 14 }}>
          <Text style={{ color: isLight ? '#6b7280' : '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Email</Text>
          <TextInput
            value={userData.email}
            onChangeText={(t) => setUserData(prev => ({ ...prev, email: t }))}
            style={{ color: isLight ? '#111' : '#fff', fontSize: 16, backgroundColor: isLight ? '#f8fafc' : '#1c1c1c', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#2a2a2a' }}
            placeholder="Email"
            placeholderTextColor={isLight ? '#98a2b3' : '#666'}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={{ backgroundColor: isLight ? '#ffffff' : '#151515', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#222', marginBottom: 14 }}>
          <Text style={{ color: isLight ? '#6b7280' : '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Birthdate</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ backgroundColor: isLight ? '#f8fafc' : '#1c1c1c', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#2a2a2a' }}
          >
            <Text style={{ color: isLight ? '#111' : '#fff', fontSize: 16 }}>{userData.birthdate.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <View style={{ backgroundColor: isLight ? '#ffffff' : '#222', borderRadius: 12, marginTop: 8 }}>
                <DateTimePicker value={userData.birthdate} mode="date" display="spinner" onChange={onChangeBirthdate} maximumDate={new Date()} />
                <View style={{ alignItems: 'flex-end', padding: 8 }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: '#2563eb', fontSize: 16, fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <DateTimePicker value={userData.birthdate} mode="date" display="calendar" onChange={(e, d) => onChangeBirthdate(e, d)} maximumDate={new Date()} />
            )
          )}
        </View>
        <View style={{ backgroundColor: isLight ? '#ffffff' : '#151515', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#222', marginBottom: 14 }}>
          <Text style={{ color: isLight ? '#6b7280' : '#9aa0a6', fontSize: 12, marginBottom: 6 }}>Gender</Text>
          <TextInput value={userData.gender === 'male' ? 'Male' : 'Female'} editable={false} style={{ color: isLight ? '#475467' : '#aaa', fontSize: 16, backgroundColor: isLight ? '#f8fafc' : '#1c1c1c', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: isLight ? '#e5e7eb' : '#2a2a2a' }} />
        </View>

        <TouchableOpacity onPress={navigateChangePassword} style={{ backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Change password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: saving ? '#9ca3af' : '#10b981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12, marginBottom: 24 }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#0b1f16', fontSize: 16, fontWeight: '800' }}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
