import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import type { Dream } from '@/types/dream';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

const EMOTION_ICON: Record<string, { name: string; color: string }> = {
  joy:        { name: 'sunny',        color: '#fbbf24' },
  fear:       { name: 'flash',        color: '#6366f1' },
  anxiety:    { name: 'alert-circle', color: '#f97316' },
  peace:      { name: 'leaf',         color: '#34d399' },
  sadness:    { name: 'rainy',        color: '#60a5fa' },
  excitement: { name: 'star',         color: '#f472b6' },
  confusion:  { name: 'help-circle',  color: '#a78bfa' },
  anger:      { name: 'flame',        color: '#ef4444' },
  love:       { name: 'heart',        color: '#f472b6' },
  wonder:     { name: 'sparkles',     color: '#818cf8' },
};

const QUALITY_COLOR: Record<number, string> = {
  1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#8b5cf6',
};

interface DreamCardProps {
  dream: Dream;
  onLongPress?: (dream: Dream) => void;
}

export function DreamCard({ dream, onLongPress }: DreamCardProps) {
  const hasInterpretation = !!dream.interpretation;
  const qualityColor = dream.sleep_quality ? QUALITY_COLOR[dream.sleep_quality] : COLORS.border;
  const preview = dream.content.length > 120
    ? dream.content.slice(0, 120).trim() + '…'
    : dream.content;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/dream/${dream.id}`)}
      onLongPress={() => onLongPress?.(dream)}
      activeOpacity={0.8}
      style={styles.card}
    >
      {/* Indicateur qualité sommeil */}
      <View style={[styles.qualityBar, { backgroundColor: qualityColor }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.date}>
              {format(new Date(dream.dream_date), 'MMM d, yyyy')}
            </Text>
            <View style={styles.badges}>
              {dream.is_lucid && (
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, { color: '#a78bfa' }]}>Lucid</Text>
                </View>
              )}
              {dream.is_recurring && (
                <View style={[styles.badge, styles.badgeRecurring]}>
                  <Text style={styles.badgeText}>Recurring</Text>
                </View>
              )}
            </View>
          </View>
          {hasInterpretation && (
            <View style={styles.aiDot}>
              <Text style={styles.aiDotText}>AI</Text>
            </View>
          )}
        </View>

        {/* Title */}
        {dream.title && (
          <Text style={styles.title} numberOfLines={1}>{dream.title}</Text>
        )}

        {/* Preview */}
        <Text style={styles.preview} numberOfLines={3}>{preview}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Emotions */}
          {dream.emotions.length > 0 && (
            <View style={styles.emotions}>
              {dream.emotions.slice(0, 3).map((e) => (
                <Ionicons key={e} name={(EMOTION_ICON[e]?.name ?? 'ellipse') as any} size={12} color={EMOTION_ICON[e]?.color ?? '#6b7280'} />
              ))}
            </View>
          )}

          {/* Tags */}
          {dream.tags.length > 0 && (
            <View style={styles.tags}>
              {dream.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Flèche */}
          <Text style={styles.arrow}>›</Text>
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
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  qualityBar: {
    width: 4,
    borderRadius: 0,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  headerLeft: { flex: 1, gap: 4 },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  badges: { flexDirection: 'row', gap: SPACING.xs },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.primaryDark + '33',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  badgeRecurring: {
    backgroundColor: COLORS.gold + '22',
    borderColor: COLORS.gold + '44',
  },
  badgeText: { fontSize: 10, color: COLORS.textSecondary },
  aiDot: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiDotText: { fontSize: 10, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  preview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  emotions: { flexDirection: 'row', gap: 2 },
  emotionEmoji: { fontSize: 14 },
  tags: { flex: 1, flexDirection: 'row', gap: 4 },
  tag: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: COLORS.textMuted },
  arrow: { fontSize: 20, color: COLORS.textMuted, marginLeft: 'auto' },
});
