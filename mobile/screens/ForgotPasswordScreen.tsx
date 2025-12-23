import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/themeContext';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      setSubmitting(true);
      await authService.forgotPassword(email.trim());
      Alert.alert('Email sent', 'Check your email for the confirmation code.');
      router.push(`/confirm-code?email=${encodeURIComponent(email.trim())}`);
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: isLight ? '#f8fafc' : '#0f0f0f' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={[styles.title, { color: isLight ? '#111' : '#ccc' }]}>Forgot Password</Text>
          <Text style={[styles.subtitle, { color: isLight ? '#475467' : '#777' }]}>
            Enter your email to receive a password reset link.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isLight ? '#f8fafc' : '#1f1f1f',
                  color: isLight ? '#111' : '#fff',
                  borderWidth: 1,
                  borderColor: isLight ? '#e5e7eb' : 'transparent',
                },
              ]}
              placeholder="Email"
              placeholderTextColor={isLight ? '#98a2b3' : '#777'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            <LinearGradient colors={["#6366f1", "#4f46e5"]} style={styles.submitGradient}>
              <Text style={styles.submitText}>{submitting ? 'Sending…' : 'Send Reset Link'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: '#6366f1', fontSize: 15, fontWeight: '600' }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 4, marginTop: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  inputContainer: { position: 'relative', marginBottom: 16 },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  submitButton: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  submitGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '600', letterSpacing: 1.1 },
  logoWrapper: { alignItems: "center", marginBottom: 4 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff" },
});

export default ForgotPasswordScreen;
