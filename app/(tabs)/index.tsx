import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useDreams } from '@/hooks/useDreams';
import { COLORS, FONT_SIZES, SPACING, RADIUS, GRADIENTS } from '@/constants/theme';
import { format } from 'date-fns';

const QUICK_ACTIONS = [
  { icon: 'book-outline' as const,      label: 'Journal',   route: '/(tabs)/journal',  color: COLORS.accent,   bg: COLORS.primaryGlow },
  { icon: 'compass-outline' as const,   label: 'Explore',   route: '/(tabs)/explore',  color: COLORS.teal,     bg: COLORS.tealGlow   },
  { icon: 'stats-chart-outline' as const, label: 'Patterns', route: '/(tabs)/patterns', color: COLORS.gold,    bg: COLORS.goldGlow   },
  { icon: 'library-outline' as const,   label: 'Dictionary',route: '/dictionary',       color: '#60A5FA',       bg: 'rgba(96,165,250,0.12)' },
];

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const { dreams } = useDreams();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? 'Still awake?' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const rawName = profile?.username || user?.email?.split('@')[0] || 'Dreamer';
  const username = rawName.split('.')[0].charAt(0).toUpperCase() + rawName.split('.')[0].slice(1);

  const lucidCount  = dreams?.filter(d => d.is_lucid).length ?? 0;
  const totalDreams = dreams?.length ?? 0;
  const streak      = profile?.streak_days ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Background nebula glows */}
      <View style={styles.glowTR} pointerEvents="none" />
      <View style={styles.glowBL} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.dateLabel}>{format(now, 'EEEE, MMMM d')}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/(tabs)/patterns')}>
            <Ionicons name="flame" size={15} color="#F97316" />
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>day</Text>
          </TouchableOpacity>
        </View>

        {/* ── Record CTA ─────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => router.push('/dream/new')} activeOpacity={0.88} style={styles.ctaShadow}>
          <LinearGradient colors={['#3D1F8A', '#6B46C1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
            {/* Stars decoration */}
            <View style={styles.star1} />
            <View style={styles.star2} />
            <View style={styles.star3} />
            <View style={styles.ctaContent}>
              <View style={styles.ctaIconWrap}>
                <Ionicons name="sparkles" size={28} color="#fff" />
              </View>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Record a Dream</Text>
                <Text style={styles.ctaSub}>
                  {profile?.last_dream_at
                    ? `Last: ${format(new Date(profile.last_dream_at), 'MMM d')}`
                    : 'Capture it before it fades'}
                </Text>
              </View>
              <View style={styles.ctaArrow}>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Stats row ──────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { val: totalDreams, label: 'Dreams',  color: COLORS.accent,   icon: 'sparkles' as const  },
            { val: streak,      label: 'Streak',  color: '#F97316',        icon: 'flame' as const     },
            { val: lucidCount,  label: 'Lucid',   color: COLORS.teal,      icon: 'moon' as const      },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <LinearGradient colors={[s.color + '22', s.color + '08']} style={styles.statCardGrad}>
                <Ionicons name={s.icon} size={16} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity key={action.label} style={styles.quickCard} onPress={() => router.push(action.route as any)} activeOpacity={0.75}>
              <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Pro upsell ─────────────────────────────────────────────── */}
        {!profile?.is_pro && (
          <TouchableOpacity onPress={() => router.push('/paywall')} activeOpacity={0.88} style={styles.upsellShadow}>
            <LinearGradient colors={['#1A0D3A', '#241450', '#1A0D3A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upsell}>
              <View style={styles.upsellLeft}>
                <View style={styles.upsellStarWrap}>
                  <Ionicons name="star" size={16} color={COLORS.gold} />
                </View>
                <View>
                  <Text style={styles.upsellTitle}>Unlock Lucid Pro</Text>
                  <Text style={styles.upsellSub}>Unlimited AI · No ads · Deep insights</Text>
                </View>
              </View>
              <View style={styles.upsellChevron}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Recent dreams mini-preview ─────────────────────────────── */}
        {dreams && dreams.length > 0 && (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/journal')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {dreams.slice(0, 2).map(dream => (
              <TouchableOpacity key={dream.id} onPress={() => router.push(`/dream/${dream.id}`)} activeOpacity={0.78} style={styles.recentCard}>
                <View style={[styles.recentQualityBar, { backgroundColor: dream.sleep_quality ? ['#F87171','#FB923C','#FBBF24','#34D399','#8B5CF6'][dream.sleep_quality - 1] : COLORS.border }]} />
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{dream.title || 'Untitled Dream'}</Text>
                  <Text style={styles.recentPreview} numberOfLines={2}>{dream.content}</Text>
                  <View style={styles.recentFooter}>
                    <Text style={styles.recentDate}>{format(new Date(dream.dream_date + 'T12:00:00'), 'MMM d')}</Text>
                    {dream.is_lucid && <View style={styles.lucidPill}><Text style={styles.lucidPillText}>Lucid</Text></View>}
                    {dream.interpretation && <View style={styles.aiPill}><Text style={styles.aiPillText}>AI ✦</Text></View>}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ alignSelf: 'center' }} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  glowTR: {
    position: 'absolute', top: -100, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(123,94,167,0.1)',
  },
  glowBL: {
    position: 'absolute', bottom: 250, left: -100,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(45,212,191,0.05)',
  },
  scroll: { paddingHorizontal: SPACING.lg },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: SPACING.lg, marginBottom: SPACING.xl },
  greeting: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, letterSpacing: 0.3 },
  username: { fontSize: 30, fontWeight: '800', color: COLORS.text, letterSpacing: -0.8, marginTop: 1 },
  dateLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 3 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(249,115,22,0.1)',
    borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.22)',
    marginTop: 4,
  },
  streakNum: { fontSize: 18, fontWeight: '800', color: '#F97316' },
  streakLabel: { fontSize: 11, color: '#F9731688', fontWeight: '500' },

  // CTA
  ctaShadow: {
    borderRadius: RADIUS.xl, marginBottom: SPACING.lg,
    shadowColor: '#6B46C1', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 22, elevation: 14,
  },
  ctaGradient: { borderRadius: RADIUS.xl, padding: SPACING.lg, overflow: 'hidden' },
  star1: { position: 'absolute', top: 14, right: 28, width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  star2: { position: 'absolute', top: 28, right: 56, width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  star3: { position: 'absolute', bottom: 20, right: 20, width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  ctaContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ctaIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { flex: 1 },
  ctaTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  ctaSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  ctaArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  statCardGrad: { paddingVertical: SPACING.md, alignItems: 'center', gap: 4 },
  statVal: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: SPACING.sm },

  // Quick Actions
  quickGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  quickCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, paddingVertical: SPACING.md,
    alignItems: 'center', gap: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },

  // Upsell
  upsellShadow: {
    borderRadius: RADIUS.xl, marginBottom: SPACING.xl,
    shadowColor: '#6B46C1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  upsell: {
    borderRadius: RADIUS.xl, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(123,94,167,0.28)',
  },
  upsellLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  upsellStarWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: COLORS.goldGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  upsellTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  upsellSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  upsellChevron: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
  },

  // Recent
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  seeAll: { fontSize: FONT_SIZES.sm, color: COLORS.primaryBright, fontWeight: '600' },
  recentCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderSubtle, overflow: 'hidden',
  },
  recentQualityBar: { width: 3 },
  recentContent: { flex: 1, padding: SPACING.md },
  recentTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  recentPreview: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 8 },
  recentFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  recentDate: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  lucidPill: { backgroundColor: 'rgba(139,92,246,0.18)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  lucidPillText: { fontSize: 10, color: '#A78BFA', fontWeight: '600' },
  aiPill: { backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  aiPillText: { fontSize: 10, color: COLORS.accent, fontWeight: '600' },
});
