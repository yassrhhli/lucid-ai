import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '@/constants/config';

// Adapter SecureStore pour Supabase Auth (stockage sécurisé des tokens)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  CONFIG.supabase.url,
  CONFIG.supabase.anonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-app-version': '1.0.0',
      },
    },
  }
);

// Helper pour les erreurs Supabase
export function getSupabaseErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred';
}
