import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/themeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authService } from '../services/authService';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const handleSubmit = async () => {
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const token = (params?.token || '').toString();
    if (!token) {
      alert('Missing reset token.');
      return;
    }
    try {
      setSubmitting(true);
      await authService.resetPassword(token, password);
      alert('Password reset successful!');
      router.push('/login');
    } catch (e: any) {
      alert(e?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: isLight ? '#ffffff' : '#0f0f0f' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={[styles.title, { color: isLight ? '#111' : '#ccc' }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: isLight ? '#475467' : '#777' }]}>Enter your new password below.</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: isLight ? '#f8fafc' : '#1f1f1f', color: isLight ? '#111' : '#fff', borderWidth: 1, borderColor: isLight ? '#e5e7eb' : 'transparent' }]}
              placeholder="New Password"
              placeholderTextColor={isLight ? '#98a2b3' : '#777'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: isLight ? '#f8fafc' : '#1f1f1f', color: isLight ? '#111' : '#fff', borderWidth: 1, borderColor: isLight ? '#e5e7eb' : 'transparent' }]}
              placeholder="Confirm Password"
              placeholderTextColor={isLight ? '#98a2b3' : '#777'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.submitGradient}>
              <Text style={styles.submitText}>{submitting ? 'Resetting…' : 'Reset Password'}</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  logoWrapper: { alignItems: 'center', marginBottom: 4 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff' },
  title: {
    color: '#ccc',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: { position: 'relative', marginBottom: 16 },
  input: {
    height: 50,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    paddingRight: 40,
  },
  eyeIcon: { position: 'absolute', right: 14, top: 14 },
  submitButton: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  submitGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
});

export default ResetPasswordScreen; 