// app/_layout.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from "react-native";
import { Stack } from "expo-router";
import { StatsProvider } from "../context/StatsContext";
import { MealsProvider } from "../context/MealsContext";
import { WorkoutsProvider } from "../context/WorkoutsContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from "../context/themeContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { useTheme } from "../context/themeContext";
import { Colors } from "../constants/theme";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from "../context/AuthContext";
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface NotificationData {
  title: string;
  body: string;
  type?: string;
}

function AppStack() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    // We rely on native system notifications now.
    // This listener can be used for deep linking or silent updates in the future.
    const subscription = Notifications.addNotificationReceivedListener(response => {
      console.log('[Notification] Received in foreground:', response.request.content.title);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isLight ? Colors.light.background : Colors.dark.background },
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Legacy styles removed
});

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <PreferencesProvider>
            <StatsProvider>
              <MealsProvider>
                <WorkoutsProvider>
                  <AppStack />
                </WorkoutsProvider>
              </MealsProvider>
            </StatsProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
