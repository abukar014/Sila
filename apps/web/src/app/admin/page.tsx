import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function pct(n: number, d: number) {
  if (d === 0) return '—'
  return `${Math.round((n / d) * 100)}%`
}

function ctr(clicks: number, views: number) {
  if (views === 0) return '—'
  return `${((clicks / views) * 100).toFixed(1)}%`
}

function num(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString()
}

export default async function AdminOverview() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: verifiedCount },
    { count: pendingCount },
    { count: inReviewCount },
    { count: noSchedulingCount },
    { count: notAcceptingCount },
    { count: totalCount },
    { count: rejectedCount },
    { data: stateData },
    { data: monthlyStats },
    { data: searchEvents },
    { data: allVerified },
  ] = await Promise.all([
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified').eq('status', 'active'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'in_review'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified').eq('status', 'active')
      .or('scheduling_url.is.null,scheduling_url.eq.""'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified').eq('status', 'active')
      .eq('accepting_clients', false),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'rejected'),
    supabaseAdmin.from('providers').select('state')
      .eq('verification_status', 'verified').eq('status', 'active'),
    supabaseAdmin.from('provider_stats_named').select('provider_id, profile_views, booking_clicks, provider_name, stat_date')
      .gte('stat_date', startOfMonth),
    supabaseAdmin.from('search_events_readable').select('query, filters, results_count, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(500),
    supabaseAdmin.from('providers').select('created_at, verified_date, verification_status, status, scheduling_url')
      .eq('verification_status', 'verified'),
  ])

  // Platform health
  const statesSet = new Set((stateData ?? []).map(p => p.state).filter(Boolean))
  const statesCovered = statesSet.size

  // Directory usage — aggregate monthly stats
  const statsMap = new Map<string, { views: number; clicks: number; name: string }>()
  for (const row of monthlyStats ?? []) {
    const existing = statsMap.get(row.provider_id) ?? { views: 0, clicks: 0, name: row.provider_name ?? row.provider_id }
    statsMap.set(row.provider_id, {
      views: existing.views + (row.profile_views ?? 0),
      clicks: existing.clicks + (row.booking_clicks ?? 0),
      name: row.provider_name ?? existing.name,
    })
  }
  const totalViews = Array.from(statsMap.values()).reduce((s, r) => s + r.views, 0)
  const totalClicks = Array.from(statsMap.values()).reduce((s, r) => s + r.clicks, 0)
  const topViewed = Array.from(statsMap.entries())
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 5)
  const topClicked = Array.from(statsMap.entries())
    .sort((a, b) => b[1].clicks - a[1].clicks)
    .slice(0, 5)

  // Search intelligence
  const events = searchEvents ?? []
  const queryCounts = new Map<string, number>()
  let zeroResults = 0
  let totalResultsSum = 0
  let totalResultsCount = 0

  for (const e of events) {
    const q = (e.query ?? '').trim().toLowerCase()
    if (q) queryCounts.set(q, (queryCounts.get(q) ?? 0) + 1)
    if (e.results_count === 0) zeroResults++
    if (e.results_count != null) { totalResultsSum += e.results_count; totalResultsCount++ }
  }
  const avgResults = totalResultsCount > 0 ? (totalResultsSum / totalResultsCount).toFixed(1) : '—'
  const topQueries = Array.from(queryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const zeroResultQueries = events
    .filter(e => e.results_count === 0 && (e.query ?? '').trim())
    .reduce((acc, e) => {
      const q = (e.query ?? '').trim().toLowerCase()
      acc.set(q, (acc.get(q) ?? 0) + 1)
      return acc
    }, new Map<string, number>())
  const topZeroQueries = Array.from(zeroResultQueries.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Provider funnel
  const applied = totalCount ?? 0
  const inReview = inReviewCount ?? 0
  const verified = verifiedCount ?? 0
  const bookable = (allVerified ?? []).filter(p => p.scheduling_url && p.status === 'active').length

  const verifiedProviders = (allVerified ?? []).filter(p => p.verified_date && p.created_at)
  const avgDaysToVerify = verifiedProviders.length > 0
    ? (verifiedProviders.reduce((s, p) => {
        const days = (new Date(p.verified_date!).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
        return s + days
      }, 0) / verifiedProviders.length).toFixed(1)
    : '—'

  const monthName = now.toLocaleString('en-US', { month: 'long' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Page header */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(160,106,87,0.7)', marginBottom: 4 }}>
          Platform Overview
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#FBF7EF', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(251,247,239,0.38)', marginTop: 4 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Section 1: Platform Health ── */}
      <section>
        <SectionLabel>Platform health</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          <StatCard
            label="Verified providers"
            value={num(verifiedCount)}
            accent="teal"
            note="active in directory"
          />
          <StatCard
            label="Pending review"
            value={num((pendingCount ?? 0) + (inReviewCount ?? 0))}
            accent="clay"
            note={`${num(pendingCount)} pending · ${num(inReviewCount)} in review`}
            urgent={(pendingCount ?? 0) + (inReviewCount ?? 0) > 0}
          />
          <StatCard
            label="States covered"
            value={statesCovered === 0 ? '—' : String(statesCovered)}
            accent="neutral"
            note="with ≥1 verified provider"
          />
          <StatCard
            label="Unbookable listings"
            value={num(noSchedulingCount)}
            accent={noSchedulingCount ? 'warn' : 'neutral'}
            note="no scheduling URL"
          />
          <StatCard
            label="Not accepting"
            value={num(notAcceptingCount)}
            accent="neutral"
            note="closed to new clients"
          />
        </div>
      </section>

      {/* ── Section 2: Directory Usage ── */}
      <section>
        <SectionLabel>{monthName} directory usage</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <StatCard
            label="Profile views"
            value={num(totalViews)}
            accent="teal"
            note={`this month`}
            large
          />
          <StatCard
            label="Booking clicks"
            value={num(totalClicks)}
            accent="clay"
            note="leads generated"
            large
          />
          <StatCard
            label="Click-through rate"
            value={ctr(totalClicks, totalViews)}
            accent="neutral"
            note="clicks ÷ views"
            large
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <GlassTable
            title="Most viewed this month"
            headers={['Provider', 'Views']}
            rows={topViewed.map(([, v]) => [v.name, num(v.views)])}
            empty="No view data yet"
          />
          <GlassTable
            title="Most clicked this month"
            headers={['Provider', 'Clicks']}
            rows={topClicked.map(([, v]) => [v.name, num(v.clicks)])}
            empty="No click data yet"
          />
        </div>
      </section>

      {/* ── Section 3: Search Intelligence ── */}
      <section>
        <SectionLabel>Search intelligence — last 30 days</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <StatCard label="Searches" value={num(events.length)} accent="neutral" note="in last 30 days" />
          <StatCard label="Zero-result searches" value={num(zeroResults)} accent={zeroResults > 10 ? 'warn' : 'neutral'} note={`avg ${avgResults} results per search`} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <GlassTable
            title="Top search queries"
            headers={['Query', 'Count']}
            rows={topQueries.map(([q, c]) => [q || '(empty)', String(c)])}
            empty="No search data yet"
          />
          <GlassTable
            title="Zero-result searches"
            headers={['Query', 'Count']}
            rows={topZeroQueries.map(([q, c]) => [q, String(c)])}
            empty="No zero-result searches"
            accentRows
          />
        </div>
      </section>

      {/* ── Section 4: Provider Funnel ── */}
      <section>
        <SectionLabel>Provider funnel</SectionLabel>
        <GlassCard>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            <FunnelStep
              label="Applied"
              count={applied}
              sublabel="all submissions"
              isFirst
            />
            <FunnelStep
              label="In review"
              count={inReview}
              sublabel={`${pct(inReview, applied)} of applied`}
            />
            <FunnelStep
              label="Verified"
              count={verified}
              sublabel={`${pct(verified, applied)} of applied`}
              accent
            />
            <FunnelStep
              label="Bookable"
              count={bookable}
              sublabel={`${pct(bookable, verified)} of verified`}
              accent
              isLast
            />
          </div>
          <div style={{
            borderTop: '1px solid rgba(26,92,90,0.18)',
            marginTop: 20,
            paddingTop: 16,
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
          }}>
            <MetaItem label="Avg. days to verify" value={avgDaysToVerify === '—' ? '—' : `${avgDaysToVerify} days`} />
            <MetaItem label="Rejected" value={num(rejectedCount)} />
            <MetaItem label="Verified → bookable drop-off" value={pct(verified - bookable, verified)} />
            <div style={{ marginLeft: 'auto' }}>
              <Link
                href="/admin/queue"
                style={{
                  fontSize: 12,
                  color: 'rgba(160,106,87,0.85)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Go to review queue →
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* PostHog link */}
      <div style={{ paddingBottom: 8 }}>
        <p style={{ fontSize: 12, color: 'rgba(251,247,239,0.25)' }}>
          Traffic analytics (referral sources, geo, device) →{' '}
          <a
            href="https://us.posthog.com/project/461844"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(160,106,87,0.6)', textDecoration: 'none' }}
          >
            View in PostHog
          </a>
        </p>
      </div>

    </div>
  )
}

/* ── Sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.13em',
      textTransform: 'uppercase',
      color: 'rgba(251,247,239,0.28)',
      marginBottom: 10,
    }}>
      {children}
    </p>
  )
}

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(26,92,90,0.22)',
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(251,247,239,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

type Accent = 'teal' | 'clay' | 'warn' | 'neutral'

const ACCENT_COLORS: Record<Accent, string> = {
  teal: '#1A5C5A',
  clay: '#A06A57',
  warn: '#C17D3C',
  neutral: 'transparent',
}

const ACCENT_TEXT: Record<Accent, string> = {
  teal: '#5BB8B6',
  clay: '#D4956A',
  warn: '#E8A040',
  neutral: '#FBF7EF',
}

function StatCard({
  label, value, note, accent = 'neutral', large, urgent,
}: {
  label: string
  value: string
  note?: string
  accent?: Accent
  large?: boolean
  urgent?: boolean
}) {
  const accentColor = ACCENT_COLORS[accent]
  const textColor = ACCENT_TEXT[accent]
  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${accent !== 'neutral' ? accentColor + '44' : 'rgba(26,92,90,0.22)'}`,
      borderRadius: 14,
      padding: large ? '22px 24px' : '18px 20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(251,247,239,0.04)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent !== 'neutral' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          opacity: 0.6,
        }} />
      )}
      {urgent && (
        <div style={{
          position: 'absolute',
          top: 12, right: 12,
          width: 7, height: 7,
          borderRadius: '50%',
          background: '#E8A040',
          boxShadow: '0 0 8px rgba(232,160,64,0.6)',
        }} />
      )}
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(251,247,239,0.38)',
        marginBottom: 8,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: large ? 38 : 30,
        fontWeight: 700,
        lineHeight: 1,
        color: accent !== 'neutral' ? textColor : '#FBF7EF',
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </p>
      {note && (
        <p style={{
          fontSize: 11,
          color: 'rgba(251,247,239,0.28)',
          marginTop: 6,
        }}>
          {note}
        </p>
      )}
    </div>
  )
}

function GlassTable({
  title, headers, rows, empty, accentRows,
}: {
  title: string
  headers: string[]
  rows: string[][]
  empty: string
  accentRows?: boolean
}) {
  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(26,92,90,0.22)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(251,247,239,0.04)',
    }}>
      <div style={{
        padding: '14px 20px 10px',
        borderBottom: '1px solid rgba(26,92,90,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(251,247,239,0.7)', margin: 0 }}>{title}</p>
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: '24px 20px', fontSize: 13, color: 'rgba(251,247,239,0.22)', textAlign: 'center' }}>
          {empty}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,92,90,0.15)' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '8px 20px',
                    textAlign: i === 0 ? 'left' : 'right',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(251,247,239,0.25)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  borderBottom: ri < rows.length - 1 ? '1px solid rgba(26,92,90,0.10)' : 'none',
                  background: 'transparent',
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: '10px 20px',
                      fontSize: 13,
                      textAlign: ci === 0 ? 'left' : 'right',
                      color: ci === 0
                        ? (accentRows ? 'rgba(232,160,64,0.85)' : 'rgba(251,247,239,0.72)')
                        : 'rgba(251,247,239,0.45)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function FunnelStep({
  label, count, sublabel, isFirst, isLast, accent,
}: {
  label: string
  count: number
  sublabel: string
  isFirst?: boolean
  isLast?: boolean
  accent?: boolean
}) {
  return (
    <div style={{
      padding: '16px 24px',
      borderRight: isLast ? 'none' : '1px solid rgba(26,92,90,0.18)',
      position: 'relative',
    }}>
      {!isFirst && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: '8px solid rgba(26,92,90,0.25)',
        }} />
      )}
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: accent ? 'rgba(91,184,182,0.7)' : 'rgba(251,247,239,0.28)',
        marginBottom: 8,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        color: accent ? '#5BB8B6' : '#FBF7EF',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {count.toLocaleString()}
      </p>
      <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.30)', marginTop: 5 }}>
        {sublabel}
      </p>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(251,247,239,0.25)', marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(251,247,239,0.65)' }}>
        {value}
      </p>
    </div>
  )
}
