import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'
import { colors, space, radius, shadow, glassBorder } from '../../lib/tokens'

const IC = colors.teal
const SW = 1.5

function IconIndividual() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={IC} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 13.5c1.5.8 2.5 2.3 2.5 4" stroke={IC} strokeWidth={SW} strokeLinecap="round" opacity={0.5}/>
    </Svg>
  )
}

function IconFamily() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7.5" r="2.8" stroke={IC} strokeWidth={SW}/>
      <Circle cx="15.5" cy="7.5" r="2.8" stroke={IC} strokeWidth={SW}/>
      <Path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M10 14c1.2-.6 2.8-.6 4 0" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M15.5 14c3 0 5.5 2.5 5.5 5.5" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M12 11.5v2" stroke={IC} strokeWidth={SW} strokeLinecap="round" opacity={0.4}/>
    </Svg>
  )
}

function IconPsychiatry() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6h6M12 3v3" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M7 9h10l-1.5 9H8.5L7 9z" stroke={IC} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 13h4M12 11v4" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M9 21h6" stroke={IC} strokeWidth={SW} strokeLinecap="round" opacity={0.5}/>
    </Svg>
  )
}

function IconPsychologist() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M8 3h8a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={IC} strokeWidth={SW} strokeLinejoin="round"/>
      <Path d="M10 8h4M10 11.5h4M10 15h2.5" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Path d="M5 6.5v11a2 2 0 002 2h10" stroke={IC} strokeWidth={SW} strokeLinecap="round" opacity={0.45}/>
    </Svg>
  )
}

function IconAll() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="7" cy="8" r="2.5" stroke={IC} strokeWidth={SW}/>
      <Circle cx="17" cy="8" r="2.5" stroke={IC} strokeWidth={SW}/>
      <Circle cx="7" cy="17" r="2.5" stroke={IC} strokeWidth={SW}/>
      <Circle cx="17" cy="17" r="2.5" stroke={IC} strokeWidth={SW}/>
    </Svg>
  )
}

const CATEGORIES = [
  {
    Icon: IconIndividual,
    title: 'Individual therapy',
    subtitle: 'One-on-one support for anxiety, depression, life transitions',
    type: 'individual',
  },
  {
    Icon: IconFamily,
    title: 'Family & couples therapy',
    subtitle: 'Support for family dynamics and relationship challenges',
    type: 'family',
  },
  {
    Icon: IconPsychiatry,
    title: 'Psychiatry',
    subtitle: 'Psychiatric evaluation and medication support',
    type: 'psychiatry',
  },
  {
    Icon: IconPsychologist,
    title: 'Clinical psychologist',
    subtitle: 'Doctoral-level assessment and evidence-based therapy',
    type: 'psychologist',
  },
  {
    Icon: IconAll,
    title: 'See all providers',
    subtitle: 'Browse every verified provider on Sila',
    type: 'all',
  },
]

export default function CategoryScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Arabic watermark */}
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Find a provider</Text>
            <Text style={styles.headline}>
              What type of help{' '}
              <Text style={styles.headlineAccent}>are you looking for?</Text>
            </Text>
            <Text style={styles.sub}>We'll help you find the right provider for your needs.</Text>
          </View>

          {/* Category cards */}
          <View style={styles.cards}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.type}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
                onPress={() => router.push({ pathname: '/directory/location', params: { type: cat.type } })}
              >
                <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill} />
                <View style={styles.cardHighlight} />
                <View style={styles.cardInner}>
                  <View style={styles.iconBox}>
                    <cat.Icon />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{cat.title}</Text>
                    <Text style={styles.cardSub}>{cat.subtitle}</Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Crisis banner */}
          <View style={styles.crisis}>
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.crisisInner}>
              <Text style={styles.crisisText}>
                <Text style={styles.crisisEmphasis}>Need immediate help? </Text>
                If you're in crisis, call{' '}
                <Text style={styles.crisisEmphasis}>988</Text>
                {' '}(Suicide & Crisis Lifeline) or text "HELLO" to{' '}
                <Text style={styles.crisisEmphasis}>741741</Text>
                {' '}(Crisis Text Line).
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  watermark: {
    position: 'absolute',
    right: -20,
    top: 40,
    fontFamily: 'DMSans_400Regular',
    fontSize: 180,
    color: colors.teal,
    opacity: 0.07,
    zIndex: 0,
  },

  scroll: {
    paddingHorizontal: space.lg,
    paddingBottom: 48,
    gap: 0,
  },

  backBtn: { paddingVertical: space.md, alignSelf: 'flex-start' },
  backText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: colors.teal,
  },

  header: { gap: 10, marginBottom: 28 },
  eyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.clay,
  },
  headline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  headlineAccent: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.clay,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink54,
  },

  cards: { gap: 10, marginBottom: 24 },

  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
    ...glassBorder,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.68)',
    zIndex: 2,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    backgroundColor: 'rgba(251,247,239,0.68)',
  },
  iconBox: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(160,106,87,0.10)',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
cardText: { flex: 1, gap: 3 },
  cardTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.ink,
  },
  cardSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.clay,
  },
  arrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 18,
    color: colors.clay,
  },

  crisis: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(160,106,87,0.25)',
  },
  crisisInner: {
    padding: 16,
    backgroundColor: 'rgba(254,246,240,0.80)',
  },
  crisisText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: colors.ink54,
  },
  crisisEmphasis: {
    fontFamily: 'DMSans_600SemiBold',
    color: colors.clay,
  },
})
