import React from 'react';
import { View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

interface BannerAdComponentProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle';
  style?: object;
}

export function BannerAdComponent({ size = 'banner', style }: BannerAdComponentProps) {
  const { isPro } = useAuth();
  if (isPro) return null;
  // AdMob désactivé temporairement — placeholder invisible
  return <View style={[{ height: 0 }, style]} />;
}
