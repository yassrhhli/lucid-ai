import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useInterpretation } from '@/hooks/useInterpretation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import type { Dream } from '@/types/dream';

interface InterpretationCardProps {
  dream: Dream;
  onSuccess?: () => void;
}

export function InterpretationCard({ dream, onSuccess }: InterpretationCardProps) {
  const { isPro, profile } = useAuth();
  const { isLoading, error, quotaExceeded, quotaInfo, interpret } = useInterpretation();
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  const weeklyUsed = profile?.interpretation_count_week ?? 0;
  const weeklyLimit = 3;
  const remaining = Math.max(0, weeklyLimit - weeklyUsed);
  const hasQuota = isPro || remaining > 0;

  const handleInterpret = async () => {
    const result = await interpret(dream.id);
    if (result) onSuccess?.();
  };

  // Quota épuisé — afficher upsell
  if (quotaExceeded) {
    return (
      <View style={styles.quotaCard}>
        <Ionicons name="flash" size={32} color="#fbbf24" />
        <Text style={styles.quotaTitle}>Weekly Limit Reached</Text>
        <Text style={styles.quotaSub}>
          You've used all {weeklyLimit} free interpretations this week.
          {quotaInfo && ` Resets in ${getDaysUntil(quotaInfo.resets_at)} days.`}
        </Text>

        <View style={styles.quotaOptions}>
          <Button
            title="Upgrade to Pro"
            onPress={() => router.push('/paywall')}
            variant="gold"
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => setShowRewardedAd(true)}
            style={styles.rewardedBtn}
          >
            <Text style={styles.rewardedText}>
              📺 Watch an ad for 1 free interpretation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Chargement en cours
  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingTitle}>Analyzing your dream...</Text>
        <Text style={styles.loadingSub}>
          Our AI is exploring the symbols, archetypes and emotions hidden in your dream.
        </Text>
        <View style={styles.steps}>
          {['Identifying symbols', 'Analyzing emotions', 'Finding archetypes', 'Crafting insights'].map(
            (step, i) => (
              <View key={step} style={styles.step}>
                <ActivityIndicator size="small" color={COLORS.primary} style={{ opacity: 0.6 }} />
                <Text style={styles.stepText}>{step}...</Text>
              </View>
            )
          )}
        </View>
      </View>
    );
  }

  // Erreur
  if (error) {
    return (
      <View style={styles.errorCard}>
        <Ionicons name="warning-outline" size={32} color="#f87171" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={handleInterpret} variant="secondary" size="md" />
      </View>
    );
  }

  // CTA principal
  return (
    <View style={styles.ctaCard}>
      <View style={styles.ctaHeader}>
        <Ionicons name="sparkles" size={32} color="#a78bfa" />
        <View style={styles.ctaTexts}>
          <Text style={styles.ctaTitle}>AI Dream Interpretation</Text>
          <Text style={styles.ctaSub}>
            Uncover symbols, archetypes & psychological insights
          </Text>
        </View>
      </View>

      {/* Quota indicator (free users) */}
      {!isPro && (
        <View style={styles.quotaIndicator}>
          <View style={styles.quotaBar}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.quotaDot,
                  i <= weeklyUsed ? styles.quotaDotUsed : styles.quotaDotFree,
                ]}
              />
            ))}
          </View>
          <Text style={styles.quotaLabel}>
            {remaining > 0
              ? `${remaining} free interpretation${remaining !== 1 ? 's' : ''} left this week`
              : 'No free interpretations left this week'}
          </Text>
        </View>
      )}

      {hasQuota ? (
        <Button
          title={isPro ? 'Interpret This Dream' : `Interpret (${remaining} left)`}
          onPress={handleInterpret}
          isLoading={isLoading}
          fullWidth
          size="lg"
        />
      ) : (
        <View style={styles.noQuotaActions}>
          <Button
            title="Get Unlimited with Pro"
            onPress={() => router.push('/paywall')}
            variant="gold"
            fullWidth
            size="lg"
          />
          <TouchableOpacity style={styles.rewardedBtn}>
            <Text style={styles.rewardedText}>Watch ad for 1 free interpretation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const styles = StyleSheet.create({
  ctaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  ctaHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  ctaEmoji: { fontSize: 36 },
  ctaTexts: { flex: 1 },
  ctaTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  ctaSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2, lineHeight: 18 },
  quotaIndicator: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  quotaBar: { flexDirection: 'row', gap: 6 },
  quotaDot: { width: 10, height: 10, borderRadius: 5 },
  quotaDotFree: { backgroundColor: COLORS.primary },
  quotaDotUsed: { backgroundColor: COLORS.border },
  quotaLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, flex: 1 },
  noQuotaActions: { gap: SPACING.sm },
  rewardedBtn: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rewardedText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  loadingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    gap: SPACING.md,
  },
  loadingTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  loadingSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  steps: { width: '100%', gap: SPACING.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '44',
    gap: SPACING.sm,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  errorText: { fontSize: FONT_SIZES.sm, color: COLORS.error, textAlign: 'center' },
  quotaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
    gap: SPACING.md,
  },
  quotaEmoji: { fontSize: 40 },
  quotaTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  quotaSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  quotaOptions: { width: '100%', gap: SPACING.sm },
});
