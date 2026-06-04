import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../../lib/supabase'
import { colors } from '../../../lib/tokens'

const STEPS = [
  { title: 'NPPES identity match', status: 'In progress' },
  { title: 'OIG exclusion list',   status: 'In progress' },
  { title: 'SAM.gov check',        status: 'In progress' },
  { title: 'State license review', status: 'In progress' },
]

export default function PendingScreen() {
  useEffect(() => {
    async function pollStatus() {
      const providerId = await AsyncStorage.getItem('sila_provider_id')
      if (!providerId) return
      const { data } = await supabase
        .from('providers')
        .select('verification_status, status')
        .eq('id', providerId)
        .single()
      if (!data) return
      if (data.verification_status === 'verified' || data.verification_status === 'in_review' || data.verification_status === 'rejected' || data.verification_status === 'excluded') {
        router.replace('/(provider)/dashboard')
      }
    }
    pollStatus()
    const interval = setInterval(pollStatus, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <LinearGradient
      colors={[colors.tealNight, colors.tealDeep, '#A06A57']}
      locations={[0, 0.65, 1]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView style={styles.safe}>

        <View style={styles.header}>
          <Text style={styles.wordmark}>Sila</Text>
          <Text style={styles.arabic}>صلة</Text>
        </View>

        <View style={styles.headingWrap}>
          <Text style={styles.heading}>
            Almost <Text style={styles.headingBold}>there</Text>
          </Text>
          <Text style={styles.sub}>Your application is under review.</Text>
        </View>

        <View style={styles.stepsCard}>
          {STEPS.map((step, i) => (
            <View key={step.title} style={[styles.stepRow, i < STEPS.length - 1 && styles.stepBorder]}>
              <View style={[styles.stepDot, styles.stepDotPending]}>
                <Text style={styles.stepDotText}>○</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <View style={styles.stepStatusRow}>
                  <View style={styles.stepPulse} />
                  <Text style={styles.stepStatus}>{step.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerPrimary}>We've got it from here.</Text>
          <Text style={styles.footerSub}>
            Check your inbox — we sent you a confirmation. If you don't hear back right away, come back and check this screen. We'll have an answer for you within 3 business days.
          </Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 44,
    marginTop: 8,
  },
  wordmark: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 48,
    color: colors.paper,
    letterSpacing: -1,
    lineHeight: 52,
  },
  arabic: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(245,239,230,0.38)',
    letterSpacing: 3,
  },

  headingWrap: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 6,
  },
  heading: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 32,
    lineHeight: 40,
    color: colors.paper,
    textAlign: 'center',
  },
  headingBold: {
    fontFamily: 'DMSans_700Bold',
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(245,239,230,0.60)',
    textAlign: 'center',
  },

  stepsCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepDotDone: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  stepDotPending: {
    backgroundColor: 'rgba(160,106,87,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(160,106,87,0.55)',
  },
  stepDotText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: colors.paper,
    lineHeight: 14,
  },
  stepTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: colors.paper,
    lineHeight: 20,
  },
  stepStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stepPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.clay,
  },
  stepStatus: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(245,239,230,0.55)',
  },

  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 10,
  },
  footerPrimary: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: colors.paper,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  footerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 22,
    color: 'rgba(245,239,230,0.50)',
    textAlign: 'center',
  },
})
