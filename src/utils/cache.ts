import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'lucid-cache' });

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export const cache = {
  set<T>(key: string, data: T, ttlMs: number): void {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    try {
      storage.set(key, JSON.stringify(entry));
    } catch (error) {
      console.warn('[Cache] set error:', key, error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const raw = storage.getString(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        storage.delete(key);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  },

  delete(key: string): void {
    storage.delete(key);
  },

  clear(): void {
    storage.clearAll();
  },

  // Clés nommées pour éviter les fautes de frappe
  keys: {
    dreamList: (userId: string) => `dreams:${userId}`,
    userProfile: (userId: string) => `profile:${userId}`,
    offerings: 'revenuecat:offerings',
    symbolSearch: (query: string) => `symbols:${query.toLowerCase()}`,
  },
};
