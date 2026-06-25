import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { initRevenueCat } from '@/services/revenuecat';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/dream';

interface AuthState {
  user:            User | null;
  profile:         Profile | null;
  session:         Session | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  isPro:           boolean;

  initialize:       () => Promise<void>;
  signIn:           (email: string, password: string) => Promise<void>;
  signUp:           (email: string, password: string, username?: string) => Promise<void>;
  signOut:          () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple:  () => Promise<void>;
  refreshProfile:   () => Promise<void>;
  updateProfile:    (updates: Partial<Profile>) => Promise<void>;
}

// ── Helper module-level (non exposé dans le store) ────────────
async function loadUserProfile(
  user: User,
  session: Session,
  set: (state: Partial<AuthState>) => void,
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  set({
    user,
    session,
    profile:         profile ?? null,
    isAuthenticated: true,
    isPro:           profile?.is_pro ?? false,
    isLoading:       false,
  });

  // RevenueCat en background — non bloquant
  initRevenueCat(user.id).catch(() => {});
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  profile:         null,
  session:         null,
  isAuthenticated: false,
  isLoading:       true,
  isPro:           false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user, session, set);
      } else {
        set({ isLoading: false });
      }

      // Écouter les changements d'auth (token refresh, signout, etc.)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user, session, set);
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null, profile: null, session: null,
            isAuthenticated: false, isPro: false, isLoading: false,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({ session });
        }
      });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    // onAuthStateChange → SIGNED_IN gère le reste
  },

  signUp: async (email: string, password: string, username?: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { username: username?.trim() ?? email.split('@')[0] },
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null, profile: null, session: null,
      isAuthenticated: false, isPro: false,
    });
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'lucidai://auth/callback' },
    });
    if (error) throw error;
  },

  signInWithApple: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: 'lucidai://auth/callback' },
    });
    if (error) throw error;
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profile) {
      set({ profile, isPro: profile.is_pro ?? false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;
    set(state => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
      isPro: updates.is_pro !== undefined ? updates.is_pro : state.isPro,
    }));
  },
}));
