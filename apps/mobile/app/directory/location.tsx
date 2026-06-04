import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Ellipse, Circle, Rect } from 'react-native-svg'

const IC = colors.teal
const SW = 1.5

function IconPin() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={IC} strokeWidth={SW} strokeLinejoin="round"/>
      <Circle cx="12" cy="9" r="2.5" stroke={IC} strokeWidth={SW}/>
    </Svg>
  )
}

function IconLock() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke={IC} strokeWidth={SW} strokeLinejoin="round"/>
      <Path d="M8 11V7a4 4 0 018 0v4" stroke={IC} strokeWidth={SW} strokeLinecap="round"/>
      <Circle cx="12" cy="16" r="1.5" fill={IC}/>
    </Svg>
  )
}
import { colors, space, radius, shadow, glassBorder, glassHighlight, GLASS_BG, GLASS_BLUR } from '../../lib/tokens'

function MapPinIllustration() {
  return (
    <Svg width={80} height={100} viewBox="0 0 80 100" fill="none">
      <Ellipse cx="40" cy="94" rx="20" ry="6" fill={colors.clay} opacity={0.20} />
      <Path
        d="M40 4C22.3 4 8 18.3 8 36C8 60 40 92 40 92C40 92 72 60 72 36C72 18.3 57.7 4 40 4Z"
        fill={colors.clay}
        stroke="rgba(160,106,87,0.5)"
        strokeWidth={1.5}
      />
      <Circle cx="40" cy="36" r="14" fill="rgba(255,255,255,0.15)" />
      <Circle cx="40" cy="36" r="8" fill={colors.creamFull} opacity={0.90} />
      <Circle cx="37" cy="33" r="2.5" fill={colors.clay} opacity={0.5} />
    </Svg>
  )
}

export default function LocationScreen() {
  const { type } = useLocalSearchParams<{ type: string }>()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const clean = zip.trim()
    if (!/^\d{5}$/.test(clean)) {
      setError('Please enter a valid 5-digit zip code.')
      return
    }
    router.push({ pathname: '/directory/providers', params: { type: type ?? 'all', zip: clean } })
  }

  function handleSkip() {
    router.push({ pathname: '/directory/providers', params: { type: type ?? 'all' } })
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            {/* Illustration + step label */}
            <View style={styles.illustrationWrap}>
              <Text style={styles.stepLabel}>Step 01 · Location</Text>
              <MapPinIllustration />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headline}>Where are you looking{'\n'}for care?</Text>
              <Text style={styles.sub}>
                Enter your zip code to find verified providers near you. We never share your location with providers without your consent.
              </Text>
            </View>

            {/* Zip input */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
                <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter zip code"
                  placeholderTextColor={colors.ink36}
                  keyboardType="number-pad"
                  maxLength={5}
                  value={zip}
                  onChangeText={v => { setError(''); setZip(v.replace(/\D/g, '')) }}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* CTA */}
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                zip.length === 5 ? styles.btnActive : styles.btnDisabled,
                pressed && zip.length === 5 && { opacity: 0.88 },
              ]}
              onPress={handleSubmit}
              disabled={zip.length !== 5}
            >
              <Text style={[styles.btnText, zip.length < 5 && styles.btnTextDisabled]}>
                Find providers
              </Text>
            </Pressable>

            {/* Skip link */}
            <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip — show all providers</Text>
            </Pressable>

            {/* Info cards */}
            <View style={styles.infoCards}>
              {[
                { Icon: IconPin,  title: 'Find nearby providers', sub: 'See verified clinicians in your area' },
                { Icon: IconLock, title: 'Private by default',    sub: 'Your zip code is never stored or shared' },
              ].map(card => (
                <View key={card.title} style={styles.infoCard}>
                  <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
                  <View style={glassHighlight} />
                  <View style={styles.infoCardInner}>
                    <View style={styles.infoIconBox}>
                      <card.Icon />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoTitle}>{card.title}</Text>
                      <Text style={styles.infoSub}>{card.sub}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.footnote}>
              We use your zip code only to show nearby providers. It is never stored.
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  watermark: {
    position: 'absolute',
    right: -20, top: 40,
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
  backText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.teal },

  illustrationWrap: {
    alignItems: 'center',
    gap: 12,
    marginVertical: space.lg,
  },
  stepLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.clay,
  },

  header: { gap: 10, marginBottom: space.xl },
  headline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink54,
    textAlign: 'center',
  },

  inputGroup: { gap: 6, marginBottom: space.md },
  inputWrap: {
    height: 52,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...glassBorder,
    borderWidth: 1.5,
  },
  inputWrapError: { borderColor: colors.clay },
  input: {
    flex: 1,
    paddingHorizontal: 18,
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 3,
    backgroundColor: GLASS_BG,
  },
  errorText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.clay,
    paddingLeft: 4,
  },

  btn: {
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
  },
  btnActive: {
    backgroundColor: colors.tealDeep,
    ...shadow.card,
  },
  btnDisabled: {
    backgroundColor: 'rgba(19,69,67,0.25)',
  },
  btnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.creamFull,
  },
  btnTextDisabled: { color: 'rgba(245,239,230,0.55)' },

  skipBtn: {
    alignItems: 'center',
    paddingVertical: space.sm,
    marginBottom: space.xl,
  },
  skipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.ink54,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },

  infoCards: { gap: 10, marginBottom: space.lg },
  infoCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.subtle,
    ...glassBorder,
  },
  infoCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    backgroundColor: GLASS_BG,
  },
  infoIconBox: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: 'rgba(160,106,87,0.10)',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  infoText: { flex: 1, gap: 2 },
  infoTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: colors.ink },
  infoSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.ink54 },

  footnote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.ink36,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
