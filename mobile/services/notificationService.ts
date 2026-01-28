import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NOTIFICATION_CHANNELS = {
    REMINDERS: 'reminders',
    SYSTEM: 'system',
};

export const NOTIFICATION_TYPES = {
    WATER: 'water_reminder',
    WELLNESS: 'wellness_reminder',
};

class NotificationService {
    constructor() {
        this.configure();
    }

    private configure() {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: false,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: false,
                shouldShowList: true,
            }),
        });
    }

    async registerChannels() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.REMINDERS, {
                name: 'Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#6366f1',
            });
        }
    }

    async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    }

    async scheduleWaterReminders() {
        await this.cancelNotificationsByType(NOTIFICATION_TYPES.WATER);

        // Every 2 hours = 7200 seconds
        const interval = 2 * 60 * 60;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '💧 Stay Hydrated!',
                body: 'It’s time for a glass of water. Keep your energy high!',
                sound: true,
                data: { type: NOTIFICATION_TYPES.WATER },
            },
            trigger: {
                seconds: interval,
                repeats: true,
                channelId: NOTIFICATION_CHANNELS.REMINDERS,
            } as Notifications.NotificationTriggerInput,
        });

        await AsyncStorage.setItem('notifyWater', 'true');
    }

    async scheduleWellnessReminders() {
        await this.cancelNotificationsByType(NOTIFICATION_TYPES.WELLNESS);

        // Every 5 hours = 18000 seconds
        const interval = 5 * 60 * 60;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌱 Wellness Check',
                body: 'Take a moment for yourself. How is your progress today?',
                sound: true,
                data: { type: NOTIFICATION_TYPES.WELLNESS },
            },
            trigger: {
                seconds: interval,
                repeats: true,
                channelId: NOTIFICATION_CHANNELS.REMINDERS,
            } as Notifications.NotificationTriggerInput,
        });

        await AsyncStorage.setItem('notifyWellness', 'true');
    }

    async cancelNotificationsByType(type: string) {
        const all = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of all) {
            if (notification.content.data?.type === type) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }

        if (type === NOTIFICATION_TYPES.WATER) await AsyncStorage.setItem('notifyWater', 'false');
        if (type === NOTIFICATION_TYPES.WELLNESS) await AsyncStorage.setItem('notifyWellness', 'false');
    }

    async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.setItem('notifyWater', 'false');
        await AsyncStorage.setItem('notifyWellness', 'false');
    }
}

export const notificationService = new NotificationService();
