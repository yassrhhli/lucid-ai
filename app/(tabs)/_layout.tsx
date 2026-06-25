import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ icon, iconFocused, focused }: { icon: string; iconFocused: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Ionicons
        name={(focused ? iconFocused : icon) as any}
        size={22}
        color={focused ? COLORS.accentSoft : COLORS.textMuted}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, profile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) router.replace('/(auth)/login');
      else if (profile && !profile.onboarding_completed) router.replace('/onboarding');
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, profile]);

  if (!isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accentSoft,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={95} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.tabBarAndroid]} />
          ),
      }}
    >
      <Tabs.Screen name="index"    options={{ tabBarLabel: 'Home',     tabBarIcon: ({ focused }) => <TabIcon icon="home-outline"      iconFocused="home"       focused={focused} /> }} />
      <Tabs.Screen name="journal"  options={{ tabBarLabel: 'Journal',  tabBarIcon: ({ focused }) => <TabIcon icon="book-outline"      iconFocused="book"       focused={focused} /> }} />
      <Tabs.Screen name="explore"  options={{ tabBarLabel: 'Explore',  tabBarIcon: ({ focused }) => <TabIcon icon="compass-outline"   iconFocused="compass"    focused={focused} /> }} />
      <Tabs.Screen name="patterns" options={{ tabBarLabel: 'Patterns', tabBarIcon: ({ focused }) => <TabIcon icon="stats-chart-outline" iconFocused="stats-chart" focused={focused} /> }} />
      <Tabs.Screen name="profile"  options={{ tabBarLabel: 'Profile',  tabBarIcon: ({ focused }) => <TabIcon icon="person-outline"    iconFocused="person"     focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(123,94,167,0.2)',
    height: Platform.OS === 'ios' ? 82 : 64,
    backgroundColor: 'transparent',
    elevation: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBarAndroid: {
    backgroundColor: 'rgba(6,6,16,0.97)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(123,94,167,0.2)',
  },
  iconWrap: {
    width: 40, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12,
  },
  iconWrapFocused: {
    backgroundColor: 'rgba(123,94,167,0.18)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: -2,
  },
});
