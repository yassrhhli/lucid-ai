import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    user,
    profile,
    session,
    isLoading,
    isInitialized,
    isPro,
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
    isPro,
    profile,
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
