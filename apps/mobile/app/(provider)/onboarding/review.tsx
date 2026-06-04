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

function FieldRow({ label, value, onChangeText, keyboardType, placeholder }: {
  label: string
  value: string
  onChangeText: (t: string) => void
  keyboardType?: 'default' | 'numeric' | 'email-address'
  placeholder?: string
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        placeholder={placeholder ?? '—'}
        placeholderTextColor={colors.ink36}
        style={styles.fieldInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  )
}

export default function ReviewScreen() {
  const [name, setName]               = useState('')
  const [dob, setDob]                 = useState('')
  const [npi, setNpi]                 = useState('')
  const [licenseNumber, setLicNum]    = useState('')
  const [licenseType, setLicType]     = useState('')
  const [licenseState, setLicState]   = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    async function load() {
      const providerId = await AsyncStorage.getItem('sila_provider_id')
      if (!providerId) return
      const { data } = await supabase
        .from('providers')
        .select('name, dob, npi, license_number, license_type, state')
        .eq('id', providerId)
        .single()
      if (!data) return
      if (data.name)           setName(data.name)
      if (data.dob)            setDob(data.dob)
      if (data.npi)            setNpi(data.npi)
      if (data.license_number) setLicNum(data.license_number)
      if (data.license_type)   setLicType(data.license_type)
      if (data.state)          setLicState(data.state)
    }
    load()
  }, [])

  async function handleSubmit() {
    setError('')
    if (!name || !npi || !licenseNumber || !licenseType || !licenseState) {
      setError('Please complete all required verification fields.')
      return
    }

    const providerId = await AsyncStorage.getItem('sila_provider_id')
    if (!providerId) { router.replace('/(provider)/onboarding/account'); return }

    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('providers')
        .update({
          name,
          dob:              dob || null,
          npi,
          license_number:   licenseNumber,
          license_type:     licenseType,
          credentials:      licenseType,
          state:            licenseState,
          verification_status: 'pending',
          submitted_at:     new Date().toISOString(),
        })
        .eq('id', providerId)

      if (err) { setError(err.message ?? 'Failed to submit. Please try again.'); return }

      // Fire and forget — don't block navigation on either call
      supabase.functions.invoke('send-confirmation-email', {
        body: { providerId },
      }).catch(() => null)
      supabase.functions.invoke('run-verification-checks', {
        body: { providerId },
      }).catch(() => null)

      router.replace('/(provider)/onboarding/pending')
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
          <View style={styles.navRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backBtn}>← Back</Text>
            </Pressable>
            <StepDots current={4} />
          </View>

          <Text style={styles.heading}>
            <Text style={styles.headingRegular}>Ready to </Text>
            <Text style={styles.headingAccent}>submit</Text>
          </Text>
          <Text style={styles.subtitle}>
            Review your verification details before we begin.
          </Text>

          {/* Editable verification fields */}
          <View style={[styles.card, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.cardEyebrow, { marginBottom: 0 }]}>Verification details</Text>
              <Text style={styles.editHint}>✎ tap to edit</Text>
            </View>

            <FieldRow label="Full name"     value={name}          onChangeText={setName}    />
            <View style={styles.divider} />
            <FieldRow label="Date of birth" value={dob}           onChangeText={setDob}     placeholder="YYYY-MM-DD" />
            <View style={styles.divider} />
            <FieldRow label="NPI number"    value={npi}           onChangeText={setNpi}     keyboardType="numeric" />
            <View style={styles.divider} />
            <FieldRow label="License #"     value={licenseNumber} onChangeText={setLicNum}  />
            <View style={styles.divider} />
            <FieldRow label="License type"  value={licenseType}   onChangeText={setLicType} placeholder="MD, LCSW…" />
            <View style={styles.divider} />
            <FieldRow label="License state" value={licenseState}  onChangeText={setLicState} />

            <Text style={styles.cardNote}>
              These details are checked against NPPES, OIG, SAM.gov, and your state board. Make sure everything matches your license exactly.
            </Text>
          </View>

          {/* What happens next */}
          <View style={[styles.nextCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <Text style={styles.nextEyebrow}>What happens next</Text>
            <Text style={styles.nextText}>
              Automated checks run immediately. Human review of your state license takes up to 3 business days. We'll email you when you're live.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={{ marginBottom: 52 }} />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [styles.submitBtn, (loading || pressed) && { opacity: 0.75 }]}
          >
            {loading
              ? <ActivityIndicator color={colors.paper} />
              : <Text style={styles.submitBtnText}>Submit for verification</Text>
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
    color: colors.teal,
  },
  dotLabel: {
    marginLeft: 8,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(31,27,22,0.54)',
  },

  heading: { marginBottom: 6 },
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

  card: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    ...glassBorder,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 12,
  },
  editHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.clay,
    opacity: 0.7,
  },

  cardEyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.clay,
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  fieldLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(31,27,22,0.54)',
    width: 110,
    flexShrink: 0,
  },
  fieldInput: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.ink,
    padding: 0,
    margin: 0,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(160,106,87,0.10)',
  },
  cardNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(31,27,22,0.38)',
    marginTop: 14,
  },

  nextCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    ...glassBorder,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  nextEyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.teal,
    marginBottom: 8,
  },
  nextText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(31,27,22,0.65)',
  },

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#C0392B',
    marginTop: 8,
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
})
