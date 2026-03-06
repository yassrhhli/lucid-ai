import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
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

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'gold' ? '#fff' : COLORS.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: SPACING.xs },
  iconRight: { marginLeft: SPACING.xs },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  gold: {
    backgroundColor: COLORS.gold,
  },

  // Sizes
  sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
    minHeight: 48,
  },
  lg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },

  disabled: {
    opacity: 0.5,
  },

  // Text base
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Text variants
  primaryText: { color: '#fff' },
  secondaryText: { color: COLORS.primary },
  ghostText: { color: COLORS.textSecondary },
  dangerText: { color: '#fff' },
  goldText: { color: '#fff' },

  // Text sizes
  smText: { fontSize: FONT_SIZES.sm },
  mdText: { fontSize: FONT_SIZES.md },
  lgText: { fontSize: FONT_SIZES.lg },
});
