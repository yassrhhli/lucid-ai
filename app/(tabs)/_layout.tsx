import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONT_SIZES } from '@/constants/theme';

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? COLORS.primary : COLORS.textMuted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, profile } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (profile && !profile.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, profile]);

  if (!isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.tabBarAndroid]} />
          ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📓" label="Journal" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌐" label="Explore" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" label="Patterns" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 85 : 65,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBarAndroid: {
    backgroundColor: COLORS.surface,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 3,
  },
  tabItemFocused: {},
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
