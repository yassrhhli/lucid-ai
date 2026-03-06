import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAds } from '@/hooks/useAds';

/**
 * Hook à placer dans les écrans clés pour déclencher
 * les interstitiels aux moments optimaux :
 * - Après la sauvegarde d'un rêve (retour à la liste)
 * - Après avoir lu une interprétation complète
 * - Après 3 navigations entre onglets
 */
export function useInterstitialTrigger(trigger: 'post_save' | 'post_read' | 'navigation') {
  const { showInterstitial, isPro } = useAds();
  const actionCount = useRef(0);

  const triggerIfReady = async () => {
    if (isPro) return;

    actionCount.current += 1;

    const shouldShow =
      trigger === 'post_save' ||
      trigger === 'post_read' ||
      (trigger === 'navigation' && actionCount.current % 3 === 0);

    if (shouldShow) {
      await showInterstitial();
    }
  };

  return { triggerIfReady };
}

/**
 * Manager global — à placer dans le Root Layout
 * Gère le préchargement et les triggers globaux
 */
export function useGlobalAdManager() {
  const { isPro } = useAds();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (isPro) return;

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      // Précharger quand l'app revient au premier plan
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        const { preloadInterstitial } = require('@/services/admob');
        preloadInterstitial();
      }
      appState.current = nextState;
    });

    return () => subscription?.remove();
  }, [isPro]);
}
