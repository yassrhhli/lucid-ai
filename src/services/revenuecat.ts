import Purchases, {
  PurchasesOffering,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { CONFIG } from '@/constants/config';
import { supabase } from './supabase';

export async function initRevenueCat(userId: string): Promise<void> {
  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    const apiKey = Platform.OS === 'ios'
      ? CONFIG.revenuecat.iosKey
      : CONFIG.revenuecat.androidKey;

    await Purchases.configure({ apiKey, appUserID: userId });

    // Sync avec Supabase via webhook (configuré dans RevenueCat dashboard)
    console.log('[RevenueCat] Initialized for user:', userId);
  } catch (error) {
    console.error('[RevenueCat] Init error:', error);
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (error) {
    console.error('[RevenueCat] getOfferings error:', error);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('[RevenueCat] getCustomerInfo error:', error);
    return null;
  }
}

export async function purchasePackage(packageToBuy: any): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  userCancelled?: boolean;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
    await syncProStatus(customerInfo);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, userCancelled: true };
    }
    console.error('[RevenueCat] purchasePackage error:', error);
    return { success: false, error: error.message };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  isPro: boolean;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = checkIsPro(customerInfo);
    await syncProStatus(customerInfo);
    return { success: true, isPro };
  } catch (error: any) {
    console.error('[RevenueCat] restorePurchases error:', error);
    return { success: false, isPro: false, error: error.message };
  }
}

export function checkIsPro(customerInfo: CustomerInfo): boolean {
  return (
    typeof customerInfo.entitlements.active['pro'] !== 'undefined'
  );
}

// Sync le statut pro avec Supabase
async function syncProStatus(customerInfo: CustomerInfo): Promise<void> {
  const isPro = checkIsPro(customerInfo);
  const proEntitlement = customerInfo.entitlements.active['pro'];
  const expiresAt = proEntitlement?.expirationDate ?? null;

  const { error } = await supabase
    .from('profiles')
    .update({
      is_pro: isPro,
      pro_expires_at: expiresAt,
    })
    .eq('id', (await supabase.auth.getUser()).data.user?.id);

  if (error) {
    console.error('[RevenueCat] syncProStatus error:', error);
  }
}
