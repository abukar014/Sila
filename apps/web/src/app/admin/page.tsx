import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No data'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(diff / 86400000)
  return `${days}d ago`
}


const STATUS_COLOR: Record<string, string> = {
  pending:   'rgba(232,160,64,0.8)',
  in_review: 'rgba(91,184,182,0.8)',
  verified:  'rgba(91,184,182,0.9)',
  rejected:  'rgba(248,113,113,0.8)',
  excluded:  'rgba(248,113,113,0.7)',
}
const STATUS_LABEL: Record<string, string> = {
  pending:   'Submitted',
  in_review: 'In review',
  verified:  'Verified',
  rejected:  'Rejected',
  excluded:  'Excluded',
}

export default async function AdminOverview() {
  const now = new Date()

  const [
    { count: verified },
    { count: pending },
    { count: inReview },
    { count: noScheduling },
    { count: notAccepting },
    { data: stateData },
    { data: overdueQueue },
    { data: recentActivity },
    { data: lastSearch },
    { data: lastStat },
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
    supabaseAdmin.from('providers').select('state')
      .eq('verification_status', 'verified').eq('status', 'active'),
    supabaseAdmin.from('providers')
      .select('id, name, submitted_at')
      .eq('verification_status', 'pending')
      .not('submitted_at', 'is', null)
      .lt('submitted_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .order('submitted_at', { ascending: true }),
    supabaseAdmin.from('providers')
      .select('id, name, verification_status, submitted_at, verified_date')
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(12),
    supabaseAdmin.from('search_events_readable')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1),
    supabaseAdmin.from('provider_stats_named')
      .select('stat_date')
      .order('stat_date', { ascending: false })
      .limit(1),
  ])

  const statesSet = new Set((stateData ?? []).map(p => p.state).filter(Boolean))
  const queueUrgent = overdueQueue?.length ?? 0
  const lastSearchDate = lastSearch?.[0]?.created_at ?? null
  const lastStatDate   = lastStat?.[0]?.stat_date   ?? null
  const queueTotal = (pending ?? 0) + (inReview ?? 0)

  // Build deduplicated activity timeline
  type Event = { id: string; name: string; status: string; date: string }
  const seen = new Set<string>()
  const timeline: Event[] = []
  for (const p of recentActivity ?? []) {
    if (seen.has(p.id)) continue
    seen.add(p.id)
    const date = p.verification_status === 'verified' && p.verified_date
      ? p.verified_date
      : p.submitted_at!
    timeline.push({ id: p.id, name: p.name, status: p.verification_status, date })
  }
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const attentionItems = [
    ...(queueUrgent > 0 ? [{
      label: `${queueUrgent} application${queueUrgent > 1 ? 's' : ''} waiting over 3 days`,
      sub: 'Review the queue to keep providers moving through verification.',
      href: '/admin/verification?tab=queue',
      cta: 'Open queue →',
    }] : []),
    ...((noScheduling ?? 0) > 0 ? [{
      label: `${noScheduling} verified provider${(noScheduling ?? 0) > 1 ? 's' : ''} with no scheduling URL`,
      sub: 'These listings are visible but clients cannot book through Sila.',
      href: '/admin/verification?tab=verified',
      cta: 'View verified →',
    }] : []),
    ...((notAccepting ?? 0) > 0 ? [{
      label: `${notAccepting} provider${(notAccepting ?? 0) > 1 ? 's' : ''} not accepting new clients`,
      sub: 'Consider reaching out to confirm whether they want to remain listed.',
      href: '/admin/verification?tab=verified',
      cta: 'View verified →',
    }] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 48 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(160,106,87,0.65)', marginBottom: 5 }}>
          Platform Overview
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#FBF7EF', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontSize: 12.5, color: 'rgba(251,247,239,0.32)', marginTop: 4 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Quick stat row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'Verified',  value: verified  ?? 0, color: '#5BB8B6' },
          { label: 'In queue',  value: queueTotal,     color: queueTotal > 0 ? '#E8A040' : 'rgba(251,247,239,0.38)' },
          { label: 'States',    value: statesSet.size, color: 'rgba(251,247,239,0.5)' },
          { label: 'Unbookable',value: noScheduling ?? 0, color: (noScheduling ?? 0) > 0 ? '#E8A040' : 'rgba(251,247,239,0.25)' },
        ].map(chip => (
          <div key={chip.label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: 'rgba(26,92,90,0.1)',
            border: '1px solid rgba(26,92,90,0.2)',
            borderRadius: 20,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: chip.color, fontVariantNumeric: 'tabular-nums' }}>
              {chip.value}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(251,247,239,0.32)', fontWeight: 500 }}>
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Needs Attention */}
          <Section label="Needs attention">
            {attentionItems.length === 0 ? (
              <GlassCard style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#5BB8B6',
                    boxShadow: '0 0 8px rgba(91,184,182,0.6)',
                    flexShrink: 0,
                  }}/>
                  <span style={{ fontSize: 13, color: 'rgba(251,247,239,0.55)' }}>
                    No issues — everything looks good
                  </span>
                </div>
              </GlassCard>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attentionItems.map((item, i) => (
                  <GlassCard key={i} style={{ padding: '16px 20px', borderColor: 'rgba(232,160,64,0.28)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#E8A040',
                        boxShadow: '0 0 6px rgba(232,160,64,0.55)',
                        flexShrink: 0, marginTop: 5,
                      }}/>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(251,247,239,0.8)', marginBottom: 3 }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: 11.5, color: 'rgba(251,247,239,0.35)', lineHeight: 1.45, marginBottom: 8 }}>
                          {item.sub}
                        </p>
                        <Link href={item.href} style={{ fontSize: 11, color: 'rgba(160,106,87,0.75)', textDecoration: 'none', fontWeight: 600 }}>
                          {item.cta}
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </Section>

          {/* System Status */}
          <Section label="System status">
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              {[
                {
                  label: 'Directory',
                  sub: 'Provider data · public API',
                  status: 'live' as const,
                  detail: `${verified ?? 0} providers active`,
                },
                {
                  label: 'Search tracking',
                  sub: 'log_search_event RPC',
                  status: (lastSearchDate ? 'live' : 'idle') as 'live' | 'idle',
                  detail: lastSearchDate ? `Last event ${timeAgo(lastSearchDate)}` : 'No events recorded yet',
                },
                {
                  label: 'Analytics tracking',
                  sub: 'increment_provider_stat RPC',
                  status: (lastStatDate ? 'live' : 'idle') as 'live' | 'idle',
                  detail: lastStatDate ? `Last write ${timeAgo(lastStatDate)}` : 'No stats recorded yet',
                },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(26,92,90,0.14)' : 'none',
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: row.status === 'live' ? '#5BB8B6' : 'rgba(251,247,239,0.2)',
                    boxShadow: row.status === 'live' ? '0 0 7px rgba(91,184,182,0.5)' : 'none',
                  }}/>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(251,247,239,0.72)', marginBottom: 1 }}>
                      {row.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.28)' }}>{row.sub}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(251,247,239,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                    {row.detail}
                  </span>
                </div>
              ))}
            </GlassCard>
          </Section>
        </div>

        {/* RIGHT COLUMN — Recent Activity */}
        <Section label="Recent activity">
          <GlassCard style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
            {timeline.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(251,247,239,0.22)', fontSize: 13 }}>
                No provider activity yet
              </div>
            ) : (
              <div>
                {timeline.slice(0, 10).map((event, i) => (
                  <Link
                    key={`${event.id}-${i}`}
                    href={`/admin/providers/${event.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 13,
                      padding: '12px 20px',
                      borderBottom: i < Math.min(timeline.length, 10) - 1 ? '1px solid rgba(26,92,90,0.12)' : 'none',
                      textDecoration: 'none',
                      transition: 'background 0.12s',
                    }}
                  >
                    {/* Status dot */}
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: STATUS_COLOR[event.status] ?? 'rgba(251,247,239,0.3)',
                    }}/>

                    {/* Name + status */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 500,
                        color: 'rgba(251,247,239,0.78)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginBottom: 1,
                      }}>
                        {event.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(251,247,239,0.3)' }}>
                        {STATUS_LABEL[event.status] ?? event.status}
                      </p>
                    </div>

                    {/* Time */}
                    <span style={{ fontSize: 11, color: 'rgba(251,247,239,0.25)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {timeAgo(event.date)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </Section>
      </div>

    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: 9.5, fontWeight: 700, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'rgba(251,247,239,0.24)',
        marginBottom: 8,
      }}>
        {label}
      </p>
      {children}
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
      borderRadius: 13,
      boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(251,247,239,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}
