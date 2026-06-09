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

  // Directory usage
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
  const topViewed = Array.from(statsMap.entries()).sort((a, b) => b[1].views - a[1].views).slice(0, 5)
  const topClicked = Array.from(statsMap.entries()).sort((a, b) => b[1].clicks - a[1].clicks).slice(0, 5)

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
  const topQueries = Array.from(queryCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const zeroResultQueries = events
    .filter(e => e.results_count === 0 && (e.query ?? '').trim())
    .reduce((acc, e) => {
      const q = (e.query ?? '').trim().toLowerCase()
      acc.set(q, (acc.get(q) ?? 0) + 1)
      return acc
    }, new Map<string, number>())
  const topZeroQueries = Array.from(zeroResultQueries.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Provider funnel
  const applied = totalCount ?? 0
  const inReview = inReviewCount ?? 0
  const verified = verifiedCount ?? 0
  const bookable = (allVerified ?? []).filter(p => p.scheduling_url && p.status === 'active').length

  // Avg days to verify — filter out data artifacts (negative or implausibly large values)
  const verifiedProviders = (allVerified ?? []).filter(p => {
    if (!p.verified_date || !p.created_at) return false
    const days = (new Date(p.verified_date).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return days >= 0 && days < 365
  })
  const avgDaysToVerify = verifiedProviders.length > 0
    ? (verifiedProviders.reduce((s, p) => {
        return s + (new Date(p.verified_date!).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / verifiedProviders.length).toFixed(1)
    : '—'

  const monthName = now.toLocaleString('en-US', { month: 'long' })
  const queueTotal = (pendingCount ?? 0) + (inReviewCount ?? 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, paddingBottom: 48 }}>

      {/* Page header */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(160,106,87,0.7)', marginBottom: 6 }}>
          Platform Overview
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FBF7EF', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(251,247,239,0.35)', marginTop: 5 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Section 1: Platform Health ── */}
      <section>
        <SectionHeader
          label="Platform health"
          description="Current state of the provider directory — who's live, who's waiting, and where coverage gaps exist."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          <StatCard
            label="Verified providers"
            value={num(verifiedCount)}
            accent="teal"
            context="Active and visible in the public directory"
          />
          <StatCard
            label="Pending review"
            value={num(queueTotal)}
            accent={queueTotal > 0 ? 'clay' : 'neutral'}
            context={`${num(pendingCount)} new · ${num(inReviewCount)} needs more info`}
            urgent={queueTotal > 0}
            action={queueTotal > 0 ? { label: 'Go to queue →', href: '/admin/queue' } : undefined}
          />
          <StatCard
            label="States covered"
            value={statesCovered === 0 ? '—' : String(statesCovered)}
            accent="neutral"
            context="Distinct US states with ≥1 active provider"
          />
          <StatCard
            label="Unbookable listings"
            value={num(noSchedulingCount)}
            accent={(noSchedulingCount ?? 0) > 0 ? 'warn' : 'neutral'}
            context="Verified providers with no scheduling URL — clients can't book"
          />
          <StatCard
            label="Not accepting"
            value={num(notAcceptingCount)}
            accent="neutral"
            context="Visible in directory but closed to new referrals"
          />
        </div>
      </section>

      <Divider />

      {/* ── Section 2: Directory Usage ── */}
      <section>
        <SectionHeader
          label={`${monthName} directory usage`}
          description="How clients are engaging with provider profiles this month. Views come from the web directory and app. Clicks are when a visitor follows a provider's scheduling link."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <StatCard
            label="Profile views"
            value={num(totalViews)}
            accent="teal"
            context="Sessions that opened a provider profile page"
            large
          />
          <StatCard
            label="Booking clicks"
            value={num(totalClicks)}
            accent="clay"
            context="Visitors who clicked through to a provider's scheduling page"
            large
          />
          <StatCard
            label="Click-through rate"
            value={ctr(totalClicks, totalViews)}
            accent="neutral"
            context="Share of profile views that converted to a booking click"
            large
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <GlassTable
            title="Most viewed this month"
            description="Providers whose profiles are getting the most traffic."
            headers={['Provider', 'Views']}
            rows={topViewed.map(([, v]) => [v.name, num(v.views)])}
            empty="No view data recorded yet"
          />
          <GlassTable
            title="Most clicked this month"
            description="Providers generating the most booking link traffic — your top performers."
            headers={['Provider', 'Clicks']}
            rows={topClicked.map(([, v]) => [v.name, num(v.clicks)])}
            empty="No click data recorded yet"
          />
        </div>
      </section>

      <Divider />

      {/* ── Section 3: Search Intelligence ── */}
      <section>
        <SectionHeader
          label="Search intelligence — last 30 days"
          description="What clients are searching for in the directory. Zero-result searches are the most actionable: they show where the directory has gaps that new provider recruitment could fill."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <StatCard
            label="Total searches"
            value={num(events.length)}
            accent="neutral"
            context="Search queries fired in the directory over the last 30 days"
          />
          <StatCard
            label="Zero-result searches"
            value={num(zeroResults)}
            accent={zeroResults > 5 ? 'warn' : 'neutral'}
            context={`Queries that returned no providers · avg ${avgResults} results per search`}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <GlassTable
            title="Top search queries"
            description="The most common terms clients type. Use this to confirm your directory matches what people actually search for."
            headers={['Query', 'Count']}
            rows={topQueries.map(([q, c]) => [q || '(no text — filter-only search)', String(c)])}
            empty="No search queries recorded yet"
          />
          <GlassTable
            title="Zero-result searches"
            description="Searches that came back empty. High counts on a specific term = a recruitment opportunity."
            headers={['Query', 'Count']}
            rows={topZeroQueries.map(([q, c]) => [q, String(c)])}
            empty="No zero-result searches — good"
            accentRows
          />
        </div>
      </section>

      <Divider />

      {/* ── Section 4: Provider Funnel ── */}
      <section>
        <SectionHeader
          label="Provider funnel"
          description="The verification pipeline from application to bookable listing. Drop-off at each stage highlights where applications are stalling."
        />
        <GlassCard>
          {/* Funnel steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 20 }}>
            <FunnelStep label="Applied"   count={applied}   sublabel="All submissions ever"              pctLabel={null}                    isFirst />
            <FunnelStep label="In review" count={inReview}  sublabel="Awaiting additional verification"  pctLabel={`${pct(inReview, applied)} of applied`} />
            <FunnelStep label="Verified"  count={verified}  sublabel="Cleared all checks"                pctLabel={`${pct(verified, applied)} of applied`} accent />
            <FunnelStep label="Bookable"  count={bookable}  sublabel="Verified + has scheduling link"    pctLabel={`${pct(bookable, verified)} of verified`} accent isLast />
          </div>

          {/* Funnel meta row */}
          <div style={{
            borderTop: '1px solid rgba(26,92,90,0.18)',
            paddingTop: 18,
            display: 'flex',
            gap: 40,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}>
            <MetaItem
              label="Avg. days to verify"
              value={avgDaysToVerify === '—' ? '—' : `${avgDaysToVerify} days`}
              note="From submission to verified status"
            />
            <MetaItem
              label="Rejected"
              value={num(rejectedCount)}
              note="Applications that failed verification"
            />
            <MetaItem
              label="Verified → bookable drop-off"
              value={pct(verified - bookable, verified)}
              note="Verified providers still missing a scheduling URL"
            />
            <div style={{ marginLeft: 'auto' }}>
              <Link href="/admin/queue" style={{ fontSize: 12, color: 'rgba(160,106,87,0.75)', textDecoration: 'none' }}>
                Go to review queue →
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(26,92,90,0.12)', paddingTop: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(251,247,239,0.22)' }}>
          Page views, referral sources, geo, and device data →{' '}
          <a href="https://us.posthog.com/project/461844" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(160,106,87,0.55)', textDecoration: 'none' }}>
            View in PostHog
          </a>
          <span style={{ marginLeft: 8, color: 'rgba(251,247,239,0.12)' }}>
            (web-only analytics — referral traffic, session duration, geographic distribution)
          </span>
        </p>
      </div>

    </div>
  )
}

/* ── Sub-components ── */

function Divider() {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(90deg, rgba(26,92,90,0.25) 0%, rgba(26,92,90,0.08) 60%, transparent 100%)',
      margin: '-8px 0',
    }} />
  )
}

function SectionHeader({ label, description }: { label: string; description: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(251,247,239,0.32)',
        marginBottom: 4,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 13,
        color: 'rgba(251,247,239,0.42)',
        lineHeight: 1.5,
        maxWidth: 680,
      }}>
        {description}
      </p>
    </div>
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

const ACCENT_BORDER: Record<Accent, string> = {
  teal:    'rgba(26,92,90,0.45)',
  clay:    'rgba(160,106,87,0.45)',
  warn:    'rgba(193,125,60,0.45)',
  neutral: 'rgba(26,92,90,0.22)',
}
const ACCENT_BAR: Record<Accent, string> = {
  teal:    '#1A5C5A',
  clay:    '#A06A57',
  warn:    '#C17D3C',
  neutral: 'transparent',
}
const ACCENT_TEXT: Record<Accent, string> = {
  teal:    '#5BB8B6',
  clay:    '#D4956A',
  warn:    '#E8A040',
  neutral: '#FBF7EF',
}

function StatCard({
  label, value, context, accent = 'neutral', large, urgent, action,
}: {
  label: string
  value: string
  context: string
  accent?: Accent
  large?: boolean
  urgent?: boolean
  action?: { label: string; href: string }
}) {
  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${ACCENT_BORDER[accent]}`,
      borderRadius: 14,
      padding: large ? '22px 22px 18px' : '18px 18px 14px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(251,247,239,0.04)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* top accent bar */}
      {accent !== 'neutral' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${ACCENT_BAR[accent]}, transparent)`,
          opacity: 0.7,
        }} />
      )}
      {/* urgency dot */}
      {urgent && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 7, height: 7, borderRadius: '50%',
          background: '#E8A040',
          boxShadow: '0 0 8px rgba(232,160,64,0.55)',
        }} />
      )}

      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(251,247,239,0.35)',
        marginBottom: 10,
      }}>
        {label}
      </p>

      <p style={{
        fontSize: large ? 40 : 32,
        fontWeight: 700,
        lineHeight: 1,
        color: ACCENT_TEXT[accent],
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 10,
      }}>
        {value}
      </p>

      <p style={{
        fontSize: 12,
        color: 'rgba(251,247,239,0.32)',
        lineHeight: 1.45,
        flexGrow: 1,
      }}>
        {context}
      </p>

      {action && (
        <Link href={action.href} style={{
          marginTop: 10,
          fontSize: 11,
          color: 'rgba(160,106,87,0.75)',
          textDecoration: 'none',
          fontWeight: 500,
        }}>
          {action.label}
        </Link>
      )}
    </div>
  )
}

function GlassTable({
  title, description, headers, rows, empty, accentRows,
}: {
  title: string
  description: string
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
      {/* Table header */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(26,92,90,0.18)',
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(251,247,239,0.72)', margin: '0 0 3px' }}>{title}</p>
        <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.28)', margin: 0, lineHeight: 1.4 }}>{description}</p>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '28px 20px', fontSize: 13, color: 'rgba(251,247,239,0.2)', textAlign: 'center' }}>
          {empty}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,92,90,0.14)' }}>
              {headers.map((h, i) => (
                <th key={i} style={{
                  padding: '8px 20px',
                  textAlign: i === 0 ? 'left' : 'right',
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(251,247,239,0.22)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? '1px solid rgba(26,92,90,0.10)' : 'none' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    textAlign: ci === 0 ? 'left' : 'right',
                    color: ci === 0
                      ? (accentRows ? 'rgba(232,160,64,0.85)' : 'rgba(251,247,239,0.7)')
                      : 'rgba(251,247,239,0.38)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
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

function FunnelStep({ label, count, sublabel, pctLabel, isFirst, isLast, accent }: {
  label: string; count: number; sublabel: string; pctLabel: string | null
  isFirst?: boolean; isLast?: boolean; accent?: boolean
}) {
  return (
    <div style={{
      padding: '18px 24px',
      borderRight: isLast ? 'none' : '1px solid rgba(26,92,90,0.18)',
      position: 'relative',
    }}>
      {!isFirst && (
        <div style={{
          position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%) translateY(-10px)',
          fontSize: 16, color: 'rgba(26,92,90,0.4)', lineHeight: 1,
        }}>›</div>
      )}
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: accent ? 'rgba(91,184,182,0.65)' : 'rgba(251,247,239,0.28)',
        marginBottom: 8,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
        color: accent ? '#5BB8B6' : '#FBF7EF',
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 6,
      }}>
        {count.toLocaleString()}
      </p>
      <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.28)', marginBottom: pctLabel ? 4 : 0 }}>
        {sublabel}
      </p>
      {pctLabel && (
        <p style={{ fontSize: 11, color: accent ? 'rgba(91,184,182,0.5)' : 'rgba(251,247,239,0.18)', fontWeight: 600 }}>
          {pctLabel}
        </p>
      )}
    </div>
  )
}

function MetaItem({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(251,247,239,0.22)',
        marginBottom: 3,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(251,247,239,0.65)', marginBottom: 2 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.22)' }}>
        {note}
      </p>
    </div>
  )
}
