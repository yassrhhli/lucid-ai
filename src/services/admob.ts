// AdMob mock — react-native-google-mobile-ads désactivé temporairement

export const AD_UNIT_IDS = {
  banner: 'ca-app-pub-3940256099942544/2934735716',
  interstitial: 'ca-app-pub-3940256099942544/4411468910',
  rewarded: 'ca-app-pub-3940256099942544/1712485313',
};

export async function initAdMob(): Promise<void> {
  console.log('[AdMob] Mock — désactivé temporairement');
}

export function preloadInterstitial(): void {}

export async function showInterstitial(force = false): Promise<boolean> {
  return false;
}

export async function showRewardedAd(): Promise<boolean> {
  return false;
}

export const BannerAdSize = {
  BANNER: 'BANNER',
  FULL_BANNER: 'FULL_BANNER',
  LARGE_BANNER: 'LARGE_BANNER',
};

export const BannerAd = () => null;
