import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    user,
    session,
    isLoading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    updateProfile,
    refreshProfile,
  } = useAuthStore();

  return {
    user,
    session,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
    isPro: user?.profile?.is_pro ?? false,
    profile: user?.profile ?? null,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    updateProfile,
    refreshProfile,
  };
}
