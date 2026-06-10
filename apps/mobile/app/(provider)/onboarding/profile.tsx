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
import { supabase } from '../../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../../lib/tokens'

const FAITH_OPTIONS = [
  {
    label: 'Faith-integrated',
    value: 'faith_integrated',
    desc: 'Spiritual practice and scripture woven into sessions',
  },
  {
    label: 'Faith-sensitive',
    value: 'faith_sensitive',
    desc: 'Religion-aware; honors beliefs without centering them',
  },
  {
    label: 'Faith-neutral',
    value: 'faith_neutral',
    desc: "Evidence-based; follows the client's lead on faith",
  },
  {
    label: 'Secular',
    value: 'secular',
    desc: 'Strictly clinical; faith kept outside the room',
  },
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

const AGE_GROUP_OPTIONS = [
  { label: 'Children (6–12)',      value: 'children' },
  { label: 'Teens (13–17)',        value: 'teens' },
  { label: 'Young Adults (18–24)', value: 'young_adults' },
  { label: 'Adults (25–64)',       value: 'adults' },
  { label: 'Seniors (65+)',        value: 'seniors' },
]

const PULL_QUOTE_MAX = 180
const BIO_MAX = 600

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

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>
}

export default function ProfileScreen() {
  const [photoUrl, setPhotoUrl]             = useState('') // local URI for display
  const [savedPhotoUrl, setSavedPhotoUrl]   = useState('') // remote URL for saving
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [faithApproach, setFaithApproach]   = useState('faith_integrated')
  const [telehealth, setTelehealth]         = useState(false)
  const [inPerson, setInPerson]             = useState(true)
  const [languages, setLanguages]           = useState('')
  const [pullQuote, setPullQuote]           = useState('')
  const [bio, setBio]                       = useState('')
  const [schedulingUrl, setSchedulingUrl]   = useState('')
  const [specialties, setSpecialties]             = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput]       = useState('')
  const [showSpecialtyInput, setShowSpecialtyInput] = useState(false)
  const [approaches, setApproaches]               = useState<string[]>([])
  const [approachInput, setApproachInput]         = useState('')
  const [showApproachInput, setShowApproachInput] = useState(false)
  const [insurances, setInsurances]               = useState<string[]>([])
  const [insuranceInput, setInsuranceInput]       = useState('')
  const [showInsInput, setShowInsInput]           = useState(false)
  const [feeIndividual, setFeeIndividual]   = useState('')
  const [feeCouples, setFeeCouples]         = useState('')
  const [feeInitial, setFeeInitial]         = useState('')
  const [slidingScale, setSlidingScale]     = useState(false)
  const [ageGroups, setAgeGroups]           = useState<string[]>([])
  const [error, setError]                   = useState('')
  const [loading, setLoading]               = useState(false)

  useEffect(() => {
    async function loadExisting() {
      const providerId = await AsyncStorage.getItem('sila_provider_id')
      if (!providerId) return
      const { data } = await supabase
        .from('providers')
        .select('photo_url, faith_approach, telehealth, in_person, languages, pull_quote, bio, scheduling_url, specialties, approaches, insurances, fee_individual, fee_couples, fee_initial, sliding_scale, age_groups')
        .eq('id', providerId)
        .single()
      if (!data) return
      if (data.photo_url)     { setPhotoUrl(data.photo_url); setSavedPhotoUrl(data.photo_url) }
      if (data.faith_approach) setFaithApproach(data.faith_approach)
      if (data.telehealth != null) setTelehealth(data.telehealth)
      if (data.in_person != null)  setInPerson(data.in_person)
      if (data.languages)     setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : data.languages)
      if (data.pull_quote)    setPullQuote(data.pull_quote)
      if (data.bio)           setBio(data.bio)
      if (data.scheduling_url) setSchedulingUrl(data.scheduling_url)
      if (data.specialties)   setSpecialties(data.specialties ?? [])
      if (data.approaches)    setApproaches(data.approaches ?? [])
      if (data.insurances)    setInsurances(data.insurances ?? [])
      if (data.fee_individual) setFeeIndividual(data.fee_individual)
      if (data.fee_couples)   setFeeCouples(data.fee_couples)
      if (data.fee_initial)   setFeeInitial(data.fee_initial)
      if (data.sliding_scale != null) setSlidingScale(data.sliding_scale)
      if (data.age_groups)    setAgeGroups(data.age_groups ?? [])
    }
    loadExisting()
  }, [])

  async function handlePhotoUpload() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Photo library access is required to upload a photo.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (result.canceled || !result.assets[0]) return

    const uri = result.assets[0].uri
    const providerId = await AsyncStorage.getItem('sila_provider_id')
    if (!providerId) return

    // Show local preview immediately — don't wait for upload
    setPhotoUrl(uri)
    setPhotoLoadFailed(false)
    setUploading(true)
    setError('')
    try {
      const response = await fetch(uri)
      const arrayBuffer = await response.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('provider-photos')
        .upload(`${providerId}.jpg`, arrayBuffer, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) { setError(uploadError.message); return }

      const { data: { publicUrl } } = supabase.storage
        .from('provider-photos')
        .getPublicUrl(`${providerId}.jpg`)

      // Append version param so CDN/RN cache treats this as a new URL after each upload
      setSavedPhotoUrl(`${publicUrl}?v=${Date.now()}`)
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

  async function handleContinue() {
    setError('')
    if (!photoUrl)             { setError('Please upload a photo.'); return }
    if (!bio.trim())           { setError('Please add a bio.'); return }
    if (!schedulingUrl.trim()) { setError('Please add your scheduling link.'); return }

    const providerId = await AsyncStorage.getItem('sila_provider_id')
    if (!providerId) { router.replace('/(provider)/onboarding/account'); return }

    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('providers')
        .update({
          photo_url:      savedPhotoUrl || photoUrl,
          faith_approach: faithApproach,
          telehealth,
          in_person:      inPerson,
          languages:      languages ? languages.split(',').map(l => l.trim()).filter(Boolean) : [],
          pull_quote:     pullQuote.trim() || null,
          bio:            bio.trim(),
          scheduling_url: schedulingUrl.trim(),
          specialties,
          approaches,
          age_groups:     ageGroups,
          insurances,
          fee_individual: feeIndividual || null,
          fee_couples:    feeCouples || null,
          fee_initial:    feeInitial || null,
          sliding_scale:  slidingScale,
        })
        .eq('id', providerId)

      if (err) { setError(err.message ?? 'Failed to save. Please try again.'); return }

      router.push('/(provider)/onboarding/review')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canContinue = !!photoUrl && bio.trim().length > 0 && schedulingUrl.trim().length > 0

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
            <StepDots current={3} />
          </View>

          <Text style={styles.heading}>
            <Text style={styles.headingRegular}>How should clients </Text>
            <Text style={styles.headingAccent}>find you?</Text>
          </Text>
          <Text style={styles.subtitle}>This is your public-facing profile.</Text>

          {/* ── Photo ── */}
          <SectionLabel text="Photo" />
          <Pressable
            onPress={handlePhotoUpload}
            disabled={uploading}
            style={({ pressed }) => [styles.photoCard, shadow.subtle, (uploading || pressed) && { opacity: 0.75 }]}
          >
            <View style={glassHighlight} />
            <View style={styles.photoInner}>
              <View style={styles.photoCircle}>
                {photoUrl && !photoLoadFailed
                  ? <Image source={{ uri: photoUrl }} style={styles.photoImg} onError={() => setPhotoLoadFailed(true)} />
                  : <Text style={styles.photoPlaceholder}>{photoUrl && photoLoadFailed ? '↑' : '+'}</Text>
                }
                {uploading && (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator color={colors.paper} size="small" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.photoTitle}>
                  {uploading ? 'Uploading…' : photoUrl ? 'Tap to change photo' : 'Upload a profile photo'}
                </Text>
                <Text style={styles.photoSub}>Square crop · JPEG · Required</Text>
              </View>
            </View>
          </Pressable>

          {/* ── Faith approach ── */}
          <SectionLabel text="Faith approach" />
          <View style={styles.faithGrid}>
            {FAITH_OPTIONS.map(opt => {
              const selected = faithApproach === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setFaithApproach(opt.value)}
                  style={[styles.faithOption, selected && styles.faithOptionSelected]}
                >
                  <View style={glassHighlight} />
                  <View style={styles.faithHeader}>
                    {selected && <View style={styles.faithDot} />}
                    <Text style={[styles.faithLabel, selected && styles.faithLabelSelected]}>
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={[styles.faithDesc, selected && styles.faithDescSelected]}>
                    {opt.desc}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          {/* ── Session format ── */}
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
                  onPress={() => { setTelehealth(opt.t); setInPerson(opt.ip) }}
                  style={[styles.formatChip, active && styles.formatChipActive]}
                >
                  <View style={glassHighlight} />
                  <Text style={[styles.formatChipText, active && styles.formatChipTextActive]}>{opt.label}</Text>
                </Pressable>
              )
            })}
          </View>

          {/* ── Languages ── */}
          <SectionLabel text="Languages" />
          <InputCard label="Languages spoken">
            <TextInput
              value={languages}
              onChangeText={setLanguages}
              placeholder="English, Urdu, Arabic"
              placeholderTextColor={colors.ink36}
              style={styles.input}
              autoCapitalize="words"
            />
          </InputCard>

          {/* ── Age groups ── */}
          <SectionLabel text="Clients I work with" />
          <Text style={styles.sectionHint}>Which age groups do you see? Tap all that apply.</Text>
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.quickAddChips}>
              {AGE_GROUP_OPTIONS.map(opt => {
                const active = ageGroups.includes(opt.value)
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setAgeGroups(p => active ? p.filter(x => x !== opt.value) : [...p, opt.value])}
                    style={[styles.quickChip, active && styles.quickChipSelected]}
                  >
                    <Text style={[styles.quickChipText, active && styles.quickChipTextSelected]}>{opt.label}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {/* ── Focus areas ── */}
          <SectionLabel text="Focus areas" />
          <Text style={styles.sectionHint}>What do you specialize in? Tap to add, or type a custom one.</Text>
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            {specialties.length > 0 && (
              <View style={styles.insuranceTags}>
                {specialties.map((s, i) => (
                  <View key={i} style={styles.insuranceTag}>
                    <Text style={styles.insuranceTagText}>{s}</Text>
                    <Pressable onPress={() => setSpecialties(p => p.filter((_, idx) => idx !== i))} hitSlop={8}>
                      <Text style={styles.insuranceTagRemove}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.quickAdd}>
              <Text style={styles.quickAddLabel}>Common:</Text>
              <View style={styles.quickAddChips}>
                {SPECIALTY_OPTIONS.filter(s => !specialties.includes(s)).map(s => (
                  <Pressable key={s} onPress={() => setSpecialties(p => [...p, s])} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {showSpecialtyInput && (
              <View style={styles.insuranceInputRow}>
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
                  style={styles.insuranceAddBtn}
                >
                  <Text style={styles.insuranceAddBtnText}>Add</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={() => setShowSpecialtyInput(true)} style={styles.addPlanBtn}>
              <Text style={styles.addPlanText}>+ Add custom</Text>
            </Pressable>
          </View>

          {/* ── Treatment approaches ── */}
          <SectionLabel text="Treatment approaches" />
          <Text style={styles.sectionHint}>Tap to select all that apply.</Text>
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.quickAddChips}>
              {APPROACH_OPTIONS.map(a => {
                const active = approaches.includes(a)
                return (
                  <Pressable
                    key={a}
                    onPress={() => setApproaches(p => active ? p.filter(x => x !== a) : [...p, a])}
                    style={[styles.quickChip, active && styles.quickChipSelected]}
                  >
                    <Text style={[styles.quickChipText, active && styles.quickChipTextSelected]}>{a}</Text>
                  </Pressable>
                )
              })}
              {approaches.filter(a => !APPROACH_OPTIONS.includes(a)).map(a => (
                <Pressable
                  key={a}
                  onPress={() => setApproaches(p => p.filter(x => x !== a))}
                  style={[styles.quickChip, styles.quickChipSelected]}
                >
                  <Text style={[styles.quickChipText, styles.quickChipTextSelected]}>{a} ×</Text>
                </Pressable>
              ))}
            </View>
            {showApproachInput && (
              <View style={styles.insuranceInputRow}>
                <TextInput
                  value={approachInput}
                  onChangeText={setApproachInput}
                  onSubmitEditing={() => {
                    const t = approachInput.trim()
                    if (t && !approaches.includes(t)) setApproaches(p => [...p, t])
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
                    if (t && !approaches.includes(t)) setApproaches(p => [...p, t])
                    setApproachInput(''); setShowApproachInput(false)
                  }}
                  style={[styles.insuranceAddBtn, { marginTop: 10 }]}
                >
                  <Text style={styles.insuranceAddBtnText}>Add</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={() => setShowApproachInput(true)} style={styles.addPlanBtn}>
              <Text style={styles.addPlanText}>+ Add custom</Text>
            </Pressable>
          </View>

          {/* ── Pull quote ── */}
          <SectionLabel text="Pull quote" />
          <Text style={styles.sectionHint}>
            Keep it short · Write like you're talking to a friend, not writing a resume.
          </Text>
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.pullQuoteHeader}>
              <Text style={styles.inputLabel}>In your own words</Text>
              <Text style={[styles.sentenceCount, pullQuote.length >= PULL_QUOTE_MAX && { color: colors.clay }]}>
                {pullQuote.length} / {PULL_QUOTE_MAX}
              </Text>
            </View>
            <TextInput
              value={pullQuote}
              onChangeText={t => setPullQuote(t.slice(0, PULL_QUOTE_MAX))}
              multiline
              numberOfLines={3}
              placeholder="I believe healing starts with feeling truly seen…"
              placeholderTextColor={colors.ink36}
              style={[styles.input, styles.inputMultiline]}
              textAlignVertical="top"
            />
          </View>

          {/* ── Bio ── */}
          <SectionLabel text="Bio" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.pullQuoteHeader}>
              <Text style={styles.inputLabel}>Tell clients about your approach <Text style={{ color: colors.clay }}>*</Text></Text>
              <Text style={[styles.sentenceCount, bio.length >= BIO_MAX && { color: colors.clay }]}>
                {bio.length} / {BIO_MAX}
              </Text>
            </View>
            <TextInput
              value={bio}
              onChangeText={t => setBio(t.slice(0, BIO_MAX))}
              multiline
              numberOfLines={4}
              placeholder="I specialize in working with…"
              placeholderTextColor={colors.ink36}
              style={[styles.input, styles.inputMultiline]}
              textAlignVertical="top"
            />
          </View>

          {/* ── Scheduling ── */}
          <SectionLabel text="Scheduling" />
          <InputCard label="Scheduling link" required>
            <TextInput
              value={schedulingUrl}
              onChangeText={setSchedulingUrl}
              placeholder="calendly.com/your-name"
              placeholderTextColor={colors.ink36}
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </InputCard>

          {/* ── Insurance ── */}
          <SectionLabel text="In-network insurance" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            {insurances.length > 0 && (
              <View style={styles.insuranceTags}>
                {insurances.map((plan, i) => (
                  <View key={i} style={styles.insuranceTag}>
                    <Text style={styles.insuranceTagText}>{plan}</Text>
                    <Pressable onPress={() => removeInsurance(i)} hitSlop={8}>
                      <Text style={styles.insuranceTagRemove}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            {showInsInput && (
              <View style={styles.insuranceInputRow}>
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
                  style={styles.insuranceAddBtn}
                >
                  <Text style={styles.insuranceAddBtnText}>Add</Text>
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
            <Pressable onPress={() => setShowInsInput(true)} style={styles.addPlanBtn}>
              <Text style={styles.addPlanText}>+ Add plan</Text>
            </Pressable>
          </View>

          {/* ── Fees ── */}
          <SectionLabel text="Out-of-pocket fees" />
          <View style={[styles.inputCard, shadow.subtle]}>
            <View style={glassHighlight} />
            {[
              { label: 'Individual session',          value: feeIndividual, set: setFeeIndividual, placeholder: '$150–200' },
              { label: 'Couples session (optional)',   value: feeCouples,    set: setFeeCouples,    placeholder: '$200–250' },
              { label: 'Initial consultation',         value: feeInitial,    set: setFeeInitial,    placeholder: '$200'     },
            ].map((item, i) => (
              <View key={item.label} style={[styles.feeRow, i > 0 && styles.feeRowBorder]}>
                <Text style={styles.feeLabel}>{item.label}</Text>
                <TextInput
                  value={item.value}
                  onChangeText={item.set}
                  placeholder={item.placeholder}
                  placeholderTextColor={colors.ink36}
                  style={styles.feeInput}
                />
              </View>
            ))}
            <View style={[styles.feeRow, styles.feeRowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.feeLabel}>Sliding scale available</Text>
                <Text style={styles.slidingScaleHint}>I adjust my rate based on income</Text>
              </View>
              <Pressable
                onPress={() => setSlidingScale(v => !v)}
                style={[styles.toggle, slidingScale && styles.toggleOn]}
                accessibilityRole="switch"
                accessibilityState={{ checked: slidingScale }}
              >
                <View style={[styles.toggleThumb, slidingScale && styles.toggleThumbOn]} />
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={{ marginBottom: 52 }} />

          <Pressable
            onPress={handleContinue}
            disabled={loading || !canContinue}
            style={({ pressed }) => [
              styles.continueBtn,
              (!canContinue || loading || pressed) && { opacity: 0.55 },
            ]}
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

  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.clay,
    marginBottom: 4,
    marginTop: 20,
  },

  sectionHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(31,27,22,0.40)',
    marginBottom: 8,
    marginTop: -2,
  },

  // Photo
  photoCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    ...glassBorder,
    overflow: 'hidden',
  },
  photoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  photoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(160,106,87,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(160,106,87,0.25)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 24,
    color: colors.clay,
    lineHeight: 28,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,92,90,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  photoSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: 'rgba(31,27,22,0.45)',
    lineHeight: 16,
  },

  // Faith approach
  faithGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  faithOption: {
    width: '48%',
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 12,
    ...glassBorder,
    padding: 12,
    overflow: 'hidden',
    gap: 4,
  },
  faithOptionSelected: {
    backgroundColor: 'rgba(26,92,90,0.07)',
    borderColor: colors.teal,
  },
  faithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  faithDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
    flexShrink: 0,
  },
  faithLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(31,27,22,0.60)',
  },
  faithLabelSelected: {
    fontFamily: 'DMSans_600SemiBold',
    color: colors.teal,
  },
  faithDesc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(31,27,22,0.38)',
  },
  faithDescSelected: {
    color: 'rgba(26,92,90,0.60)',
  },

  // Inputs
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
  inputMultiline: {
    minHeight: 80,
    lineHeight: 22,
  },

  // Pull quote
  pullQuoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sentenceCount: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: 'rgba(31,27,22,0.32)',
  },

  // Insurance
  insuranceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  insuranceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(26,92,90,0.10)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(26,92,90,0.20)',
  },
  insuranceTagText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.teal,
  },
  insuranceTagRemove: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.teal,
    lineHeight: 18,
  },
  insuranceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  insuranceAddBtn: {
    backgroundColor: colors.teal,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  insuranceAddBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: colors.paper,
  },
  quickAdd: { marginBottom: 10 },
  quickAddLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: 'rgba(31,27,22,0.40)',
    marginBottom: 6,
  },
  quickAddChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickChip: {
    backgroundColor: 'rgba(160,106,87,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(160,106,87,0.20)',
  },
  quickChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.clay,
  },
  quickChipSelected: {
    backgroundColor: 'rgba(26,92,90,0.12)',
    borderColor: colors.teal,
  },
  quickChipTextSelected: {
    fontFamily: 'DMSans_600SemiBold',
    color: colors.teal,
  },

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
  addPlanBtn: { paddingTop: 4 },
  addPlanText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },

  // Fees
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  feeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,106,87,0.12)',
  },
  feeLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(31,27,22,0.60)',
    flex: 1,
  },
  feeInput: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.ink,
    textAlign: 'right',
    minWidth: 90,
    padding: 0,
  },

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#C0392B',
    marginTop: 12,
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

  slidingScaleHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(31,27,22,0.40)',
    marginTop: 2,
  },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(31,27,22,0.14)',
    justifyContent: 'center',
    paddingHorizontal: 2,
    flexShrink: 0,
  },
  toggleOn: {
    backgroundColor: colors.teal,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
})
