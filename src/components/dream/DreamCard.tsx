import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import type { Dream } from '@/types/dream';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

const EMOTION_META: Record<string, { name: string; color: string }> = {
  joy:        { name: 'sunny',        color: '#FBBF24' },
  fear:       { name: 'flash',        color: '#818CF8' },
  anxiety:    { name: 'alert-circle', color: '#FB923C' },
  peace:      { name: 'leaf',         color: '#34D399' },
  sadness:    { name: 'rainy',        color: '#60A5FA' },
  excitement: { name: 'star',         color: '#F472B6' },
  confusion:  { name: 'help-circle',  color: '#A78BFA' },
  anger:      { name: 'flame',        color: '#EF4444' },
  love:       { name: 'heart',        color: '#F472B6' },
  wonder:     { name: 'sparkles',     color: '#818CF8' },
};

const QUALITY_COLOR: Record<number, string> = {
  1: '#F87171', 2: '#FB923C', 3: '#FBBF24', 4: '#34D399', 5: '#8B5CF6',
};

interface DreamCardProps {
  dream: Dream;
  onLongPress?: (dream: Dream) => void;
}

export function DreamCard({ dream, onLongPress }: DreamCardProps) {
  const hasInterpretation = !!dream.interpretation;
  const qualityColor = dream.sleep_quality ? QUALITY_COLOR[dream.sleep_quality] : COLORS.borderSubtle;
  const preview = dream.content.length > 110 ? dream.content.slice(0, 110).trim() + '…' : dream.content;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/dream/${dream.id}`)}
      onLongPress={() => onLongPress?.(dream)}
      activeOpacity={0.78}
      style={styles.card}
    >
      {/* Sleep quality accent bar */}
      <View style={[styles.qualityBar, { backgroundColor: qualityColor }]} />

      <View style={styles.content}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.date}>{format(new Date(dream.dream_date + 'T12:00:00'), 'MMM d')}</Text>
          <View style={styles.pillsRow}>
            {dream.is_lucid && (
              <View style={styles.lucidPill}>
                <Ionicons name="moon" size={9} color="#A78BFA" />
                <Text style={[styles.pillText, { color: '#A78BFA' }]}>Lucid</Text>
              </View>
            )}
            {dream.is_recurring && (
              <View style={styles.recurPill}>
                <Ionicons name="repeat" size={9} color={COLORS.gold} />
                <Text style={[styles.pillText, { color: COLORS.gold }]}>Recurring</Text>
              </View>
            )}
            {hasInterpretation && (
              <View style={styles.aiPill}>
                <Text style={styles.aiPillText}>✦ AI</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        {dream.title ? (
          <Text style={styles.title} numberOfLines={1}>{dream.title}</Text>
        ) : null}

        {/* Preview */}
        <Text style={styles.preview} numberOfLines={2}>{preview}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Emotion icons */}
          {dream.emotions.length > 0 && (
            <View style={styles.emotions}>
              {dream.emotions.slice(0, 4).map(e => (
                <Ionicons
                  key={e}
                  name={(EMOTION_META[e]?.name ?? 'ellipse') as any}
                  size={12}
                  color={EMOTION_META[e]?.color ?? COLORS.textMuted}
                />
              ))}
            </View>
          )}

          {/* Tags */}
          {dream.tags.length > 0 && (
            <View style={styles.tags}>
              {dream.tags.slice(0, 2).map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {dream.tags.length > 2 && (
                <Text style={styles.tagMore}>+{dream.tags.length - 2}</Text>
              )}
            </View>
          )}

          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    overflow: 'hidden',
  },
  qualityBar: { width: 3 },
  content: { flex: 1, padding: SPACING.md, gap: 6 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },

  pillsRow: { flexDirection: 'row', gap: 5 },
  lucidPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(167,139,250,0.14)', borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)' },
  recurPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.goldGlow, borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(233,184,74,0.25)' },
  aiPill:    { backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.borderBright },
  pillText:  { fontSize: 10, fontWeight: '600' },
  aiPillText:{ fontSize: 10, fontWeight: '700', color: COLORS.accent },

  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  preview: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },

  footer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  emotions: { flexDirection: 'row', gap: 3 },
  tags: { flexDirection: 'row', gap: 4 },
  tagChip: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500' },
  tagMore: { fontSize: 10, color: COLORS.textMuted },
});
