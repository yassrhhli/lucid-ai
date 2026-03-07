import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useDreams } from '@/hooks/useDreams';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, profile, isPro, signOut } = useAuth();
  const { dreams } = useDreams();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const lucidCount = dreams.filter((d) => d.is_lucid).length;
  const interpretedCount = dreams.filter((d) => d.interpretation).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        {/* Avatar + info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.username ?? user?.email ?? 'D')[0].toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => router.push('/edit-profile')}>
              <Ionicons name="pencil" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>
                {(() => { const raw = profile?.username ?? user?.email?.split('@')[0] ?? 'Dreamer'; return raw.split('.')[0].charAt(0).toUpperCase() + raw.split('.')[0].slice(1); })()}
              </Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.email}>{user?.email}</Text>
            {isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>★ LUCID PRO</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Dreams', value: dreams.length, icon: 'sparkles-outline', color: '#a78bfa' },
            { label: 'Day Streak', value: profile?.streak_days ?? 0, icon: 'flame-outline', color: '#f97316' },
            { label: 'Lucid Dreams', value: lucidCount, icon: 'moon-outline', color: '#818cf8' },
            { label: 'AI Interpreted', value: interpretedCount, icon: 'hardware-chip-outline', color: '#34d399' },
          ].map(({ label, value, icon, color }) => (
            <View key={label} style={styles.statCard}>
              <Ionicons name={icon as any} size={20} color={color} />
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Plan */}
        {!isPro && (
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            style={styles.upgradeCard}
            activeOpacity={0.9}
          >
            <Ionicons name="star" size={20} color="#fbbf24" />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradeSub}>Unlimited AI · No ads · Pattern insights</Text>
            </View>
            <Text style={styles.upgradeArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={styles.menu}>
          {[
            { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
            { icon: 'shield-outline', label: 'Privacy & Data', onPress: () => router.push('/privacy') },
            { icon: 'star-outline', label: 'Rate Lucid AI', onPress: () => { const { Linking } = require('react-native'); Linking.openURL('https://apps.apple.com/app/idYOUR_APP_ID?action=write-review'); } },
            { icon: 'mail-outline', label: 'Contact Support', onPress: () => { const { Linking } = require('react-native'); Linking.openURL('mailto:support@lucidai.app'); } },
          ].map(({ icon, label, onPress }) => (
            <TouchableOpacity
              key={label}
              onPress={onPress}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <Ionicons name={icon as any} size={18} color={COLORS.textSecondary} />
              <Text style={styles.menuLabel}>{label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Lucid AI v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.text,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatarWrap: { position: 'relative' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.background },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.primary + '44' },
  editBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  avatar: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: '#fff' },
  username: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  email: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },
  proBadge: {
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold + '22',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  proBadgeText: { fontSize: 10, color: COLORS.gold, fontWeight: '700', letterSpacing: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '11',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  upgradeEmoji: { fontSize: 28 },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  upgradeSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  upgradeArrow: { fontSize: 24, color: COLORS.primary, fontWeight: '700' },
  menu: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  menuArrow: { fontSize: 20, color: COLORS.textMuted },
  signOutBtn: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  signOutText: { color: COLORS.error, fontSize: FONT_SIZES.md, fontWeight: '500' },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
