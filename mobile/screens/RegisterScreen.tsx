import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/themeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { authService } from "../services/authService";

const RegisterScreen = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef(null);
  const [dateInputY, setDateInputY] = useState(0);
  const animatedPadding = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    const keyboardShowEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(keyboardShowEvent, () => {
      Animated.timing(animatedPadding, {
        toValue: 250,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(keyboardHideEvent, () => {
      Animated.timing(animatedPadding, {
        toValue: 80,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedPadding]);

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password || !gender) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        fullName,
        username,
        email,
        password,
        birthDate,
        gender: gender.toLowerCase() as 'male' | 'female'
      });
      Alert.alert(
        "Verify your email",
        "We sent you a 6-digit verification code. Enter it to finish creating your account."
      );
      router.replace({ pathname: "/verify-email", params: { email } });
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: isLight ? "#f8fafc" : "#0f0f0f" }]}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: animatedPadding }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrapper}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          </View>

          <Text style={[styles.title, { color: isLight ? "#111" : "#ccc" }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: isLight ? "#475467" : "#777" }]}>
            Register to start your journey
          </Text>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isLight ? "#f8fafc" : "#1f1f1f",
                  color: isLight ? "#111" : "#fff",
                  borderWidth: 1,
                  borderColor: isLight ? "#e5e7eb" : "transparent",
                },
              ]}
              placeholder="Full Name"
              placeholderTextColor={isLight ? "#98a2b3" : "#777"}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isLight ? "#f8fafc" : "#1f1f1f",
                  color: isLight ? "#111" : "#fff",
                  borderWidth: 1,
                  borderColor: isLight ? "#e5e7eb" : "transparent",
                },
              ]}
              placeholder="Username"
              placeholderTextColor={isLight ? "#98a2b3" : "#777"}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isLight ? "#f8fafc" : "#1f1f1f",
                  color: isLight ? "#111" : "#fff",
                  borderWidth: 1,
                  borderColor: isLight ? "#e5e7eb" : "transparent",
                },
              ]}
              placeholder="Email"
              placeholderTextColor={isLight ? "#98a2b3" : "#777"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Birthdate Picker */}
          <TouchableOpacity
            ref={dateInputRef}
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
            onLayout={(event) => {
              const { y, height } = event.nativeEvent.layout;
              setDateInputY(y + height);
            }}
          >
            <Text
              style={[
                styles.birthText,
                {
                  color: isLight ? "#111" : "#fff",
                  backgroundColor: isLight ? "#f8fafc" : "#1f1f1f",
                  borderWidth: 1,
                  borderColor: isLight ? "#e5e7eb" : "transparent",
                },
              ]}
            >
              {birthDate ? birthDate.toDateString() : "Select Birthdate"}
            </Text>
          </TouchableOpacity>
          {showDatePicker &&
            (Platform.OS === "ios" ? (
              <View
                style={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  top: dateInputY + 8,
                  backgroundColor: isLight ? "#ffffff" : "#222",
                  borderRadius: 16,
                  paddingBottom: 16,
                  zIndex: 100,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View style={{ alignItems: "flex-end", padding: 12 }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: "#8b5cf6", fontSize: 17, fontWeight: "600" }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="spinner"
                  onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                    if (selectedDate) setBirthDate(selectedDate);
                  }}
                  maximumDate={new Date()}
                  style={{ backgroundColor: isLight ? "#ffffff" : "#222" }}
                />
              </View>
            ) : (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="calendar"
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  if (event.type === "set" && selectedDate) {
                    setBirthDate(selectedDate);
                  }
                  setShowDatePicker(false);
                }}
                maximumDate={new Date()}
              />
            ))}

          {/* Gender Selector */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                { backgroundColor: isLight ? "#f8fafc" : "#1f1f1f" },
                gender === "male" && { backgroundColor: "#8b5cf6" },
              ]}
              onPress={() => setGender("male")}
            >
              <Text
                style={{
                  color: gender === "male" ? "#fff" : isLight ? "#111" : "#fff",
                  fontWeight: "500",
                }}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                { backgroundColor: isLight ? "#f8fafc" : "#1f1f1f" },
                gender === "female" && { backgroundColor: "#8b5cf6" },
              ]}
              onPress={() => setGender("female")}
            >
              <Text
                style={{
                  color: gender === "female" ? "#fff" : isLight ? "#111" : "#fff",
                  fontWeight: "500",
                }}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isLight ? "#f8fafc" : "#1f1f1f",
                  color: isLight ? "#111" : "#fff",
                  borderWidth: 1,
                  borderColor: isLight ? "#e5e7eb" : "transparent",
                },
              ]}
              placeholder="Password"
              placeholderTextColor={isLight ? "#98a2b3" : "#777"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color={isLight ? "#555" : "#888"} />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isLight ? "#f8fafc" : "#1f1f1f",
                  color: isLight ? "#111" : "#fff",
                  borderWidth: 1,
                  borderColor: isLight ? "#e5e7eb" : "transparent",
                },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={isLight ? "#98a2b3" : "#777"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={22} color={isLight ? "#555" : "#888"} />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient colors={["#6366f1", "#4f46e5"]} style={styles.loginGradient}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginText}>Register</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Already a member? */}
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={{ color: "#6366f1", fontSize: 15, fontWeight: "600" }}>
                Already a member? Login
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
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
  logoWrapper: { alignItems: "center", marginBottom: 16 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff" },
  title: { color: "#ccc", fontSize: 22, textAlign: "center", marginBottom: 4 },
  subtitle: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: { position: "relative", marginBottom: 16 },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    paddingRight: 40,
  },
  eyeIcon: { position: "absolute", right: 14, top: 14 },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  birthText: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  loginButton: { marginTop: 12, borderRadius: 12, overflow: "hidden" },
  loginGradient: { height: 50, justifyContent: "center", alignItems: "center" },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1.1,
  },
});

export default RegisterScreen;
