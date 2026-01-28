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
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    // Register for push notifications
    const subscription = Notifications.addNotificationReceivedListener(response => {
      const { title, body, data } = response.request.content;
      setNotification({
        title: title || 'Notification',
        body: body || '',
        type: data?.type as string | undefined
      });

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Slide in
      Animated.spring(slideAnim, {
        toValue: 20,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();

      // Auto hide after 5 seconds
      setTimeout(() => {
        hideNotification();
      }, 5000);
    });

    return () => subscription.remove();
  }, []);

  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 350,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isLight ? Colors.light.background : Colors.dark.background },
      }} />

      {notification && (
        <Animated.View
          style={[
            styles.bannerWrapper,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint={isLight ? 'light' : 'dark'}
            style={styles.bannerContainer}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={hideNotification}
              style={styles.bannerContent}
            >
              <View style={[styles.iconContainer, { backgroundColor: notification.type === 'water_reminder' ? '#3b82f6' : '#10b981' }]}>
                <Ionicons
                  name={notification.type === 'water_reminder' ? 'water' : 'leaf'}
                  size={20}
                  color="#fff"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.bannerTitle, { color: isLight ? '#000' : '#fff' }]} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={[styles.bannerBody, { color: isLight ? '#4b5563' : '#9ca3af' }]} numberOfLines={1}>
                  {notification.body}
                </Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    position: 'absolute',
    top: 30, // Higher up for centered pill look
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  bannerContainer: {
    borderRadius: 30, // Much more rounded for pill look
    overflow: 'hidden',
    width: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerBody: {
    fontSize: 12,
    marginTop: -1,
  }
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
