import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function NetworkBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      Animated.timing(slideAnim, {
        toValue: connected ? -100 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }], top: insets.top }]}>
      <Ionicons name="cloud-offline" size={16} color="#fff" />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    padding: SPACING.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
