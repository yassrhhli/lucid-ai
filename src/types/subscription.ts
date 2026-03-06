export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isPro: boolean;
  expiresAt: string | null;
  interpretationsRemaining: number; // -1 = illimité
}

export const SUBSCRIPTION_LIMITS = {
  free: {
    interpretationsPerWeek: 3,
    patternsAccess: false,
    lucidTraining: false,
    adFree: false,
  },
  pro: {
    interpretationsPerWeek: -1, // illimité
    patternsAccess: true,
    lucidTraining: true,
    adFree: true,
  },
} as const;

export const SUBSCRIPTION_PRODUCTS = {
  monthly: 'lucid_pro_monthly',    // $4.99/mois
  annual: 'lucid_pro_annual',      // $34.99/an
  lifetime: 'lucid_pro_lifetime',  // $79 one-time
} as const;
