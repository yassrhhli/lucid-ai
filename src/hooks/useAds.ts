import { useCallback } from 'react';
import { useAdStore } from '@/stores/adStore';
import { useAuth } from '@/hooks/useAuth';

export function useAds() {
  const { isPro } = useAuth();
  const store = useAdStore();

  // Ne jamais afficher de pub aux users Pro
  const showInterstitial = useCallback(
    async (force = false): Promise<boolean> => {
      if (isPro) return false;
      return store.showInterstitialIfReady(force);
    },
    [isPro]
  );

  const showRewardedForInterpretation = useCallback(async (): Promise<boolean> => {
    if (isPro) return true; // Pro = pas besoin de pub
    return store.showRewardedForInterpretation();
  }, [isPro]);

  return {
    isPro,
    showInterstitial,
    showRewardedForInterpretation,
    interstitialCount: store.interstitialCount,
    rewardedEarned: store.rewardedEarned,
  };
}
