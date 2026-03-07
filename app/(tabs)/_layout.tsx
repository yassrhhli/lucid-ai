import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ icon, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <Ionicons name={icon as any} size={24} color={focused ? COLORS.primary : COLORS.textMuted} />
  );
}

export default function TabsLayout() {
  const { isAuthenticated, profile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (profile && !profile.onboarding_completed) {
        router.replace('/onboarding');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, profile]);

  if (!isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 10, marginBottom: 2 },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.tabBarAndroid]} />
          ),
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: "Home", tabBarIcon: ({ focused }) => <TabIcon icon="home-outline" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="journal" options={{ tabBarLabel: "Journal",  tabBarIcon: ({ focused }) => <TabIcon icon="book-outline" label="Journal" focused={focused} /> }} />
      <Tabs.Screen name="explore" options={{ tabBarLabel: "Explore",  tabBarIcon: ({ focused }) => <TabIcon icon="compass-outline" label="Explore" focused={focused} /> }} />
      <Tabs.Screen name="patterns" options={{ tabBarLabel: "Patterns",  tabBarIcon: ({ focused }) => <TabIcon icon="bar-chart-outline" label="Patterns" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: "Profile",  tabBarIcon: ({ focused }) => <TabIcon icon="person-outline" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === "ios" ? 75 : 60,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBarAndroid: { backgroundColor: COLORS.surface },
  tabItem: { alignItems: "center", justifyContent: "center", paddingTop: 6, gap: 2 },
  tabItemFocused: {},
  tabIcon: { fontSize: 22, fontWeight: '300' },
  tabLabel: { fontSize: FONT_SIZES.xs, fontWeight: "500", letterSpacing: 0.2 },
});
