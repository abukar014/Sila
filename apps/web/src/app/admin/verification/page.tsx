import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

type SearchParams = Promise<{ tab?: string }>

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export default async function VerificationPage({ searchParams }: { searchParams: SearchParams }) {
  const params  = await searchParams
  const active  = params.tab ?? 'queue'

  // Always fetch counts for the chips
  const [
    { count: pendingCount },
    { count: inReviewCount },
    { count: verifiedCount },
    { count: excludedCount },
  ] = await Promise.all([
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'in_review'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified').eq('status', 'active'),
    supabaseAdmin.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'excluded'),
  ])

  // Fetch table data for active tab
  let queueRows:    { id: string; name: string; credentials: string|null; city: string|null; npi: string|null; submitted_at: string }[]         = []
  let inReviewRows: { id: string; name: string; credentials: string|null; city: string|null; npi: string|null; created_at: string; verification_notes: string|null }[] = []
  let verifiedRows: { id: string; name: string; credentials: string|null; city: string|null; faith_approach: string|null; accepting_clients: boolean; verified_date: string|null }[] = []
  let excludedRows: { id: string; name: string; credentials: string|null; city: string|null; npi: string|null; created_at: string; exclusion_reason: string|null }[] = []

  if (active === 'queue') {
    const { data } = await supabaseAdmin
      .from('providers')
      .select('id, name, credentials, city, npi, submitted_at')
      .eq('verification_status', 'pending')
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: true })
    queueRows = data ?? []
  } else if (active === 'in-review') {
    const { data } = await supabaseAdmin
      .from('providers')
      .select('id, name, credentials, city, npi, created_at, verification_notes')
      .eq('verification_status', 'in_review')
      .order('created_at', { ascending: true })
    inReviewRows = data ?? []
  } else if (active === 'verified') {
    const { data } = await supabaseAdmin
      .from('providers')
      .select('id, name, credentials, city, faith_approach, accepting_clients, verified_date')
      .eq('verification_status', 'verified')
      .eq('status', 'active')
      .order('verified_date', { ascending: false })
    verifiedRows = data ?? []
  } else if (active === 'excluded') {
    const { data: provs } = await supabaseAdmin
      .from('providers')
      .select('id, name, credentials, city, npi, created_at')
      .eq('verification_status', 'excluded')
      .order('created_at', { ascending: false })
    const npis = (provs ?? []).map(p => p.npi).filter(Boolean) as string[]
    const { data: flags } = npis.length > 0
      ? await supabaseAdmin.from('flagged_npis').select('npi, reason').in('npi', npis)
      : { data: [] }
    const flagMap = new Map((flags ?? []).map(f => [f.npi, f.reason]))
    excludedRows = (provs ?? []).map(p => ({
      ...p,
      exclusion_reason: p.npi ? (flagMap.get(p.npi) ?? null) : null,
    }))
  }

  const tabs = [
    { id: 'queue',     label: 'Queue',      count: pendingCount  ?? 0 },
    { id: 'in-review', label: 'In Review',  count: inReviewCount ?? 0 },
    { id: 'verified',  label: 'Verified',   count: verifiedCount ?? 0 },
    { id: 'excluded',  label: 'Excluded',   count: excludedCount ?? 0 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 48 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(160,106,87,0.65)', marginBottom: 5 }}>
          Provider Pipeline
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#FBF7EF', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
          Verification
        </h1>
        <p style={{ fontSize: 12.5, color: 'rgba(251,247,239,0.32)', marginTop: 4 }}>
          Review and manage providers at each stage of the verification process.
        </p>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const isActive = active === tab.id
          const isPending = tab.id === 'queue' && (tab.count > 0)
          const isExcluded = tab.id === 'excluded'
          return (
            <Link
              key={tab.id}
              href={`/admin/verification?tab=${tab.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px',
                borderRadius: 22,
                textDecoration: 'none',
                background: isActive
                  ? 'rgba(26,92,90,0.25)'
                  : 'rgba(26,92,90,0.08)',
                border: isActive
                  ? '1px solid rgba(26,92,90,0.45)'
                  : '1px solid rgba(26,92,90,0.18)',
                transition: 'background 0.14s, border-color 0.14s',
              }}
            >
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: isActive
                  ? '#FBF7EF'
                  : isPending
                    ? '#E8A040'
                    : isExcluded
                      ? 'rgba(248,113,113,0.7)'
                      : 'rgba(251,247,239,0.45)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}>
                {tab.count}
              </span>
              <span style={{
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'rgba(251,247,239,0.85)' : 'rgba(251,247,239,0.38)',
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 2,
        borderBottom: '1px solid rgba(26,92,90,0.18)',
        paddingBottom: 0,
        marginBottom: -4,
      }}>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={`/admin/verification?tab=${tab.id}`}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? '#FBF7EF' : 'rgba(251,247,239,0.38)',
              textDecoration: 'none',
              borderBottom: active === tab.id ? '2px solid #A06A57' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.14s',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {active === 'queue' && (
        <TableShell
          headers={['Name', 'Credentials', 'City', 'NPI', 'Submitted', 'Waiting', '']}
          empty={queueRows.length === 0}
          emptyText="Queue is empty — no providers awaiting review."
        >
          {queueRows.map((p, i) => {
            const days = daysAgo(p.submitted_at)
            const urgency = days >= 7 ? 'urgent' : days >= 3 ? 'warn' : 'ok'
            return (
              <tr key={p.id} style={{ borderBottom: i < queueRows.length - 1 ? '1px solid rgba(26,92,90,0.1)' : 'none', background: 'transparent' }}>
                <td style={tdStyle}><span style={{ color: '#FBF7EF', fontWeight: 500 }}>{p.name}</span></td>
                <td style={tdMuted}>{p.credentials ?? '—'}</td>
                <td style={tdMuted}>{p.city ?? '—'}</td>
                <td style={{ ...tdMuted, fontFamily: 'monospace', fontSize: 12 }}>{p.npi ?? '—'}</td>
                <td style={tdMuted}>{fmtDate(p.submitted_at)}</td>
                <td style={{ ...tdStyle, width: 110 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                    background: urgency === 'urgent' ? 'rgba(248,113,113,0.1)' : urgency === 'warn' ? 'rgba(232,160,64,0.1)' : 'rgba(26,92,90,0.12)',
                    color:      urgency === 'urgent' ? '#f87171'               : urgency === 'warn' ? '#E8A040'               : 'rgba(251,247,239,0.38)',
                    border: `1px solid ${urgency === 'urgent' ? 'rgba(248,113,113,0.25)' : urgency === 'warn' ? 'rgba(232,160,64,0.25)' : 'rgba(26,92,90,0.2)'}`,
                  }}>
                    {urgency === 'urgent' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 5px rgba(248,113,113,0.6)', display: 'inline-block', flexShrink: 0 }}/>}
                    {days === 0 ? 'Today' : `${days}d`}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <Link href={`/admin/providers/${p.id}`} style={actionBtn}>Review →</Link>
                </td>
              </tr>
            )
          })}
        </TableShell>
      )}

      {active === 'in-review' && (
        <TableShell
          headers={['Name', 'Credentials', 'City', 'NPI', 'Submitted', 'Needs verification', '']}
          empty={inReviewRows.length === 0}
          emptyText="No providers currently in review."
        >
          {inReviewRows.map((p, i) => (
            <tr key={p.id} style={{ borderBottom: i < inReviewRows.length - 1 ? '1px solid rgba(26,92,90,0.1)' : 'none' }}>
              <td style={tdStyle}><span style={{ color: '#FBF7EF', fontWeight: 500 }}>{p.name}</span></td>
              <td style={tdMuted}>{p.credentials ?? '—'}</td>
              <td style={tdMuted}>{p.city ?? '—'}</td>
              <td style={{ ...tdMuted, fontFamily: 'monospace', fontSize: 12 }}>{p.npi ?? '—'}</td>
              <td style={tdMuted}>{fmtDate(p.created_at)}</td>
              <td style={{ ...tdMuted, maxWidth: 220 }}>
                <span style={{ fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.verification_notes ?? '—'}
                </span>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <Link href={`/admin/providers/${p.id}`} style={actionBtn}>Continue →</Link>
              </td>
            </tr>
          ))}
        </TableShell>
      )}

      {active === 'verified' && (
        <TableShell
          headers={['Name', 'City', 'Faith approach', 'Accepting', 'Verified', '']}
          empty={verifiedRows.length === 0}
          emptyText="No verified providers yet."
        >
          {verifiedRows.map((p, i) => (
            <tr key={p.id} style={{ borderBottom: i < verifiedRows.length - 1 ? '1px solid rgba(26,92,90,0.1)' : 'none' }}>
              <td style={tdStyle}>
                <span style={{ color: '#FBF7EF', fontWeight: 500 }}>{p.name}</span>
                {p.credentials && <span style={{ display: 'block', fontSize: 11, color: 'rgba(251,247,239,0.28)', marginTop: 1 }}>{p.credentials}</span>}
              </td>
              <td style={tdMuted}>{p.city ?? '—'}</td>
              <td style={tdMuted}>{p.faith_approach?.replace(/_/g, ' ') ?? '—'}</td>
              <td style={tdStyle}>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                  background: p.accepting_clients ? 'rgba(91,184,182,0.12)' : 'rgba(251,247,239,0.06)',
                  color:      p.accepting_clients ? '#5BB8B6'                : 'rgba(251,247,239,0.3)',
                  border: `1px solid ${p.accepting_clients ? 'rgba(91,184,182,0.25)' : 'rgba(251,247,239,0.1)'}`,
                }}>
                  {p.accepting_clients ? 'Yes' : 'No'}
                </span>
              </td>
              <td style={tdMuted}>{p.verified_date ? fmtDate(p.verified_date) : '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <Link href={`/admin/providers/${p.id}`} style={actionBtn}>View →</Link>
              </td>
            </tr>
          ))}
        </TableShell>
      )}

      {active === 'excluded' && (
        <TableShell
          headers={['Name', 'Credentials', 'City', 'NPI (blocked)', 'Submitted', 'Exclusion reason', '']}
          empty={excludedRows.length === 0}
          emptyText="No excluded providers."
          danger
        >
          {excludedRows.map((p, i) => (
            <tr key={p.id} style={{ borderBottom: i < excludedRows.length - 1 ? '1px solid rgba(160,40,40,0.12)' : 'none' }}>
              <td style={{ ...tdStyle, color: '#f87171' }}>{p.name}</td>
              <td style={tdMuted}>{p.credentials ?? '—'}</td>
              <td style={tdMuted}>{p.city ?? '—'}</td>
              <td style={tdStyle}>
                <span style={{ fontFamily: 'monospace', fontSize: 11.5, padding: '2px 7px', borderRadius: 5, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {p.npi ?? '—'}
                </span>
              </td>
              <td style={tdMuted}>{fmtDate(p.created_at)}</td>
              <td style={{ ...tdMuted, maxWidth: 220, fontSize: 12 }}>{p.exclusion_reason ?? '—'}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <Link href={`/admin/providers/${p.id}`} style={{ ...actionBtn, color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>View →</Link>
              </td>
            </tr>
          ))}
        </TableShell>
      )}

    </div>
  )
}

/* ── helpers ── */

const tdStyle: React.CSSProperties = { padding: '13px 20px', fontSize: 13, verticalAlign: 'middle' }
const tdMuted: React.CSSProperties = { ...tdStyle, color: 'rgba(251,247,239,0.42)' }
const actionBtn: React.CSSProperties = {
  display: 'inline-block', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
  color: 'rgba(251,247,239,0.65)', background: 'rgba(26,92,90,0.14)',
  border: '1px solid rgba(26,92,90,0.28)', textDecoration: 'none',
}

function TableShell({ headers, children, empty, emptyText, danger }: {
  headers: string[]; children: React.ReactNode
  empty: boolean; emptyText: string; danger?: boolean
}) {
  const borderColor = danger ? 'rgba(160,40,40,0.3)' : 'rgba(26,92,90,0.22)'
  const headerBg    = danger ? 'rgba(30,8,8,0.6)'    : 'rgba(6,20,19,0.5)'

  return (
    <div style={{
      background: 'rgba(26,92,90,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 13,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(251,247,239,0.04)',
    }}>
      {empty ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', fontSize: 13, color: 'rgba(251,247,239,0.22)' }}>
          {emptyText}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '10px 20px', textAlign: i === headers.length - 1 ? 'right' : 'left', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(251,247,239,0.25)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  )
}
