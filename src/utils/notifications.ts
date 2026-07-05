import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/services/supabase';

// Configuration du handler de notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('[Notifications] Not a physical device, skipping');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission denied');
    return false;
  }

  // Configurer le channel Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('dream-reminder', {
      name: 'Dream Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    });
  }

  return true;
}

export async function scheduleDreamReminder(
  hour: number = 8,
  minute: number = 0
): Promise<string | null> {
  try {
    // Annuler les rappels existants
    await cancelDreamReminder();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 What did you dream?',
        body: 'Capture your dream before it fades away. Tap to record it now.',
        data: { screen: 'dream/new' },
        sound: false,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: 'dream-reminder',
      },
    });

    console.log('[Notifications] Dream reminder scheduled:', identifier);
    return identifier;
  } catch (error) {
    console.error('[Notifications] Schedule error:', error);
    return null;
  }
}

export async function cancelDreamReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Cancel error:', error);
  }
}

export async function saveExpoPushToken(userId: string): Promise<void> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'd26bb7b2-57d8-4b23-b94a-32b1ac90a674', // Remplacer par votre project ID
    });

    await supabase
      .from('profiles')
      .update({ expo_push_token: tokenData.data } as any)
      .eq('id', userId);
  } catch (error) {
    console.error('[Notifications] Save token error:', error);
  }
}

// Listener pour navigation depuis une notification
export function setupNotificationResponseListener(
  onResponse: (screen: string) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) onResponse(screen as string);
    }
  );
  return () => subscription.remove();
}
