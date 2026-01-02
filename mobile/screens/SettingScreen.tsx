import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Switch, Linking, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import createSettingsStyles from '../components/settings/settingsStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from "../context/themeContext";
import { usePreferences } from "../context/PreferencesContext";
import { useAuth } from "../context/AuthContext";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DeleteAccountModal from '../components/settings/DeleteAccountModal';
import { userService } from '../services/userService';

const SettingScreen = () => {
  const router = useRouter();
  const { theme, toggleTheme, setThemeExplicit } = useTheme();
  const { units, setUnits } = usePreferences();
  const { user, logout } = useAuth();
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [useImperial, setUseImperial] = useState(false); // kg/cm vs lb/in
  const [notifyWater, setNotifyWater] = useState(false);
  const [notifyWellness, setNotifyWellness] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const prevNotifyWater = React.useRef<boolean | null>(null);
  const prevNotifyWellness = React.useRef<boolean | null>(null);

  useEffect(() => {
    setIsLightMode(theme === 'light');
  }, [theme]);

  useEffect(() => {
    setUseImperial(units === 'imperial');
  }, [units]);

  const onToggleTheme = (val: boolean) => {
    setIsLightMode(val);
    setThemeExplicit(val ? 'light' : 'dark');
  };

  const onToggleUnits = (val: boolean) => {
    setUseImperial(val);
    setUnits(val ? 'imperial' : 'metric');
  };

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      await logout(); // Clear auth state
      router.replace('/login');
    } catch (error: any) {
      throw error; // Let modal handle error display
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link'));
  };

  const scheduleWaterReminders = async () => {
    // Cancel existing water reminders to avoid duplicates
    await cancelWaterReminders();
    // Schedule ONE repeating reminder every 2 hours (7200 seconds)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Time to drink water!',
        body: 'Stay hydrated! Log your water intake.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        seconds: 7200, // 2 hours
        repeats: true,
        channelId: 'reminders',
      } as Notifications.NotificationTriggerInput,
    });
  };

  const cancelWaterReminders = async () => {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content.title === '💧 Time to drink water!') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  };

  const scheduleWellnessReminders = async () => {
    // Cancel existing wellness reminders to avoid duplicates
    await cancelWellnessReminders();
    // Schedule ONE repeating reminder every 6 hours (21600 seconds)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌱 Wellness Reminder',
        body: 'Time for a workout, meal, or a motivational check-in!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        seconds: 21600, // 6 hours
        repeats: true,
        channelId: 'reminders',
      } as Notifications.NotificationTriggerInput,
    });
  };

  const cancelWellnessReminders = async () => {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content.title === '🌱 Wellness Reminder') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  };

  const registerNotificationChannels = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
      });
    }
  };

  // Request notification permissions
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: reqStatus } = await Notifications.requestPermissionsAsync();
      return reqStatus === 'granted';
    }
    return true;
  };

  // Show notifications in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Replace the useEffect for loading switches with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        await registerNotificationChannels();
        const water = await AsyncStorage.getItem('notifyWater');
        if (water !== null && isActive) setNotifyWater(JSON.parse(water));
        const wellness = await AsyncStorage.getItem('notifyWellness');
        if (wellness !== null && isActive) setNotifyWellness(JSON.parse(wellness));
        setLoading(false);
        await requestNotificationPermission();
      })();
      return () => { isActive = false; };
    }, [])
  );
  // Water reminders effect
  useEffect(() => {
    if (loading) return;
    if (prevNotifyWater.current === null) {
      prevNotifyWater.current = notifyWater; // initialize from loaded state without acting
      return;
    }
    if (prevNotifyWater.current === notifyWater) return;
    prevNotifyWater.current = notifyWater;

    if (notifyWater) {
      requestNotificationPermission().then(granted => {
        if (granted) scheduleWaterReminders();
        else setNotifyWater(false);
      });
    } else {
      cancelWaterReminders();
    }
  }, [notifyWater, loading]);

  // Wellness reminders effect
  useEffect(() => {
    if (loading) return;
    if (prevNotifyWellness.current === null) {
      prevNotifyWellness.current = notifyWellness; // initialize from loaded state without acting
      return;
    }
    if (prevNotifyWellness.current === notifyWellness) return;
    prevNotifyWellness.current = notifyWellness;

    if (notifyWellness) {
      requestNotificationPermission().then(granted => {
        if (granted) scheduleWellnessReminders();
        else setNotifyWellness(false);
      });
    } else {
      cancelWellnessReminders();
    }
  }, [notifyWellness, loading]);

  const styles = React.useMemo(() => createSettingsStyles(theme === 'light'), [theme]);
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: theme === 'light' ? '#f5f3ff' : '#0f0f0f' }} edges={['top']} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.accountRow}
              onPress={() => router.push('/account')}
            >
              <Image
                source={
                  user?.profilePhoto
                    ? { uri: user.profilePhoto }
                    : require('../assets/images/icon.png')
                }
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.accountLabel}>{user?.username || 'Loading...'}</Text>
                <Text style={styles.accountEmail}>{user?.email || 'Loading...'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8a8a8a" />
            </TouchableOpacity>
          </View>
          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="sunny" size={18} color="#fbbf24" style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>Light Mode</Text>
                  <Text style={styles.rowSub}>Toggle light/dark theme</Text>
                </View>
              </View>
              <Switch value={isLightMode} onValueChange={onToggleTheme} />
            </View>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="swap-horizontal" size={18} color="#60a5fa" style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>Units</Text>
                  <Text style={styles.rowSub}>{useImperial ? 'lb / inches' : 'kg / cm'}</Text>
                </View>
              </View>
              <Switch value={useImperial} onValueChange={onToggleUnits} />
            </View>
          </View>
          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="water" size={18} color="#60a5fa" style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>Water reminders</Text>
                  <Text style={styles.rowSub}>Get reminded to drink water</Text>
                </View>
              </View>
              <Switch value={notifyWater} onValueChange={async (val) => {
                setNotifyWater(val);
                try { await AsyncStorage.setItem('notifyWater', JSON.stringify(val)); } catch { }
              }} />
            </View>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications" size={18} color="#22c55e" style={styles.rowIcon} />
                <View>
                  <Text style={styles.rowLabel}>Wellness reminders</Text>
                  <Text style={styles.rowSub}>Workout, meals and motivation</Text>
                </View>
              </View>
              <Switch value={notifyWellness} onValueChange={async (val) => {
                setNotifyWellness(val);
                try { await AsyncStorage.setItem('notifyWellness', JSON.stringify(val)); } catch { }
              }} />
            </View>
          </View>
          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => Alert.alert('Report a Bug', 'Feature coming soon.')}>
              <View style={styles.rowLeft}>
                <Ionicons name="bug" size={18} color="#ef4444" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Report a bug</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8a8a8a" />
            </TouchableOpacity>
          </View>
          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="information-circle" size={18} color="#a78bfa" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>App Version</Text>
              </View>
              <Text style={{ color: '#9aa0a6' }}>1.0.0</Text>
            </View>
            <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => openLink('https://example.com/terms')}>
              <View style={styles.rowLeft}>
                <Ionicons name="newspaper" size={18} color="#60a5fa" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8a8a8a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => openLink('https://example.com/privacy')}>
              <View style={styles.rowLeft}>
                <Ionicons name="lock-closed" size={18} color="#f59e0b" style={styles.rowIcon} />
                <Text style={styles.rowLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8a8a8a" />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
            <View style={[styles.row, { backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fee2e2' }]}>
              <View style={styles.rowLeft}>
                <Ionicons name="trash" size={18} color="#ef4444" style={styles.rowIcon} />
                <View>
                  <Text style={[styles.rowLabel, { color: '#dc2626' }]}>Delete Account</Text>
                  <Text style={[styles.rowSub, { color: '#991b1b' }]}>Permanently delete your account and data</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsDeleteModalVisible(true)}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-forward" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            <TouchableOpacity style={styles.dangerButton} activeOpacity={0.9} onPress={onLogout}>
              <Text style={styles.dangerText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      {/* Legacy Account Modal (unused now) */}
      <Modal
        visible={isAccountModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Image
                source={
                  user?.profilePhoto
                    ? { uri: user.profilePhoto }
                    : require('../assets/images/icon.png')
                }
                style={styles.modalAvatar}
              />
              <Text style={styles.modalEmail}>{user?.email || 'Loading...'}</Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAccountModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        username={user?.username || ''}
        onDelete={handleDeleteAccount}
      />
    </View>
  );
};
export default SettingScreen;