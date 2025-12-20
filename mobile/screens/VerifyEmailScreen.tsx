import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/themeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const VerifyEmailScreen = () => {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params?.email || "").toString();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { refreshUser } = useAuth();

  const handleVerify = async () => {
    if (!email) {
      Alert.alert("Missing email", "Return to login and try again.");
      return;
    }
    if (code.length !== 6) {
      Alert.alert("Invalid code", "Enter the 6-digit code we emailed you.");
      return;
    }
    try {
      setSubmitting(true);
      await authService.verifyEmailCode(email, code);
      await refreshUser().catch(() => undefined);
      Alert.alert("Email verified", "You can now log in to your account.", [
        {
          text: "Go to Login",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Verification failed", error?.message || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Missing email", "Return to login and try again.");
      return;
    }
    try {
      setResending(true);
      await authService.requestEmailVerification(email);
      Alert.alert("Code sent", "We just sent you another verification code.");
    } catch (error: any) {
      Alert.alert("Unable to resend", error?.message || "Please try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  const codeDigits = Array.from({ length: 6 });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: isLight ? "#f8fafc" : "#0f0f0f" }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrapper}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          </View>

          <Text style={[styles.title, { color: isLight ? "#111" : "#ccc" }]}>Verify Your Email</Text>
          <Text style={[styles.subtitle, { color: isLight ? "#475467" : "#777" }]}>
            We sent a 6-digit code to {email || "your email"}. Enter it below to finish setting up your account.
          </Text>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.codeRow}
          >
            {codeDigits.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: isLight ? "#ffffff" : "#181818",
                    borderColor: isLight ? "#e5e7eb" : "#333",
                  },
                  code.length === idx && styles.codeBoxActive,
                ]}
              >
                <Text style={[styles.codeDigit, { color: isLight ? "#111" : "#fff" }]}>{code[idx] || ""}</Text>
              </View>
            ))}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
              caretHidden
              autoCapitalize="none"
              importantForAccessibility="no"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleVerify} disabled={submitting}>
            <LinearGradient colors={["#8b5cf6", "#7c3aed"]} style={styles.submitGradient}>
              <Text style={styles.submitText}>{submitting ? "Verifying…" : "Verify Email"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={{ color: "#8b5cf6", fontWeight: "600" }}>
                {resending ? "Sending…" : "Resend code"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={{ color: isLight ? "#111" : "#fff", fontWeight: "500" }}>Back to login</Text>
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
    justifyContent: "center",
    flexGrow: 1,
  },
  logoWrapper: { alignItems: "center", marginBottom: 4 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff" },
  title: {
    color: "#ccc",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    minHeight: 60,
  },
  codeBox: {
    width: 44,
    height: 54,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "#181818",
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxActive: {
    borderColor: "#8b5cf6",
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  submitButton: { marginTop: 12, borderRadius: 12, overflow: "hidden" },
  submitGradient: { height: 50, justifyContent: "center", alignItems: "center" },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1.1,
  },
  actionsRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default VerifyEmailScreen;

