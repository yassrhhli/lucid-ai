import { useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuth } from '@/hooks/useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const store = useSubscriptionStore();

  useEffect(() => {
    if (user?.id && !store.customerInfo) {
      store.initialize(user.id);
    }
  }, [user?.id]);

  return {
    isPro: store.isPro,
    isLoading: store.isLoading,
    isPurchasing: store.isPurchasing,
    isRestoring: store.isRestoring,
    offering: store.offering,
    error: store.error,
    loadOffering: store.loadOffering,
    purchase: store.purchase,
    restore: store.restore,
    clearError: store.clearError,
  };
}
