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
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const username = profile?.username || user?.email?.split('@')[0] || 'Dreamer';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.username}>{username} 🌙</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{profile?.streak_days ?? 0}</Text>
          </View>
        </View>

        {/* Date */}
        <Text style={styles.date}>{format(now, 'EEEE, MMMM d')}</Text>

        {/* CTA Principal */}
        <TouchableOpacity
          onPress={() => router.push('/dream/new')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#5b21b6', '#7c3aed', '#9d5ff5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recordButton}
          >
            <Text style={styles.recordEmoji}>🌙</Text>
            <Text style={styles.recordTitle}>Record a Dream</Text>
            <Text style={styles.recordSub}>
              {profile?.last_dream_at
                ? `Last recorded ${format(new Date(profile.last_dream_at), 'MMM d')}`
                : "Tap to log your first dream"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { emoji: '📓', label: 'My Journal', route: '/(tabs)/journal' },
            { emoji: '🌐', label: 'Dream Feed', route: '/(tabs)/explore' },
            { emoji: '📊', label: 'My Patterns', route: '/(tabs)/patterns' },
            { emoji: '🔮', label: 'Dictionary', route: '/dictionary' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickEmoji}>{action.emoji}</Text>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Row */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{profile?.streak_days ?? 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>
              {3 - (profile?.interpretation_count_week ?? 0)}
            </Text>
            <Text style={styles.statLabel}>Free AI Left</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{profile?.is_pro ? '∞' : 'FREE'}</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Pro Upsell si pas pro */}
        {!profile?.is_pro && (
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            activeOpacity={0.9}
            style={styles.upsellCard}
          >
            <LinearGradient
              colors={['#1a0a3a', '#2d1060']}
              style={styles.upsellGradient}
            >
              <Text style={styles.upsellEmoji}>⭐</Text>
              <View style={styles.upsellText}>
                <Text style={styles.upsellTitle}>Unlock Lucid Pro</Text>
                <Text style={styles.upsellSub}>
                  Unlimited AI interpretations • No ads • Pattern insights
                </Text>
              </View>
              <Text style={styles.upsellArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Spacer pour la tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  username: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  streakEmoji: { fontSize: 16 },
  streakCount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gold,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  recordButton: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  recordEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  recordTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  recordSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  upsellCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  upsellGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  upsellEmoji: { fontSize: 28 },
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
    lineHeight: 16,
  },
  upsellArrow: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
