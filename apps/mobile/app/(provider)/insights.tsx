import { useState, useEffect } from 'react'
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../../lib/supabase'
import { colors, shadow, glassBorder, glassHighlight } from '../../lib/tokens'
import {
  InsightsProvider,
  is30DaysActive,
  buildDiscoverabilityTags,
  calcCompleteness,
} from '../../lib/providerInsights'

export default function InsightsScreen() {
  const [provider, setProvider]         = useState<InsightsProvider | null>(null)
  const [loading, setLoading]           = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [monthlyViews, setMonthlyViews]       = useState(0)
  const [allTimeViews, setAllTimeViews]       = useState(0)
  const [monthlyBookings, setMonthlyBookings] = useState(0)
  const [allTimeBookings, setAllTimeBookings] = useState(0)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const id = await AsyncStorage.getItem('sila_provider_id')
    if (!id) { router.replace('/(auth)/sign-in'); return }
    const { data } = await supabase
      .from('providers')
      .select('id, verified_date, scheduling_url, specialties, faith_approach, languages, telehealth, in_person, sliding_scale, photo_url, bio, credentials, license_type')
      .eq('id', id)
      .single()
    if (!data) { router.replace('/(auth)/sign-in'); return }
    setProvider(data)
    setLoading(false)
    loadStats(data.id)
  }

  async function loadStats(providerId: string) {
    const now    = new Date()
    const somStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const [{ data: monthly }, { data: allTime }] = await Promise.all([
      supabase
        .from('provider_daily_stats')
        .select('profile_views, booking_clicks')
        .eq('provider_id', providerId)
        .gte('stat_date', somStr),
      supabase
        .from('provider_daily_stats')
        .select('profile_views, booking_clicks')
        .eq('provider_id', providerId),
    ])

    setMonthlyViews(monthly?.reduce((s, r) => s + (r.profile_views   ?? 0), 0) ?? 0)
    setMonthlyBookings(monthly?.reduce((s, r) => s + (r.booking_clicks ?? 0), 0) ?? 0)
    setAllTimeViews(allTime?.reduce((s, r) => s + (r.profile_views    ?? 0), 0) ?? 0)
    setAllTimeBookings(allTime?.reduce((s, r) => s + (r.booking_clicks ?? 0), 0) ?? 0)
    setStatsLoading(false)
  }

  if (loading) {
    return (
      <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={styles.loadingWrap}>
        <ActivityIndicator color={colors.teal} />
      </LinearGradient>
    )
  }

  if (!provider) return null

  const isActive = is30DaysActive(provider.verified_date)
  const tags     = buildDiscoverabilityTags(provider)
  const { score, gaps } = calcCompleteness(provider)

  return (
    <LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} style={{ flex: 1 }}>
      <Text style={styles.watermark} aria-hidden>صلة</Text>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-start', marginBottom: 24 }}>
            <Text style={styles.backBtn}>← Back</Text>
          </Pressable>

          <Text style={styles.pageTitle}>Data & Insights</Text>

          {/* ── Profile completeness — always shown ─────────────────── */}
          <View style={[styles.card, shadow.card]}>
            <View style={glassHighlight} />
            <View style={styles.completenessHeader}>
              <Text style={styles.cardLabel}>Profile completeness</Text>
              <Text style={styles.completenessScore}>{score}%</Text>
            </View>
            <View style={styles.completenessBar}>
              <View style={[styles.completenessBarFill, { width: `${score}%` }]} />
            </View>
            {gaps.length > 0 ? (
              <>
                <View style={styles.divider} />
                {gaps.map((gap, i) => (
                  <Pressable
                    key={gap}
                    onPress={() => router.push(
                      gap.includes('scheduling') ? '/(provider)/edit-scheduling' : '/(provider)/edit-profile'
                    )}
                    style={({ pressed }) => [
                      styles.gapRow,
                      i < gaps.length - 1 && styles.gapBorder,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={styles.gapBullet}>+</Text>
                    <Text style={styles.gapText}>{gap}</Text>
                    <Text style={styles.gapArrow}>›</Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <View style={styles.divider} />
                <Text style={styles.completeMsg}>Your profile is complete.</Text>
              </>
            )}
          </View>

          {/* ── Stats — gated by 30 days ────────────────────────────── */}
          {!isActive ? (
            <View style={[styles.card, shadow.subtle]}>
              <View style={glassHighlight} />
              <Text style={styles.gateText}>
                Your reach numbers will appear after your first month on Sila.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.contextBanner}>
                Sila is in early launch — your numbers will grow as we expand our client base.
              </Text>

              {statsLoading ? (
                <ActivityIndicator color={colors.teal} style={{ marginVertical: 20 }} />
              ) : (
                <>
                  {/* Profile reach */}
                  <View style={[styles.card, shadow.card]}>
                    <View style={glassHighlight} />
                    <Text style={styles.cardLabel}>People who found your profile</Text>
                    <Text style={styles.bigNum}>{monthlyViews}</Text>
                    <Text style={styles.bigNumSub}>this month</Text>
                    <View style={styles.divider} />
                    <Text style={styles.allTime}>{allTimeViews} all-time</Text>
                  </View>

                  {/* Scheduling visits */}
                  {!!provider.scheduling_url && (
                    <View style={[styles.card, shadow.card]}>
                      <View style={glassHighlight} />
                      <Text style={styles.cardLabel}>People who visited your scheduling page</Text>
                      <Text style={styles.bigNum}>{monthlyBookings}</Text>
                      <Text style={styles.bigNumSub}>this month</Text>
                      <View style={styles.divider} />
                      <Text style={styles.allTime}>{allTimeBookings} all-time</Text>
                    </View>
                  )}

                  {/* Discoverability */}
                  {tags.length > 0 && (
                    <View style={[styles.card, shadow.card]}>
                      <View style={glassHighlight} />
                      <Text style={styles.cardLabel}>Clients can find you when searching for:</Text>
                      <View style={styles.tagRow}>
                        {tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </>
          )}

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

  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 28,
  },

  backBtn: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: colors.teal,
  },

  pageTitle: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 36,
    lineHeight: 42,
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: 24,
  },

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

  cardLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(31,27,22,0.45)',
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  // ── Completeness ───────────────────────────────────────────────
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completenessScore: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: colors.teal,
    lineHeight: 26,
  },
  completenessBar: {
    height: 6,
    backgroundColor: 'rgba(26,92,90,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  completenessBarFill: {
    height: 6,
    backgroundColor: colors.teal,
    borderRadius: 3,
  },
  completeMsg: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(31,27,22,0.45)',
  },
  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
  },
  gapBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160,106,87,0.08)',
  },
  gapBullet: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.clay,
    lineHeight: 18,
    width: 14,
  },
  gapText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.ink,
    lineHeight: 20,
    flex: 1,
  },
  gapArrow: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 18,
    color: 'rgba(31,27,22,0.25)',
    lineHeight: 22,
  },

  // ── Stats section ──────────────────────────────────────────────
  gateText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(31,27,22,0.45)',
  },
  contextBanner: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 19,
    color: 'rgba(31,27,22,0.38)',
    marginBottom: 14,
  },
  bigNum: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 54,
    lineHeight: 54,
    color: colors.teal,
    letterSpacing: -1,
  },
  bigNumSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(31,27,22,0.40)',
    lineHeight: 18,
    marginTop: 2,
  },
  allTime: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(31,27,22,0.45)',
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(26,92,90,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(26,92,90,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.teal,
    lineHeight: 18,
  },
})
