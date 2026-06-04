import { useEffect, useState, useRef } from 'react'
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, Animated, Modal, Image, ScrollView,
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

type FilterState = { format: string; faith: string; accepting: string; type: string; specialty: string[]; gender: string }
const DEFAULT_FILTERS: FilterState = { format: 'all', faith: 'all', accepting: 'all', type: 'all', specialty: [], gender: 'all' }

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

function FilterSheet({
  filters, onChange, onClear, onClose, activeFilterCount,
}: {
  filters: FilterState
  onChange: (key: keyof FilterState, val: string | string[]) => void
  onClear: () => void
  onClose: () => void
  activeFilterCount: number
}) {
  const insets = useSafeAreaInsets()
  const fadeAnim = useRef(new Animated.Value(0)).current

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

          {/* Header */}
          <View style={[fStyles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={dismiss} hitSlop={12} style={fStyles.closeBtn}>
              <Text style={fStyles.closeBtnText}>✕</Text>
            </Pressable>
            <Text style={fStyles.title}>Filter</Text>
            <Pressable onPress={onClear} hitSlop={8} style={{ opacity: hasFilters ? 1 : 0, pointerEvents: hasFilters ? 'auto' : 'none' }}>
              <Text style={fStyles.clearText}>Clear all</Text>
            </Pressable>
          </View>

          {/* Sections */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={fStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Section label="Category" options={TYPE_OPTIONS} activeValue={filters.type} filterKey="type" />
            <Section label="Format" options={FORMAT_OPTIONS} activeValue={filters.format} filterKey="format" />
            <Section label="Availability" options={ACCEPTING_OPTIONS} activeValue={filters.accepting} filterKey="accepting" />
            <Section label="Provider gender" options={GENDER_OPTIONS} activeValue={filters.gender} filterKey="gender" />
            <Section label="Faith approach" options={FAITH_OPTIONS} activeValue={filters.faith} filterKey="faith" />
            <Section label="Focus area" options={SPECIALTY_FILTER_OPTIONS} activeValue={filters.specialty} filterKey="specialty" multiSelect hint="Select all that apply" />
          </ScrollView>

          {/* CTA */}
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

  ctaArea: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
  applyBtn: {
    height: 54, borderRadius: 14, backgroundColor: colors.tealDeep,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#A06A57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16, shadowRadius: 18, elevation: 6,
  },
  applyBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: colors.paper },
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
      {/* Blurred backdrop */}
      <Animated.View style={[styles.sheetOverlay, { opacity: backdropAnim }]}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
        <View style={glassHighlight} />
        <View style={styles.sheetInner}>

          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Provider header */}
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

          {/* Pull quote / bio excerpt */}
          {(p.pull_quote || p.bio) && (
            <View style={styles.sheetBio}>
              <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
              <View style={glassHighlight} />
              <Text style={styles.sheetBioText} numberOfLines={4}>{p.pull_quote || p.bio}</Text>
            </View>
          )}

          {/* Quick details */}
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

          {/* CTAs */}
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

  useEffect(() => {
    supabase
      .from('providers')
      .select('id, slug, name, license_type, credentials, state, specialties, approaches, identity, faith_approach, languages, bio, pull_quote, scheduling_url, insurances, fee_individual, fee_couples, fee_initial, visit_type, telehealth, in_person, photo_url, accepting_clients, verified_date, gender')
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
    filters.specialty.length

  const filtered = providers.filter(p => {
    if (!matchesChip(p, filters.type)) return false
    if (filters.format === 'telehealth' && !p.telehealth) return false
    if (filters.format === 'in_person' && !p.in_person) return false
    if (filters.accepting === 'open' && !p.accepting_clients) return false
    if (filters.accepting === 'full' && p.accepting_clients) return false
    if (filters.gender !== 'all' && p.gender !== filters.gender) return false
    if (filters.faith !== 'all' && p.faith_approach !== filters.faith) return false
    if (filters.specialty.length > 0 && !toArr(p.specialties).some(s => filters.specialty.some(f => s.toLowerCase() === f.toLowerCase()))) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      toArr(p.specialties).some(s => s.toLowerCase().includes(q)) ||
      toArr(p.languages).some(l => l.toLowerCase().includes(q)) ||
      (p.state ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headline}>
            Find someone who{' '}
            <Text style={styles.headlineAccent}>gets it.</Text>
          </Text>
          {zip ? <Text style={styles.zipNote}>Near {zip}</Text> : null}
        </View>

        {/* Search bar */}
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

        {/* Quick filter chips */}
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

        {/* Results count + filter button */}
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

        {/* List */}
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
