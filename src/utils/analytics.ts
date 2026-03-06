// Analytics service — compatible Mixpanel, PostHog, ou Amplitude
// Swapper l'implémentation sans changer les call sites

const IS_DEV = __DEV__;

// Remplacer par : import { Mixpanel } from 'mixpanel-react-native';
// ou : import PostHog from 'posthog-react-native';

type EventProperties = Record<string, string | number | boolean | null>;

class Analytics {
  private userId: string | null = null;
  private sessionStart = Date.now();

  identify(userId: string, traits?: EventProperties) {
    this.userId = userId;
    if (IS_DEV) {
      console.log('[Analytics] identify:', userId, traits);
      return;
    }
    // Mixpanel.identify(userId);
    // if (traits) Mixpanel.getPeople().set(traits);
  }

  track(event: string, properties?: EventProperties) {
    const payload = {
      ...properties,
      user_id: this.userId,
      session_duration_s: Math.floor((Date.now() - this.sessionStart) / 1000),
      timestamp: new Date().toISOString(),
    };

    if (IS_DEV) {
      console.log(`[Analytics] ${event}:`, payload);
      return;
    }
    // Mixpanel.track(event, payload);
  }

  screen(screenName: string, properties?: EventProperties) {
    this.track('Screen View', { screen: screenName, ...properties });
  }

  reset() {
    this.userId = null;
    // Mixpanel.reset();
  }
}

export const analytics = new Analytics();

// ============================================================
// EVENTS CATALOGUÉS — toujours utiliser ces constantes
// ============================================================
export const EVENTS = {
  // Auth
  SIGN_UP: 'Sign Up',
  SIGN_IN: 'Sign In',
  SIGN_OUT: 'Sign Out',

  // Dreams
  DREAM_CREATED: 'Dream Created',
  DREAM_EDITED: 'Dream Edited',
  DREAM_DELETED: 'Dream Deleted',
  DREAM_SHARED: 'Dream Shared',

  // AI
  INTERPRETATION_REQUESTED: 'Interpretation Requested',
  INTERPRETATION_COMPLETED: 'Interpretation Completed',
  INTERPRETATION_QUOTA_HIT: 'Interpretation Quota Hit',

  // Monetization
  PAYWALL_VIEWED: 'Paywall Viewed',
  PAYWALL_DISMISSED: 'Paywall Dismissed',
  PURCHASE_INITIATED: 'Purchase Initiated',
  PURCHASE_COMPLETED: 'Purchase Completed',
  PURCHASE_FAILED: 'Purchase Failed',
  RESTORE_ATTEMPTED: 'Restore Attempted',

  // Ads
  INTERSTITIAL_SHOWN: 'Interstitial Shown',
  REWARDED_STARTED: 'Rewarded Started',
  REWARDED_COMPLETED: 'Rewarded Completed',
  REWARDED_SKIPPED: 'Rewarded Skipped',

  // Engagement
  STREAK_UPDATED: 'Streak Updated',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  NOTIFICATION_ENABLED: 'Notification Enabled',
  FEED_POST_CREATED: 'Feed Post Created',
  FEED_POST_VOTED: 'Feed Post Voted',
} as const;
