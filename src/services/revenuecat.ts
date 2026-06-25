import Purchases, {
  PurchasesOffering,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { CONFIG } from '@/constants/config';
import { supabase } from './supabase';

let _initialized = false;

// ── Initialiser RevenueCat (idempotent) ───────────────────────
export async function initRevenueCat(userId: string): Promise<void> {
  try {
    const apiKey = Platform.OS === 'ios'
      ? CONFIG.revenuecat.iosKey
      : CONFIG.revenuecat.androidKey;

    if (!apiKey) return; // Clé non configurée — dev/test sans RevenueCat

    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    await Purchases.configure({ apiKey, appUserID: userId });
    _initialized = true;
  } catch (err: any) {
    // Non bloquant — l'app fonctionne sans RevenueCat en fallback
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!_initialized) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!_initialized) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
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
    // Sync Supabase en background — non bloquant
    syncProStatus(customerInfo).catch(() => {});
    return { success: true, customerInfo };
  } catch (err: any) {
    if (err.userCancelled) return { success: false, userCancelled: true };
    return { success: false, error: err.message ?? 'Purchase failed' };
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
    syncProStatus(customerInfo).catch(() => {});
    return { success: true, isPro };
  } catch (err: any) {
    return { success: false, isPro: false, error: err.message };
  }
}

export function checkIsPro(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
}

// ── Sync local → Supabase après achat/restore ─────────────────
async function syncProStatus(customerInfo: CustomerInfo): Promise<void> {
  const isPro         = checkIsPro(customerInfo);
  const proEntitlement = customerInfo.entitlements.active['pro'];
  const expiresAt      = proEntitlement?.expirationDate ?? null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update({
    is_pro:         isPro,
    pro_expires_at: expiresAt,
  }).eq('id', user.id);
}
