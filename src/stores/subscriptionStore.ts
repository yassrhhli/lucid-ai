import { create } from 'zustand';
import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import {
  initRevenueCat,
  getOfferings,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
  checkIsPro,
} from '@/services/revenuecat';

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  offering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  error: string | null;

  initialize: (userId: string) => Promise<void>;
  loadOffering: () => Promise<void>;
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPro: false,
  isLoading: false,
  isPurchasing: false,
  isRestoring: false,
  offering: null,
  customerInfo: null,
  error: null,

  initialize: async (userId: string) => {
    set({ isLoading: true });
    try {
      await initRevenueCat(userId);
      const customerInfo = await getCustomerInfo();
      if (customerInfo) {
        set({ customerInfo, isPro: checkIsPro(customerInfo) });
      }
    } catch (error: any) {
      console.error('[SubscriptionStore] initialize:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadOffering: async () => {
    try {
      const offering = await getOfferings();
      set({ offering });
    } catch (error: any) {
      console.error('[SubscriptionStore] loadOffering:', error);
    }
  },

  purchase: async (pkg: any): Promise<boolean> => {
    set({ isPurchasing: true, error: null });
    try {
      const result = await purchasePackage(pkg);
      if (result.success && result.customerInfo) {
        set({
          customerInfo: result.customerInfo,
          isPro: checkIsPro(result.customerInfo),
        });
        return true;
      }
      if (!result.userCancelled && result.error) {
        set({ error: result.error });
      }
      return false;
    } finally {
      set({ isPurchasing: false });
    }
  },

  restore: async (): Promise<boolean> => {
    set({ isRestoring: true, error: null });
    try {
      const result = await restorePurchases();
      if (result.success) {
        set({ isPro: result.isPro });
        return result.isPro;
      }
      set({ error: result.error ?? 'Restore failed' });
      return false;
    } finally {
      set({ isRestoring: false });
    }
  },

  clearError: () => set({ error: null }),
}));
