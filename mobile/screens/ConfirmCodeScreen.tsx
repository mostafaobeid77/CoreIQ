import React, { useState, useRef } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authService } from '../services/authService';

const ConfirmCodeScreen = () => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const handleSubmit = async () => {
    const email = (params?.email || '').toString();
    if (!email) {
      alert('Missing email.');
      return;
    }
    if (code.length !== 6) {
      alert('Enter the 6-digit code.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await authService.verifyCode(email, code);
      // Pass the reset token to the reset screen
      router.push({ pathname: '/reset-password', params: { token: res.token } });
    } catch (e: any) {
      alert(e?.message || 'Invalid or expired code.');
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
          <Text style={[styles.title, { color: isLight ? '#111' : '#ccc' }]}>Enter Confirmation Code</Text>
          <Text style={[styles.subtitle, { color: isLight ? '#475467' : '#777' }]}>Check your email for a code and enter it below.</Text>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current && inputRef.current.focus()}
            style={styles.codeRow}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <View
                key={idx}
                style={[styles.codeBox, { backgroundColor: isLight ? '#ffffff' : '#181818', borderColor: isLight ? '#e5e7eb' : '#333' }, code.length === idx && styles.codeBoxActive]}
              >
                <Text style={[styles.codeDigit, { color: isLight ? '#111' : '#fff' }]}>{code[idx] || ''}</Text>
              </View>
            ))}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={text => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
              caretHidden
              autoCapitalize="none"
              importantForAccessibility="no"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            <LinearGradient colors={["#6366f1", "#4f46e5"]} style={styles.submitGradient}>
              <Text style={styles.submitText}>{submitting ? 'Verifying…' : 'Verify Code'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ color: '#8b5cf6', fontSize: 15, fontWeight: '600' }}>
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
    letterSpacing: 8,
    textAlign: 'center',
  },
  submitButton: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  submitGradient: { height: 50, justifyContent: 'center', alignItems: 'center' },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    minHeight: 60,
  },
  codeBox: {
    width: 44,
    height: 54,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#181818',
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxActive: {
    borderColor: '#8b5cf6',
  },
  codeDigit: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

export default ConfirmCodeScreen; 