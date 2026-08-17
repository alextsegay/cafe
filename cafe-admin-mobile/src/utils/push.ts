import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { fetchWithAuth } from '../services/api';
import { navigationRef } from './navigation';

export type PushListener = (screen: string) => void;

// Show notifications while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let tapListener: { remove: () => void } | null = null;

/**
 * Wire up the "open notification" tap so the app can navigate to the
 * screen the notification points at (e.g. Contact messages).
 */
export function initPushTapHandling() {
  if (Platform.OS === 'web') return;
  tapListener?.remove();
  tapListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as
        | { screen?: string }
        | undefined;
      const screen = data?.screen;
      if (screen && navigationRef.isReady()) {
        // The tab is "More" and the destination lives in its stack.
        navigationRef.navigate('More', { screen });
      }
    }
  );
}

/**
 * Ask for permission and register this device with the backend so the
 * café can push notifications to it (new contact messages, etc.).
 */
export async function registerPushToken(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Café Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#d97706',
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const res = await fetchWithAuth('/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenData.data, platform: Platform.OS }),
    });
    return res.ok;
  } catch (error) {
    console.log('push registration failed', error);
    return false;
  }
}
