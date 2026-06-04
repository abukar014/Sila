import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'

export default function ResetPasswordScreen() {
  const [password, setPassword]           = useState('')
  const [confirm, setConfirm]             = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [done, setDone]                   = useState(false)
  const [error, setError]                 = useState('')
  const [sessionReady, setSessionReady]   = useState(false)

  // Supabase emits an AUTH_STATE_CHANGE with event PASSWORD_RECOVERY
  // when the user arrives via the reset link. We wait for that before
  // allowing a password update.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    setError('')
    if (!password) { setError('Please enter a new password.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) { setError(err.message); return }
      setDone(true)
      setTimeout(() => router.replace('/(auth)/sign-in'), 2200)
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

          {done ? (
            /* ── Success state ───────────────────────── */
            <View style={styles.centerWrap}>
              <View style={[styles.doneCard, shadow.subtle]}>
                <View style={glassHighlight} />
                <View style={styles.doneIconWrap}>
                  <Text style={styles.doneIcon}>✓</Text>
                </View>
                <Text style={styles.doneHeading}>Password updated</Text>
                <Text style={styles.doneBody}>
                  You're all set. Signing you in now.
                </Text>
              </View>
            </View>
          ) : !sessionReady ? (
            /* ── Waiting for PASSWORD_RECOVERY event ─── */
            <View style={styles.centerWrap}>
              <ActivityIndicator color={colors.teal} />
              <Text style={styles.waitingText}>Verifying your link…</Text>
            </View>
          ) : (
            /* ── Reset form ──────────────────────────── */
            <>
              <Text style={styles.eyebrow}>Password reset</Text>
              <Text style={styles.heading}>
                <Text style={styles.headingRegular}>Choose a new </Text>
                <Text style={styles.headingAccent}>password</Text>
              </Text>
              <Text style={styles.subtitle}>
                Pick something secure. At least 8 characters.
              </Text>

              <View style={styles.fields}>
                <View style={[styles.fieldCard, shadow.subtle]}>
                  <View style={glassHighlight} />
                  <Text style={styles.fieldLabel}>New password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="At least 8 characters"
                      placeholderTextColor={colors.ink36}
                      style={[styles.input, { flex: 1 }]}
                      autoCapitalize="none"
                      autoFocus
                    />
                    <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                      <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.fieldCard, shadow.subtle]}>
                  <View style={glassHighlight} />
                  <Text style={styles.fieldLabel}>Confirm password</Text>
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!showPassword}
                    placeholder="Same as above"
                    placeholderTextColor={colors.ink36}
                    style={styles.input}
                    autoCapitalize="none"
                    onSubmitEditing={handleReset}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Strength hint */}
              {password.length > 0 && password.length < 8 && (
                <Text style={styles.hintText}>
                  {8 - password.length} more character{8 - password.length !== 1 ? 's' : ''} needed
                </Text>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={{ marginBottom: 28 }} />

              <Pressable
                onPress={handleReset}
                disabled={loading}
                style={({ pressed }) => [styles.submitBtn, (loading || pressed) && { opacity: 0.75 }]}
              >
                {loading
                  ? <ActivityIndicator color={colors.paper} />
                  : <Text style={styles.submitBtnText}>Update password</Text>
                }
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
    paddingTop: 48,
    paddingBottom: 28,
    flexGrow: 1,
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

  fields: { gap: 10, marginBottom: 8 },

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

  hintText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(31,27,22,0.38)',
    marginTop: 8,
    marginLeft: 2,
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

  // Center states (loading / done)
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 16,
  },
  waitingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(31,27,22,0.45)',
    marginTop: 4,
  },

  doneCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 18,
    ...glassBorder,
    padding: 32,
    overflow: 'hidden',
    alignItems: 'center',
    width: '100%',
  },
  doneIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(26,92,90,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(26,92,90,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  doneIcon: {
    fontSize: 22,
    color: colors.teal,
    fontFamily: 'DMSans_600SemiBold',
  },
  doneHeading: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  doneBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(31,27,22,0.55)',
    textAlign: 'center',
  },
})
