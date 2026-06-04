import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'

function routeAfterSignIn(provider: Record<string, unknown>) {
  // Check onboarding completion in order first
  if (!provider.npi || !provider.license_number) {
    router.replace('/(provider)/onboarding/credentials')
    return
  }
  if (!provider.bio || !provider.photo_url || !provider.scheduling_url) {
    router.replace('/(provider)/onboarding/profile')
    return
  }
  const status = provider.verification_status as string
  if (status === 'in_review' || status === 'verified' || status === 'excluded' || status === 'rejected') {
    router.replace('/(provider)/dashboard')
    return
  }
  // All fields complete — if already submitted show pending, else review
  if ((provider.verification_status as string) === 'pending') {
    router.replace('/(provider)/onboarding/pending')
    return
  }
  router.replace('/(provider)/onboarding/review')
}

export default function SignInScreen() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  async function handleSignIn() {
    setError('')
    if (!email || !password) { setError('Email and password are required.'); return }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError || !data.user) {
        const msg = authError?.message?.toLowerCase() ?? ''
        if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('not found')) {
          setError('Wrong email or password.')
        } else if (msg.includes('not confirmed') || msg.includes('email confirmation')) {
          setError('Please verify your email before signing in.')
        } else if (msg.includes('too many') || msg.includes('rate limit')) {
          setError('Too many attempts. Wait a moment and try again.')
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id, npi, license_number, bio, photo_url, scheduling_url, verification_status')
        .eq('user_id', data.user.id)
        .single()

      if (providerError || !provider) {
        setError('No provider account found for this email.')
        return
      }

      await AsyncStorage.setItem('sila_provider_id', provider.id)
      routeAfterSignIn(provider)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-start', marginBottom: 32 }}>
            <Text style={styles.backBtn}>← Back</Text>
          </Pressable>

          {/* Header */}
          <Text style={styles.eyebrow}>For providers</Text>
          <Text style={styles.heading}>
            <Text style={styles.headingRegular}>Welcome </Text>
            <Text style={styles.headingAccent}>back</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in to manage your provider profile.</Text>

          {/* Fields */}
          <View style={styles.fields}>
            <View style={[styles.fieldCard, shadow.subtle]}>
              <View style={glassHighlight} />
              <Text style={styles.fieldLabel}>Email address</Text>
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
            </View>

            <View style={[styles.fieldCard, shadow.subtle]}>
              <View style={glassHighlight} />
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onSubmitEditing={handleSignIn}
                  returnKeyType="go"
                  placeholder="Enter your password"
                  placeholderTextColor={colors.ink36}
                  style={[styles.input, { flex: 1 }]}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                  <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={{ marginBottom: 28 }} />

          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            style={({ pressed }) => [styles.signInBtn, (loading || pressed) && { opacity: 0.75 }]}
          >
            {loading
              ? <ActivityIndicator color={colors.paper} />
              : <Text style={styles.signInBtnText}>Sign in</Text>
            }
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpLabel}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/(provider)/onboarding/account')}>
              <Text style={styles.signUpLink}>Get started</Text>
            </Pressable>
          </View>

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

  backBtn: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },

  eyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.clay,
    marginBottom: 12,
  },

  heading: { marginBottom: 8 },
  headingRegular: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 34,
    lineHeight: 42,
    color: colors.ink,
  },
  headingAccent: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 34,
    lineHeight: 42,
    color: colors.clay,
  },

  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 32,
  },

  fields: { gap: 10, marginBottom: 12 },

  fieldCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    ...glassBorder,
    padding: 14,
    overflow: 'hidden',
  },
  fieldLabel: {
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

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showHide: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: colors.teal,
  },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 4 },
  forgotText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#C0392B',
    marginTop: 8,
  },

  signInBtn: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.float,
  },
  signInBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: colors.paper,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(160,106,87,0.18)',
  },
  dividerText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: 'rgba(31,27,22,0.36)',
  },

  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(31,27,22,0.54)',
  },
  signUpLink: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },
})
