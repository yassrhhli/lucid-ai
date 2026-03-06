import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { Emotion } from '@/types/dream';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

const EMOTIONS: { key: Emotion; label: string; emoji: string }[] = [
  { key: 'joy',       label: 'Joy',       emoji: '😄' },
  { key: 'fear',      label: 'Fear',      emoji: '😨' },
  { key: 'anxiety',   label: 'Anxiety',   emoji: '😰' },
  { key: 'peace',     label: 'Peace',     emoji: '😌' },
  { key: 'sadness',   label: 'Sadness',   emoji: '😢' },
  { key: 'excitement',label: 'Excited',   emoji: '🤩' },
  { key: 'confusion', label: 'Confused',  emoji: '😵' },
  { key: 'anger',     label: 'Anger',     emoji: '😡' },
  { key: 'love',      label: 'Love',      emoji: '🥰' },
  { key: 'wonder',    label: 'Wonder',    emoji: '🌟' },
];

interface EmotionPickerProps {
  selected: Emotion[];
  onChange: (emotions: Emotion[]) => void;
  max?: number;
}

export function EmotionPicker({ selected, onChange, max = 3 }: EmotionPickerProps) {
  const toggle = (emotion: Emotion) => {
    if (selected.includes(emotion)) {
      onChange(selected.filter((e) => e !== emotion));
    } else if (selected.length < max) {
      onChange([...selected, emotion]);
    }
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>How did you feel?</Text>
        <Text style={styles.counter}>{selected.length}/{max}</Text>
      </View>
      <View style={styles.grid}>
        {EMOTIONS.map(({ key, label, emoji }) => {
          const isSelected = selected.includes(key);
          const color = COLORS.emotions[key];
          return (
            <TouchableOpacity
              key={key}
              onPress={() => toggle(key)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                isSelected && { backgroundColor: color + '22', borderColor: color },
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && { color: color, fontWeight: '600' },
                ]}
              >
                {label}
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
  counter: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: { fontSize: 14 },
  chipLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
});
