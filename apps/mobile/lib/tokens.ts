export const colors = {
  // Core palette
  teal:        '#1A5C5A',
  tealDeep:    '#134543',
  tealNight:   '#0E2C2A',
  tealMid:     '#2A5A5A',
  tealSoft:    '#4F8584',
  clay:        '#A06A57',
  ink:         '#1F1B16',
  sand:        '#F5EFE6',
  paper:       '#FBF7EF',
  line:        '#E2D9C7',
  verified:    '#3F6A58',

  // UI
  white:       '#FFFFFF',
  transparent: 'transparent',

  // Glass surfaces (semi-transparent)
  glassPaper:  'rgba(236, 228, 214, 0.82)',
  glassWhite:  'rgba(255, 255, 255, 0.62)',
  glassDark:   'rgba(14, 44, 42, 0.72)',

  // Text on dark
  creamFull:   '#F5EFE6',
  cream60:     'rgba(245, 239, 230, 0.60)',
  cream40:     'rgba(245, 239, 230, 0.40)',

  // Text on light
  ink70:       'rgba(31, 27, 22, 0.70)',
  ink54:       'rgba(31, 27, 22, 0.54)',
  ink36:       'rgba(31, 27, 22, 0.36)',
} as const

export const fonts = {
  serif:  'CormorantGaramond_400Regular_Italic',
  serifMd: 'CormorantGaramond_600SemiBold',
  sans:   'DMSans_400Regular',
  sansMd: 'DMSans_500Medium',
  sansSb: 'DMSans_600SemiBold',
  sansBd: 'DMSans_700Bold',
} as const

export const type = {
  displayXl: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 48, lineHeight: 52, letterSpacing: -1 },
  displayLg: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 36, lineHeight: 40, letterSpacing: -0.8 },
  displayMd: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  displaySm: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },

  bodyLg:   { fontFamily: 'DMSans_400Regular', fontSize: 17, lineHeight: 27 },
  bodyMd:   { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 23 },
  bodySm:   { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 21 },

  labelLg:  { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22 },
  labelMd:  { fontFamily: 'DMSans_600SemiBold', fontSize: 13, lineHeight: 20 },
  labelSm:  { fontFamily: 'DMSans_600SemiBold', fontSize: 11, lineHeight: 17 },
  capsXs:   { fontFamily: 'DMSans_700Bold', fontSize: 10, lineHeight: 15, letterSpacing: 1.4, textTransform: 'uppercase' as const },
} as const

export const space = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  '3xl': 64,
} as const

export const radius = {
  sm:  8,
  md:  14,
  lg:  18,
  xl:  24,
  full: 999,
} as const

export const shadow = {
  card: {
    shadowColor: '#A06A57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  float: {
    shadowColor: '#A06A57',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 10,
  },
  subtle: {
    shadowColor: '#A06A57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
} as const

// Glass card border — uniform clay on all four sides
export const glassBorder = {
  borderWidth: 1,
  borderColor: 'rgba(160,106,87,0.28)',
} as const

// Inner top highlight — place as first child inside any glass card (above content, below BlurView)
// <View style={glassHighlight} />
export const glassHighlight = {
  position: 'absolute' as const,
  top: 0, left: 0, right: 0,
  height: 1.5,
  backgroundColor: 'rgba(255,255,255,0.68)',
  zIndex: 2,
} as const

// Standard glass card opacity — use with BlurView intensity 72
export const GLASS_BG = 'rgba(251,247,239,0.68)'
export const GLASS_BLUR = 72
