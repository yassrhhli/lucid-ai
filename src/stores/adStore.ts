import { create } from 'zustand';
import { showInterstitial, showRewardedAd, preloadInterstitial } from '@/services/admob';

interface AdState {
  interstitialCount: number;
  lastShownAt: number;
  rewardedEarned: number;

  showInterstitialIfReady: (force?: boolean) => Promise<boolean>;
  showRewardedForInterpretation: () => Promise<boolean>;
  incrementInterstitialCount: () => void;
}

export const useAdStore = create<AdState>((set, get) => ({
  interstitialCount: 0,
  lastShownAt: 0,
  rewardedEarned: 0,

  showInterstitialIfReady: async (force = false): Promise<boolean> => {
    const shown = await showInterstitial(force);
    if (shown) {
      set((state) => ({
        interstitialCount: state.interstitialCount + 1,
        lastShownAt: Date.now(),
      }));
    }
    return shown;
  },

  showRewardedForInterpretation: async (): Promise<boolean> => {
    const earned = await showRewardedAd();
    if (earned) {
      set((state) => ({ rewardedEarned: state.rewardedEarned + 1 }));
    }
    return earned;
  },

  incrementInterstitialCount: () => {
    set((state) => ({ interstitialCount: state.interstitialCount + 1 }));
  },
}));
