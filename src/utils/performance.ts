import { useCallback, useRef, useMemo } from 'react';

/**
 * useStableCallback — version stable d'une fonction pour éviter
 * les re-renders inutiles dans les composants enfants
 */
export function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}

/**
 * usePrevious — retourne la valeur précédente
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  const previous = ref.current;
  ref.current = value;
  return previous;
}

/**
 * keyExtractor stable pour FlashList / FlatList
 */
export const dreamKeyExtractor = (item: { id: string }) => item.id;
export const feedKeyExtractor = (item: { id: string }) => `feed-${item.id}`;

/**
 * Calcule le nombre estimé d'items visibles pour FlashList
 */
export function estimatedItemSize(
  itemHeight: number,
  screenHeight: number = 800
): number {
  return Math.ceil(screenHeight / itemHeight) + 2;
}

/**
 * Chunk array pour le rendu progressif
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Tronquer le texte proprement sur un mot complet
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.8 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
