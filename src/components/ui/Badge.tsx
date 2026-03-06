import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'gold' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: COLORS.primary + '22', text: COLORS.primary,       border: COLORS.primary + '44' },
  success: { bg: COLORS.success + '22', text: COLORS.success,       border: COLORS.success + '44' },
  warning: { bg: COLORS.warning + '22', text: COLORS.warning,       border: COLORS.warning + '44' },
  error:   { bg: COLORS.error   + '22', text: COLORS.error,         border: COLORS.error   + '44' },
  gold:    { bg: COLORS.gold    + '22', text: COLORS.gold,          border: COLORS.gold    + '44' },
  neutral: { bg: COLORS.surface,        text: COLORS.textSecondary, border: COLORS.border },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <View style={[
      styles.base,
      { backgroundColor: v.bg, borderColor: v.border },
      size === 'md' && styles.md,
    ]}>
      <Text style={[styles.text, { color: v.text }, size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  md: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textMd: {
    fontSize: FONT_SIZES.sm,
  },
});
