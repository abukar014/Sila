import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import Svg, { Rect, Polyline } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'

export default function ForgotPasswordScreen() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit() {
    setError('')
    const trimmed = email.trim()
    if (!trimmed) { setError('Please enter your email address.'); return }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'sila://reset-password',
      })
      if (err) {
        const msg = err.message?.toLowerCase() ?? ''
        if (msg.includes('invalid') || msg.includes('format')) {
          setError('That doesn\'t look like a valid email address.')
        } else if (msg.includes('rate limit') || msg.includes('security purposes')) {
          setError('Please wait a moment before requesting another link.')
        } else {
          setError('Couldn\'t send the reset link. Please try again.')
        }
        return
      }
      setSent(true)
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

          {!sent ? (
            <>
              <Text style={styles.eyebrow}>Password reset</Text>
              <Text style={styles.heading}>
                <Text style={styles.headingRegular}>Forgot your </Text>
                <Text style={styles.headingAccent}>password?</Text>
              </Text>
              <Text style={styles.subtitle}>
                Enter the email on your provider account. We'll send a reset link right away.
              </Text>

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
                  autoFocus
                  onSubmitEditing={handleSubmit}
                  returnKeyType="send"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={{ marginBottom: 28 }} />

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [styles.submitBtn, (loading || pressed) && { opacity: 0.75 }]}
              >
                {loading
                  ? <ActivityIndicator color={colors.paper} />
                  : <Text style={styles.submitBtnText}>Send reset link</Text>
                }
              </Pressable>
            </>
          ) : (
            <>
              {/* Sent state */}
              <View style={[styles.sentCard, shadow.subtle]}>
                <View style={glassHighlight} />
                <View style={styles.sentIconWrap}>
                  <Svg width={22} height={18} viewBox="0 0 22 18" fill="none">
                    <Rect x="1" y="1" width="20" height="16" rx="2" stroke={colors.teal} strokeWidth={1.5} />
                    <Polyline points="1,1 11,10 21,1" stroke={colors.teal} strokeWidth={1.5} strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.sentHeading}>Check your email</Text>
                <Text style={styles.sentBody}>
                  We sent a password reset link to{'\n'}
                  <Text style={styles.sentEmail}>{email.trim()}</Text>
                </Text>
                <Text style={styles.sentNote}>
                  The link expires in 24 hours. If you don't see it, check your spam folder.
                </Text>
              </View>

              <View style={{ marginBottom: 28 }} />

              <Pressable
                onPress={() => router.replace('/(auth)/sign-in')}
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.submitBtnText}>Back to sign in</Text>
              </Pressable>

              <Pressable
                onPress={() => { setSent(false); setEmail('') }}
                style={styles.retryRow}
              >
                <Text style={styles.retryText}>Wrong email? Try again</Text>
              </Pressable>
            </>
          )}

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

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#C0392B',
    marginTop: 12,
  },

  submitBtn: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.float,
  },
  submitBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: colors.paper,
  },

  // Sent state
  sentCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 18,
    ...glassBorder,
    padding: 28,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 12,
  },
  sentIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(26,92,90,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(26,92,90,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sentHeading: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  sentBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(31,27,22,0.65)',
    textAlign: 'center',
    marginBottom: 16,
  },
  sentEmail: {
    fontFamily: 'DMSans_600SemiBold',
    color: colors.clay,
  },
  sentNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: 'rgba(31,27,22,0.40)',
    textAlign: 'center',
  },

  retryRow: {
    alignItems: 'center',
    marginTop: 18,
  },
  retryText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },
})
