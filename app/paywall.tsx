import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const FEATURES = [
  { icon: 'infinite-outline',        label: 'Unlimited AI dream interpretations',   highlight: true  },
  { icon: 'stats-chart-outline',     label: 'Deep pattern analysis & insights',     highlight: false },
  { icon: 'moon-outline',            label: '30-day Lucid Dreaming program',        highlight: false },
  { icon: 'ban-outline',             label: 'Completely ad-free experience',        highlight: false },
  { icon: 'book-outline',            label: 'Full dream symbol dictionary',         highlight: false },
  { icon: 'headset-outline',         label: 'Priority customer support',            highlight: false },
];

type PlanKey = 'annual' | 'monthly' | 'lifetime';

export default function PaywallScreen() {
  const { offering, isLoading, isPurchasing, isRestoring, loadOffering, purchase, restore, error } = useSubscription();
  const { refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual');

  useEffect(() => { loadOffering(); }, []);

  const getPackage = (key: PlanKey) => {
    if (!offering) return null;
    return key === 'annual' ? offering.annual : key === 'monthly' ? offering.monthly : offering.lifetime;
  };

  const getPriceString = (key: PlanKey): string => {
    const pkg = getPackage(key);
    if (!pkg) return key === 'annual' ? '$34.99/yr' : key === 'monthly' ? '$4.99/mo' : '$79';
    return pkg.product.priceString;
  };

  const handlePurchase = async () => {
    const pkg = getPackage(selectedPlan);
    if (!pkg) { Alert.alert('Not Available', 'Please try again.'); return; }
    const success = await purchase(pkg);
    if (success) {
      await refreshProfile();
      Alert.alert('Welcome to Pro! 🎉', 'Unlimited access unlocked.', [
        { text: "Let's Go!", onPress: () => router.back() },
      ]);
    } else if (error) {
      Alert.alert('Purchase Failed', error);
    }
  };

  const handleRestore = async () => {
    const isPro = await restore();
    if (isPro) {
      await refreshProfile();
      Alert.alert('Restored! ✅', 'Your subscription has been restored.', [
        { text: 'Continue', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('No Purchase Found', 'No active subscription found for this account.');
    }
  };

  const plans: { key: PlanKey; name: string; priceLabel: string; badge?: string; saving?: string }[] = [
    { key: 'annual',   name: 'Annual',   priceLabel: getPriceString('annual'),   badge: 'BEST VALUE', saving: 'Save 42% · $2.92/mo' },
    { key: 'monthly',  name: 'Monthly',  priceLabel: getPriceString('monthly'),  saving: 'Billed monthly, cancel anytime'           },
    { key: 'lifetime', name: 'Lifetime', priceLabel: getPriceString('lifetime'), saving: 'Pay once, yours forever'                  },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Background glow */}
      <View style={styles.bgGlow} pointerEvents="none" />

      {/* Close */}
      <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.back()} style={styles.closeBtn} accessibilityLabel="Close" accessibilityRole="button">
        <View style={styles.closeWrap}>
          <Ionicons name="close" size={24} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <LinearGradient colors={['#4A2D8A', '#7B5EA7']} style={styles.heroIconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="star" size={36} color={COLORS.gold} />
          </LinearGradient>
          <Text style={styles.heroEyebrow}>LUCID AI PRO</Text>
          <Text style={styles.heroTitle}>Unlock Your{'\n'}Full Dream World</Text>
          <Text style={styles.heroSub}>Everything you need to understand, improve, and master your dreams.</Text>
        </View>

        {/* ── Features ─────────────────────────────────────────────── */}
        <View style={styles.featuresCard}>
          {FEATURES.map(({ icon, label, highlight }) => (
            <View key={label} style={styles.featureRow}>
              <View style={[styles.featureIconWrap, highlight && styles.featureIconHighlight]}>
                <Ionicons name={icon as any} size={16} color={highlight ? COLORS.gold : COLORS.accent} />
              </View>
              <Text style={[styles.featureLabel, highlight && styles.featureLabelHighlight]}>{label}</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.teal} />
            </View>
          ))}
        </View>

        {/* ── Plan selector ────────────────────────────────────────── */}
        <Text style={styles.plansTitle}>Choose Your Plan</Text>
        <View style={styles.plansWrap}>
          {plans.map(({ key, name, priceLabel, badge, saving }) => {
            const selected = selectedPlan === key;
            return (
              <TouchableOpacity key={key} onPress={() => setSelectedPlan(key)} activeOpacity={0.8}>
                <View style={[styles.planCard, selected && styles.planCardSelected]}>
                  {badge && (
                    <LinearGradient colors={[COLORS.gold, '#C98B2A']} style={styles.planBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={styles.planBadgeText}>{badge}</Text>
                    </LinearGradient>
                  )}
                  <View style={styles.planCardInner}>
                    <View style={styles.planLeft}>
                      <Text style={[styles.planName, selected && styles.planNameSelected]}>{name}</Text>
                      {saving && <Text style={styles.planSaving}>{saving}</Text>}
                    </View>
                    <View style={styles.planRight}>
                      <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>{priceLabel}</Text>
                    </View>
                    <View style={[styles.planRadio, selected && styles.planRadioSelected]}>
                      {selected && <View style={styles.planRadioInner} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={handlePurchase} disabled={isPurchasing || isLoading} activeOpacity={0.88} style={styles.ctaShadow}>
          <LinearGradient colors={['#5B3FA0', '#8B6AC4']} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isPurchasing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.ctaTitle}>
                  {selectedPlan === 'lifetime' ? 'Buy Lifetime Access' : 'Start 7-Day Free Trial'}
                </Text>
                <Text style={styles.ctaSub}>
                  {selectedPlan === 'lifetime'
                    ? 'No subscription, ever'
                    : `Then ${getPriceString(selectedPlan)} · Cancel anytime`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={isRestoring} style={styles.restoreBtn}>
          {isRestoring
            ? <ActivityIndicator size="small" color={COLORS.textMuted} />
            : <Text style={styles.restoreText}>Restore Purchases</Text>}
        </TouchableOpacity>

        {/* Trust row */}
        <View style={styles.trustRow}>
          {['🔒 Secure', '✦ No Ads', '↩ Cancel Anytime'].map(t => (
            <Text key={t} style={styles.trustItem}>{t}</Text>
          ))}
        </View>

        <Text style={styles.legal}>
          Payment charged to {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} at confirmation.
          {selectedPlan !== 'lifetime' && ' Subscription auto-renews. Cancel anytime in Settings.'}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDeep },
  bgGlow: {
    position: 'absolute', top: -50, alignSelf: 'center',
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(123,94,167,0.12)',
  },
  closeBtn: { position: 'absolute', top: 56, right: SPACING.lg, zIndex: 20 },
  closeWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderSubtle },

  scroll: { paddingHorizontal: SPACING.lg },

  // Hero
  hero: { alignItems: 'center', paddingTop: SPACING['2xl'], paddingBottom: SPACING.xl, gap: SPACING.sm },
  heroIconWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm, shadowColor: '#7B5EA7', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },
  heroEyebrow: { fontSize: 11, fontWeight: '800', color: COLORS.accent, letterSpacing: 3 },
  heroTitle: { fontSize: FONT_SIZES['3xl'], fontWeight: '900', color: COLORS.text, textAlign: 'center', letterSpacing: -0.8, lineHeight: 38 },
  heroSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: SPACING.md },

  // Features
  featuresCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.xl, gap: SPACING.md,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  featureIconHighlight: { backgroundColor: COLORS.goldGlow },
  featureLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  featureLabelHighlight: { color: COLORS.text, fontWeight: '600' },

  // Plans
  plansTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: SPACING.md },
  plansWrap: { gap: SPACING.sm, marginBottom: SPACING.lg },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    borderWidth: 1.5, borderColor: COLORS.borderSubtle, overflow: 'hidden',
  },
  planCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  planBadge: { paddingHorizontal: SPACING.md, paddingVertical: 5, alignSelf: 'flex-start', borderBottomRightRadius: 10 },
  planBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  planCardInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  planLeft: { flex: 1 },
  planName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },
  planNameSelected: { color: COLORS.text, fontWeight: '700' },
  planSaving: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  planRight: {},
  planPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textSecondary },
  planPriceSelected: { color: COLORS.accentSoft },
  planRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  planRadioSelected: { borderColor: COLORS.primary },
  planRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // CTA
  ctaShadow: { borderRadius: RADIUS.xl, marginBottom: SPACING.md, shadowColor: '#7B5EA7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 20, elevation: 12 },
  ctaBtn: { borderRadius: RADIUS.xl, paddingVertical: SPACING.lg + 2, alignItems: 'center', gap: 4 },
  ctaTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)' },

  restoreBtn: { alignItems: 'center', padding: SPACING.md, marginBottom: SPACING.sm },
  restoreText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },

  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.lg, marginBottom: SPACING.md },
  trustItem: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },

  legal: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 17, paddingHorizontal: SPACING.lg },
});
