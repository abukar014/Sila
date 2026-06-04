import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'

const FAITH_OPTIONS = [
  { label: 'Faith-integrated', value: 'faith_integrated' },
  { label: 'Faith-sensitive',  value: 'faith_sensitive' },
  { label: 'Faith-neutral',    value: 'faith_neutral' },
  { label: 'Secular',         value: 'secular' },
]

const QUICK_INSURANCE = ['Cigna', 'United Healthcare', 'Humana', 'Medicare']

const SPECIALTY_OPTIONS = [
  'Anxiety', 'Depression', 'Trauma', 'Grief', 'OCD',
  'Relationships', 'Family conflict', 'Postpartum',
  "Men's mental health", "Women's mental health",
  'Couples', 'Premarital', 'Addiction', 'ADHD',
]

const APPROACH_OPTIONS = [
  'CBT', 'DBT', 'EMDR', 'ACT', 'Gottman method',
  'Narrative therapy', 'Somatic therapy', 'Mindfulness',
  'ERP', 'IFS', 'Psychodynamic', 'Solution-focused',
]

const PULL_QUOTE_MAX = 180
const BIO_MAX = 600

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>
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

export default function EditProfileScreen() {
  const [providerId, setProviderId]   = useState<string | null>(null)
  const [photoUri, setPhotoUri]       = useState('')     // local URI for display
  const [photoUrl, setPhotoUrl]       = useState('')     // saved remote URL
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [bio, setBio]                 = useState('')
  const [pullQuote, setPullQuote]     = useState('')
  const [schedulingUrl, setSchedulingUrl] = useState('')
  const [languages, setLanguages]     = useState('')
  const [faithApproach, setFaithApproach] = useState('faith_integrated')
  const [telehealth, setTelehealth]       = useState(false)
  const [inPerson, setInPerson]           = useState(true)
  const [specialties, setSpecialties]             = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput]       = useState('')
  const [showSpecialtyInput, setShowSpecialtyInput] = useState(false)
  const [approaches, setApproaches]               = useState<string[]>([])
  const [approachInput, setApproachInput]         = useState('')
  const [showApproachInput, setShowApproachInput] = useState(false)
  const [insurances, setInsurances]               = useState<string[]>([])
  const [insuranceInput, setInsuranceInput]       = useState('')
  const [showInsInput, setShowInsInput]           = useState(false)
  const [feeIndividual, setFeeIndividual] = useState('')
  const [feeCouples, setFeeCouples]   = useState('')
  const [feeInitial, setFeeInitial]   = useState('')
  const [gender, setGender]           = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [saved, setSaved]             = useState(false)

  useEffect(() => {
    async function load() {
      const id = await AsyncStorage.getItem('sila_provider_id')
      if (!id) { router.replace('/(auth)/sign-in'); return }
      setProviderId(id)
      const { data } = await supabase
        .from('providers')
        .select('photo_url, bio, pull_quote, scheduling_url, languages, faith_approach, telehealth, in_person, specialties, approaches, insurances, fee_individual, fee_couples, fee_initial, gender')
        .eq('id', id)
        .single()
      if (data) {
        if (data.photo_url) { setPhotoUri(data.photo_url); setPhotoUrl(data.photo_url) }
        if (data.bio)           setBio(data.bio)
        if (data.pull_quote)    setPullQuote(data.pull_quote)
        if (data.scheduling_url) setSchedulingUrl(data.scheduling_url)
        if (data.languages)     setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : data.languages)
        if (data.faith_approach) setFaithApproach(data.faith_approach)
        if (data.telehealth != null) setTelehealth(data.telehealth)
        if (data.in_person != null)  setInPerson(data.in_person)
        if (data.specialties)   setSpecialties(data.specialties ?? [])
        if (data.approaches)    setApproaches(data.approaches ?? [])
        if (data.insurances)    setInsurances(data.insurances ?? [])
        if (data.fee_individual) setFeeIndividual(data.fee_individual)
        if (data.fee_couples)   setFeeCouples(data.fee_couples)
        if (data.fee_initial)   setFeeInitial(data.fee_initial)
        setGender(data.gender ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handlePhotoUpload() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) { setError('Photo library access is required.'); return }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0] || !providerId) return

    const uri = result.assets[0].uri
    setPhotoUri(uri)
    setPhotoLoadFailed(false)
    setUploading(true)
    setError('')

    try {
      const response = await fetch(uri)
      const arrayBuffer = await response.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('provider-photos')
        .upload(`${providerId}.jpg`, arrayBuffer, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) { setError(uploadError.message); setUploading(false); return }

      const { data: { publicUrl } } = supabase.storage
        .from('provider-photos')
        .getPublicUrl(`${providerId}.jpg`)

      const versionedUrl = `${publicUrl}?v=${Date.now()}`
      setPhotoUrl(versionedUrl)
    } catch {
      setError('Photo upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function addInsurance(plan: string) {
    const t = plan.trim()
    if (t && !insurances.includes(t)) setInsurances(p => [...p, t])
  }

  function removeInsurance(i: number) {
    setInsurances(p => p.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!providerId) return
    setError('')
    setSaved(false)
    setSaving(true)

    const { error: err } = await supabase
      .from('providers')
      .update({
        photo_url:      photoUrl || null,
        telehealth,
        in_person:      inPerson,
        bio:            bio.trim() || null,
        pull_quote:     pullQuote.trim() || null,
        scheduling_url: schedulingUrl.trim() || null,
        languages:      languages ? languages.split(',').map(l => l.trim()).filter(Boolean) : [],
        faith_approach: faithApproach,
        specialties,
        approaches,
        insurances,
        fee_individual: feeIndividual || null,
        fee_couples:    feeCouples || null,
        fee_initial:    feeInitial || null,
      })
      .eq('id', providerId)

    if (err) {
      setError(err.message ?? 'Failed to save. Please try again.')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.back(), 600)
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={styles.loadingWrap}>
        <ActivityIndicator color={colors.teal} />
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
          {/* Nav */}
          <View style={styles.navRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backBtn}>← Back</Text>
            </Pressable>
          </View>

          <Text style={styles.heading}>Edit profile</Text>
          <Text style={styles.subtitle}>Changes go live immediately.</Text>

          {/* Photo */}
          <SectionLabel text="Photo" />
          <Pressable
            onPress={handlePhotoUpload}
            disabled={uploading}
            style={({ pressed }) => [styles.photoCard, shadow.subtle, (uploading || pressed) && { opacity: 0.75 }]}
          >
            <View style={glassHighlight} />
            <View style={styles.photoInner}>
              <View style={styles.photoCircle}>
                {photoUri && !photoLoadFailed
                  ? <Image
                      source={{ uri: photoUri }}
                      style={styles.photoImg}
                      onError={() => setPhotoLoadFailed(true)}
                    />
                  : <Text style={styles.photoPlaceholder}>{photoUri && photoLoadFailed ? '↑' : '+'}</Text>
                }
                {uploading && (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator color={colors.paper} size="small" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.photoTitle}>
                  {uploading ? 'Uploading…' : photoUri ? 'Tap to change photo' : 'Upload a profile photo'}
                </Text>
                <Text style={styles.photoSub}>Square crop · JPEG</Text>
              </View>
            </View>
          </Pressable>

          {/* Gender — locked, sourced from NPPES */}
          <SectionLabel text="Gender" />
          <View style={[styles.inputCard, styles.inputCardDisabled, shadow.subtle]}>
            <View style={glassHighlight} />
            <Text style={styles.inputLabel}>GENDER</Text>
            <Text style={styles.genderValue}>
              {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Not on file'}
            </Text>
            <Text style={styles.genderNote}>
              Sourced from NPPES and cannot be edited. If this is incorrect, email hello@silacare.health
            </Text>
          </View>

          {/* Bio */}
          <SectionLabel text="Bio" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.counterRow}>
              <Text style={styles.inputLabel}>Tell clients about your approach</Text>
              <Text style={[styles.counter, bio.length >= BIO_MAX && { color: colors.clay }]}>
                {bio.length} / {BIO_MAX}
              </Text>
            </View>
            <TextInput
              value={bio}
              onChangeText={t => { setBio(t.slice(0, BIO_MAX)); setSaved(false) }}
              multiline
              numberOfLines={4}
              placeholder="I specialize in working with…"
              placeholderTextColor={colors.ink36}
              style={[styles.input, styles.inputMultiline]}
              textAlignVertical="top"
            />
          </View>

          {/* Pull quote */}
          <SectionLabel text="Pull quote" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.counterRow}>
              <Text style={styles.inputLabel}>In your own words</Text>
              <Text style={[styles.counter, pullQuote.length >= PULL_QUOTE_MAX && { color: colors.clay }]}>
                {pullQuote.length} / {PULL_QUOTE_MAX}
              </Text>
            </View>
            <TextInput
              value={pullQuote}
              onChangeText={t => { setPullQuote(t.slice(0, PULL_QUOTE_MAX)); setSaved(false) }}
              multiline
              numberOfLines={3}
              placeholder="I believe healing starts with feeling truly seen…"
              placeholderTextColor={colors.ink36}
              style={[styles.input, styles.inputMultiline]}
              textAlignVertical="top"
            />
          </View>

          {/* Scheduling */}
          <SectionLabel text="Scheduling link" />
          <InputCard label="Where clients book with you">
            <TextInput
              value={schedulingUrl}
              onChangeText={t => { setSchedulingUrl(t); setSaved(false) }}
              placeholder="calendly.com/your-name"
              placeholderTextColor={colors.ink36}
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </InputCard>

          {/* Session format */}
          <SectionLabel text="Session format" />
          <View style={styles.formatRow}>
            {([
              { label: 'Telehealth', t: true,  ip: false },
              { label: 'In-person',  t: false, ip: true  },
              { label: 'Both',       t: true,  ip: true  },
            ] as const).map(opt => {
              const active = telehealth === opt.t && inPerson === opt.ip
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => { setTelehealth(opt.t); setInPerson(opt.ip); setSaved(false) }}
                  style={[styles.formatChip, active && styles.formatChipActive]}
                >
                  <View style={glassHighlight} />
                  <Text style={[styles.formatChipText, active && styles.formatChipTextActive]}>{opt.label}</Text>
                </Pressable>
              )
            })}
          </View>

          {/* Languages */}
          <SectionLabel text="Languages" />
          <InputCard label="Languages spoken">
            <TextInput
              value={languages}
              onChangeText={t => { setLanguages(t); setSaved(false) }}
              placeholder="English, Urdu, Arabic"
              placeholderTextColor={colors.ink36}
              style={styles.input}
              autoCapitalize="words"
            />
          </InputCard>

          {/* Faith approach */}
          <SectionLabel text="Faith approach" />
          <View style={styles.faithRow}>
            {FAITH_OPTIONS.map(opt => {
              const selected = faithApproach === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => { setFaithApproach(opt.value); setSaved(false) }}
                  style={[styles.faithChip, selected && styles.faithChipSelected]}
                >
                  <Text style={[styles.faithChipText, selected && styles.faithChipTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          {/* Focus areas */}
          <SectionLabel text="Focus areas" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            {specialties.length > 0 && (
              <View style={styles.tags}>
                {specialties.map((s, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                    <Pressable onPress={() => setSpecialties(p => p.filter((_, idx) => idx !== i))} hitSlop={8}>
                      <Text style={styles.tagRemove}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.quickAdd}>
              <Text style={styles.quickAddLabel}>Common:</Text>
              <View style={styles.quickAddChips}>
                {SPECIALTY_OPTIONS.filter(s => !specialties.includes(s)).map(s => (
                  <Pressable key={s} onPress={() => { setSpecialties(p => [...p, s]); setSaved(false) }} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {showSpecialtyInput && (
              <View style={styles.insInputRow}>
                <TextInput
                  value={specialtyInput}
                  onChangeText={setSpecialtyInput}
                  onSubmitEditing={() => {
                    const t = specialtyInput.trim()
                    if (t && !specialties.includes(t)) setSpecialties(p => [...p, t])
                    setSpecialtyInput(''); setShowSpecialtyInput(false)
                  }}
                  placeholder="Custom specialty"
                  placeholderTextColor={colors.ink36}
                  style={[styles.input, { flex: 1 }]}
                  autoFocus returnKeyType="done"
                />
                <Pressable
                  onPress={() => {
                    const t = specialtyInput.trim()
                    if (t && !specialties.includes(t)) setSpecialties(p => [...p, t])
                    setSpecialtyInput(''); setShowSpecialtyInput(false)
                  }}
                  style={styles.insAddBtn}
                >
                  <Text style={styles.insAddBtnText}>Add</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={() => setShowSpecialtyInput(true)}>
              <Text style={styles.addPlanText}>+ Add custom</Text>
            </Pressable>
          </View>

          {/* Treatment approaches */}
          <SectionLabel text="Treatment approaches" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.quickAddChips}>
              {APPROACH_OPTIONS.map(a => {
                const active = approaches.includes(a)
                return (
                  <Pressable
                    key={a}
                    onPress={() => { setApproaches(p => active ? p.filter(x => x !== a) : [...p, a]); setSaved(false) }}
                    style={[styles.quickChip, active && styles.quickChipSelected]}
                  >
                    <Text style={[styles.quickChipText, active && styles.quickChipTextSelected]}>{a}</Text>
                  </Pressable>
                )
              })}
              {approaches.filter(a => !APPROACH_OPTIONS.includes(a)).map(a => (
                <Pressable
                  key={a}
                  onPress={() => { setApproaches(p => p.filter(x => x !== a)); setSaved(false) }}
                  style={[styles.quickChip, styles.quickChipSelected]}
                >
                  <Text style={[styles.quickChipText, styles.quickChipTextSelected]}>{a} ×</Text>
                </Pressable>
              ))}
            </View>
            {showApproachInput && (
              <View style={styles.insInputRow}>
                <TextInput
                  value={approachInput}
                  onChangeText={setApproachInput}
                  onSubmitEditing={() => {
                    const t = approachInput.trim()
                    if (t && !approaches.includes(t)) { setApproaches(p => [...p, t]); setSaved(false) }
                    setApproachInput(''); setShowApproachInput(false)
                  }}
                  placeholder="Custom approach"
                  placeholderTextColor={colors.ink36}
                  style={[styles.input, { flex: 1, marginTop: 10 }]}
                  autoFocus returnKeyType="done"
                />
                <Pressable
                  onPress={() => {
                    const t = approachInput.trim()
                    if (t && !approaches.includes(t)) { setApproaches(p => [...p, t]); setSaved(false) }
                    setApproachInput(''); setShowApproachInput(false)
                  }}
                  style={[styles.insAddBtn, { marginTop: 10 }]}
                >
                  <Text style={styles.insAddBtnText}>Add</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={() => setShowApproachInput(true)}>
              <Text style={styles.addPlanText}>+ Add custom</Text>
            </Pressable>
          </View>

          {/* Insurance */}
          <SectionLabel text="In-network insurance" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            {insurances.length > 0 && (
              <View style={styles.tags}>
                {insurances.map((plan, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{plan}</Text>
                    <Pressable onPress={() => removeInsurance(i)} hitSlop={8}>
                      <Text style={styles.tagRemove}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            {showInsInput && (
              <View style={styles.insInputRow}>
                <TextInput
                  value={insuranceInput}
                  onChangeText={setInsuranceInput}
                  onSubmitEditing={() => { addInsurance(insuranceInput); setInsuranceInput(''); setShowInsInput(false) }}
                  placeholder="Plan name"
                  placeholderTextColor={colors.ink36}
                  style={[styles.input, { flex: 1 }]}
                  autoFocus
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => { addInsurance(insuranceInput); setInsuranceInput(''); setShowInsInput(false) }}
                  style={styles.insAddBtn}
                >
                  <Text style={styles.insAddBtnText}>Add</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.quickAdd}>
              <Text style={styles.quickAddLabel}>Quick add:</Text>
              <View style={styles.quickAddChips}>
                {QUICK_INSURANCE.map(plan => (
                  <Pressable key={plan} onPress={() => addInsurance(plan)} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>{plan}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Pressable onPress={() => setShowInsInput(true)}>
              <Text style={styles.addPlanText}>+ Add plan</Text>
            </Pressable>
          </View>

          {/* Fees */}
          <SectionLabel text="Out-of-pocket fees" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            {[
              { label: 'Individual session',        value: feeIndividual, set: setFeeIndividual, placeholder: '$150–200' },
              { label: 'Couples session (optional)', value: feeCouples,    set: setFeeCouples,    placeholder: '$200–250' },
              { label: 'Initial consultation',       value: feeInitial,    set: setFeeInitial,    placeholder: '$200' },
            ].map((item, i) => (
              <View key={item.label} style={[styles.feeRow, i > 0 && styles.feeRowBorder]}>
                <Text style={styles.feeLabel}>{item.label}</Text>
                <TextInput
                  value={item.value}
                  onChangeText={v => { item.set(v); setSaved(false) }}
                  placeholder={item.placeholder}
                  placeholderTextColor={colors.ink36}
                  style={styles.feeInput}
                />
              </View>
            ))}
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <View style={{ height: 24 }} />

          <Pressable
            onPress={handleSave}
            disabled={saving || saved}
            style={({ pressed }) => [styles.saveBtn, (saving || pressed) && { opacity: 0.65 }]}
          >
            {saving
              ? <ActivityIndicator color={colors.paper} size="small" />
              : <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : 'Save changes'}</Text>
            }
          </Pressable>

          <View style={{ height: 16 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  watermark: {
    position: 'absolute',
    top: -20, right: -20,
    fontFamily: 'DMSans_400Regular',
    fontSize: 180,
    color: colors.teal,
    opacity: 0.07,
    zIndex: 0,
  },

  scrollContent: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 28 },

  navRow: { marginBottom: 20 },
  backBtn: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: colors.teal },

  heading: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 26, lineHeight: 32, color: colors.ink, marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13, lineHeight: 20,
    color: 'rgba(31,27,22,0.50)', marginBottom: 24,
  },

  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase',
    color: colors.clay, marginBottom: 6, marginTop: 20,
  },

  inputCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14, ...glassBorder, padding: 14, overflow: 'hidden',
  },
  inputLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase',
    color: 'rgba(31,27,22,0.54)', marginBottom: 6,
  },
  input: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 20,
    color: colors.ink, padding: 0, margin: 0,
  },
  inputMultiline: { minHeight: 80, lineHeight: 22 },

  // Photo
  photoCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14, ...glassBorder, overflow: 'hidden',
  },
  photoInner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  photoCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(160,106,87,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(160,106,87,0.25)',
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { fontFamily: 'DMSans_400Regular', fontSize: 24, color: colors.clay, lineHeight: 28 },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,92,90,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  photoTitle: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink, lineHeight: 20 },
  photoSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(31,27,22,0.45)', lineHeight: 16 },

  // Faith
  faithRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  faithChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(251,247,239,0.82)', ...glassBorder,
  },
  faithChipSelected: { backgroundColor: 'rgba(26,92,90,0.10)', borderColor: colors.teal },
  faithChipText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: 'rgba(31,27,22,0.55)' },
  faithChipTextSelected: { fontFamily: 'DMSans_600SemiBold', color: colors.teal },

  // Insurance
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(26,92,90,0.10)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(26,92,90,0.20)',
  },
  tagText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.teal },
  tagRemove: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: colors.teal, lineHeight: 18 },
  insInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insAddBtn: { backgroundColor: colors.teal, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  insAddBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: colors.paper },
  quickAdd: { marginBottom: 10 },
  quickAddLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: 'rgba(31,27,22,0.40)', marginBottom: 6 },
  quickAddChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickChip: {
    backgroundColor: 'rgba(160,106,87,0.08)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(160,106,87,0.20)',
  },
  quickChipText: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: colors.clay },
  quickChipSelected: { backgroundColor: 'rgba(26,92,90,0.12)', borderColor: colors.teal },
  quickChipTextSelected: { fontFamily: 'DMSans_600SemiBold', color: colors.teal },

  formatRow: { flexDirection: 'row', gap: 8 },
  formatChip: {
    flex: 1, height: 42, borderRadius: 12, overflow: 'hidden',
    backgroundColor: 'rgba(251,247,239,0.82)',
    ...glassBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  formatChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  formatChipText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.ink54 },
  formatChipTextActive: { fontFamily: 'DMSans_600SemiBold', color: colors.paper },
  addPlanText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: colors.teal, paddingTop: 4 },

  // Fees
  feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  feeRowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(160,106,87,0.12)' },
  feeLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: 'rgba(31,27,22,0.60)', flex: 1 },
  feeInput: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink, textAlign: 'right', minWidth: 90, padding: 0 },

  inputCardDisabled: { opacity: 0.72, backgroundColor: 'rgba(240,235,228,0.72)' },
  genderValue: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: 'rgba(31,27,22,0.55)', marginBottom: 8 },
  genderNote: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 16, color: 'rgba(31,27,22,0.40)', fontStyle: 'italic' },

  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  counter: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: 'rgba(31,27,22,0.32)' },

  errorText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#C0392B', marginTop: 12 },

  saveBtn: {
    backgroundColor: colors.teal, borderRadius: 14, height: 54,
    justifyContent: 'center', alignItems: 'center', ...shadow.float,
  },
  saveBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: colors.paper },
})
