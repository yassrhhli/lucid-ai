import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useDreams } from '@/hooks/useDreams';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'notifications-outline', label: 'Notifications',   onPress: (r: any) => r.push('/notifications') },
      { icon: 'shield-outline',        label: 'Privacy & Data',  onPress: (r: any) => r.push('/privacy')       },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'star-outline',          label: 'Rate Lucid AI',    onPress: () => Linking.openURL('https://apps.apple.com/app/id000000000?action=write-review') },
      { icon: 'mail-outline',          label: 'Contact Support',  onPress: () => Linking.openURL('mailto:support@lucidai.app') },
    ],
  },
];

export default function ProfileScreen() {
  const { user, profile, isPro, signOut } = useAuth();
  const { dreams } = useDreams();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        }
      },
    ]);
  };

  const rawName = profile?.username ?? user?.email?.split('@')[0] ?? 'Dreamer';
  const displayName = rawName.split('.')[0].charAt(0).toUpperCase() + rawName.split('.')[0].slice(1);
  const initial = displayName[0].toUpperCase();
  const lucidCount = dreams.filter(d => d.is_lucid).length;
  const interpretedCount = dreams.filter(d => d.interpretation).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* ── Avatar card ────────────────────────────────────────────── */}
        <LinearGradient colors={['#1A0D3A', '#0e0e1f']} style={styles.avatarCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={['#6B46C1', '#8B5CF6']} style={styles.avatar}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => router.push('/edit-profile')}>
                <Ionicons name="pencil" size={11} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
                {isPro && (
                  <View style={styles.proBadge}>
                    <Ionicons name="star" size={9} color={COLORS.gold} />
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.email}>{user?.email}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
                <Ionicons name="create-outline" size={13} color={COLORS.primaryBright} />
                <Text style={styles.editBtnText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Stats grid ─────────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Dreams',   value: dreams.length,       icon: 'sparkles-outline',       color: COLORS.accent  },
            { label: 'Streak',   value: profile?.streak_days ?? 0, icon: 'flame-outline',   color: '#F97316'      },
            { label: 'Lucid',    value: lucidCount,          icon: 'moon-outline',           color: '#818CF8'      },
            { label: 'AI Read',  value: interpretedCount,    icon: 'hardware-chip-outline',  color: COLORS.teal    },
          ].map(({ label, value, icon, color }) => (
            <View key={label} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
                <Ionicons name={icon as any} size={18} color={color} />
              </View>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Pro upsell ─────────────────────────────────────────────── */}
        {!isPro && (
          <TouchableOpacity onPress={() => router.push('/paywall')} activeOpacity={0.88} style={styles.upsellShadow}>
            <LinearGradient colors={['#1A0D3A', '#2D1460', '#1A0D3A']} style={styles.upsell} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={styles.upsellIconWrap}>
                <Ionicons name="star" size={20} color={COLORS.gold} />
              </View>
              <View style={styles.upsellText}>
                <Text style={styles.upsellTitle}>Upgrade to Pro</Text>
                <Text style={styles.upsellSub}>Unlimited AI · No ads · Pattern insights</Text>
              </View>
              <View style={styles.upsellArrow}>
                <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Menu sections ──────────────────────────────────────────── */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.menuCard}>
              {section.items.map(({ icon, label, onPress }, idx) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => onPress(router)}
                  style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name={icon as any} size={17} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.menuLabel}>{label}</Text>
                  <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign out ───────────────────────────────────────────────── */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.7}>
          <View style={styles.menuCard}>
            <View style={styles.menuItem}>
              <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245,101,101,0.12)' }]}>
                <Ionicons name="log-out-outline" size={17} color={COLORS.error} />
              </View>
              <Text style={[styles.menuLabel, { color: COLORS.error }]}>Sign Out</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.version}>Lucid AI · v1.0.0</Text>
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg },
  pageTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, paddingTop: SPACING.md, marginBottom: SPACING.lg, letterSpacing: -0.5 },

  // Avatar card
  avatarCard: {
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.borderGlass,
    marginBottom: SPACING.lg,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.background,
  },
  avatarInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 3 },
  displayName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.goldGlow, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(233,184,74,0.3)',
  },
  proBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.gold, letterSpacing: 1 },
  email: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.borderBright,
  },
  editBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.primaryBright, fontWeight: '600' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderSubtle, gap: 5,
  },
  statIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FONT_SIZES['2xl'], fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },

  // Upsell
  upsellShadow: { borderRadius: RADIUS.xl, marginBottom: SPACING.xl, shadowColor: '#6B46C1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 6 },
  upsell: { borderRadius: RADIUS.xl, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderColor: 'rgba(123,94,167,0.3)' },
  upsellIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.goldGlow, alignItems: 'center', justifyContent: 'center' },
  upsellText: { flex: 1 },
  upsellTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  upsellSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  upsellArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center' },

  // Menu
  menuSection: { marginBottom: SPACING.md },
  menuSectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: SPACING.xs },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderSubtle, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  menuItemIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },

  signOutBtn: { marginBottom: SPACING.lg },
  version: { textAlign: 'center', fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.lg },
});
