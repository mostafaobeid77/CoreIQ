// app/_layout.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
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

interface NotificationData {
  title: string;
  body: string;
  type?: string;
}

function AppStack() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Register for push notifications
    const subscription = Notifications.addNotificationReceivedListener(response => {
      const { title, body, data } = response.request.content;
      setNotification({
        title: title || 'Notification',
        body: body || '',
        type: data?.type as string | undefined
      });

      // Slide in
      Animated.spring(slideAnim, {
        toValue: 20,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
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
      toValue: -150,
      duration: 300,
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
            styles.bannerContainer,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: isLight ? '#ffffff' : '#1e1e1e',
              shadowColor: isLight ? '#000' : '#6366f1',
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideNotification}
            style={styles.bannerContent}
          >
            <View style={[styles.iconContainer, { backgroundColor: notification.type === 'water_reminder' ? '#60a5fa' : '#22c55e' }]}>
              <Ionicons
                name={notification.type === 'water_reminder' ? 'water' : 'leaf'}
                size={24}
                color="#fff"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.bannerTitle, { color: isLight ? '#111' : '#fff' }]}>{notification.title}</Text>
              <Text style={[styles.bannerBody, { color: isLight ? '#444' : '#ccc' }]} numberOfLines={2}>{notification.body}</Text>
            </View>
            <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={isLight ? '#999' : '#666'} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerBody: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
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
