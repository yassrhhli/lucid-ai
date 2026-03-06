import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { requestNotificationPermission, scheduleDreamReminder } from '@/utils/notifications';
import { analytics, EVENTS } from '@/utils/analytics';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🌙',
    title: 'Welcome to\nLucid AI',
    subtitle: 'Your personal AI dream analyst. Decode the hidden language of your subconscious mind.',
    bg: ['#0a0a0f', '#12092a'] as [string, string],
  },
  {
    emoji: '✍️',
    title: 'Record Your\nDreams',
    subtitle: 'Log dreams each morning before they fade. Voice recording or text — whatever feels natural.',
    bg: ['#0a0a0f', '#0a1a2a'] as [string, string],
  },
  {
    emoji: '🤖',
    title: 'AI Interprets\nYour Dreams',
    subtitle: 'Our AI analyzes symbols, archetypes, and emotions using Jungian psychology and neuroscience.',
    bg: ['#0a0a0f', '#1a0a2a'] as [string, string],
  },
  {
    emoji: '📊',
    title: 'Discover\nYour Patterns',
    subtitle: 'Track recurring themes, symbols, and emotions to understand your deeper self over time.',
    bg: ['#0a0a0f', '#0a1a1a'] as [string, string],
  },
  {
    emoji: '🔔',
    title: 'Never Forget\nA Dream',
    subtitle: "We'll send you a gentle reminder each morning to capture your dreams while they're fresh.",
    bg: ['#0a0a0f', '#1a0f0a'] as [string, string],
    isFinal: true,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { updateProfile } = useAuth();

  const isLast = currentIndex === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      handleFinish();
      return;
    }
    const next = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Demander permission notifications
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDreamReminder(8, 0);
      }

      // Marquer l'onboarding comme complété
      await updateProfile({ onboarding_completed: true });

      analytics.track(EVENTS.ONBOARDING_COMPLETED, {
        notifications_granted: granted,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Onboarding] finish error:', error);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
    } catch {}
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
    <LinearGradient
      colors={item.bg}
      style={styles.slide}
    >
      <View style={styles.slideContent}>
        <Text style={styles.slideEmoji}>{item.emoji}</Text>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

        {item.isFinal && (
          <View style={styles.notifCard}>
            <Text style={styles.notifEmoji}>⏰</Text>
            <View>
              <Text style={styles.notifTitle}>Morning Dream Reminder</Text>
              <Text style={styles.notifSub}>Every day at 8:00 AM — customizable</Text>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={styles.flatList}
      />

      {/* Dots indicator */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <Button
          title={isLast ? '🔔 Enable Reminders & Start' : 'Continue'}
          onPress={goNext}
          isLoading={isLoading}
          fullWidth
          size="lg"
          variant={isLast ? 'primary' : 'primary'}
        />
        {isLast && (
          <TouchableOpacity onPress={handleFinish} style={styles.noThanksBtn}>
            <Text style={styles.noThanksText}>No thanks, skip notifications</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  skipBtn: {
    position: 'absolute', top: 60, right: SPACING.lg,
    zIndex: 10, padding: SPACING.sm,
  },
  skipText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  flatList: { flex: 1 },
  slide: { width, flex: 1, justifyContent: 'center' },
  slideContent: {
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  slideEmoji: { fontSize: 96 },
  slideTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  slideSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginTop: SPACING.md,
  },
  notifEmoji: { fontSize: 32 },
  notifTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  notifSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  noThanksBtn: { alignItems: 'center', padding: SPACING.sm },
  noThanksText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
});
