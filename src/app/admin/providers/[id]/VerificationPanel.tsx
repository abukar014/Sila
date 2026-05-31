'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CheckResult = {
  result: 'clear' | 'flagged' | 'excluded' | 'review_required' | 'error'
  details: string
  timestamp: string
}

type Log = {
  id: string
  created_at: string
  check_type: string
  result: string
  raw_output: string | null
}

const CHECK_META = {
  nppes: { label: 'NPPES', description: 'Verify NPI against the national provider registry' },
  leie: { label: 'OIG LEIE', description: 'Check OIG List of Excluded Individuals/Entities' },
  sam: { label: 'SAM.gov', description: 'Check federal exclusions list' },
}

type BoardLink = { label: string; url: string; types?: string[] }

const STATE_BOARDS: Record<string, BoardLink[]> = {
  TX: [
    { label: 'TX Medical Board', url: 'https://www.tmb.state.tx.us/page/lookup-physician', types: ['MD', 'DO'] },
    { label: 'TX BHEC', url: 'https://bhec.texas.gov/verify-a-license/', types: ['LPC', 'LCDC', 'LCSW', 'LMFT'] },
    { label: 'TX Board of Nursing', url: 'https://www.bon.texas.gov/licensure_verification.asp', types: ['RN', 'NP', 'APRN'] },
    { label: 'TX Psychologists Board', url: 'https://www.tsbep.texas.gov/page/licensee-search', types: ['PhD', 'PsyD', 'LP'] },
  ],
  CA: [
    { label: 'CA Medical Board', url: 'https://search.dca.ca.gov/', types: ['MD', 'DO'] },
    { label: 'CA BBS (LCSW/MFT/LPCC)', url: 'https://search.dca.ca.gov/', types: ['LCSW', 'LMFT', 'LPCC', 'AMFT', 'ASW'] },
    { label: 'CA Board of Psychology', url: 'https://search.dca.ca.gov/', types: ['PhD', 'PsyD', 'LP'] },
    { label: 'CA Board of Nursing', url: 'https://www.rn.ca.gov/consumers/lic_lookup.shtml', types: ['RN', 'NP', 'APRN'] },
  ],
  NY: [
    { label: 'NY Office of Professions', url: 'https://www.op.nysed.gov/opsearches.htm' },
  ],
  FL: [
    { label: 'FL DOH License Verification', url: 'https://mqa.doh.state.fl.us/MQASearchServices/HealthCareProviders' },
  ],
  IL: [
    { label: 'IL IDFPR License Lookup', url: 'https://online-dfpr.micropact.com/lookup/licenselookup.aspx' },
  ],
  NJ: [
    { label: 'NJ License Verification', url: 'https://newjersey.mylicense.com/verification/Search.aspx' },
  ],
  MI: [
    { label: 'MI License Lookup', url: 'https://aca-prod.accela.com/MILARA/GeneralProperty/PropertyLookUp.aspx' },
  ],
  VA: [
    { label: 'VA Dept of Health Professions', url: 'https://dhp.virginiainteractive.org/lookup/index' },
  ],
  GA: [
    { label: 'GA Composite Medical Board', url: 'https://gcmb.mylicense.com/verification/' },
  ],
  NC: [
    { label: 'NC Medical Board', url: 'https://www.ncmedboard.org/resources-information/professional-license-information/license-verification', types: ['MD', 'DO'] },
    { label: 'NC Counseling Board', url: 'https://www.ncblpc.org/Verification/', types: ['LPC', 'LCAS', 'CCS'] },
    { label: 'NC Social Work Board', url: 'https://www.ncswboard.gov/verification/', types: ['LCSW', 'LCSWA', 'LSW'] },
  ],
  WA: [
    { label: 'WA DOH License Lookup', url: 'https://fortress.wa.gov/doh/providercredentialsearch/' },
  ],
  OH: [
    { label: 'OH eLicense', url: 'https://elicense.ohio.gov/oh_verifylicense' },
  ],
  PA: [
    { label: 'PA License Verification', url: 'https://www.dos.pa.gov/ProfessionalLicensing/Pages/Verification-of-Licensure.aspx' },
  ],
  MD: [
    { label: 'MD Board Verification', url: 'https://www.mdbon.org/license-verification' },
  ],
  MN: [
    { label: 'MN License Lookup', url: 'https://mn.gov/boards/health-professional-services/public/license-lookup/' },
  ],
  AZ: [
    { label: 'AZ Medical Board', url: 'https://azmdboard.ent.sirsi.net/client/en_US/default/', types: ['MD', 'DO'] },
    { label: 'AZ Board of Behavioral Health', url: 'https://bhe.az.gov/license-verification', types: ['LPC', 'LCSW', 'LMFT'] },
  ],
  CO: [
    { label: 'CO DORA License Lookup', url: 'https://apps2.colorado.gov/dora/licensing/lookup/licenselookup.aspx' },
  ],
}

function getStateBoardLinks(state: string, licenseType: string, specialties: string[]): BoardLink[] {
  const boards = STATE_BOARDS[state?.toUpperCase()] ?? []
  if (!boards.length) return []
  const lt = licenseType?.toUpperCase() ?? ''
  const filtered = boards.filter(b => !b.types || b.types.some(t => lt.includes(t)))
  return filtered.length > 0 ? filtered : boards
}

function getMismatchGuidance(checkType: string, result: string, details: string, providerState: string): string | null {
  const d = details.toLowerCase()
  if (result === 'clear' || result === 'approved') return null

  if (checkType === 'nppes') {
    if (d.includes('not found') || d.includes('no results')) {
      return `This NPI doesn't exist in the NPPES database. Ask the provider to confirm their NPI number is correct before re-running the check.`
    }
    if (d.includes('state:')) {
      return `The NPI is registered to a different state than what was submitted. The provider may have relocated or hold a separate license in ${providerState ?? 'the submitted state'}. Check the ${providerState ?? 'submitted'} state board below to confirm they hold an active license there before approving.`
    }
    if (d.includes('name:')) {
      return `The name on the application doesn't match NPPES exactly. This could be a legal name vs. preferred name difference. Ask the provider to confirm the exact name on their license before proceeding.`
    }
    if (d.includes('credential:')) {
      return `The credential listed doesn't match what NPPES has on file. Verify the correct license type before approving — what they submitted may not reflect their actual credential.`
    }
    if (d.includes('specialty:')) {
      return `The specialty listed differs from NPPES. This may just be a taxonomy code difference — cross-reference against their license type on the state board before making a decision.`
    }
    return `Review the mismatches above and cross-reference against the ${providerState ?? 'relevant'} state board before approving.`
  }

  if (checkType === 'leie') {
    return `This provider may appear on the OIG exclusion list. Do not approve. Manually verify their identity using DOB, specialty, and address from the result above at exclusions.oig.hhs.gov, then flag and exclude if confirmed.`
  }

  if (checkType === 'sam') {
    return `This provider may appear on the federal SAM.gov exclusion list. Do not approve. Verify their identity manually at sam.gov, then flag and exclude if confirmed.`
  }

  return null
}

const RESULT_STYLES: Record<string, { color: string; icon: string }> = {
  clear: { color: '#22c55e', icon: '✓' },
  flagged: { color: '#f59e0b', icon: '⚠' },
  review_required: { color: '#f59e0b', icon: '⚠' },
  excluded: { color: '#ef4444', icon: '✗' },
  error: { color: '#ef4444', icon: '✗' },
  approved: { color: '#22c55e', icon: '✓' },
  rejected: { color: '#ef4444', icon: '✗' },
}

export default function VerificationPanel({
  providerId,
  initialLogs,
  isExcluded = false,
  providerState,
  licenseType,
  specialties = [],
}: {
  providerId: string
  initialLogs: Log[]
  isExcluded?: boolean
  providerState?: string
  licenseType?: string
  specialties?: string[]
}) {
  const router = useRouter()
  const [checkResults, setCheckResults] = useState<Partial<Record<string, CheckResult>>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [showReviewInput, setShowReviewInput] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [requestCorrections, setRequestCorrections] = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [decided, setDecided] = useState(false)
  const [stateLicenseVerified, setStateLicenseVerified] = useState(false)
  const [stateLicenseSaving, setStateLicenseSaving] = useState(false)
  const [flagging, setFlagging] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [exclusionConfirmed, setExclusionConfirmed] = useState(false)

  const allChecksRun = ['nppes', 'leie', 'sam'].every(t => checkResults[t]) && stateLicenseVerified
  const confirmedExclusion = ['leie', 'sam'].some(t => checkResults[t]?.result === 'excluded')
    || checkResults['nppes']?.result === 'excluded'

  async function runCheck(type: string) {
    setLoading(prev => ({ ...prev, [type]: true }))
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/check/${type}`, { method: 'POST' })
      const data = await res.json()
      const timestamp = new Date().toLocaleTimeString()
      setCheckResults(prev => ({ ...prev, [type]: { ...data, timestamp } }))
      setLogs(prev => [{
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        check_type: type,
        result: data.result,
        raw_output: data.details,
      }, ...prev])
    } catch {
      setCheckResults(prev => ({ ...prev, [type]: { result: 'error', details: 'Request failed', timestamp: new Date().toLocaleTimeString() } }))
    }
    setLoading(prev => ({ ...prev, [type]: false }))
  }

  async function runAllChecks() {
    setLoading({ nppes: true, leie: true, sam: true })
    await Promise.all(['nppes', 'leie', 'sam'].map(type => runCheck(type)))
  }

  const anyLoading = Object.values(loading).some(Boolean)

  async function handleFlag() {
    setFlagging(true)
    const res = await fetch(`/api/admin/providers/${providerId}/flag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Confirmed OIG/SAM exclusion' }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to block NPI: ${data.error ?? res.statusText}`)
      setFlagging(false)
      return
    }
    setFlagged(true)
    setFlagging(false)
    router.refresh()
  }

  async function confirmStateLicense() {
    setStateLicenseSaving(true)
    await fetch(`/api/admin/providers/${providerId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        check_type: 'state_license',
        result: 'verified',
        passed: true,
        notes: 'Manually verified on state board website',
      }),
    })
    setStateLicenseVerified(true)
    setLogs(prev => [{
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      check_type: 'state_license',
      result: 'verified',
      raw_output: 'Manually verified on state board website',
    }, ...prev])
    setStateLicenseSaving(false)
  }

  async function handleDecision(action: 'approve' | 'in_review') {
    setDeciding(true)
    await fetch(`/api/admin/providers/${providerId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: action === 'approve' ? 'verified' : 'in_review',
        notes: reviewNotes || null,
        requestCorrections: action === 'in_review' ? requestCorrections : false,
      }),
    })
    setDecided(true)
    setDeciding(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Run all button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="text-sm font-semibold text-white">Automated Checks</p>
        <button
          onClick={runAllChecks}
          disabled={anyLoading || isExcluded}
          className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: anyLoading || isExcluded ? '#1a1a1a' : '#1e3a5f',
            border: '1px solid #2a4a7f',
            color: anyLoading || isExcluded ? '#555' : '#93c5fd',
            cursor: anyLoading || isExcluded ? 'not-allowed' : 'pointer',
          }}
        >
          {anyLoading ? 'Running…' : 'Run all checks'}
        </button>
      </div>

      {/* Automated check sections */}
      {(Object.entries(CHECK_META) as [string, { label: string; description: string }][]).map(([type, meta]) => {
        const res = checkResults[type]
        const style = res ? RESULT_STYLES[res.result] : null
        return (
          <div key={type} style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-white text-sm font-semibold">{meta.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>{meta.description}</p>
              </div>
              <button
                onClick={() => runCheck(type)}
                disabled={!!loading[type]}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', color: loading[type] ? '#555' : '#aaa' }}
              >
                {loading[type] ? 'Running...' : res ? 'Re-run' : 'Run check'}
              </button>
            </div>

            {res && style && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e1e1e' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: style.color }}>
                  {style.icon} {res.result.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#777' }}>{res.details}</p>
                <p className="text-xs mt-2" style={{ color: '#444' }}>Run at {res.timestamp}</p>
                {(() => {
                  const guidance = getMismatchGuidance(type, res.result, res.details, providerState ?? '')
                  if (!guidance) return null
                  return (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#1a1400', border: '1px solid #3a2e00' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>What to do next</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#a88a40' }}>{guidance}</p>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )
      })}

      {/* State license — manual */}
      <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-white text-sm font-semibold">State License</p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>Manually verify on the state board website</p>
          </div>
          {stateLicenseVerified ? (
            <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: '#052e16', color: '#22c55e', border: '1px solid #14532d' }}>
              ✓ Verified
            </span>
          ) : (
            <button
              onClick={confirmStateLicense}
              disabled={stateLicenseSaving}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', color: stateLicenseSaving ? '#555' : '#aaa' }}
            >
              {stateLicenseSaving ? 'Saving...' : 'Mark verified'}
            </button>
          )}
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e1e1e' }}>
          {providerState ? (
            <>
              <p className="text-xs mb-2" style={{ color: '#444' }}>
                State board links for <span style={{ color: '#888' }}>{providerState}</span> based on submitted license type
              </p>
              <div className="flex flex-wrap gap-2">
                {getStateBoardLinks(providerState, licenseType ?? '', specialties).map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
                  >
                    {label} ↗
                  </a>
                ))}
                {getStateBoardLinks(providerState, licenseType ?? '', specialties).length === 0 && (
                  <p className="text-xs" style={{ color: '#444' }}>No board links on file for {providerState}. Search manually.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs" style={{ color: '#444' }}>No state on file — check provider profile for submitted state.</p>
          )}
        </div>
      </div>

      {/* Exclusion flag — only shown when OIG/SAM/NPPES returns excluded */}
      {confirmedExclusion && (
        <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #450a0a', borderRadius: 12, padding: 16 }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#f87171' }}>Confirmed Exclusion</p>
          <p className="text-xs mb-3" style={{ color: '#888' }}>
            This provider appears on a federal exclusion list. Blocking their NPI will prevent re-registration under any email.
          </p>
          {flagged ? (
            <p className="text-xs font-semibold" style={{ color: '#f87171' }}>✓ NPI blocked and account locked</p>
          ) : (
            <>
              <p className="text-xs mb-2" style={{ color: '#666' }}>
                Before blocking, verify this is the same person using DOB, specialty, and address shown in the check result above.
                Cross-reference at <a href="https://exclusions.oig.hhs.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#f87171', textDecoration: 'underline' }}>exclusions.oig.hhs.gov</a> or <a href="https://sam.gov/search/?index=ei&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true" target="_blank" rel="noopener noreferrer" style={{ color: '#f87171', textDecoration: 'underline' }}>sam.gov</a>.
              </p>
              <label className="flex items-start gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exclusionConfirmed}
                  onChange={e => setExclusionConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs" style={{ color: '#aaa' }}>
                  I have manually verified this is the same individual on the federal exclusion list
                </span>
              </label>
              <button
                onClick={handleFlag}
                disabled={flagging || !exclusionConfirmed}
                className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: '#450a0a', color: '#f87171', opacity: (flagging || !exclusionConfirmed) ? 0.4 : 1, cursor: !exclusionConfirmed ? 'not-allowed' : 'pointer' }}
              >
                {flagging ? 'Blocking...' : 'Confirm exclusion & block NPI'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Decision */}
      {!isExcluded && <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
        <p className="text-sm font-semibold text-white mb-3">Decision</p>

        {decided ? (
          <p className="text-sm" style={{ color: '#555' }}>Decision recorded. Refresh to continue.</p>
        ) : (
          <>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => handleDecision('approve')}
                disabled={!allChecksRun || deciding}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: allChecksRun ? '#166534' : '#0f2d1e',
                  color: allChecksRun ? '#86efac' : '#2d5a3d',
                  cursor: allChecksRun ? 'pointer' : 'not-allowed',
                }}
              >
                {deciding ? 'Saving...' : 'Approve provider'}
              </button>
              <button
                onClick={() => setShowReviewInput(v => !v)}
                disabled={deciding}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: '#1a1a2e', color: '#93c5fd', border: '1px solid #1e3a5f' }}
              >
                Move to In Review
              </button>
            </div>

            {!allChecksRun && (
              <p className="text-xs" style={{ color: '#444' }}>
                Run all three checks and verify the state license to enable approval.
              </p>
            )}

            {showReviewInput && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs" style={{ color: '#555' }}>
                  Internal note (not sent to provider) — what needs further verification?
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. NPPES name mismatch, state license not found on board site..."
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                />
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestCorrections}
                    onChange={e => setRequestCorrections(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs" style={{ color: '#aaa' }}>
                    Email provider asking them to submit corrected credentials (NPI, DOB, license)
                  </span>
                </label>
                <button
                  onClick={() => handleDecision('in_review')}
                  disabled={!reviewNotes.trim() || deciding}
                  className="py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#1e3a5f', color: '#93c5fd', opacity: !reviewNotes.trim() ? 0.5 : 1 }}
                >
                  Confirm — move to In Review
                </button>
              </div>
            )}
          </>
        )}
      </div>}

      {/* Verification log */}
      <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
        <p className="text-sm font-semibold text-white mb-3">Verification Log</p>
        {logs.length === 0 ? (
          <p className="text-xs" style={{ color: '#444' }}>No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map(log => {
              const style = RESULT_STYLES[log.result] ?? { color: '#888', icon: '·' }
              return (
                <div key={log.id} className="flex gap-3 text-xs">
                  <span style={{ color: '#444', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  <span style={{ color: style.color, whiteSpace: 'nowrap' }}>
                    {style.icon} {log.check_type.toUpperCase()}
                  </span>
                  <span style={{ color: '#666' }}>{log.raw_output}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
