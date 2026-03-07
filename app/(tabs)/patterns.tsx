import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useDreams } from '@/hooks/useDreams';
import { Button } from '@/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import type { Dream, Emotion } from '@/types/dream';

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

function computeStats(dreams: Dream[]) {
  if (dreams.length === 0) return null;

  // Émotions les plus fréquentes
  const emotionCounts: Record<string, number> = {};
  for (const d of dreams) {
    for (const e of d.emotions) {
      emotionCounts[e] = (emotionCounts[e] ?? 0) + 1;
    }
  }
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Tags les plus fréquents
  const tagCounts: Record<string, number> = {};
  for (const d of dreams) {
    for (const t of d.tags) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Qualité sommeil moyenne
  const withQuality = dreams.filter(d => d.sleep_quality);
  const avgQuality = withQuality.length > 0
    ? withQuality.reduce((s, d) => s + (d.sleep_quality ?? 0), 0) / withQuality.length
    : null;

  // Rêves lucides
  const lucidCount = dreams.filter(d => d.is_lucid).length;
  const lucidPct = Math.round((lucidCount / dreams.length) * 100);

  // Interprétés
  const interpretedCount = dreams.filter(d => d.interpretation).length;

  // Archetypes les plus fréquents
  const archetypeCounts: Record<string, number> = {};
  for (const d of dreams) {
    for (const arch of (d.interpretation?.archetypes ?? [])) {
      archetypeCounts[arch] = (archetypeCounts[arch] ?? 0) + 1;
    }
  }
  const topArchetypes = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return { topEmotions, topTags, avgQuality, lucidCount, lucidPct, interpretedCount, topArchetypes };
}

export default function PatternsScreen() {
  const { isPro, profile } = useAuth();
  const { dreams } = useDreams();
  const stats = computeStats(dreams);

  if (!isPro) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.gateContainer}>
          <Ionicons name='analytics-outline' size={72} color='#6b5fa6' />
          <Text style={styles.gateTitle}>Dream Patterns</Text>
          <Text style={styles.gateSub}>
            Discover recurring symbols, emotions, and themes across all your dreams. Understand yourself at a deeper level.
          </Text>
          <View style={styles.previewCards}>
            {[{ label: 'Top Emotions', icon: 'heart' }, { label: 'Recurring Themes', icon: 'repeat' }, { label: 'Archetype Profile', icon: 'person' }, { label: 'Sleep Quality Trend', icon: 'bed' }].map(({ label, icon }) => (
              <View key={label} style={styles.previewCard}>
                <View style={styles.previewBlur} />
                <Text style={styles.previewCardIcon}>{icon}</Text>
                <Text style={styles.previewLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Button title="Unlock with Pro" onPress={() => router.push('/paywall')} variant="gold" fullWidth size="lg" style={{ marginTop: SPACING.md }} />
          <Text style={styles.gateHint}>Available with Lucid Pro · From $2.92/month</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || dreams.length < 3) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name='analytics-outline' size={64} color='#6b5fa6' />
          <Text style={styles.gateTitle}>Not Enough Data Yet</Text>
          <Text style={styles.gateSub}>Record at least 3 dreams to see your patterns.</Text>
          <Text style={styles.gateHint}>You have {dreams.length} dream{dreams.length !== 1 ? 's' : ''} so far.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Patterns</Text>
          <Text style={styles.sub}>{dreams.length} dreams analysed</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Dreams', value: String(dreams.length), icon: 'sparkles-outline', color: '#a78bfa' },
            { label: 'Lucid', value: `${stats.lucidPct}%`, icon: 'moon-outline', color: '#818cf8' },
            { label: 'Interpreted', value: String(stats.interpretedCount), icon: 'hardware-chip-outline', color: '#34d399' },
            { label: 'Avg Sleep', value: stats.avgQuality ? `${stats.avgQuality.toFixed(1)}/5` : '—', icon: 'bed-outline', color: '#60a5fa' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={18} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Top Emotions */}
        {stats.topEmotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>♦ Dominant Emotions</Text>
            <View style={styles.emotionBars}>
              {stats.topEmotions.map(([emotion, count]) => {
                const pct = Math.round((count / dreams.length) * 100);
                return (
                  <View key={emotion} style={styles.emotionRow}>
                    <Ionicons name={(EMOTION_ICON[emotion]?.name ?? 'ellipse') as any} size={16} color={EMOTION_ICON[emotion]?.color ?? '#6b7280'} style={{ width: 22 }} />
                    <Text style={styles.emotionLabel}>{emotion}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: COLORS.emotions[emotion as Emotion] ?? COLORS.primary }]} />
                    </View>
                    <Text style={styles.emotionPct}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Top Tags */}
        {stats.topTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recurring Themes</Text>
            <View style={styles.tagCloud}>
              {stats.topTags.map(([tag, count]) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <Text style={styles.tagChipCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Archetypes */}
        {stats.topArchetypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Archetypes</Text>
            <View style={styles.archetypeGrid}>
              {stats.topArchetypes.map(([arch, count]) => (
                <LinearGradient key={arch} colors={[COLORS.primary + '22', COLORS.primary + '11']} style={styles.archetypeCard}>
                  <Text style={styles.archetypeName}>{arch}</Text>
                  <Text style={styles.archetypeCount}>×{count}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg },
  header: { paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text },
  sub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 2 },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center' },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  emotionBars: { gap: SPACING.sm },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  emotionEmoji: { fontSize: 16, width: 22 },
  emotionLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, width: 70, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  emotionPct: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, width: 32, textAlign: 'right' },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.border },
  tagChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  tagChipCount: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  archetypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  archetypeCard: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.primary + '33', flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  archetypeName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  archetypeCount: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  // Gate
  gateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, gap: SPACING.md },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  gateEmoji: { fontSize: 72 },
  gateTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  gateSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  gateHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
  previewCards: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, width: '100%', marginTop: SPACING.sm },
  previewCard: { flex: 1, minWidth: '45%', height: 70, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'flex-end', padding: SPACING.sm, overflow: 'hidden' },
  previewBlur: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.surface, opacity: 0.9 },
  previewCardIcon: { fontSize: 22, color: '#9b8ec4', marginBottom: 4 },
  previewLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600', zIndex: 1 },
});
