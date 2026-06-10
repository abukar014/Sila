import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../../lib/tokens'

function StepDots({ current }: { current: number }) {
  const labels = ['Account', 'Credentials', 'Profile', 'Review']
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {[1, 2, 3, 4].map((n) => {
        const active = n === current
        const done = n < current
        return (
          <View key={n} style={{
            width: active ? 9 : 7,
            height: active ? 9 : 7,
            borderRadius: 999,
            backgroundColor: active ? colors.clay : done ? colors.teal : 'rgba(31,27,22,0.20)',
          }} />
        )
      })}
      <Text style={styles.dotLabel}>{current} of 4 · {labels[current - 1]}</Text>
    </View>
  )
}

function InputCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={[styles.inputCard, shadow.subtle]}>
      <View style={glassHighlight} />
      <Text style={styles.inputLabel}>{label}</Text>
      {children}
    </View>
  )
}

function formatDob(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
}

function dobToISO(dob: string): string | null {
  const digits = dob.replace(/\D/g, '')
  if (digits.length !== 8) return null
  return `${digits.slice(4, 8)}-${digits.slice(0, 2)}-${digits.slice(2, 4)}`
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    + '-' + Math.random().toString(36).slice(2, 7)
}

export default function AccountScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(emailParam ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dob, setDob] = useState('')
  const [directoryConsent, setDirectoryConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleContinue() {
    setError('')
    if (!fullName || !email || !password) { setError('All fields are required.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!directoryConsent) { setError('Please check the consent box to continue.'); return }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: fullName } },
      })

      if (authError || !authData.user) {
        const msg = authError?.message?.toLowerCase() ?? ''
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setError('An account already exists with this email. Try signing in instead.')
        } else if (msg.includes('invalid') || msg.includes('format')) {
          setError('That doesn\'t look like a valid email address.')
        } else if (msg.includes('rate limit') || msg.includes('too many')) {
          setError('Too many attempts. Please wait a moment and try again.')
        } else {
          setError(authError?.message ?? 'Couldn\'t create your account. Please try again.')
        }
        return
      }

      let providerId: string

      // First: try to claim a pre-submitted web form row (email matches, no user_id yet)
      // Requires "providers_self_update" RLS policy allowing update where jwt email = row email
      const { data: claimed } = await supabase
        .from('providers')
        .update({ user_id: authData.user.id, name: fullName, dob: dobToISO(dob), directory_consent: true })
        .eq('email', email)
        .is('user_id', null)
        .select('id')
        .single()

      if (claimed) {
        providerId = claimed.id
      } else {
        // No pre-existing row — create fresh
        const { data: newProvider, error: insertError } = await supabase
          .from('providers')
          .insert({
            name: fullName,
            email,
            slug: toSlug(fullName),
            user_id: authData.user.id,
            dob: dobToISO(dob),
            directory_consent: true,
            verification_status: 'pending',
            status: 'inactive',
          })
          .select('id')
          .single()

        if (insertError || !newProvider) {
          setError(insertError?.message ?? 'Couldn\'t save your account. Please try again.')
          return
        }
        providerId = newProvider.id
      }

      await AsyncStorage.setItem('sila_provider_id', providerId)

      if (authData.session) {
        router.push('/(provider)/onboarding/credentials')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
          <View style={[styles.confirmCard, shadow.card]}>
            <View style={glassHighlight} />
            <View style={styles.confirmIcon}>
              <Text style={{ fontSize: 24 }}>✉</Text>
            </View>
            <Text style={styles.confirmHeading}>Check your inbox.</Text>
            <Text style={styles.confirmBody}>
              We sent a confirmation link to{' '}
              <Text style={{ fontFamily: 'DMSans_600SemiBold', color: colors.teal }}>{email}</Text>.
              {'\n'}Click it to continue your application.
            </Text>
            <Text style={styles.confirmNote}>
              Once confirmed you'll be taken straight to the next step.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={{ flex: 1 }}>
      <Text style={styles.watermark} aria-hidden>صلة</Text>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {/* Nav row */}
          <View style={styles.navRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backBtn}>← Back</Text>
            </Pressable>
            <StepDots current={1} />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            <Text style={styles.headingRegular}>Let's get you </Text>
            <Text style={styles.headingAccent}>started</Text>
          </Text>
          <Text style={styles.subtitle}>Two minutes is all it takes to sign up.</Text>

          {/* Fields */}
          <View style={styles.fields}>
            <InputCard label="Full legal name">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Dr. Aisha Rahman"
                placeholderTextColor={colors.ink36}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </InputCard>

            <InputCard label="Work email">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@clinic.com"
                placeholderTextColor={colors.ink36}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </InputCard>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <InputCard label="Password">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </InputCard>
              </View>
              <View style={{ flex: 1 }}>
                <InputCard label="Confirm">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </InputCard>
              </View>
            </View>

            <InputCard label="Date of birth">
              <TextInput
                value={dob}
                onChangeText={(t) => setDob(formatDob(t))}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.ink36}
                style={styles.input}
                keyboardType="numeric"
              />
            </InputCard>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.privacy}>
            By continuing you agree to our{' '}
            <Text style={styles.privacyLink}>Privacy Policy.</Text>
          </Text>

          {/* Directory consent */}
          <Pressable
            onPress={() => setDirectoryConsent(v => !v)}
            style={styles.consentRow}
          >
            <View style={[styles.consentBox, directoryConsent && styles.consentBoxChecked]}>
              {directoryConsent && <Text style={styles.consentCheck}>✓</Text>}
            </View>
            <Text style={styles.consentText}>
              By creating an account, I consent to my profile being listed in the Sila directory if my credentials are verified and approved. I understand that applying does not guarantee approval.
            </Text>
          </Pressable>

          <View style={styles.signInRow}>
            <Text style={styles.signInLabel}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </View>

          {/* Continue button — inside scroll so keyboard never pushes it */}
          <Pressable
            onPress={handleContinue}
            disabled={loading}
            style={({ pressed }) => [styles.continueBtn, (loading || pressed) && { opacity: 0.75 }]}
          >
            {loading
              ? <ActivityIndicator color={colors.paper} />
              : <Text style={styles.continueBtnText}>Continue</Text>
            }
          </Pressable>

          <View style={{ height: 12 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
  },

  watermark: {
    position: 'absolute',
    top: -20,
    right: -20,
    fontFamily: 'DMSans_400Regular',
    fontSize: 180,
    color: colors.teal,
    opacity: 0.07,
    zIndex: 0,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  backBtn: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: colors.teal,
  },

  dotLabel: {
    marginLeft: 8,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(31,27,22,0.54)',
  },

  heading: {
    marginBottom: 6,
  },
  headingRegular: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 26,
    lineHeight: 34,
    color: colors.ink,
  },
  headingAccent: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 26,
    lineHeight: 34,
    color: colors.clay,
  },

  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 24,
  },

  fields: {
    gap: 10,
    marginBottom: 14,
  },

  inputCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    ...glassBorder,
    padding: 14,
    overflow: 'hidden',
  },

  inputLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 4,
  },

  input: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    padding: 0,
    margin: 0,
  },

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#C0392B',
    marginBottom: 10,
  },

  privacy: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 18,
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 14,
  },
  privacyLink: {
    fontFamily: 'DMSans_600SemiBold',
    color: colors.teal,
    textDecorationLine: 'underline',
  },

  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
  },
  consentBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(31,27,22,0.28)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  consentBoxChecked: {
    borderColor: colors.teal,
    backgroundColor: 'rgba(26,92,90,0.10)',
  },
  consentCheck: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: colors.teal,
    lineHeight: 14,
  },
  consentText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: 'rgba(31,27,22,0.54)',
    flex: 1,
  },

  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 52,
  },
  signInLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(31,27,22,0.54)',
  },
  signInLink: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },


  continueBtn: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.float,
  },
  continueBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: colors.paper,
  },

  confirmCard: {
    backgroundColor: 'rgba(251,247,239,0.92)',
    borderRadius: 20,
    ...glassBorder,
    padding: 28,
    overflow: 'hidden',
  },
  confirmIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(160,106,87,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmHeading: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 26,
    lineHeight: 34,
    color: colors.ink,
    marginBottom: 10,
  },
  confirmBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 12,
  },
  confirmNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 18,
    color: 'rgba(31,27,22,0.36)',
  },
})
