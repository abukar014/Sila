import { useState, useEffect } from 'react'
import {
  View, Text, Switch, Pressable, ScrollView,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'

type Provider = {
  id: string
  slug: string | null
  name: string
  photo_url: string | null
  credentials: string | null
  license_type: string | null
  state: string | null
  verified_date: string | null
  accepting_clients: boolean
  bio: string | null
  verification_status: string
  status: string | null
  welcome_seen: boolean
  scheduling_url: string | null
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// ── Non-verified state screens ───────────────────────────────────────────────

function StatusScreen({ heading, body, onSignOut }: {
  heading: string
  body: string
  onSignOut: () => void
}) {
  return (
    <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={{ flex: 1 }}>
      <Text style={styles.watermark} aria-hidden>صلة</Text>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.statusWrap}>
          <Text style={styles.statusWordmark}>Sila</Text>
          <Text style={styles.statusHeading}>{heading}</Text>
          <Text style={styles.statusBody}>{body}</Text>
          <Text style={styles.statusContact}>
            Questions? Reach us at{' '}
            <Text style={styles.statusEmail}>hello@silacare.health</Text>
          </Text>
          <Pressable onPress={onSignOut} style={styles.statusSignOut}>
            <Text style={styles.statusSignOutText}>Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

// ── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [provider, setProvider]     = useState<Provider | null>(null)
  const [loading, setLoading]       = useState(true)
  const [toggling, setToggling]     = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [dismissingBanner, setDismissingBanner] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const id = await AsyncStorage.getItem('sila_provider_id')
    if (!id) { router.replace('/(auth)/sign-in'); return }
    const { data } = await supabase
      .from('providers')
      .select('id, slug, name, photo_url, credentials, license_type, state, verified_date, accepting_clients, bio, verification_status, status, welcome_seen, scheduling_url')
      .eq('id', id)
      .single()
    if (!data) { router.replace('/(auth)/sign-in'); return }
    setProvider(data)
    setLoading(false)
  }

  async function toggleAccepting() {
    if (!provider || toggling) return
    const next = !provider.accepting_clients
    setProvider(p => p ? { ...p, accepting_clients: next } : p)
    setToggling(true)
    const { error } = await supabase
      .from('providers')
      .update({ accepting_clients: next })
      .eq('id', provider.id)
    if (error) setProvider(p => p ? { ...p, accepting_clients: !next } : p)
    setToggling(false)
  }

  async function dismissWelcome() {
    if (!provider || dismissingBanner) return
    setDismissingBanner(true)
    await supabase.from('providers').update({ welcome_seen: true }).eq('id', provider.id)
    setProvider(p => p ? { ...p, welcome_seen: true } : p)
    setDismissingBanner(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    await AsyncStorage.removeItem('sila_provider_id')
    router.replace('/(auth)/sign-in')
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={styles.loadingWrap}>
        <ActivityIndicator color={colors.teal} />
      </LinearGradient>
    )
  }

  if (!provider) return null

  // ── Status-specific screens ──────────────────────────────────────────────

  if (provider.verification_status === 'in_review') {
    return (
      <StatusScreen
        heading="We need a bit more from you."
        body="We reviewed your application and have a few questions before we can move forward. Check your email — we sent over exactly what we need. Once you reply we'll pick it back up right away."
        onSignOut={handleSignOut}
      />
    )
  }

  if (provider.verification_status === 'rejected') {
    return (
      <StatusScreen
        heading="We weren't able to approve your application."
        body="We weren't able to complete our review with what was submitted. Check your email for details on what we found and next steps."
        onSignOut={handleSignOut}
      />
    )
  }

  if (provider.verification_status === 'excluded') {
    return (
      <StatusScreen
        heading="We weren't able to approve your application."
        body="Please check your email for details. If you believe this is an error, reach out to us directly."
        onSignOut={handleSignOut}
      />
    )
  }

  // ── Verified dashboard ───────────────────────────────────────────────────

  const firstName    = provider.name.split(' ')[0]
  const cred         = [provider.credentials || provider.license_type, provider.state].filter(Boolean).join(' · ')
  const verifiedDate = provider.verified_date
    ? new Date(provider.verified_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const showWelcomeBanner = !provider.welcome_seen

  const schedulingShort = provider.scheduling_url
    ? provider.scheduling_url.replace(/^https?:\/\//, '').replace(/\/.{20,}/, '/…')
    : 'Not set'

  const quickActions = [
    {
      icon: '↗',
      title: 'View public profile',
      subtitle: 'See what clients see',
      onPress: () => router.push(`/provider/${provider.slug}`),
    },
    {
      icon: '✎',
      title: 'Edit profile',
      subtitle: 'Bio, photo, languages, fees',
      onPress: () => router.push('/(provider)/edit-profile'),
    },
    {
      icon: '⧗',
      title: 'Scheduling link',
      subtitle: schedulingShort,
      onPress: () => router.push('/(provider)/edit-scheduling'),
    },
  ]

  return (
    <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={{ flex: 1 }}>
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Welcome banner — one time */}
          {showWelcomeBanner && (
            <View style={styles.welcomeBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerHeading}>You've been approved. Welcome to Sila.</Text>
                <Text style={styles.bannerSub}>Your profile is live. Clients can find you in the directory now.</Text>
              </View>
              <Pressable
                onPress={dismissWelcome}
                disabled={dismissingBanner}
                hitSlop={12}
                style={{ paddingLeft: 8 }}
              >
                <Text style={styles.bannerDismiss}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Verified badge */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeCheck}>✓</Text>
              <Text style={styles.badgeText}>Verified Provider</Text>
            </View>
          </View>

          {/* Welcome */}
          <Text style={styles.welcomeLabel}>Welcome back</Text>
          <Text style={styles.welcomeName}>{firstName}</Text>

          {/* ── Profile snapshot ───────────────────────────────────── */}
          <View style={[styles.card, shadow.subtle]}>
            <View style={glassHighlight} />
            <View style={styles.profileRow}>
              {provider.photo_url && !photoFailed ? (
                <Image
                  source={{ uri: `${provider.photo_url}?v=${provider.verified_date ?? 'x'}` }}
                  style={styles.photo}
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <View style={styles.photoFallback}>
                  <Text style={styles.photoInitials}>{initials(provider.name)}</Text>
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.providerName}>{provider.name}</Text>
                {!!cred && <Text style={styles.providerCred}>{cred}</Text>}
                {verifiedDate && <Text style={styles.verifiedDate}>Verified {verifiedDate}</Text>}
              </View>
            </View>
            {!!provider.bio && (
              <>
                <View style={styles.divider} />
                <Text style={styles.bioSnippet} numberOfLines={3}>{provider.bio}</Text>
              </>
            )}
          </View>

          {/* ── Quick actions ──────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>Quick actions</Text>
          <View style={styles.actionsWrap}>
            {quickActions.map((action, i) => (
              <Pressable
                key={action.title}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.actionCard,
                  i < quickActions.length - 1 && styles.actionBorder,
                  pressed && { opacity: 0.72 },
                ]}
              >
                <View style={styles.actionIconWrap}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSub} numberOfLines={1}>{action.subtitle}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>
            ))}
          </View>

          {/* ── Accepting clients ──────────────────────────────────── */}
          <View style={[styles.card, shadow.card]}>
            <View style={glassHighlight} />
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Open to new clients</Text>
                <Text style={styles.toggleSub}>
                  {provider.accepting_clients
                    ? 'Your profile is visible and clients can reach out.'
                    : 'Clients will see your schedule is full for now.'}
                </Text>
              </View>
              <Switch
                value={provider.accepting_clients}
                onValueChange={toggleAccepting}
                disabled={toggling}
                trackColor={{ false: 'rgba(31,27,22,0.14)', true: colors.teal }}
                thumbColor={colors.paper}
                ios_backgroundColor="rgba(31,27,22,0.14)"
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.toggleNote}>
              {provider.accepting_clients
                ? 'Turn this off when your caseload is full or you need a break.'
                : 'Your profile stays visible — clients can still find you.'}
            </Text>
          </View>

          {/* Sign out */}
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.55 }]}
          >
            {signingOut
              ? <ActivityIndicator color={colors.clay} size="small" />
              : <Text style={styles.signOutText}>Sign out</Text>
            }
          </Pressable>

          <View style={{ height: 12 }} />
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

  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 28,
  },

  // ── Status screen ──────────────────────────────────────────────
  statusWrap: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  statusWordmark: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 38,
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: 40,
  },
  statusHeading: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 26,
    lineHeight: 36,
    color: colors.ink,
    marginBottom: 14,
  },
  statusBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 23,
    color: 'rgba(31,27,22,0.60)',
    marginBottom: 20,
  },
  statusContact: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(31,27,22,0.50)',
  },
  statusEmail: {
    fontFamily: 'DMSans_600SemiBold',
    color: colors.teal,
  },
  statusSignOut: {
    marginTop: 'auto' as any,
    alignSelf: 'center',
    paddingVertical: 12,
  },
  statusSignOutText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(31,27,22,0.35)',
    textDecorationLine: 'underline',
  },

  // ── Welcome banner ─────────────────────────────────────────────
  welcomeBanner: {
    backgroundColor: colors.tealNight,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
  },
  bannerHeading: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    lineHeight: 20,
    color: colors.paper,
    marginBottom: 3,
  },
  bannerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(251,247,239,0.55)',
  },
  bannerDismiss: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(251,247,239,0.40)',
    lineHeight: 20,
  },

  // ── Verified badge ─────────────────────────────────────────────
  badgeRow: { alignItems: 'flex-start', marginBottom: 20 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(26,92,90,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(26,92,90,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeCheck: { fontFamily: 'DMSans_700Bold', fontSize: 10, color: colors.teal, lineHeight: 14 },
  badgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: colors.teal, letterSpacing: 0.2 },

  // ── Welcome ────────────────────────────────────────────────────
  welcomeLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(31,27,22,0.45)',
    marginBottom: 2,
  },
  welcomeName: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 44,
    lineHeight: 50,
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: 28,
  },

  // ── Cards ──────────────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 16,
    ...glassBorder,
    overflow: 'hidden',
    padding: 18,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(160,106,87,0.12)',
    marginVertical: 14,
  },

  // ── Toggle ─────────────────────────────────────────────────────
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(31,27,22,0.50)',
    lineHeight: 18,
  },
  toggleNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: 'rgba(31,27,22,0.45)',
  },

  // ── Profile ────────────────────────────────────────────────────
  profileRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  photo: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.line, flexShrink: 0 },
  photoFallback: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(26,92,90,0.12)',
    borderWidth: 1, borderColor: 'rgba(26,92,90,0.20)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  photoInitials: { fontFamily: 'DMSans_700Bold', fontSize: 18, color: colors.teal, lineHeight: 22 },
  providerName: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: colors.ink, lineHeight: 22 },
  providerCred: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: 'rgba(31,27,22,0.50)', lineHeight: 18 },
  verifiedDate: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: colors.teal, opacity: 0.8, marginTop: 2 },
  bioSnippet: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 21, color: 'rgba(31,27,22,0.55)' },

  // ── Quick actions ──────────────────────────────────────────────
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(31,27,22,0.40)',
    marginBottom: 10,
    marginTop: 4,
  },
  actionsWrap: {
    backgroundColor: 'rgba(251,247,239,0.82)',
    borderRadius: 16,
    ...glassBorder,
    overflow: 'hidden',
    marginBottom: 28,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160,106,87,0.10)',
  },
  actionIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(26,92,90,0.10)',
    borderWidth: 1, borderColor: 'rgba(26,92,90,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  actionIcon: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: colors.teal, lineHeight: 20 },
  actionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: colors.ink, lineHeight: 20 },
  actionSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(31,27,22,0.45)', lineHeight: 17, marginTop: 1 },
  actionArrow: { fontFamily: 'DMSans_400Regular', fontSize: 20, color: 'rgba(31,27,22,0.25)', lineHeight: 24 },

  // ── Sign out ───────────────────────────────────────────────────
  signOutBtn: { alignItems: 'center', paddingVertical: 12 },
  signOutText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: colors.teal },
})
