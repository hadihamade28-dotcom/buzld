import { Platform } from 'react-native';

/** Vicino — unified Hinge/Tinder dating UI */

export const colors = {
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEFF2',
  surfaceElevated: '#FFFFFF',
  ink: '#1A1A1A',

  text: '#1A1A1A',
  textSecondary: '#5C5C63',
  textMuted: '#AEAEB2',
  textOnPhoto: '#FFFFFF',
  foam: '#1A1A1A',
  fog: '#5C5C63',
  muted: '#AEAEB2',

  mist: '#E8E8ED',
  surfaceRaised: '#FFFFFF',

  // Tinder flame
  rose: '#FE3C72',
  roseDeep: '#E91E63',
  roseSoft: 'rgba(254, 60, 114, 0.12)',
  coral: '#FF655B',
  amber: '#FF7854',
  amberDeep: '#FE3C72',

  // Hinge accent
  hinge: '#7B61FF',
  hingeSoft: 'rgba(123, 97, 255, 0.12)',

  like: '#FE3C72',
  likeGreen: '#44D62C',
  pass: '#D1D1D6',
  passIcon: '#FF4458',
  superLike: '#1EC9FF',

  success: '#34C759',
  danger: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayLight: 'rgba(0, 0, 0, 0.35)',

  border: 'rgba(0, 0, 0, 0.07)',
  borderStrong: 'rgba(0, 0, 0, 0.14)',
  glass: '#F2F2F7',
  glassStrong: '#E5E5EA',
  white: '#FFFFFF',
  black: '#000000',
};

export const gradients = {
  flame: ['#FE3C72', '#FF655B'] as const,
  flameVertical: ['#FF655B', '#FE3C72'] as const,
  flameSoft: ['rgba(254,60,114,0.14)', 'rgba(255,101,91,0.08)'] as const,
  cardScrim: ['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.78)'] as const,
  hero: ['#FFF0F5', '#FFFFFF', '#F5F5F7'] as const,
  screen: ['#FFFFFF', '#F5F5F7'] as const,
  orb: ['#FE3C72', '#FF655B', '#FF8A65'] as const,
  chipActive: ['#FE3C72', '#FF655B'] as const,
  profileHero: ['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.72)'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  card: 20,
  full: 999,
};

export const fonts = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_500Medium',
  body: 'Outfit_400Regular',
  bodyMedium: 'Outfit_500Medium',
  bodyBold: 'Outfit_700Bold',
  serif: 'Fraunces_700Bold',
};

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 38, lineHeight: 44, color: colors.text, letterSpacing: -1.2 },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.text, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.text, letterSpacing: -0.4 },
  h3: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 24, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  bodySm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.rose,
  },
};

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16 },
    android: { elevation: 5 },
    default: {},
  }),
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 28 },
    android: { elevation: 8 },
    default: {},
  }),
  glow: Platform.select({
    ios: { shadowColor: colors.rose, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 18 },
    android: { elevation: 8 },
    default: {},
  }),
  tabBar: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16 },
    android: { elevation: 16 },
    default: {},
  }),
  float: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 24 },
    android: { elevation: 10 },
    default: {},
  }),
};

export const layout = {
  mobileMaxWidth: 430,
  tabBarHeight: 72,
  tabBarInset: 100,
  cardHeight: 520,
};

export const VICINO_BLE_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const DEFAULT_RADIUS_M = 150;
export const BLE_RSSI_THRESHOLD = -70;
