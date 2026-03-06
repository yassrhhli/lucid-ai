export const COLORS = {
  // Backgrounds
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceElevated: '#1a1a26',
  card: '#16162a',

  // Brand
  primary: '#7c3aed',        // Violet profond
  primaryLight: '#9d5ff5',
  primaryDark: '#5b21b6',
  accent: '#c084fc',

  // Gold (premium)
  gold: '#f59e0b',
  goldLight: '#fcd34d',

  // Text
  text: '#f8f8ff',
  textSecondary: '#9898b8',
  textMuted: '#5a5a7a',
  textInverse: '#0a0a0f',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Emotions
  emotions: {
    joy: '#fbbf24',
    fear: '#6366f1',
    anxiety: '#f97316',
    peace: '#34d399',
    sadness: '#60a5fa',
    excitement: '#f472b6',
    confusion: '#a78bfa',
    anger: '#ef4444',
    love: '#fb7185',
    wonder: '#818cf8',
  },

  // Borders
  border: '#2a2a3e',
  borderLight: '#3a3a54',

  // Overlay
  overlay: 'rgba(10, 10, 15, 0.85)',
  overlayLight: 'rgba(10, 10, 15, 0.5)',
} as const;

export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  mono: 'SpaceMono-Regular',
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;
