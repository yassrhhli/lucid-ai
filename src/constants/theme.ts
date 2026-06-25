// ─── LUCID AI — Design System v2 ────────────────────────────────────────────
// Direction: "Cosmic Depth" — dark luxury, deep navy-black + electric violet
// Signature: glassmorphic cards avec border lumineux, micro-gradients subtils

import { Platform } from 'react-native';

export const COLORS = {
  // ── Core backgrounds ──────────────────────────────────────────────────────
  background:        '#060610',   // Near-black with blue undertone
  backgroundDeep:    '#030308',   // Deepest — headers, modals
  surface:           '#0e0e1f',   // Cards, panels
  surfaceElevated:   '#161628',   // Elevated cards
  surfaceGlass:      'rgba(14, 14, 31, 0.72)', // Glassmorphic

  // ── Brand — Electric Violet System ────────────────────────────────────────
  primary:           '#7B5EA7',   // Refined violet (less saturated, more luxury)
  primaryBright:     '#9D7FD4',   // Interactive highlight
  primaryGlow:       'rgba(123, 94, 167, 0.2)',
  primaryGlowStrong: 'rgba(123, 94, 167, 0.4)',
  accent:            '#B48EF0',   // Light violet for icons
  accentSoft:        '#D4BBFF',   // Very light for selected states

  // ── Teal accent (complément froid) ────────────────────────────────────────
  teal:              '#2DD4BF',
  tealGlow:          'rgba(45, 212, 191, 0.15)',

  // ── Gold premium ──────────────────────────────────────────────────────────
  gold:              '#E9B84A',
  goldLight:         '#F5D07A',
  goldGlow:          'rgba(233, 184, 74, 0.15)',

  // ── Text ──────────────────────────────────────────────────────────────────
  text:              '#F0EEFF',   // Slightly violet-white
  textSecondary:     '#8B88B0',
  textMuted:         '#4E4B6E',
  textInverse:       '#060610',

  // ── Semantic ──────────────────────────────────────────────────────────────
  success:           '#22D3A5',
  warning:           '#F59E0B',
  error:             '#F56565',
  info:              '#60A5FA',

  // ── Emotions ──────────────────────────────────────────────────────────────
  emotions: {
    joy:        '#FBBF24',
    fear:       '#818CF8',
    anxiety:    '#FB923C',
    peace:      '#34D399',
    sadness:    '#60A5FA',
    excitement: '#F472B6',
    confusion:  '#A78BFA',
    anger:      '#F87171',
    love:       '#FB7185',
    wonder:     '#C4B5FD',
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  border:            'rgba(123, 94, 167, 0.18)',
  borderBright:      'rgba(123, 94, 167, 0.45)',
  borderSubtle:      'rgba(240, 238, 255, 0.06)',
  borderGlass:       'rgba(255, 255, 255, 0.08)',

  // ── Overlays ──────────────────────────────────────────────────────────────
  overlay:           'rgba(6, 6, 16, 0.88)',
  overlayLight:      'rgba(6, 6, 16, 0.55)',
} as const;

export const GRADIENTS = {
  primary:    ['#4A2D8A', '#7B5EA7'] as [string, string],
  heroButton: ['#5B3FA0', '#8B6AC4', '#7B5EA7'] as [string, string, string],
  gold:       ['#C98B2A', '#E9B84A', '#F5D07A'] as [string, string, string],
  surface:    ['#0e0e1f', '#12112a'] as [string, string],
  cardGlow:   ['rgba(123,94,167,0.12)', 'rgba(123,94,167,0.02)'] as [string, string],
  dreamCard:  ['#0f0e22', '#0b0b1a'] as [string, string],
  teal:       ['#0D7A72', '#2DD4BF'] as [string, string],
  dark:       ['#0a0918', '#060610'] as [string, string],
} as const;

export const FONTS = {
  regular:  'Inter-Regular',
  medium:   'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold:     'Inter-Bold',
  mono:     'SpaceMono-Regular',
} as const;

export const FONT_SIZES = {
  '2xs': 10,
  xs:    11,
  sm:    13,
  md:    15,
  lg:    17,
  xl:    20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const SPACING = {
  '2xs': 2,
  xs:    4,
  sm:    8,
  md:    16,
  lg:    24,
  xl:    32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  '2xl':36,
  full: 9999,
} as const;

// Shadows — toujours violet pour cohérence de marque
export const SHADOWS = {
  sm: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  lg: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
  },
  gold: {
    shadowColor: '#E9B84A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Glassmorphism helper
export const GLASS = {
  card: {
    backgroundColor: 'rgba(14, 14, 31, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  cardBright: {
    backgroundColor: 'rgba(22, 22, 40, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(123, 94, 167, 0.25)',
  },
} as const;
