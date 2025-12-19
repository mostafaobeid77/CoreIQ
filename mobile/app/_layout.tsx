// app/_layout.tsx
import React from "react";
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

function AppStack() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  return (
    <>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isLight ? Colors.light.background : Colors.dark.background },
      }} />
    </>
  );
}

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
