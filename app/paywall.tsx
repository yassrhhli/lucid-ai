import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const FEATURES = [
  { emoji: '🤖', label: 'Unlimited AI dream interpretations' },
  { emoji: '📊', label: 'Pattern analysis & monthly reports' },
  { emoji: '🎯', label: '30-day Lucid Dreaming program' },
  { emoji: '🚫', label: 'Completely ad-free experience' },
  { emoji: '🔮', label: 'Full dream symbol dictionary (10K+)' },
  { emoji: '💬', label: 'Priority customer support' },
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
        { text: 'Let\'s Go!', onPress: () => router.back() },
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
      Alert.alert('No Purchase Found', 'No active subscription found.');
    }
  };

  const plans: { key: PlanKey; name: string; badge?: string; saving?: string }[] = [
    { key: 'annual', name: 'Annual', badge: 'BEST VALUE', saving: 'Save 42% · $2.92/mo' },
    { key: 'monthly', name: 'Monthly', saving: 'Billed monthly' },
    { key: 'lifetime', name: 'Lifetime', saving: 'Pay once, own forever' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a0a3a', '#2d1060', '#1a0a3a']} style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>LUCID PRO</Text>
          <Text style={styles.heroSub}>Unlock the full power of your dream world</Text>
        </LinearGradient>

        <View style={styles.featuresCard}>
          {FEATURES.map(({ emoji, label }) => (
            <View key={label} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{emoji}</Text>
              <Text style={styles.featureLabel}>{label}</Text>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ))}
        </View>

        <Text style={styles.plansTitle}>Choose your plan</Text>
        <View style={styles.plansContainer}>
          {plans.map(({ key, name, badge, saving }) => (
            <TouchableOpacity
              key={key} onPress={() => setSelectedPlan(key)} activeOpacity={0.8}
              style={[styles.planCard, selectedPlan === key && styles.planCardSelected]}
            >
              {badge && (
                <View style={styles.planBadge}><Text style={styles.planBadgeText}>{badge}</Text></View>
              )}
              <Text style={[styles.planName, selectedPlan === key && { color: COLORS.primary }]}>{name}</Text>
              <Text style={[styles.planPrice, selectedPlan === key && { color: COLORS.primary }]}>
                {getPriceString(key)}
              </Text>
              {saving && <Text style={styles.planSaving}>{saving}</Text>}
              {selectedPlan === key && (
                <View style={styles.planCheck}><Text style={styles.planCheckText}>✓</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handlePurchase} disabled={isPurchasing || isLoading} activeOpacity={0.9}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaTitle}>
                  {selectedPlan === 'lifetime' ? 'Buy Lifetime Access' : 'Start 7-Day Free Trial'}
                </Text>
                <Text style={styles.ctaSub}>
                  {selectedPlan === 'lifetime' ? 'No subscription, ever' : `Then ${getPriceString(selectedPlan)} · Cancel anytime`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} disabled={isRestoring} style={styles.restoreBtn}>
          {isRestoring
            ? <ActivityIndicator size="small" color={COLORS.textMuted} />
            : <Text style={styles.restoreText}>Restore Purchases</Text>}
        </TouchableOpacity>

        <Text style={styles.legal}>
          Payment via {Platform.OS === 'ios' ? 'Apple App Store' : 'Google Play'}.
          {selectedPlan !== 'lifetime' && ' Free trial auto-renews. Cancel anytime in Settings.'}
        </Text>

        <View style={styles.trustRow}>
          {['🔒 Secure', '✅ No Ads', '💜 Cancel Anytime'].map(t => (
            <Text key={t} style={styles.trustItem}>{t}</Text>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  closeBtn: { position: 'absolute', top: 60, right: SPACING.lg, zIndex: 10, padding: SPACING.sm },
  closeText: { fontSize: FONT_SIZES.lg, color: COLORS.textMuted },
  scroll: { paddingHorizontal: SPACING.lg },
  hero: { borderRadius: RADIUS.xl, padding: SPACING['2xl'], alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.lg, gap: SPACING.sm },
  heroEmoji: { fontSize: 60 },
  heroTitle: { fontSize: FONT_SIZES['4xl'], fontWeight: '900', color: COLORS.gold, letterSpacing: 5 },
  heroSub: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  featuresCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm, marginBottom: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  featureEmoji: { fontSize: 20, width: 28 },
  featureLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  checkmark: { color: COLORS.success, fontWeight: '800', fontSize: FONT_SIZES.lg },
  plansTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm },
  plansContainer: { gap: SPACING.sm, marginBottom: SPACING.lg },
  planCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.border, position: 'relative' },
  planCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0d' },
  planBadge: { position: 'absolute', top: -10, right: SPACING.md, backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  planBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  planName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4 },
  planPrice: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.text },
  planSaving: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  planCheck: { position: 'absolute', right: SPACING.md, top: SPACING.lg, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  planCheckText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  ctaBtn: { borderRadius: RADIUS.xl, padding: SPACING.lg + 4, alignItems: 'center', gap: 4, marginBottom: SPACING.md },
  ctaTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.75)' },
  restoreBtn: { alignItems: 'center', padding: SPACING.sm, marginBottom: SPACING.sm },
  restoreText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  legal: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.md },
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.lg },
  trustItem: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
});
