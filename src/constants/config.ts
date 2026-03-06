import { Platform } from 'react-native';

export const CONFIG = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  },

  revenuecat: {
    iosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
    androidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
  },

  admob: {
    bannerId: Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS!,
      android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID!,
    })!,
    interstitialId: Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS!,
      android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_ANDROID!,
    })!,
    rewardedId: Platform.select({
      ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_IOS!,
      android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID!,
    })!,
  },

  limits: {
    freeInterpretationsPerWeek: 3,
    maxDreamLength: 5000,
    maxTitleLength: 100,
    interstitialCooldownMs: 5 * 60 * 1000, // 5 minutes entre interstitiels
  },

  cache: {
    interpretationTtlMs: 24 * 60 * 60 * 1000, // 24h
    dreamListTtlMs: 5 * 60 * 1000,             // 5 min
  },
} as const;
