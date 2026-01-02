import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/themeContext";
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const router = useRouter();
  const { refreshUser, setUser } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const trimmedEmail = email.trim();
    try {
      setLoading(true);
      console.time('Login Request');
      const response = await authService.login({ email: trimmedEmail, password });
      console.timeEnd('Login Request');

      if (response.user) {
        console.time('Login Navigation');
        setUser({
          ...response.user,
          _id: response.user.id,
        });
      }

      router.replace("/dashboard");
      console.timeEnd('Login Navigation');

      // Trigger background fetch for full profile (e.g. high-res avatar)
      // We don't await this to ensure navigation is instant
      refreshUser().catch(err => console.error('Background profile fetch failed', err));
    } catch (error: any) {
      // Clean up error message - remove technical prefixes
      let message = error?.message || "Login failed";

      // Remove technical error prefixes
      message = message.replace(/^(Network error:|Error:)\s*/i, '').trim();

      // Map common technical errors to user-friendly messages
      if (message.toLowerCase().includes('invalid credentials')) {
        message = 'Incorrect email or password';
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
        message = 'Connection error. Please check your internet.';
      } else if (message.toLowerCase().includes('timeout')) {
        message = 'Request timed out. Please try again.';
      }

      if (message.toLowerCase().includes("verify your email")) {
        Alert.alert("Verify Email", message, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enter Code",
            onPress: () =>
              router.push({ pathname: "/verify-email", params: { email: trimmedEmail } }),
          },
        ]);
      } else {
        Alert.alert("Login Failed", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: isLight ? '#f5f3ff' : '#121212' }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <View style={styles.content}>
          {/* Logo Circle */}
          <View style={styles.logoContainer}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          </View>

          {/* Welcome Text */}
          <Text style={[styles.title, { color: isLight ? '#111' : '#fff' }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: isLight ? '#475467' : '#aaa' }]}>Login to continue your progress</Text>

          {/* Email / Username Input */}
          <TextInput
            style={[styles.input, { backgroundColor: isLight ? '#f8fafc' : '#1E1E1E', color: isLight ? '#111' : '#fff', borderWidth: 1, borderColor: isLight ? '#e5e7eb' : 'transparent' }]}
            placeholder="Email or Username"
            placeholderTextColor={isLight ? '#98a2b3' : '#aaa'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          {/* Password Input */}
          <View style={[styles.passwordContainer, { backgroundColor: isLight ? '#f8fafc' : '#1E1E1E', borderWidth: 1, borderColor: isLight ? '#e5e7eb' : 'transparent' }]}>
            <TextInput
              style={[styles.passwordInput, { color: isLight ? '#111' : '#fff' }]}
              placeholder="Password"
              placeholderTextColor={isLight ? '#98a2b3' : '#aaa'}
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons
                name={passwordVisible ? "eye" : "eye-off"}
                size={24}
                color={isLight ? '#98a2b3' : '#aaa'}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotContainer} onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={{ color: isLight ? '#111' : '#fff' }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // dark background
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
  },
  forgotContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#6366f1",
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#6366f1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#6366f1",
    fontWeight: "bold",
  },
});
