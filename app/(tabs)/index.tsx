import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useDreams } from '@/hooks/useDreams';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { format } from 'date-fns';

const QUICK_ACTIONS = [
  { icon: 'book-outline' as const,       label: 'My Journal',  route: '/(tabs)/journal',  color: '#7c3aed', bg: 'rgba(124,58,237,0.18)' },
  { icon: 'globe-outline' as const,      label: 'Dream Feed',  route: '/(tabs)/explore',  color: '#06b6d4', bg: 'rgba(6,182,212,0.15)'  },
  { icon: 'bar-chart-outline' as const,  label: 'My Patterns', route: '/(tabs)/patterns', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  { icon: 'library-outline' as const,    label: 'Dictionary',  route: '/dictionary',      color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
];

const STATS = [
  { icon: 'flame' as const,    color: '#f97316', key: 'streak',  label: 'Day Streak' },
  { icon: 'moon' as const,     color: '#818cf8', key: 'lucid',   label: 'Lucid'      },
  { icon: 'sparkles' as const, color: '#c084fc', key: 'dreams',  label: 'Dreams'     },
];

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const { dreams } = useDreams();
  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const rawName = profile?.username || user?.email?.split('@')[0] || 'Dreamer';
  const username = rawName.split('.')[0].charAt(0).toUpperCase() + rawName.split('.')[0].slice(1);

  const statValues: Record<string, number> = {
    streak: profile?.streak_days ?? 0,
    lucid:  dreams?.filter(d => d.is_lucid).length ?? 0,
    dreams: dreams?.length ?? 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Nebula background glow */}
      <View style={styles.nebulaTop} pointerEvents="none" />
      <View style={styles.nebulaBottom} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.date}>{format(now, 'EEEE, MMMM d')}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge} onPress={() => router.push('/(tabs)/patterns')}>
            <Ionicons name="flame" size={16} color="#f97316" />
            <Text style={styles.streakCount}>{profile?.streak_days ?? 0}</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Principal */}
        <TouchableOpacity
          onPress={() => router.push('/dream/new')}
          activeOpacity={0.88}
          style={styles.recordShadow}
        >
          <LinearGradient
            colors={['#4c1d95', '#7c3aed', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recordButton}
          >
            {/* Shimmer dots */}
            <View style={styles.shimmerDot1} />
            <View style={styles.shimmerDot2} />
            <Ionicons name="sparkles" size={36} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.recordTitle}>Record a Dream</Text>
            <Text style={styles.recordSub}>
              {profile?.last_dream_at
                ? `Last recorded ${format(new Date(profile.last_dream_at), 'MMM d')}`
                : 'Tap to log your first dream'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.key} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '22' }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statNum, { color: s.color }]}>{statValues[s.key]}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Pro Upsell */}
        {!profile?.is_pro && (
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            activeOpacity={0.9}
            style={styles.upsellWrap}
          >
            <LinearGradient
              colors={['#1e1040', '#2d1b69']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upsellGradient}
            >
              <View style={styles.upsellIcon}>
                <Ionicons name="star" size={18} color="#fbbf24" />
              </View>
              <View style={styles.upsellText}>
                <Text style={styles.upsellTitle}>Unlock Lucid Pro</Text>
                <Text style={styles.upsellSub}>Unlimited AI • No ads • Deep insights</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  /* Nebula glows */
  nebulaTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124,58,237,0.12)',
    // no blur in RN native but the color alone gives atmosphere
  },
  nebulaBottom: {
    position: 'absolute',
    bottom: 200,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(6,182,212,0.07)',
  },

  scroll: { paddingHorizontal: SPACING.lg },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.25)',
    gap: 5,
    marginTop: 4,
  },
  streakCount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#f97316',
  },

  /* Record button */
  recordShadow: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  recordButton: {
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  shimmerDot1: {
    position: 'absolute',
    top: 12,
    right: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  shimmerDot2: {
    position: 'absolute',
    top: 28,
    right: 38,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  recordTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  recordSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.65)',
  },

  /* Section title */
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* Quick actions */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNum: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  /* Upsell */
  upsellWrap: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  upsellGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  upsellIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsellText: { flex: 1 },
  upsellTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  upsellSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
