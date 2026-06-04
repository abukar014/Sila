import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, Pressable,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'

export default function EditSchedulingScreen() {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    async function load() {
      const id = await AsyncStorage.getItem('sila_provider_id')
      if (!id) { router.replace('/(auth)/sign-in'); return }
      const { data } = await supabase
        .from('providers')
        .select('scheduling_url')
        .eq('id', id)
        .single()
      setUrl(data?.scheduling_url ?? '')
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setError('')
    const trimmed = url.trim()
    if (!trimmed) { setError('Please enter a scheduling link.'); return }

    const id = await AsyncStorage.getItem('sila_provider_id')
    if (!id) return

    setSaving(true)
    const { error: err } = await supabase
      .from('providers')
      .update({ scheduling_url: trimmed })
      .eq('id', id)

    if (err) {
      setError('Failed to save. Please try again.')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.back(), 700)
  }

  return (
    <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={{ flex: 1 }}>
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.wrap}>

            {/* Nav */}
            <View style={styles.navRow}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Text style={styles.backBtn}>← Back</Text>
              </Pressable>
            </View>

            <Text style={styles.heading}>Scheduling link</Text>
            <Text style={styles.subtitle}>
              Where clients go to book with you. Calendly, SimplePractice, Jane — any URL works.
            </Text>

            {loading ? (
              <ActivityIndicator color={colors.teal} style={{ marginTop: 32 }} />
            ) : (
              <>
                <View style={[styles.inputCard, shadow.subtle]}>
                  <View style={glassHighlight} />
                  <Text style={styles.inputLabel}>Booking URL</Text>
                  <TextInput
                    value={url}
                    onChangeText={t => { setUrl(t); setSaved(false) }}
                    placeholder="calendly.com/your-name"
                    placeholderTextColor={colors.ink36}
                    style={styles.input}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <Pressable
                  onPress={handleSave}
                  disabled={saving || saved || !url.trim()}
                  style={({ pressed }) => [
                    styles.saveBtn,
                    (saving || saved || !url.trim() || pressed) && { opacity: 0.6 },
                  ]}
                >
                  {saving
                    ? <ActivityIndicator color={colors.paper} size="small" />
                    : <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : 'Save'}</Text>
                  }
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
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

  wrap: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
  },

  navRow: {
    marginBottom: 28,
  },

  backBtn: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },

  heading: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
    marginBottom: 8,
  },

  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 28,
  },

  inputCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    ...glassBorder,
    padding: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },

  inputLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(31,27,22,0.54)',
    marginBottom: 6,
  },

  input: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    padding: 0,
    margin: 0,
  },

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#C0392B',
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.float,
  },

  saveBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.paper,
  },
})
