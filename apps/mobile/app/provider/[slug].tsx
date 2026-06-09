import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Image, Linking, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { Provider, initials, avatarColor, modalityLabel, toArr } from '../../lib/types'
import { colors, space, radius, shadow, glassBorder, glassHighlight, GLASS_BG, GLASS_BLUR } from '../../lib/tokens'

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>
}

const FAITH_LABELS: Record<string, string> = {
  faith_integrated: 'Faith-integrated',
  faith_sensitive: 'Faith-sensitive',
  faith_neutral: 'Faith-neutral',
  secular: 'Secular',
}

function formatLabel(val: string): string {
  if (FAITH_LABELS[val]) return FAITH_LABELS[val]
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function GlassSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
      <View style={glassHighlight} />
      <View style={styles.sectionInner}>
        {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
        {children}
      </View>
    </View>
  )
}

function Chip({ label, warm }: { label: string; warm?: boolean }) {
  return (
    <View style={[styles.chip, warm && styles.chipWarm]}>
      <Text style={[styles.chipText, warm && styles.chipTextWarm]}>{label}</Text>
    </View>
  )
}

// In-memory session dedup — cleared when app restarts, same as sessionStorage on web
const viewedThisSession = new Set<string>()

export default function ProviderProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('providers')
      .select('*')
      .eq('slug', slug)
      .eq('verification_status', 'verified')
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setProvider(data)
        setLoading(false)
        if (!viewedThisSession.has(data.id)) {
          viewedThisSession.add(data.id)
          supabase.rpc('increment_provider_stat', {
            p_provider_id: data.id,
            p_stat_type: 'profile_view',
          })
        }
        AsyncStorage.getItem('sila_provider_id').then(async id => {
          if (!id || id !== data.id) return
          const { data: { session } } = await supabase.auth.getSession()
          if (session) setIsOwnProfile(true)
        })
      })
  }, [slug])

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    )
  }

  if (notFound || !provider) {
    return (
      <View style={styles.centerWrap}>
        <Text style={styles.notFoundH}>Provider not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  const init = initials(provider.name)
  const color = avatarColor(provider.name)
  const creds = [provider.license_type || provider.credentials, provider.state ? `Licensed in ${provider.state}` : null].filter(Boolean).join(' · ')
  const modality = modalityLabel(provider)
  const langs = toArr(provider.languages).join(', ') || 'English'
  const firstName = provider.name.split(' ').find(w => !w.includes('.')) ?? provider.name.split(' ')[0]
  const verifiedLabel = provider.verified_date
    ? `✓ Sila Verified · ${new Date(provider.verified_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : '✓ Sila Verified'
  const specialties = toArr(provider.specialties)
  const approaches = toArr(provider.approaches)
  const identity = toArr(provider.identity)
  const faithTags = provider.faith_approach ? [provider.faith_approach] : []
  const allApproaches = [...approaches, ...faithTags].map(formatLabel)
  const insurances = toArr(provider.insurances)
  const fees = [
    provider.fee_initial   ? { label: 'Initial consultation', amount: provider.fee_initial }   : null,
    provider.fee_individual ? { label: 'Individual session',  amount: provider.fee_individual } : null,
    provider.fee_couples    ? { label: 'Couples session',     amount: provider.fee_couples }    : null,
  ].filter(Boolean) as { label: string; amount: string }[]
  const schedulingUrl = provider.scheduling_url
    ? (provider.scheduling_url.startsWith('http') ? provider.scheduling_url : `https://${provider.scheduling_url}`)
    : null
  const quote = provider.pull_quote || (provider.bio ? provider.bio.split('. ').slice(0, 2).join('. ') + '.' : null)
  const genderLabel = provider.gender === 'male' ? 'Male' : provider.gender === 'female' ? 'Female' : null

  return (
    <View style={styles.root}>

      {/* ── Fully scrollable — hero + quote + content all scroll ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero gradient */}
        <LinearGradient
          colors={[colors.tealNight, colors.tealDeep, colors.teal]}
          locations={[0, 0.5, 1]}
          style={styles.hero}
        >
          <View style={styles.glowClay} />
          <SafeAreaView edges={['top']}>
            <Pressable onPress={() => router.back()} style={styles.heroBack} hitSlop={12}>
              <Text style={styles.heroBackText}>← Back</Text>
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroContent}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
              {provider.photo_url && !photoFailed
                ? <Image source={{ uri: provider.photo_url }} style={styles.avatarImg} onError={() => setPhotoFailed(true)} />
                : <Text style={styles.avatarText}>{init}</Text>
              }
            </View>
            <Text style={styles.heroName}>{provider.name}</Text>
            <Text style={styles.heroCreds}>{creds}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>{verifiedLabel}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pull quote */}
        {quote && (
          <View style={styles.quoteWrap}>
            <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
            <View style={glassHighlight} />
            <View style={styles.quoteInner}>
              <Text style={styles.quoteEyebrow}>In their own words</Text>
              <Text style={styles.quoteText}>"{quote}"</Text>
            </View>
          </View>
        )}

        {/* Content sections */}
        <View style={styles.contentPad}>

          {/* Session info */}
          <GlassSection title="Session info">
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Format</Text>
              <Text style={styles.infoVal}>{modality}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Languages</Text>
              <Text style={styles.infoVal}>{langs}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Availability</Text>
              <Text style={[styles.infoVal, { color: provider.accepting_clients ? colors.verified : colors.clay }]}>
                {provider.accepting_clients ? 'Open to new clients' : 'Full for now'}
              </Text>
            </View>
            {genderLabel && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoVal}>{genderLabel}</Text>
                </View>
              </>
            )}
          </GlassSection>

          {/* Bio */}
          {provider.bio && (
            <View style={styles.group}>
              <SectionLabel text="Bio" />
              <GlassSection>
                <Text style={styles.bioText}>{provider.bio}</Text>
              </GlassSection>
            </View>
          )}

          {/* Focus areas */}
          {specialties.length > 0 && (
            <View style={styles.group}>
              <SectionLabel text="Focus areas" />
              <GlassSection>
                <View style={styles.chips}>
                  {specialties.map((s, i) => <Chip key={s} label={s} warm={i === 0} />)}
                </View>
              </GlassSection>
            </View>
          )}

          {/* Treatment approaches */}
          {allApproaches.length > 0 && (
            <View style={styles.group}>
              <SectionLabel text="Treatment approaches" />
              <GlassSection>
                <View style={styles.chips}>
                  {allApproaches.map(a => <Chip key={a} label={a} />)}
                </View>
              </GlassSection>
            </View>
          )}

          {/* Provider identity */}
          {identity.length > 0 && (
            <View style={styles.group}>
              <SectionLabel text="Provider identity" />
              <GlassSection>
                <View style={styles.chips}>
                  {identity.map(i => <Chip key={i} label={i} />)}
                </View>
              </GlassSection>
            </View>
          )}

          {/* Insurance & fees */}
          {(insurances.length > 0 || fees.length > 0) && (
            <View style={styles.group}>
              <SectionLabel text="Insurance & fees" />
              {insurances.length > 0 && (
                <GlassSection title="In-network insurance">
                  {insurances.map(ins => (
                    <View key={ins} style={styles.infoRow}>
                      <Text style={[styles.infoVal, { color: colors.verified }]}>✓</Text>
                      <Text style={styles.infoVal}>{ins}</Text>
                    </View>
                  ))}
                  <Text style={styles.insNote}>Always verify coverage with your insurance before scheduling.</Text>
                </GlassSection>
              )}
              {fees.length > 0 && (
                <GlassSection title="Out-of-pocket fees">
                  {fees.map(f => (
                    <View key={f.label} style={[styles.infoRow, { justifyContent: 'space-between' }]}>
                      <Text style={styles.infoLabel}>{f.label}</Text>
                      <Text style={[styles.infoVal, { fontFamily: 'DMSans_600SemiBold' }]}>{f.amount}</Text>
                    </View>
                  ))}
                </GlassSection>
              )}
            </View>
          )}

          {/* Privacy notice — only for clients with a scheduling URL */}
          {schedulingUrl && !isOwnProfile && (
            <View style={styles.privacyNotice}>
              <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
              <View style={glassHighlight} />
              <View style={styles.privacyInner}>
                <Text style={styles.privacyLabel}>A note on privacy</Text>
                <Text style={styles.privacyText}>
                  You'll be taken to {firstName}'s own scheduling page. Sila won't see any information you share there — what happens after is between you and them.
                </Text>
              </View>
            </View>
          )}

        </View>

        {/* Spacer for fixed CTA bar */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ── Fixed bottom CTA ── */}
      <View style={styles.ctaBar}>
        <BlurView intensity={GLASS_BLUR} tint="light" style={StyleSheet.absoluteFill} />
        <View style={glassHighlight} />
        <View style={styles.ctaBarInner}>
          {isOwnProfile ? (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88 }]}
              onPress={() => router.push('/(provider)/edit-profile')}
            >
              <Text style={styles.ctaBtnText}>Edit profile</Text>
            </Pressable>
          ) : schedulingUrl ? (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88 }]}
              onPress={() => {
                supabase.rpc('increment_provider_stat', {
                  p_provider_id: provider.id,
                  p_stat_type: 'booking_click',
                })
                const utmUrl = schedulingUrl + (schedulingUrl.includes('?') ? '&' : '?') + 'utm_source=sila&utm_medium=app'
                Linking.openURL(utmUrl)
              }}
            >
              <Text style={styles.ctaBtnText}>Book a session</Text>
            </Pressable>
          ) : (
            <View style={[styles.ctaBtn, styles.ctaBtnDisabled]}>
              <Text style={styles.ctaBtnTextDisabled}>Scheduling link not set</Text>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [styles.ctaBack, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.ctaBackText}>Go back</Text>
          </Pressable>
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },

  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: colors.paper },
  notFoundH: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 24, color: colors.ink },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.tealDeep, borderRadius: radius.full },
  backBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.creamFull },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Hero
  hero: { paddingBottom: 28 },
  glowClay: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: colors.clay, opacity: 0.14, top: -40, right: -40,
  },
  heroBack: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: 4 },
  heroBackText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.cream60 },
  heroContent: { alignItems: 'center', gap: 8, paddingHorizontal: space.lg, paddingTop: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden', marginBottom: 4,
    ...shadow.float,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 28, color: 'rgba(255,255,255,0.90)' },
  heroName: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: colors.creamFull, letterSpacing: -0.5 },
  heroCreds: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.cream60 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: 'rgba(63,106,88,0.30)',
    borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(63,106,88,0.40)',
  },
  verifiedText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#8FD4B0' },

  // Pull quote
  quoteWrap: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  quoteInner: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    backgroundColor: GLASS_BG,
  },
  quoteEyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.clay,
    marginBottom: 8,
  },
  quoteText: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 18, lineHeight: 28, color: colors.ink, letterSpacing: -0.2,
  },

  // Content
  contentPad: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    gap: 12,
  },

  group: { gap: 8 },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10, letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.clay,
  },

  section: {
    borderRadius: radius.md, overflow: 'hidden',
    ...shadow.subtle, ...glassBorder,
  },
  sectionInner: { padding: space.md, gap: 10, backgroundColor: GLASS_BG },
  sectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: colors.ink },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: colors.ink54, flex: 1 },
  infoVal: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.ink },
  divider: { height: 1, backgroundColor: 'rgba(31,27,22,0.07)' },

  nppesNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10, lineHeight: 15,
    color: colors.ink36,
    fontStyle: 'italic',
    marginTop: -4,
  },

  bioText: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, color: colors.ink70 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(26,92,90,0.08)',
    borderWidth: 1, borderColor: 'rgba(26,92,90,0.20)',
  },
  chipWarm: {
    backgroundColor: 'rgba(160,106,87,0.10)',
    borderColor: 'rgba(160,106,87,0.25)',
  },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: colors.teal },
  chipTextWarm: { color: colors.clay },

  insNote: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: colors.ink54, fontStyle: 'italic', marginTop: 4 },

  privacyNotice: {
    borderRadius: radius.md, overflow: 'hidden',
    ...glassBorder, marginTop: 4,
  },
  privacyInner: { padding: space.md, gap: 6, backgroundColor: 'rgba(254,246,240,0.80)' },
  privacyLabel: { fontFamily: 'DMSans_700Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.clay },
  privacyText: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20, color: colors.ink70 },

  // Bottom CTA bar
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    overflow: 'hidden',
    borderTopWidth: 1, borderTopColor: colors.line,
  },
  ctaBarInner: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: 32,
    gap: 10,
    backgroundColor: 'rgba(255,253,250,0.96)',
  },
  ctaBtn: {
    height: 54, backgroundColor: colors.tealDeep,
    borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.card,
  },
  ctaBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: colors.creamFull },
  ctaBtnDisabled: { backgroundColor: colors.line },
  ctaBtnTextDisabled: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: colors.ink54 },
  ctaBack: {
    height: 48, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.tealDeep,
    justifyContent: 'center', alignItems: 'center',
  },
  ctaBackText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.tealDeep },
})
