import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NetworkBanner } from '@/components/ui/NetworkBanner';
import { initAdMob } from '@/services/admob';
import { analytics } from '@/utils/analytics';
import { setupNotificationResponseListener } from '@/utils/notifications';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { COLORS } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, isLoading, user } = useAuthStore();
  const { initialize: initSubscription } = useSubscriptionStore();

  useEffect(() => {
    const boot = async () => {
      try {
        initAdMob().catch(console.error);
        
        // Request App Tracking Transparency on iOS
        if (Platform.OS === 'ios') {
          await TrackingTransparency.requestTrackingPermissionsAsync();
        }

        await initialize();
      } catch (error) {
        console.error('[Boot] error:', error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (user?.id) {
      initSubscription(user.id).catch(console.error);
      analytics.identify(user.id, {
        email: user.email ?? '',
        is_pro: user.profile?.is_pro ?? false,
        streak: user.profile?.streak_days ?? 0,
      });
    }
  }, [user?.id]);

  useEffect(() => {
    const cleanup = setupNotificationResponseListener((screen) => {
      router.push(screen as any);
    });
    return cleanup;
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading..." />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <NetworkBanner />
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)"           options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)"           options={{ animation: 'fade' }} />
            <Stack.Screen name="onboarding/index" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
            <Stack.Screen name="dream/new"        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="dream/[id]"       options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="dream/edit/[id]"  options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="paywall"          options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="dictionary"       options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="notifications"    options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="privacy"          options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="edit-profile"     options={{ animation: 'slide_from_right' }} />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
