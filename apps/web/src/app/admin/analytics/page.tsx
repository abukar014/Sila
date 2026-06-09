import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const revalidate = 0

function ctr(clicks: number, views: number) {
  if (views === 0) return '—'
  return `${((clicks / views) * 100).toFixed(1)}%`
}

function num(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString()
}

export default async function AnalyticsPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const monthName = now.toLocaleString('en-US', { month: 'long' })

  const [
    { data: monthlyStats },
    { data: searchEvents },
    { data: stateData },
    { count: verifiedCount },
    { count: noSchedulingCount },
    { count: notAcceptingCount },
  ] = await Promise.all([
    supabaseAdmin.from('provider_stats_named')
      .select('provider_id, profile_views, booking_clicks, provider_name, stat_date')
      .gte('stat_date', startOfMonth),
    supabaseAdmin.from('search_events_readable')
      .select('query, filters, results_count, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(500),
    supabaseAdmin.from('providers').select('state')
      .eq('verification_status', 'verified').eq('status', 'active'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified').eq('status', 'active'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified').eq('status', 'active')
      .or('scheduling_url.is.null,scheduling_url.eq.""'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified').eq('status', 'active')
      .eq('accepting_clients', false),
  ])

  // Directory usage
  const statsMap = new Map<string, { views: number; clicks: number; name: string }>()
  for (const row of monthlyStats ?? []) {
    const existing = statsMap.get(row.provider_id) ?? { views: 0, clicks: 0, name: row.provider_name ?? row.provider_id }
    statsMap.set(row.provider_id, {
      views:  existing.views  + (row.profile_views   ?? 0),
      clicks: existing.clicks + (row.booking_clicks  ?? 0),
      name:   row.provider_name ?? existing.name,
    })
  }
  const totalViews  = Array.from(statsMap.values()).reduce((s, r) => s + r.views,  0)
  const totalClicks = Array.from(statsMap.values()).reduce((s, r) => s + r.clicks, 0)
  const topViewed   = Array.from(statsMap.entries()).sort((a, b) => b[1].views  - a[1].views ).slice(0, 5)
  const topClicked  = Array.from(statsMap.entries()).sort((a, b) => b[1].clicks - a[1].clicks).slice(0, 5)

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
  const avgResults  = totalResultsCount > 0 ? (totalResultsSum / totalResultsCount).toFixed(1) : '—'
  const topQueries  = Array.from(queryCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const zeroResultQueries = events
    .filter(e => e.results_count === 0 && (e.query ?? '').trim())
    .reduce((acc, e) => {
      const q = (e.query ?? '').trim().toLowerCase()
      acc.set(q, (acc.get(q) ?? 0) + 1)
      return acc
    }, new Map<string, number>())
  const topZeroQueries = Array.from(zeroResultQueries.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Coverage
  const statesSet = new Set((stateData ?? []).map(p => p.state).filter(Boolean))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 48 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(160,106,87,0.65)', marginBottom: 5 }}>
          Analytics
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#FBF7EF', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
          Data & Analytics
        </h1>
        <p style={{ fontSize: 12.5, color: 'rgba(251,247,239,0.32)', marginTop: 4 }}>
          Directory engagement and search behaviour — data grows as real clients and providers use the platform.
        </p>
      </div>

      {/* ── Directory coverage ── */}
      <div>
        <SectionLabel>Directory coverage</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard label="Verified providers" value={num(verifiedCount)} context="Active and visible in the public directory" accent="teal" />
          <StatCard label="States covered"      value={statesSet.size === 0 ? '—' : String(statesSet.size)} context="Distinct US states with ≥1 active provider" accent="neutral" />
          <StatCard label="Not accepting"       value={num(notAcceptingCount)} context="Visible but closed to new client referrals" accent="neutral" />
        </div>
      </div>

      {/* ── Directory usage ── */}
      <div>
        <SectionLabel>{monthName} directory usage</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <StatCard label="Profile views"      value={num(totalViews)}              context="Sessions that opened a provider profile this month"                  accent="teal"    large />
          <StatCard label="Booking clicks"     value={num(totalClicks)}             context="Visitors who clicked through to a provider's scheduling page"        accent="clay"    large />
          <StatCard label="Click-through rate" value={ctr(totalClicks, totalViews)} context="Share of profile views that converted to a booking click"            accent="neutral" large />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DataTable
            title="Most viewed this month"
            description="Providers whose profiles are getting the most traffic."
            headers={['Provider', 'Views']}
            rows={topViewed.map(([, v]) => [v.name, num(v.views)])}
            empty="No view data recorded yet"
          />
          <DataTable
            title="Most clicked this month"
            description="Providers generating the most booking link traffic."
            headers={['Provider', 'Clicks']}
            rows={topClicked.map(([, v]) => [v.name, num(v.clicks)])}
            empty="No click data recorded yet"
          />
        </div>
      </div>

      {/* ── Search intelligence ── */}
      <div>
        <SectionLabel>Search intelligence — last 30 days</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <StatCard label="Total searches"        value={num(events.length)} context="Search queries fired in the directory" accent="neutral" />
          <StatCard label="Zero-result searches"  value={num(zeroResults)}   context={`Queries that returned nothing · avg ${avgResults} results per search`} accent={zeroResults > 5 ? 'warn' : 'neutral'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DataTable
            title="Top search queries"
            description="Most common terms clients type — confirms directory matches what people actually look for."
            headers={['Query', 'Count']}
            rows={topQueries.map(([q, c]) => [q || '(filter-only search)', String(c)])}
            empty="No search queries recorded yet"
          />
          <DataTable
            title="Zero-result searches"
            description="Searches that came back empty. High counts on a term = a recruitment opportunity."
            headers={['Query', 'Count']}
            rows={topZeroQueries.map(([q, c]) => [q, String(c)])}
            empty="No zero-result searches — good"
            warnRows
          />
        </div>
      </div>

      {/* PostHog link */}
      <div style={{ borderTop: '1px solid rgba(26,92,90,0.12)', paddingTop: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(251,247,239,0.22)' }}>
          Page views, referral sources, geo, device →{' '}
          <a href="https://us.posthog.com/project/461844" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(160,106,87,0.55)', textDecoration: 'none' }}>
            View in PostHog
          </a>
          <span style={{ marginLeft: 8, color: 'rgba(251,247,239,0.12)' }}>
            web-only · session duration, referral traffic, geographic distribution
          </span>
        </p>
      </div>

    </div>
  )
}

/* ── Sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.15em',
      textTransform: 'uppercase', color: 'rgba(251,247,239,0.24)',
      marginBottom: 10,
    }}>
      {children}
    </p>
  )
}

type Accent = 'teal' | 'clay' | 'warn' | 'neutral'
const ACCENT_BORDER: Record<Accent, string> = {
  teal: 'rgba(26,92,90,0.45)', clay: 'rgba(160,106,87,0.45)',
  warn: 'rgba(193,125,60,0.45)', neutral: 'rgba(26,92,90,0.22)',
}
const ACCENT_BAR: Record<Accent, string> = {
  teal: '#1A5C5A', clay: '#A06A57', warn: '#C17D3C', neutral: 'transparent',
}
const ACCENT_TEXT: Record<Accent, string> = {
  teal: '#5BB8B6', clay: '#D4956A', warn: '#E8A040', neutral: '#FBF7EF',
}

function StatCard({ label, value, context, accent = 'neutral', large }: {
  label: string; value: string; context: string; accent?: Accent; large?: boolean
}) {
  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${ACCENT_BORDER[accent]}`,
      borderRadius: 13,
      padding: large ? '22px 22px 18px' : '18px 18px 14px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(251,247,239,0.04)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {accent !== 'neutral' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${ACCENT_BAR[accent]}, transparent)`,
          opacity: 0.65,
        }}/>
      )}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(251,247,239,0.32)', marginBottom: 10 }}>
        {label}
      </p>
      <p style={{ fontSize: large ? 38 : 30, fontWeight: 700, lineHeight: 1, color: ACCENT_TEXT[accent], letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: 10 }}>
        {value}
      </p>
      <p style={{ fontSize: 11.5, color: 'rgba(251,247,239,0.3)', lineHeight: 1.45 }}>
        {context}
      </p>
    </div>
  )
}

function DataTable({ title, description, headers, rows, empty, warnRows }: {
  title: string; description: string; headers: string[]
  rows: string[][]; empty: string; warnRows?: boolean
}) {
  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(26,92,90,0.22)',
      borderRadius: 13,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(251,247,239,0.04)',
    }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(26,92,90,0.16)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(251,247,239,0.7)', margin: '0 0 3px' }}>{title}</p>
        <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.27)', margin: 0, lineHeight: 1.4 }}>{description}</p>
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 13, color: 'rgba(251,247,239,0.2)' }}>
          {empty}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,92,90,0.13)' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '8px 20px', textAlign: i === 0 ? 'left' : 'right', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(251,247,239,0.2)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? '1px solid rgba(26,92,90,0.09)' : 'none' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '10px 20px', fontSize: 13, textAlign: ci === 0 ? 'left' : 'right', color: ci === 0 ? (warnRows ? 'rgba(232,160,64,0.82)' : 'rgba(251,247,239,0.68)') : 'rgba(251,247,239,0.38)', fontVariantNumeric: 'tabular-nums' }}>
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
