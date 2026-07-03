import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, View, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const GRADIENT_COLORS: Partial<Record<ButtonVariant, [string, string]>> = {
  primary: ['#5B3FA0', '#8B6AC4'],
  gold:    ['#C98B2A', '#E9B84A'],
  danger:  ['#C53030', '#E53E3E'],
};

export function Button({
  title, onPress,
  variant = 'primary', size = 'md',
  isLoading = false, disabled = false,
  icon, iconPosition = 'left',
  style, textStyle, fullWidth = false,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const isDisabled = disabled || isLoading;
  const gradient = GRADIENT_COLORS[variant];

  const inner = isLoading ? (
    <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? COLORS.primary : '#fff'} size="small" />
  ) : (
    <View style={styles.content}>
      {icon && iconPosition === 'left'  && <View style={styles.iconLeft}>{icon}</View>}
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>{title}</Text>
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );

  const containerStyle = [
    styles.base, styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  if (gradient && variant !== 'secondary' && variant !== 'ghost') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={isDisabled} activeOpacity={0.82} style={[containerStyle, styles.shadowWrap]}>
          <LinearGradient colors={gradient} style={[styles.gradientInner, styles[size]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {inner}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={isDisabled} activeOpacity={0.8}
        style={[containerStyle, styles[variant]]}
      >
        {inner}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.xl, overflow: 'hidden' },
  fullWidth: { width: '100%' },
  shadowWrap: { borderRadius: RADIUS.xl, shadowColor: '#7B5EA7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  gradientInner: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center' },
  iconLeft:  { marginRight: SPACING.xs },
  iconRight: { marginLeft:  SPACING.xs },

  // Flat variants
  primary:   { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: COLORS.error },
  gold:      { backgroundColor: COLORS.gold },

  // Sizes
  sm: { paddingHorizontal: SPACING.md,  paddingVertical: SPACING.sm,     minHeight: 44 },
  md: { paddingHorizontal: SPACING.lg,  paddingVertical: SPACING.sm + 4, minHeight: 48 },
  lg: { paddingHorizontal: SPACING.xl,  paddingVertical: SPACING.md,     minHeight: 56 },

  disabled: { opacity: 0.45 },

  // Text base
  text: { fontWeight: '700', letterSpacing: 0.2 },

  // Text variants
  primaryText:   { color: '#fff' },
  secondaryText: { color: COLORS.primaryBright },
  ghostText:     { color: COLORS.textSecondary },
  dangerText:    { color: '#fff' },
  goldText:      { color: '#fff' },

  // Text sizes
  smText: { fontSize: FONT_SIZES.sm },
  mdText: { fontSize: FONT_SIZES.md },
  lgText: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
});
