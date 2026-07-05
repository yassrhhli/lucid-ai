import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useDreams } from '@/hooks/useDreams';
import { Button } from '@/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { haptics } from '@/utils/haptics';
import type { Dream, Emotion } from '@/types/dream';

const EMOTION_META: Record<string, { icon: string; color: string }> = {
  joy:        { icon: 'sunny',        color: '#FBBF24' },
  fear:       { icon: 'flash',        color: '#818CF8' },
  anxiety:    { icon: 'alert-circle', color: '#FB923C' },
  peace:      { icon: 'leaf',         color: '#34D399' },
  sadness:    { icon: 'rainy',        color: '#60A5FA' },
  excitement: { icon: 'star',         color: '#F472B6' },
  confusion:  { icon: 'help-circle',  color: '#A78BFA' },
  anger:      { icon: 'flame',        color: '#EF4444' },
  love:       { icon: 'heart',        color: '#F472B6' },
  wonder:     { icon: 'sparkles',     color: '#818CF8' },
};

function computeStats(dreams: Dream[]) {
  if (dreams.length === 0) return null;
  const emotionCounts: Record<string, number> = {};
  for (const d of dreams) for (const e of d.emotions) emotionCounts[e] = (emotionCounts[e] ?? 0) + 1;
  const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const tagCounts: Record<string, number> = {};
  for (const d of dreams) for (const t of d.tags) tagCounts[t] = (tagCounts[t] ?? 0) + 1;
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const withQuality = dreams.filter(d => d.sleep_quality);
  const avgQuality = withQuality.length > 0
    ? withQuality.reduce((s, d) => s + (d.sleep_quality ?? 0), 0) / withQuality.length : null;

  const lucidCount = dreams.filter(d => d.is_lucid).length;
  const lucidPct = Math.round((lucidCount / dreams.length) * 100);
  const interpretedCount = dreams.filter(d => d.interpretation).length;

  const archetypeCounts: Record<string, number> = {};
  for (const d of dreams) for (const arch of (d.interpretation?.archetypes ?? []))
    archetypeCounts[arch] = (archetypeCounts[arch] ?? 0) + 1;
  const topArchetypes = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return { topEmotions, topTags, avgQuality, lucidCount, lucidPct, interpretedCount, topArchetypes };
}

export default function PatternsScreen() {
  const { isPro } = useAuth();
  const { dreams } = useDreams();
  const stats = computeStats(dreams);

  // ── Paywall gate ────────────────────────────────────────────────
  if (!isPro) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.glow} pointerEvents="none" />
        <ScrollView contentContainerStyle={styles.gateScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.gateIconOuterGlow}>
            <View style={styles.gateIconWrap}>
              <LinearGradient colors={['#4A2D8A', '#7B5EA7']} style={styles.gateIconGrad}>
                <Ionicons name="stats-chart" size={36} color="#fff" />
              </LinearGradient>
            </View>
          </View>
          <Text style={styles.gateTitle}>Dream Patterns</Text>
          <Text style={styles.gateSub}>
            Discover recurring symbols, dominant emotions, and Jungian archetypes across all your dreams.
          </Text>

          {/* Blurred preview grid */}
          <View style={styles.previewGrid}>
            {[
              { label: 'Top Emotions',       icon: 'heart-outline',   color: '#FB7185' },
              { label: 'Recurring Themes',   icon: 'repeat-outline',  color: '#60A5FA' },
              { label: 'Archetype Profile',  icon: 'person-outline',  color: COLORS.accent },
              { label: 'Sleep Trend',        icon: 'bed-outline',     color: COLORS.gold },
            ].map(({ label, icon, color }) => (
              <View key={label} style={styles.previewCard}>
                <View style={styles.previewLockBadge}>
                  <Ionicons name="lock-closed" size={9} color={COLORS.textMuted} />
                </View>
                <View style={[styles.previewIconWrap, { backgroundColor: color + '18' }]}>
                  <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <Text style={styles.previewLabel}>{label}</Text>
                <View style={styles.previewBlurBars}>
                  <View style={[styles.blurBar, { width: '80%', backgroundColor: color, opacity: 0.28 }]} />
                  <View style={[styles.blurBar, { width: '55%', backgroundColor: color, opacity: 0.18 }]} />
                  <View style={[styles.blurBar, { width: '65%', backgroundColor: color, opacity: 0.1  }]} />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.ctaGlowWrap}>
            <Button
              title="Unlock with Pro"
              onPress={() => { haptics.light(); router.push('/paywall'); }}
              variant="gold"
              fullWidth
              size="lg"
              icon={<Ionicons name="sparkles" size={17} color="#fff" />}
            />
          </View>
          <View style={styles.gateHintRow}>
            <Ionicons name="shield-checkmark-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.gateHint}>From $2.92/month · Cancel anytime</Text>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Not enough data ──────────────────────────────────────────────
  if (!stats || dreams.length < 3) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyCenter}>
          <View style={styles.gateIconWrap}>
            <LinearGradient colors={['#4A2D8A', '#7B5EA7']} style={styles.gateIconGrad}>
              <Ionicons name="stats-chart" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.gateTitle}>Not Enough Data Yet</Text>
          <Text style={styles.gateSub}>Record at least 3 dreams to unlock your pattern insights.</Text>
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${Math.min((dreams.length / 3) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{dreams.length} / 3 dreams</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Full patterns view ───────────────────────────────────────────
  const maxEmotion = stats.topEmotions[0]?.[1] ?? 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Your Patterns</Text>
            <Text style={styles.subtitle}>{dreams.length} dreams analysed</Text>
          </View>
          <View style={styles.proBadge}>
            <Ionicons name="star" size={11} color={COLORS.gold} />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total',       val: String(dreams.length),                            color: COLORS.accent, icon: 'sparkles-outline'       },
            { label: 'Lucid',       val: `${stats.lucidPct}%`,                             color: '#818CF8',     icon: 'moon-outline'            },
            { label: 'AI Read',     val: String(stats.interpretedCount),                   color: COLORS.teal,   icon: 'hardware-chip-outline'   },
            { label: 'Sleep',       val: stats.avgQuality ? `${stats.avgQuality.toFixed(1)}` : '—', color: COLORS.gold, icon: 'bed-outline' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={15} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Dominant Emotions */}
        {stats.topEmotions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(251,113,133,0.15)' }]}>
                <Ionicons name="heart" size={16} color="#FB7185" />
              </View>
              <Text style={styles.cardTitle}>Dominant Emotions</Text>
            </View>
            <View style={styles.emotionList}>
              {stats.topEmotions.map(([emotion, count]) => {
                const pct = Math.round((count / maxEmotion) * 100);
                const meta = EMOTION_META[emotion] ?? { icon: 'ellipse', color: COLORS.primary };
                const emotionColor = COLORS.emotions[emotion as Emotion] ?? COLORS.primary;
                return (
                  <View key={emotion} style={styles.emotionRow}>
                    <Ionicons name={meta.icon as any} size={14} color={meta.color} style={{ width: 20 }} />
                    <Text style={styles.emotionName}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: emotionColor }]} />
                    </View>
                    <Text style={styles.emotionCount}>{count}×</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recurring Themes */}
        {stats.topTags.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(96,165,250,0.15)' }]}>
                <Ionicons name="repeat" size={16} color="#60A5FA" />
              </View>
              <Text style={styles.cardTitle}>Recurring Themes</Text>
            </View>
            <View style={styles.tagCloud}>
              {stats.topTags.map(([tag, count]) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <View style={styles.tagCount}><Text style={styles.tagCountText}>{count}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Archetypes */}
        {stats.topArchetypes.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: COLORS.primaryGlow }]}>
                <Ionicons name="person" size={16} color={COLORS.accent} />
              </View>
              <Text style={styles.cardTitle}>Your Archetypes</Text>
            </View>
            <View style={styles.archetypeGrid}>
              {stats.topArchetypes.map(([arch, count], i) => (
                <LinearGradient
                  key={arch}
                  colors={i === 0 ? ['#4A2D8A', '#6B46C1'] : [COLORS.surface, COLORS.surfaceElevated]}
                  style={styles.archetypeCard}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  {i === 0 && <View style={styles.archetypeCrown}><Ionicons name="star" size={10} color={COLORS.gold} /></View>}
                  <Text style={[styles.archetypeName, i === 0 && { color: '#fff' }]}>{arch}</Text>
                  <Text style={[styles.archetypeCount, i === 0 && { color: 'rgba(255,255,255,0.65)' }]}>×{count}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        )}

        {/* Sleep quality overview */}
        {stats.avgQuality && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: COLORS.goldGlow }]}>
                <Ionicons name="bed" size={16} color={COLORS.gold} />
              </View>
              <Text style={styles.cardTitle}>Sleep Quality</Text>
            </View>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepBig}>{stats.avgQuality.toFixed(1)}</Text>
              <Text style={styles.sleepDen}>/5</Text>
              <View style={styles.sleepStars}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name={i <= Math.round(stats.avgQuality!) ? 'star' : 'star-outline'} size={18} color={COLORS.gold} />
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  glow: {
    position: 'absolute', top: -80, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(123,94,167,0.08)',
  },
  scroll: { paddingHorizontal: SPACING.lg },
  gateScroll: { paddingHorizontal: SPACING.lg, alignItems: 'center', paddingTop: SPACING.xl },

  // Gate
  gateIconOuterGlow: {
    marginBottom: SPACING.lg,
    borderRadius: 60,
    padding: 8,
    backgroundColor: 'rgba(123,94,167,0.14)',
  },
  gateIconWrap: { shadowColor: '#7B5EA7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 10 },
  gateIconGrad: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  gateTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm, letterSpacing: -0.5 },
  gateSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  gateHintRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: SPACING.md },
  gateHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, width: '100%', marginBottom: SPACING.xl },
  previewCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderSubtle, gap: SPACING.xs,
    position: 'relative', overflow: 'hidden',
  },
  previewLockBadge: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  previewIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  previewLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },
  previewBlurBars: { gap: 5, marginTop: SPACING.xs },
  blurBar: { height: 6, borderRadius: 3 },
  ctaGlowWrap: { width: '100%', shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 4 },

  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, gap: SPACING.md },
  progressWrap: { width: '100%', height: 6, backgroundColor: COLORS.surface, borderRadius: 3, overflow: 'hidden', marginTop: SPACING.sm },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 3 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.goldGlow,
    borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(233,184,74,0.3)',
  },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.gold, letterSpacing: 1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, paddingVertical: SPACING.sm,
    alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  statVal: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  statLabel: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', fontWeight: '500' },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },

  // Emotions
  emotionList: { gap: SPACING.sm },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  emotionName: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, width: 80 },
  barTrack: { flex: 1, height: 6, backgroundColor: COLORS.borderSubtle, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  emotionCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, width: 24, textAlign: 'right' },

  // Tags
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full, paddingLeft: SPACING.sm, paddingRight: 6, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  tagText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  tagCount: { backgroundColor: COLORS.primaryGlow, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tagCountText: { fontSize: 9, color: COLORS.accent, fontWeight: '700' },

  // Archetypes
  archetypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  archetypeCard: {
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, position: 'relative',
  },
  archetypeCrown: { position: 'absolute', top: -5, right: -4, backgroundColor: COLORS.background, borderRadius: 6, padding: 2 },
  archetypeName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  archetypeCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },

  // Sleep
  sleepRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs },
  sleepBig: { fontSize: FONT_SIZES['4xl'], fontWeight: '800', color: COLORS.gold },
  sleepDen: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted, marginRight: SPACING.md },
  sleepStars: { flexDirection: 'row', gap: 2 },
});
