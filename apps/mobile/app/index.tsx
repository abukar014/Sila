import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import { colors, space, radius, shadow, glassBorder, glassHighlight } from '../lib/tokens'

const { width: W, height: H } = Dimensions.get('window')

const SX = W / 395
const ARCH_H = H + 120
const SY = ARCH_H / 796

function scaleD(d: string) {
  return d.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (_m, x, y) =>
    `${(parseFloat(x) * SX).toFixed(2)} ${(parseFloat(y) * SY).toFixed(2)}`
  )
}

const ARCH_PATH = `M11.5488 770.623C11.2016 676.82 10.4391 418.035 11.6934 218.709C11.804 201.134 12.1939 185.51 12.8229 171.65C16.5223 90.1299 134.195 64.6569 200.117 16.5596C259.148 67.0568 375.499 95.5047 380.966 172.995C381.903 186.283 382.453 201.445 382.538 218.709C383.363 386.622 382.878 658.478 382.643 763.368C382.615 775.773 382.601 781.976 380.741 786.992C377.695 795.206 371.203 801.683 362.983 804.711C357.963 806.56 351.694 806.56 339.158 806.56H47.7774C37.3496 806.56 32.1358 806.56 27.9561 805.022C21.1131 802.504 15.7029 797.113 13.1596 790.28C11.6061 786.106 11.587 780.945 11.5488 770.623Z`

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#0E2C2A', '#134543', '#1A5C5A', '#1F4A3E']}
      locations={[0, 0.28, 0.62, 1]}
      style={styles.root}
    >
      {/* Clay glow top-right */}
      <View style={styles.glowClay} />

      {/* Opaque cream arch — version 1 style */}
      <View style={[styles.archWrap, { top: H * 0.04 }]}>
        <Svg width={W} height={ARCH_H} viewBox={`0 0 ${395 * SX} ${796 * SY}`} fill="none">
          <Defs>
            <SvgGradient id="archFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F5EFE6" stopOpacity="1" />
              <Stop offset="1" stopColor="#EBE2D1" stopOpacity="1" />
            </SvgGradient>
            <SvgGradient id="archStroke" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor="#D4C9B8" stopOpacity="1" />
              <Stop offset="1" stopColor="#C8BCA8" stopOpacity="0.6" />
            </SvgGradient>
          </Defs>
          <Path
            d={scaleD(ARCH_PATH)}
            fill="url(#archFill)"
            stroke="url(#archStroke)"
            strokeWidth={1}
          />
        </Svg>
      </View>

      <SafeAreaView style={styles.safe}>

        {/* Logo — upper third of arch */}
        <View style={styles.logoArea}>
          <Text style={styles.wordmark}>Sila</Text>
          <Text style={styles.arabic}>صلة</Text>
          <Text style={styles.tagline}>The bond between you and better care</Text>
        </View>

        {/* CTAs — pinned to bottom */}
        <View style={styles.ctaArea}>

          {/* Find a provider — solid teal */}
          <Pressable
            style={({ pressed }) => [styles.cardTeal, pressed && { opacity: 0.88 }]}
            onPress={() => router.push('/directory')}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, styles.iconBoxTeal]}>
                <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                  <Path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke={colors.creamFull} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitleLight}>Find a provider</Text>
                <Text style={styles.cardSubLight}>Browse verified clinicians</Text>
              </View>
              <Text style={styles.arrowLight}>→</Text>
            </View>
          </Pressable>

          {/* List your practice — glass card */}
          <Pressable
            style={({ pressed }) => [styles.cardGlass, pressed && { opacity: 0.88 }]}
            onPress={() => router.push('/(provider)/onboarding/account')}
          >
            <View style={glassHighlight} />
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, styles.iconBoxLight]}>
                <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                  <Path d="M10 4.167V15.833M4.167 10H15.833" stroke={colors.tealDeep} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitleDark}>List your practice</Text>
                <Text style={styles.cardSubDark}>For licensed providers</Text>
              </View>
              <Text style={styles.arrowDark}>→</Text>
            </View>
          </Pressable>

          <Text style={styles.footer}>
            By continuing, you agree to the{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>

        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  glowClay: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: colors.clay,
    opacity: 0.14,
    top: -60, right: -40,
  },

  archWrap: {
    position: 'absolute',
    left: 0,
  },

  safe: {
    flex: 1,
    paddingHorizontal: 29,
    paddingBottom: space.lg,
  },

  logoArea: {
    alignItems: 'center',
    marginTop: H * 0.22,
    gap: 10,
  },
  wordmark: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 96,
    lineHeight: 96,
    letterSpacing: -2,
    color: colors.tealNight,
  },
  arabic: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(117,131,156,0.85)',
    letterSpacing: 3,
    marginTop: -6,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#75839C',
    textAlign: 'center',
  },

  // CTAs pinned to bottom
  ctaArea: {
    position: 'absolute',
    bottom: space.lg,
    left: 29,
    right: 29,
    gap: 10,
  },

  // Solid teal card
  cardTeal: {
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.tealDeep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderTopColor: 'rgba(255,255,255,0.18)',
    ...shadow.float,
  },

  // Glass card — paper background with clay border
  cardGlass: {
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(251,247,239,0.92)',
    ...glassBorder,
    ...shadow.card,
  },

  cardRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
  },

  iconBox: {
    width: 44, height: 44, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  iconBoxTeal: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  iconBoxLight: {
    backgroundColor: 'rgba(160,106,87,0.10)',
  },

  cardText: { flex: 1, gap: 2 },

  cardTitleLight: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22, color: colors.creamFull },
  cardSubLight:   { fontFamily: 'DMSans_400Regular',  fontSize: 12, lineHeight: 16, color: 'rgba(245,239,230,0.65)' },
  cardTitleDark:  { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22, color: colors.tealNight },
  cardSubDark:    { fontFamily: 'DMSans_400Regular',  fontSize: 12, lineHeight: 16, color: colors.ink54 },

  arrowLight: { fontFamily: 'DMSans_400Regular', fontSize: 18, color: colors.creamFull },
  arrowDark:  { fontFamily: 'DMSans_400Regular', fontSize: 18, color: colors.tealDeep },

  footer: {
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#9CA4B2',
    marginTop: 2,
  },
  footerLink: { textDecorationLine: 'underline' },
})
