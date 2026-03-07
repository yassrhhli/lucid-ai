import { Ionicons } from '@expo/vector-icons';
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

const EMOTIONS: { key: Emotion; label: string; icon: string; color: string }[] = [
  { key: 'joy',        label: 'Joy',      icon: 'sunny',        color: '#fbbf24' },
  { key: 'fear',       label: 'Fear',     icon: 'flash',        color: '#6366f1' },
  { key: 'anxiety',    label: 'Anxiety',  icon: 'alert-circle', color: '#f97316' },
  { key: 'peace',      label: 'Peace',    icon: 'leaf',         color: '#34d399' },
  { key: 'sadness',    label: 'Sadness',  icon: 'rainy',        color: '#60a5fa' },
  { key: 'excitement', label: 'Excited',  icon: 'star',         color: '#f472b6' },
  { key: 'confusion',  label: 'Confused', icon: 'help-circle',  color: '#a78bfa' },
  { key: 'anger',      label: 'Anger',    icon: 'flame',        color: '#ef4444' },
  { key: 'love',       label: 'Love',     icon: 'heart',        color: '#f472b6' },
  { key: 'wonder',     label: 'Wonder',   icon: 'sparkles',     color: '#818cf8' },
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
        {EMOTIONS.map(({ key, label, icon, color }) => {
          const isSelected = selected.includes(key);
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
              <Ionicons name={icon as any} size={14} color={isSelected ? '#fff' : color} />
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
