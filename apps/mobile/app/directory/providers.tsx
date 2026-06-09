import { useEffect, useState, useRef, useMemo } from 'react'
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, Animated, Modal, Image, ScrollView, Switch,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { ProviderCard } from '../../components/ProviderCard'
import { Provider, toArr, modalityLabel, initials, avatarColor } from '../../lib/types'
import { colors, space, radius, shadow, glassBorder, glassHighlight, GLASS_BG, GLASS_BLUR } from '../../lib/tokens'

// ── Zip → state helpers ─────────────────────────────────────────────────────
const ZIP_RANGES: [number, number, string][] = [
  [600,988,'PR'],[5001,5907,'VT'],[6001,6928,'CT'],[7001,8989,'NJ'],
  [10001,14975,'NY'],[15001,19640,'PA'],[19701,19980,'DE'],
  [20001,20599,'DC'],[20601,21930,'MD'],[22001,24658,'VA'],
  [24701,26886,'WV'],[27006,28909,'NC'],[29001,29948,'SC'],
  [30001,31999,'GA'],[32004,34997,'FL'],[35004,36925,'AL'],
  [37010,38589,'TN'],[38601,39776,'MS'],[39800,39999,'GA'],
  [40003,42788,'KY'],[43001,45999,'OH'],[46001,47997,'IN'],
  [48001,49971,'MI'],[50001,52809,'IA'],[53001,54990,'WI'],
  [55001,56763,'MN'],[57001,57799,'SD'],[58001,58856,'ND'],
  [59001,59937,'MT'],[60001,62999,'IL'],[63001,65899,'MO'],
  [66002,67954,'KS'],[68001,69367,'NE'],[70001,71497,'LA'],
  [71601,72959,'AR'],[73001,74966,'OK'],[75001,79999,'TX'],
  [80001,81658,'CO'],[82001,83128,'WY'],[83201,83876,'ID'],
  [84001,84784,'UT'],[85001,86556,'AZ'],[87001,88441,'NM'],
  [88500,88599,'TX'],[88901,89883,'NV'],[90001,96162,'CA'],
  [96701,96898,'HI'],[97001,97920,'OR'],[98001,99403,'WA'],[99500,99999,'AK'],
]
function zipToState(zip: string): string | null {
  const n = parseInt(zip, 10)
  for (const [lo, hi, abbr] of ZIP_RANGES) {
    if (n >= lo && n <= hi) return abbr
  }
  return null
}
const STATE_ABBR: Record<string, string> = {
  Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',
  Colorado:'CO',Connecticut:'CT',Delaware:'DE',Florida:'FL',Georgia:'GA',
  Hawaii:'HI',Idaho:'ID',Illinois:'IL',Indiana:'IN',Iowa:'IA',
  Kansas:'KS',Kentucky:'KY',Louisiana:'LA',Maine:'ME',Maryland:'MD',
  Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',Mississippi:'MS',Missouri:'MO',
  Montana:'MT',Nebraska:'NE',Nevada:'NV','New Hampshire':'NH','New Jersey':'NJ',
  'New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND',Ohio:'OH',
  Oklahoma:'OK',Oregon:'OR',Pennsylvania:'PA','Rhode Island':'RI','South Carolina':'SC',
  'South Dakota':'SD',Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',
  Virginia:'VA',Washington:'WA','West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY',
  'District of Columbia':'DC','Puerto Rico':'PR',
}
function stateToAbbr(name: string): string {
  if (!name) return ''
  const t = name.trim()
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase()
  return STATE_ABBR[t] ?? t.slice(0, 2).toUpperCase()
}
function parseFeeMin(str: string | null | undefined): number | null {
  if (!str) return null
  const m = String(str).match(/\d+/)
  return m ? parseInt(m[0], 10) : null
}

// ── Filter types & constants ─────────────────────────────────────────────────
type FilterState = {
  format: string; faith: string; accepting: string; type: string
  specialty: string[]; gender: string; language: string[]; fee: string; slidingScale: boolean
  ageGroup: string[]; approach: string[]
}
const DEFAULT_FILTERS: FilterState = {
  format: 'all', faith: 'all', accepting: 'all', type: 'all',
  specialty: [], gender: 'all', language: [], fee: 'any', slidingScale: false,
  ageGroup: [], approach: [],
}

const AGE_GROUP_OPTIONS = [
  { label: 'Children (6–12)',    value: 'children' },
  { label: 'Teens (13–17)',      value: 'teens' },
  { label: 'Young Adults (18–24)', value: 'young_adults' },
  { label: 'Adults (25–64)',     value: 'adults' },
  { label: 'Seniors (65+)',      value: 'seniors' },
]

const APPROACH_FILTER_OPTIONS = [
  { label: 'CBT',              value: 'CBT' },
  { label: 'DBT',              value: 'DBT' },
  { label: 'EMDR',             value: 'EMDR' },
  { label: 'ACT',              value: 'ACT' },
  { label: 'Psychodynamic',    value: 'Psychodynamic' },
  { label: 'Mindfulness',      value: 'Mindfulness' },
  { label: 'Solution-focused', value: 'Solution-focused' },
  { label: 'Somatic',          value: 'Somatic therapy' },
  { label: 'IFS',              value: 'IFS' },
  { label: 'Gottman',          value: 'Gottman method' },
]

const SPECIALTY_FILTER_OPTIONS = [
  { label: 'Anxiety', value: 'Anxiety' },
  { label: 'Depression', value: 'Depression' },
  { label: 'Trauma', value: 'Trauma' },
  { label: 'Grief', value: 'Grief' },
  { label: 'OCD', value: 'OCD' },
  { label: 'Couples', value: 'Couples' },
  { label: 'Family conflict', value: 'Family conflict' },
  { label: 'Postpartum', value: 'Postpartum' },
  { label: 'ADHD', value: 'ADHD' },
]

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Therapy', value: 'therapy' },
  { label: 'Faith-integrated', value: 'faith' },
  { label: 'Family & Couples', value: 'family' },
  { label: 'Psychiatry', value: 'psychiatry' },
]

const FORMAT_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Telehealth', value: 'telehealth' },
  { label: 'In-person', value: 'in_person' },
]
const FAITH_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Faith-integrated', value: 'faith_integrated' },
  { label: 'Faith-sensitive', value: 'faith_sensitive' },
  { label: 'Faith-neutral', value: 'faith_neutral' },
  { label: 'Secular', value: 'secular' },
]
const ACCEPTING_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Full for now', value: 'full' },
]
const GENDER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
]
const FEE_OPTIONS = [
  { label: 'Any', value: 'any' },
  { label: 'Under $100', value: 'under100' },
  { label: '$100–$150', value: '100-150' },
  { label: '$150–$200', value: '150-200' },
  { label: '$200+', value: '200plus' },
]

// ── Filter sheet ─────────────────────────────────────────────────────────────
function FilterSheet({
  filters, onChange, onClear, onClose, activeFilterCount, availableLanguages,
}: {
  filters: FilterState
  onChange: (key: keyof FilterState, val: string | string[] | boolean) => void
  onClear: () => void
  onClose: () => void
  activeFilterCount: number
  availableLanguages: string[]
}) {
  const insets = useSafeAreaInsets()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [approachExpanded, setApproachExpanded] = useState(() => filters.approach.length > 0)
  const [focusExpanded, setFocusExpanded]       = useState(() => filters.specialty.length > 0)

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start()
  }, [])

  function dismiss() {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(onClose)
  }

  function Section({ label, options, activeValue, filterKey, multiSelect = false, hint }: {
    label: string
    options: { label: string; value: string }[]
    activeValue: string | string[]
    filterKey: keyof FilterState
    multiSelect?: boolean
    hint?: string
  }) {
    return (
      <View style={fStyles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={fStyles.sectionLabel}>{label}</Text>
          {hint && <Text style={fStyles.sectionHint}>{hint}</Text>}
        </View>
        <View style={fStyles.sectionCard}>
          <View style={glassHighlight} />
          <View style={fStyles.chipRow}>
            {options.map(opt => {
              const active = multiSelect
                ? (activeValue as string[]).includes(opt.value)
                : activeValue === opt.value
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    if (multiSelect) {
                      const arr = activeValue as string[]
                      onChange(filterKey, arr.includes(opt.value) ? arr.filter(v => v !== opt.value) : [...arr, opt.value])
                    } else {
                      onChange(filterKey, opt.value)
                    }
                  }}
                  style={[fStyles.chip, active && fStyles.chipActive]}
                >
                  <Text style={[fStyles.chipText, active && fStyles.chipTextActive]}>{opt.label}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  const hasFilters = activeFilterCount > 0

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }}>

          <View style={[fStyles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={dismiss} hitSlop={12} style={fStyles.closeBtn}>
              <Text style={fStyles.closeBtnText}>✕</Text>
            </Pressable>
            <Text style={fStyles.title}>Filter</Text>
            <Pressable onPress={onClear} hitSlop={8} style={{ opacity: hasFilters ? 1 : 0, pointerEvents: hasFilters ? 'auto' : 'none' }}>
              <Text style={fStyles.clearText}>Clear all</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={fStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Section label="Faith approach" options={FAITH_OPTIONS} activeValue={filters.faith} filterKey="faith" />
            {availableLanguages.length > 0 && (
              <Section
                label="Language"
                options={availableLanguages.map(l => ({ label: l, value: l }))}
                activeValue={filters.language}
                filterKey="language"
                multiSelect
                hint="Select all that apply"
              />
            )}
            <Section label="Format" options={FORMAT_OPTIONS} activeValue={filters.format} filterKey="format" />
            <Section label="Provider gender" options={GENDER_OPTIONS} activeValue={filters.gender} filterKey="gender" />
            <Section label="Age group" options={AGE_GROUP_OPTIONS} activeValue={filters.ageGroup} filterKey="ageGroup" multiSelect hint="Select all that apply" />
            <View style={fStyles.section}>
              <Pressable onPress={() => setApproachExpanded(e => !e)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} hitSlop={8}>
                <Text style={fStyles.sectionLabel}>Therapeutic approach</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!approachExpanded && filters.approach.length > 0 && (
                    <View style={fStyles.collapseBadge}><Text style={fStyles.collapseBadgeText}>{filters.approach.length}</Text></View>
                  )}
                  <Text style={[fStyles.collapseChevron, approachExpanded && { transform: [{ rotate: '180deg' }] }]}>›</Text>
                </View>
              </Pressable>
              {approachExpanded && (
                <View style={fStyles.sectionCard}>
                  <View style={glassHighlight} />
                  <View style={fStyles.chipRow}>
                    {APPROACH_FILTER_OPTIONS.map(opt => {
                      const active = filters.approach.includes(opt.value)
                      return (
                        <Pressable key={opt.value} onPress={() => onChange('approach', filters.approach.includes(opt.value) ? filters.approach.filter(v => v !== opt.value) : [...filters.approach, opt.value])} style={[fStyles.chip, active && fStyles.chipActive]}>
                          <Text style={[fStyles.chipText, active && fStyles.chipTextActive]}>{opt.label}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              )}
            </View>
            <Section label="Fees" options={FEE_OPTIONS} activeValue={filters.fee} filterKey="fee" />
            <View style={fStyles.section}>
              <View style={fStyles.sectionCard}>
                <View style={glassHighlight} />
                <View style={fStyles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={fStyles.toggleLabel}>Sliding scale only</Text>
                    <Text style={fStyles.toggleSub}>Providers who adjust fees by income</Text>
                  </View>
                  <Switch
                    value={filters.slidingScale}
                    onValueChange={v => onChange('slidingScale', v)}
                    trackColor={{ false: 'rgba(31,27,22,0.14)', true: colors.teal }}
                    thumbColor={colors.paper}
                    ios_backgroundColor="rgba(31,27,22,0.14)"
                  />
                </View>
              </View>
            </View>
            <Section label="Availability" options={ACCEPTING_OPTIONS} activeValue={filters.accepting} filterKey="accepting" />
            <Section label="Category" options={TYPE_OPTIONS} activeValue={filters.type} filterKey="type" />
            <View style={fStyles.section}>
              <Pressable onPress={() => setFocusExpanded(e => !e)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} hitSlop={8}>
                <Text style={fStyles.sectionLabel}>Focus area</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!focusExpanded && filters.specialty.length > 0 && (
                    <View style={fStyles.collapseBadge}><Text style={fStyles.collapseBadgeText}>{filters.specialty.length}</Text></View>
                  )}
                  <Text style={[fStyles.collapseChevron, focusExpanded && { transform: [{ rotate: '180deg' }] }]}>›</Text>
                </View>
              </Pressable>
              {focusExpanded && (
                <View style={fStyles.sectionCard}>
                  <View style={glassHighlight} />
                  <View style={fStyles.chipRow}>
                    {SPECIALTY_FILTER_OPTIONS.map(opt => {
                      const active = filters.specialty.includes(opt.value)
                      return (
                        <Pressable key={opt.value} onPress={() => onChange('specialty', filters.specialty.includes(opt.value) ? filters.specialty.filter(v => v !== opt.value) : [...filters.specialty, opt.value])} style={[fStyles.chip, active && fStyles.chipActive]}>
                          <Text style={[fStyles.chipText, active && fStyles.chipTextActive]}>{opt.label}</Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={fStyles.ctaArea}>
            <Pressable onPress={dismiss} style={({ pressed }) => [fStyles.applyBtn, pressed && { opacity: 0.85 }]}>
              <Text style={fStyles.applyBtnText}>
                {hasFilters ? 'Apply filters' : 'Done'}
              </Text>
            </Pressable>
          </View>

        </SafeAreaView>
      </Animated.View>
    </Modal>
  )
}

const fStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 16,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(160,106,87,0.10)',
    borderWidth: 1, borderColor: 'rgba(160,106,87,0.20)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink70, lineHeight: 17 },
  title: { fontFamily: 'DMSans_600SemiBold', fontSize: 17, color: colors.ink },
  clearText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.clay },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 16, gap: 20 },

  section: { gap: 8 },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold', fontSize: 10, letterSpacing: 1.3,
    textTransform: 'uppercase', color: colors.clay,
  },
  sectionHint: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.ink36 },
  sectionCard: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(160,106,87,0.28)',
    padding: 14, overflow: 'hidden',
    shadowColor: '#A06A57',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 3,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1, borderColor: 'rgba(160,106,87,0.20)',
  },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.ink54 },
  chipTextActive: { fontFamily: 'DMSans_600SemiBold', color: colors.paper },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.ink, lineHeight: 20, marginBottom: 2 },
  toggleSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.ink54, lineHeight: 16 },

  ctaArea: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
  applyBtn: {
    height: 54, borderRadius: 14, backgroundColor: colors.tealDeep,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#A06A57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16, shadowRadius: 18, elevation: 6,
  },
  applyBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: colors.paper },

  collapseChevron: { fontFamily: 'DMSans_500Medium', fontSize: 18, color: colors.clay, lineHeight: 22 },
  collapseBadge: {
    backgroundColor: colors.clay, borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 2, minWidth: 20, alignItems: 'center',
  },
  collapseBadgeText: { fontFamily: 'DMSans_700Bold', fontSize: 11, color: colors.paper },
})

// Map category-screen type param → filter value
const TYPE_TO_CHIP: Record<string, string> = {
  individual:   'therapy',
  family:       'family',
  psychiatry:   'psychiatry',
  psychologist: 'psychiatry',
  all:          'all',
}

function matchesChip(p: Provider, chip: string) {
  if (chip === 'all') return true
  const all = [
    ...toArr(p.specialties), ...toArr(p.approaches),
    ...toArr(p.identity), p.faith_approach ?? '',
  ].map(s => s.toLowerCase())
  if (chip === 'therapy')    return all.some(s => ['therapy','cbt','dbt','emdr','counseling'].some(k => s.includes(k)))
  if (chip === 'faith')      return all.some(s => ['faith','islamic','muslim','spiritual'].some(k => s.includes(k)))
  if (chip === 'family')     return all.some(s => ['family','couples','marriage','relationship'].some(k => s.includes(k)))
  if (chip === 'psychiatry') return all.some(s => ['psychiatry','medication','prescrib'].some(k => s.includes(k)))
  return true
}

// ── Bottom sheet popup ──────────────────────────────────────────
function ProviderSheet({ provider: p, onClose }: { provider: Provider; onClose: () => void }) {
  const slideAnim    = useRef(new Animated.Value(500)).current
  const backdropAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0, useNativeDriver: true,
        tension: 28, friction: 18,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1, duration: 280,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  function dismiss() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500, duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0, duration: 320,
        useNativeDriver: true,
      }),
    ]).start(onClose)
  }

  const init = initials(p.name)
  const color = avatarColor(p.name)
  const creds = [p.license_type || p.credentials, p.state].filter(Boolean).join(' · ')
  const langs = toArr(p.languages).join(', ') || 'English'
  const insuranceList = toArr(p.insurances)
  const insurance = insuranceList.length === 0
    ? 'Out-of-network · Superbill provided'
    : insuranceList.length <= 3
      ? insuranceList.join(', ')
      : `${insuranceList.slice(0, 3).join(', ')} +${insuranceList.length - 3} more`
  const modality = modalityLabel(p)

  return (
    <Modal transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[styles.sheetOverlay, { opacity: backdropAnim }]}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
        <View style={glassHighlight} />
        <View style={styles.sheetInner}>

          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={[styles.sheetAvatar, { backgroundColor: color }]}>
              {p.photo_url
                ? <Image source={{ uri: p.photo_url }} style={styles.sheetAvatarImg} />
                : <Text style={styles.sheetAvatarText}>{init}</Text>
              }
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.sheetName}>{p.name}</Text>
              <Text style={styles.sheetCreds}>{creds}</Text>
              <Text style={styles.sheetModality}>{modality}</Text>
            </View>
          </View>

          {(p.pull_quote || p.bio) && (
            <View style={styles.sheetBio}>
              <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
              <View style={glassHighlight} />
              <Text style={styles.sheetBioText} numberOfLines={4}>{p.pull_quote || p.bio}</Text>
            </View>
          )}

          <View style={styles.sheetDetails}>
            <View style={styles.sheetDetailRow}>
              <Text style={styles.sheetDetailLabel}>Languages</Text>
              <Text style={styles.sheetDetailVal}>{langs}</Text>
            </View>
            <View style={styles.sheetDivider} />
            <View style={styles.sheetDetailRow}>
              <Text style={styles.sheetDetailLabel}>Insurance</Text>
              <Text style={styles.sheetDetailVal} numberOfLines={1}>{insurance}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.sheetBtnPrimary, pressed && { opacity: 0.88 }]}
            onPress={() => { dismiss(); setTimeout(() => router.push(`/provider/${p.slug}`), 260) }}
          >
            <Text style={styles.sheetBtnPrimaryText}>View full profile →</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.sheetBtnSecondary, pressed && { opacity: 0.7 }]}
            onPress={dismiss}
          >
            <Text style={styles.sheetBtnSecondaryText}>Back</Text>
          </Pressable>

        </View>
      </Animated.View>
    </Modal>
  )
}

// ── Main screen ─────────────────────────────────────────────────
export default function ProvidersScreen() {
  const { type, zip } = useLocalSearchParams<{ type?: string; zip?: string }>()

  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Provider | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    type: TYPE_TO_CHIP[type ?? 'all'] ?? 'all',
  })
  const [showFilters, setShowFilters] = useState(false)
  const scrollY = useRef(new Animated.Value(0)).current

  // Convert zip param to state abbreviation once
  const zipStateAbbr = useMemo(() => {
    if (!zip) return null
    return zipToState(zip)
  }, [zip])

  // Derive available languages from loaded providers
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>()
    providers.forEach(p => toArr(p.languages).forEach(l => { if (l) langs.add(l.trim()) }))
    return [...langs].sort()
  }, [providers])

  useEffect(() => {
    supabase
      .from('providers')
      .select('id, slug, name, license_type, credentials, state, specialties, approaches, identity, faith_approach, languages, bio, pull_quote, scheduling_url, insurances, fee_individual, fee_couples, fee_initial, visit_type, telehealth, in_person, photo_url, accepting_clients, verified_date, gender, sliding_scale, age_groups')
      .eq('verification_status', 'verified')
      .eq('status', 'active')
      .order('name', { ascending: true })
      .then(({ data }) => { setProviders(data ?? []); setLoading(false) })
  }, [])

  const activeFilterCount =
    (filters.format !== 'all' ? 1 : 0) +
    (filters.faith !== 'all' ? 1 : 0) +
    (filters.accepting !== 'all' ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.gender !== 'all' ? 1 : 0) +
    filters.specialty.length +
    filters.language.length +
    filters.ageGroup.length +
    filters.approach.length +
    (filters.fee !== 'any' ? 1 : 0) +
    (filters.slidingScale ? 1 : 0)

  const filtered = providers.filter(p => {
    // State filter from zip
    if (zipStateAbbr) {
      const pAbbr = stateToAbbr(p.state ?? '')
      if (pAbbr !== zipStateAbbr) return false
    }
    if (!matchesChip(p, filters.type)) return false
    if (filters.format === 'telehealth' && !p.telehealth) return false
    if (filters.format === 'in_person' && !p.in_person) return false
    if (filters.accepting === 'open' && !p.accepting_clients) return false
    if (filters.accepting === 'full' && p.accepting_clients) return false
    if (filters.gender !== 'all' && p.gender !== filters.gender) return false
    if (filters.faith !== 'all' && p.faith_approach !== filters.faith) return false
    if (filters.specialty.length > 0 && !toArr(p.specialties).some(s => filters.specialty.some(f => s.toLowerCase() === f.toLowerCase()))) return false
    if (filters.language.length > 0) {
      const pLangs = toArr(p.languages).map(l => l.toLowerCase())
      if (!filters.language.some(l => pLangs.includes(l.toLowerCase()))) return false
    }
    if (filters.fee !== 'any') {
      const feeMin = parseFeeMin(p.fee_individual)
      if (feeMin === null) return false
      if (filters.fee === 'under100'  && feeMin >= 100) return false
      if (filters.fee === '100-150'   && (feeMin < 100 || feeMin > 150)) return false
      if (filters.fee === '150-200'   && (feeMin <= 150 || feeMin > 200)) return false
      if (filters.fee === '200plus'   && feeMin <= 200) return false
    }
    if (filters.slidingScale && !p.sliding_scale) return false
    if (filters.approach.length > 0) {
      const pApproaches = toArr(p.approaches).map(a => a.toLowerCase())
      if (!filters.approach.some(a => pApproaches.some(pa => pa.includes(a.toLowerCase())))) return false
    }
    if (filters.ageGroup.length > 0) {
      const pAgeGroups = toArr(p.age_groups).map(a => a.toLowerCase())
      if (!filters.ageGroup.some(a => pAgeGroups.includes(a.toLowerCase()))) return false
    }
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      toArr(p.specialties).some(s => s.toLowerCase().includes(q)) ||
      toArr(p.languages).some(l => l.toLowerCase().includes(q)) ||
      (p.state ?? '').toLowerCase().includes(q)
    )
  })

  const searchLogTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchLogTimer.current) clearTimeout(searchLogTimer.current)
    searchLogTimer.current = setTimeout(() => {
      const hasQuery = !!search.trim()
      const hasFilters = activeFilterCount > 0
      if (!hasQuery && !hasFilters) return

      const filtersToLog: Record<string, unknown> = {}
      if (filters.type !== 'all')      filtersToLog.category     = filters.type
      if (filters.faith !== 'all')     filtersToLog.faith        = filters.faith
      if (filters.format !== 'all')    filtersToLog.modality     = filters.format
      if (filters.accepting !== 'all') filtersToLog.accepting    = filters.accepting
      if (filters.gender !== 'all')    filtersToLog.gender       = filters.gender
      if (filters.fee !== 'any')       filtersToLog.fee_bracket  = filters.fee
      if (filters.slidingScale)        filtersToLog.sliding_scale = true
      if (filters.specialty.length)    filtersToLog.specialties  = filters.specialty
      if (filters.language.length)     filtersToLog.languages    = filters.language
      if (filters.ageGroup.length)     filtersToLog.age_groups   = filters.ageGroup
      if (filters.approach.length)     filtersToLog.approaches   = filters.approach

      supabase.rpc('log_search_event', {
        p_query:         search.trim() || null,
        p_filters:       Object.keys(filtersToLog).length ? filtersToLog : null,
        p_results_count: filtered.length,
      }).then(({ error }) => {
        if (error) console.error('[Sila] log_search_event failed:', error)
      })
    }, 1000)
  }, [search, filters, filtered.length])

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={styles.safe} edges={['top']}>

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headline}>
            Find someone who{' '}
            <Text style={styles.headlineAccent}>gets it.</Text>
          </Text>
          {zip ? (
            <Text style={styles.zipNote}>
              {zipStateAbbr ? `Providers in ${zipStateAbbr}` : `Near ${zip}`}
            </Text>
          ) : null}
        </View>

        <View style={styles.searchWrap}>
          <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.searchInner}>
            <Text style={styles.searchIco}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Name, specialty, language…"
              placeholderTextColor={colors.ink36}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Text style={styles.searchClear}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ height: 42, flexShrink: 0 }}
          contentContainerStyle={styles.quickChipsRow}
        >
          {([
            { label: 'Open', filterKey: 'accepting', value: 'open', current: filters.accepting },
            { label: 'Telehealth', filterKey: 'format', value: 'telehealth', current: filters.format },
            { label: 'In-person', filterKey: 'format', value: 'in_person', current: filters.format },
          ] as const).map(chip => {
            const active = chip.current === chip.value
            return (
              <Pressable
                key={chip.label}
                onPress={() => setFilters(prev => ({
                  ...prev,
                  [chip.filterKey]: active ? 'all' : chip.value,
                }))}
                style={[styles.quickChip, active && styles.quickChipActive]}
              >
                <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <View style={styles.resultsBar}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.resultsCount}>
              {loading ? 'Loading…' : `${filtered.length} verified provider${filtered.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowFilters(true)}
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          >
            <Svg width={13} height={11} viewBox="0 0 13 11" fill="none">
              <Path d="M0.5 1h12M2.5 5.5h8M4.5 10h4" stroke={activeFilterCount > 0 ? '#FBF7EF' : 'rgba(31,27,22,0.54)'} strokeWidth={1.5} strokeLinecap="round"/>
            </Svg>
            <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
              {activeFilterCount > 0 ? `Filter · ${activeFilterCount}` : 'Filter'}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.teal} size="large" />
          </View>
        ) : (
          <Animated.FlatList
            data={filtered}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyH}>No providers match.</Text>
                <Text style={styles.emptyP}>Try a different search or clear the filter.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <ProviderCard provider={item} onPress={() => setSelected(item)} />
            )}
          />
        )}
      </SafeAreaView>

      {selected && <ProviderSheet provider={selected} onClose={() => setSelected(null)} />}
      {showFilters && (
        <FilterSheet
          filters={filters}
          onChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val as any }))}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          onClose={() => setShowFilters(false)}
          activeFilterCount={activeFilterCount}
          availableLanguages={availableLanguages}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  watermark: {
    position: 'absolute', right: -20, top: -20,
    fontFamily: 'DMSans_400Regular',
    fontSize: 180, color: colors.teal, opacity: 0.06, zIndex: 0,
  },

  header: { paddingHorizontal: space.lg, paddingTop: 20, paddingBottom: 14, gap: 12 },
  backBtn: { alignSelf: 'flex-start' },
  backText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.teal },
  headline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 30, lineHeight: 36, letterSpacing: -0.5, color: colors.ink,
  },
  headlineAccent: { color: colors.teal },
  zipNote: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.ink54 },

  searchWrap: {
    marginHorizontal: space.lg, height: 48,
    borderRadius: radius.full, overflow: 'hidden',
    ...shadow.subtle,
    ...glassBorder,
    marginBottom: 16,
  },
  searchInner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, gap: 8,
    backgroundColor: GLASS_BG,
  },
  searchIco: { fontSize: 16, color: colors.teal, opacity: 0.7 },
  searchInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink },
  searchClear: { fontSize: 13, color: colors.ink36 },

  chips: { paddingHorizontal: space.lg, gap: 8, paddingTop: 2, paddingBottom: 2, alignItems: 'center' },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: 'rgba(31,27,22,0.16)', backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.ink54 },
  chipTextActive: { color: colors.paper },

  resultsBar: { paddingHorizontal: space.lg, paddingBottom: 8, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.verified },
  resultsCount: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.ink54 },

  list: { paddingHorizontal: space.lg, gap: 12, paddingBottom: 48 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { paddingVertical: 64, alignItems: 'center', gap: 8 },
  emptyH: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 24, color: colors.ink },
  emptyP: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.ink54, textAlign: 'center' },

  // ── Bottom sheet ──
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,14,8,0.22)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
    ...shadow.float,
  },
  sheetInner: {
    padding: space.lg, paddingBottom: 36, gap: 12,
    backgroundColor: 'rgba(255,253,250,0.96)',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(31,27,22,0.18)',
    alignSelf: 'center', marginBottom: 4,
  },
  sheetHeader: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  sheetAvatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden', flexShrink: 0,
  },
  sheetAvatarImg: { width: '100%', height: '100%' },
  sheetAvatarText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 20, color: 'rgba(255,255,255,0.9)' },
  sheetName: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22, color: colors.ink, letterSpacing: -0.3 },
  sheetCreds: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.ink54 },
  sheetModality: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.teal },

  sheetBio: {
    borderRadius: radius.md, overflow: 'hidden',
    ...glassBorder,
  },
  sheetBioText: {
    padding: 14, fontFamily: 'DMSans_400Regular',
    fontSize: 13, lineHeight: 20, color: colors.ink70,
    backgroundColor: 'rgba(254,246,240,0.75)',
  },

  sheetDetails: {
    borderRadius: radius.md, overflow: 'hidden',
    ...glassBorder,
    backgroundColor: GLASS_BG,
  },
  sheetDetailRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, gap: 12 },
  sheetDivider: { height: 1, backgroundColor: 'rgba(31,27,22,0.07)', marginHorizontal: 14 },
  sheetDetailLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.ink54, flex: 1 },
  sheetDetailVal: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.ink, flex: 2, textAlign: 'right' },

  sheetBtnPrimary: {
    height: 52, borderRadius: radius.md,
    backgroundColor: colors.tealDeep,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.card,
  },
  sheetBtnPrimaryText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: colors.creamFull },
  sheetBtnSecondary: {
    height: 46, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.tealDeep,
    justifyContent: 'center', alignItems: 'center',
  },
  sheetBtnSecondaryText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.tealDeep },

  quickChipsRow: { paddingHorizontal: space.lg, gap: 8, paddingVertical: 8, alignItems: 'center' },
  quickChip: {
    height: 32, paddingHorizontal: 14,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: 'rgba(31,27,22,0.16)', backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  quickChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  quickChipText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.ink54 },
  quickChipTextActive: { color: colors.paper, fontFamily: 'DMSans_600SemiBold' },

  filterBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
    borderColor: 'rgba(31,27,22,0.18)',
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  filterBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  filterBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.ink54 },
  filterBtnTextActive: { color: colors.paper },
})
