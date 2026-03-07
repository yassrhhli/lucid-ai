import mobileAds, {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

export { BannerAd, BannerAdSize };

const IS_TEST = __DEV__;

export const AD_UNIT_IDS = {
  banner: IS_TEST ? TestIds.BANNER : (process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS ?? TestIds.BANNER),
  interstitial: IS_TEST ? TestIds.INTERSTITIAL : (process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS ?? TestIds.INTERSTITIAL),
  rewarded: IS_TEST ? TestIds.REWARDED : (process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID_IOS ?? TestIds.REWARDED),
};

export async function initAdMob(): Promise<void> {
  try {
    await mobileAds().initialize();
    console.log('[AdMob] Initialized ✅');
  } catch (e) {
    console.warn('[AdMob] Init error:', e);
  }
}

let interstitial: InterstitialAd | null = null;

export function preloadInterstitial(): void {
  try {
    interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
    interstitial.load();
  } catch (e) {
    console.warn('[AdMob] preloadInterstitial error:', e);
  }
}

export async function showInterstitial(force = false): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!interstitial) { preloadInterstitial(); resolve(false); return; }
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial?.show();
        resolve(true);
      });
      interstitial.addAdEventListener(AdEventType.ERROR, () => resolve(false));
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        preloadInterstitial();
      });
    } catch (e) {
      resolve(false);
    }
  });
}

export async function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded);
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => rewarded.show());
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => resolve(true));
      rewarded.addAdEventListener(AdEventType.ERROR, () => resolve(false));
      rewarded.load();
    } catch (e) {
      resolve(false);
    }
  });
}
