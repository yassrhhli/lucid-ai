import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { AuthUser, Profile } from '@/types/user';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({
          session,
          user: {
            id: session.user.id,
            email: session.user.email ?? null,
            profile,
          },
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }

      // Écoute les changements d'auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({
            session,
            user: {
              id: session.user.id,
              email: session.user.email ?? null,
              profile,
            },
          });
        } else if (event === 'SIGNED_OUT') {
          set({ session: null, user: null });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({ session });
        }
      });
    } catch (error) {
      console.error('[AuthStore] Initialize error:', error);
      set({ isInitialized: true });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'lucidai://auth/callback',
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email de confirmation envoyé
        throw new Error('CHECK_EMAIL');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const profile = await fetchProfile(data.user.id);
      set({
        session: data.session,
        user: {
          id: data.user.id,
          email: data.user.email ?? null,
          profile,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'lucidai://auth/callback',
        },
      });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'lucidai://auth/callback',
        },
      });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'lucidai://auth/reset-password',
      });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    set({
      user: {
        ...user,
        profile: data as Profile,
      },
    });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const profile = await fetchProfile(user.id);
    set({ user: { ...user, profile } });
  },
}));

// Helper interne
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Profil inexistant → le créer (premier login)
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select()
        .single();

      if (createError) {
        console.error('[AuthStore] Profile creation error:', createError);
        return null;
      }
      return newProfile as Profile;
    }
    console.error('[AuthStore] fetchProfile error:', error);
    return null;
  }

  return data as Profile;
}
