import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
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

function InputCard({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={[styles.inputCard, shadow.subtle]}>
      <View style={glassHighlight} />
      <Text style={styles.inputLabel}>
        {label}{required ? <Text style={{ color: colors.clay }}> *</Text> : null}
      </Text>
      {children}
    </View>
  )
}

export default function CredentialsScreen() {
  const [npi, setNpi] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function prefill() {
      // Primary: load the linked provider row
      const id = await AsyncStorage.getItem('sila_provider_id')
      if (!id) return

      const { data } = await supabase
        .from('providers')
        .select('npi, license_number, license_type, state, email')
        .eq('id', id)
        .single()
      if (!data) return

      // If the linked row already has credentials, use it directly
      if (data.npi || data.license_number) {
        if (data.npi)            setNpi(data.npi)
        if (data.license_number) setLicenseNumber(data.license_number)
        if (data.license_type)   setLicenseType(data.license_type)
        if (data.state)          setLicenseState(data.state)
        return
      }

      // Fallback: find any row with the same email that has NPI/license data
      // (handles split-row case where web form row and app row are separate)
      if (!data.email) return
      const { data: webRow } = await supabase
        .from('providers')
        .select('npi, license_number, license_type, state')
        .eq('email', data.email)
        .not('npi', 'is', null)
        .limit(1)
        .maybeSingle()

      if (!webRow) return
      if (webRow.npi)            setNpi(webRow.npi)
      if (webRow.license_number) setLicenseNumber(webRow.license_number)
      if (webRow.license_type)   setLicenseType(webRow.license_type)
      if (webRow.state)          setLicenseState(webRow.state)
    }
    prefill()
  }, [])

  async function handleContinue() {
    setError('')
    if (!npi || !licenseNumber || !licenseType || !licenseState) {
      setError('NPI, license number, type, and state are required.')
      return
    }

    const providerId = await AsyncStorage.getItem('sila_provider_id')
    if (!providerId) {
      router.replace('/(provider)/onboarding/account')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('providers')
        .update({
          npi,
          license_number: licenseNumber,
          license_type: licenseType,
          credentials: licenseType,
          state: licenseState,
          specialties: specialty ? [specialty] : [],
        })
        .eq('id', providerId)

      if (err) {
        setError(err.message ?? 'Failed to save. Please try again.')
        return
      }

      router.push('/(provider)/onboarding/profile')
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
          {/* Nav row */}
          <View style={styles.navRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backBtn}>← Back</Text>
            </Pressable>
            <StepDots current={2} />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            <Text style={styles.headingRegular}>Tell us how to </Text>
            <Text style={styles.headingAccent}>verify you</Text>
          </Text>
          <Text style={styles.subtitle}>
            We check this against NPPES, OIG, and your state board.
          </Text>

          {/* Fields */}
          <View style={styles.fields}>
            <InputCard label="NPI number" required>
              <TextInput
                value={npi}
                onChangeText={setNpi}
                placeholder="1234567890"
                placeholderTextColor={colors.ink36}
                style={styles.input}
                keyboardType="numeric"
                maxLength={10}
              />
            </InputCard>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <InputCard label="License #" required>
                  <TextInput
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                    placeholderTextColor={colors.ink36}
                    style={styles.input}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </InputCard>
              </View>
              <View style={{ flex: 1 }}>
                <InputCard label="License type" required>
                  <TextInput
                    value={licenseType}
                    onChangeText={setLicenseType}
                    placeholder="MD, LCSW…"
                    placeholderTextColor={colors.ink36}
                    style={styles.input}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </InputCard>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <InputCard label="License state" required>
                  <TextInput
                    value={licenseState}
                    onChangeText={setLicenseState}
                    placeholder="Texas"
                    placeholderTextColor={colors.ink36}
                    style={styles.input}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </InputCard>
              </View>
              <View style={{ flex: 1 }}>
                <InputCard label="Specialty">
                  <TextInput
                    value={specialty}
                    onChangeText={setSpecialty}
                    placeholder="Psychiatry"
                    placeholderTextColor={colors.ink36}
                    style={styles.input}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </InputCard>
              </View>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.note}>
            Your credentials are used for verification only and are never shared publicly.
          </Text>

          <View style={{ marginBottom: 52 }} />

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

  note: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 18,
    color: 'rgba(31,27,22,0.40)',
    marginBottom: 4,
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
})
