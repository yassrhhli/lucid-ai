import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SleepQuality } from '@/types/dream';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

const QUALITY_CONFIG: Record<SleepQuality, { label: string; emoji: string; color: string }> = {
  1: { label: 'Terrible',  emoji: '😩', color: '#ef4444' },
  2: { label: 'Poor',      emoji: '😞', color: '#f97316' },
  3: { label: 'Ok',        emoji: '😐', color: '#eab308' },
  4: { label: 'Good',      emoji: '😊', color: '#22c55e' },
  5: { label: 'Amazing',   emoji: '🤩', color: '#8b5cf6' },
};

interface SleepQualitySliderProps {
  value: SleepQuality | null;
  onChange: (value: SleepQuality) => void;
}

export function SleepQualitySlider({ value, onChange }: SleepQualitySliderProps) {
  const selected = value ? QUALITY_CONFIG[value] : null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Sleep Quality</Text>
        {selected && (
          <Text style={[styles.selectedLabel, { color: selected.color }]}>
            {selected.emoji} {selected.label}
          </Text>
        )}
      </View>
      <View style={styles.row}>
        {([1, 2, 3, 4, 5] as SleepQuality[]).map((v) => {
          const config = QUALITY_CONFIG[v];
          const isSelected = value === v;
          return (
            <TouchableOpacity
              key={v}
              onPress={() => onChange(v)}
              activeOpacity={0.7}
              style={[
                styles.button,
                isSelected && {
                  backgroundColor: config.color + '22',
                  borderColor: config.color,
                },
              ]}
            >
              <Text style={styles.emoji}>{config.emoji}</Text>
              <Text
                style={[
                  styles.num,
                  isSelected && { color: config.color, fontWeight: '700' },
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  emoji: { fontSize: 20 },
  num: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
