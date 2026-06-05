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
  run_by?: string | null
}

const CHECK_META = {
  nppes: { label: 'NPPES', description: 'Verify NPI against the national provider registry' },
  leie: { label: 'OIG LEIE', description: 'Check OIG List of Excluded Individuals/Entities' },
  sam: { label: 'SAM.gov', description: 'Check federal exclusions list' },
}

function getCheckLink(type: string, npi?: string, providerName?: string): { label: string; url: string; note?: string } | null {
  if (type === 'nppes' && npi) {
    return {
      label: 'Look up on NPPES Registry',
      url: `https://npiregistry.cms.hhs.gov/search?number=${encodeURIComponent(npi)}`,
    }
  }
  if (type === 'leie' && providerName) {
    const parts = providerName.trim().split(' ')
    const firstName = parts[0] ?? ''
    const lastName = parts.slice(1).join(' ')
    const params = new URLSearchParams()
    if (lastName) params.set('lastname', lastName)
    if (firstName) params.set('firstname', firstName)
    return {
      label: 'Look up on OIG Exclusions',
      url: `https://exclusions.oig.hhs.gov/?${params.toString()}`,
    }
  }
  if (type === 'sam' && providerName) {
    return {
      label: 'Search SAM.gov Exclusions',
      url: `https://sam.gov/search?keywords=${encodeURIComponent(providerName)}&index=ei`,
      note: 'Sign in to your SAM.gov account first or results may not appear.',
    }
  }
  return null
}

type BoardLink = { label: string; url: string; types?: string[] }

const STATE_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
}

function toStateAbbr(state: string): string {
  if (!state) return ''
  const lower = state.trim().toLowerCase()
  if (lower.length === 2) return lower.toUpperCase()
  return STATE_ABBR[lower] ?? state.toUpperCase()
}

const STATE_BOARDS: Record<string, BoardLink[]> = {
  TX: [
    { label: 'TX Medical Board', url: 'https://www.tmb.state.tx.us/page/lookup-physician', types: ['MD', 'DO'] },
    { label: 'TX BHEC', url: 'https://bhec.texas.gov/verify-a-license/', types: ['LC', 'LPC', 'LCDC', 'LCSW', 'LMFT'] },
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

function getStateBoardLinks(state: string, licenseType: string, _specialties: string[]): BoardLink[] {
  const boards = STATE_BOARDS[toStateAbbr(state)] ?? []
  if (!boards.length) return []
  const lt = licenseType?.toUpperCase() ?? ''
  const filtered = boards.filter(b => !b.types || b.types.some(t => lt.includes(t)))
  return filtered.length > 0 ? filtered : boards
}

function getOneLiner(type: string, result: string, details: string): string {
  if (result === 'clear') {
    if (type === 'nppes') return 'Identity verified against NPPES registry'
    if (type === 'leie') return 'No exclusion record found'
    if (type === 'sam') return 'No federal exclusion found'
  }
  if (result === 'excluded') {
    if (type === 'leie') {
      const dateMatch = details.match(/Date:\s*(\d{8})/)
      const raw = dateMatch?.[1] ?? ''
      const date = raw.length === 8 ? `${raw.slice(4,6)}/${raw.slice(6,8)}/${raw.slice(0,4)}` : ''
      const exclType = details.match(/Exclusion:\s*(\w+)/)?.[1] ?? ''
      return `NPI match on exclusion list${date ? ` — excluded ${date}` : ''}${exclType ? ` (${exclType})` : ''}`
    }
    if (type === 'sam') return 'Name + state match on SAM.gov exclusion list'
    return 'NPI is on Sila block list'
  }
  if (result === 'review_required') {
    if (details.includes('first name mismatch')) return 'First name doesn\'t match NPPES exactly'
    if (details.includes('last name mismatch')) return 'Last name doesn\'t match NPPES exactly'
    if (details.includes('State:')) return 'State mismatch with NPPES record'
    if (details.includes('Credential:')) return 'Credential mismatch with NPPES record'
    if (details.includes('state does not align')) return 'Name match — state doesn\'t align, verify manually'
    if (details.includes('Partial name match')) return 'Partial name match — same last name and first initial only'
    return 'Needs manual review'
  }
  if (result === 'flagged') {
    if (details.toLowerCase().includes('no npi')) return 'No NPI on file'
    if (details.toLowerCase().includes('not found')) return 'NPI not found in registry'
    return 'Flagged — attention needed'
  }
  if (result === 'error') return 'Check failed — try re-running'
  return details.split('\n')[0].slice(0, 100)
}

function getShortGuidance(checkType: string, result: string, details: string, providerState: string): string | null {
  if (result === 'clear') return null
  if (checkType === 'nppes') {
    if (details.toLowerCase().includes('not found')) return 'Ask the provider to confirm their NPI number is correct.'
    if (details.includes('Name:')) return 'Ask the provider to confirm the exact name on their license.'
    if (details.includes('State:')) return `Confirm they hold an active ${providerState ?? ''} license before approving.`
    if (details.includes('Credential:')) return 'Verify the correct license type — the submitted value may not match NPPES.'
    return `Cross-reference against the ${providerState ?? 'relevant'} state board before approving.`
  }
  if (checkType === 'leie') return 'Do not approve. Verify identity at exclusions.oig.hhs.gov, then block NPI if confirmed.'
  if (checkType === 'sam') return 'Do not approve. Verify identity at sam.gov, then block NPI if confirmed.'
  return null
}


function generateNoteSuggestion(checkResults: Partial<Record<string, CheckResult>>, dob?: string | null): string {
  const parts: string[] = []

  const nppes = checkResults['nppes']
  if (nppes && (nppes.result === 'review_required' || nppes.result === 'flagged')) {
    const d = nppes.details

    if (nppes.result === 'flagged') {
      if (d.toLowerCase().includes('no npi')) {
        parts.push(`We don't have an NPI on file for your application. Could you reply with your NPI number so we can complete the verification?`)
      } else if (d.toLowerCase().includes('not found')) {
        parts.push(`We weren't able to find your NPI in the NPPES registry. Could you double-check the number you submitted and reply with a copy of your license?`)
      }
    }

    if (nppes.result === 'review_required') {
      const mismatchLines = d.split('\n').filter(l => l.trim().startsWith('•')).map(l => l.replace(/^[•\s]+/, '').trim())
      for (const line of mismatchLines) {
        const submitted = line.match(/submitted "([^"]+)"/)?.[1]
        const registry  = line.match(/NPPES shows "([^"]+)"/)?.[1]
        const states    = line.match(/NPPES shows address\(es\) in (.+)/)?.[1]

        if (line.startsWith('Name:') && submitted && registry) {
          parts.push(`When we ran your NPI through NPPES, the name on file didn't match what you submitted. You applied as "${submitted}" but the registry shows "${registry}". Could you confirm the name exactly as it appears on your license?`)
        } else if (line.startsWith('State:') && submitted && states) {
          parts.push(`The state you listed (${submitted}) doesn't match what NPPES has on file — the registry shows ${states}. Could you confirm which state your current license is in?`)
        } else if (line.startsWith('Credential:') && submitted && registry) {
          parts.push(`The credential you submitted (${submitted}) doesn't match what NPPES shows for your NPI (${registry}). Could you confirm your exact license type?`)
        }
      }
    }
  }

  const leie = checkResults['leie']
  if (leie && leie.result === 'review_required') {
    const d = leie.details.toLowerCase()
    const hasDob = !!dob
    if (d.includes('partial name')) {
      parts.push(`We found a partial name match in the OIG exclusion database. This is most likely a different person, but we need to rule it out before moving forward.${hasDob ? ` Could you confirm your full legal name as it appears on your license?` : ` Could you share your date of birth so we can confirm this is a different individual?`}`)
    } else if (d.includes('possible match') || d.includes('high confidence')) {
      parts.push(`We found a possible match in the OIG exclusion database. We need to confirm this isn't you before we can continue.${hasDob ? `` : ` Could you share your date of birth and license number?`}`)
    } else {
      parts.push(`We found a name match in the OIG exclusion database that we need to clear before moving forward.${hasDob ? `` : ` Could you confirm your date of birth and the state where you hold your current license?`}`)
    }
  }

  const sam = checkResults['sam']
  if (sam && sam.result === 'review_required') {
    parts.push(`We also found a name match in the SAM.gov federal exclusions list. Could you confirm your date of birth and current license state so we can rule this out?`)
  }

  return parts.join('\n\n')
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

function initCheckResults(logs: Log[]): Partial<Record<string, CheckResult>> {
  const results: Partial<Record<string, CheckResult>> = {}
  for (const type of ['nppes', 'leie', 'sam']) {
    const log = logs.find(l => l.check_type === type)
    if (log) {
      results[type] = {
        result: log.result as CheckResult['result'],
        details: log.raw_output ?? '',
        timestamp: new Date(log.created_at).toLocaleTimeString(),
      }
    }
  }
  return results
}

export default function VerificationPanel({
  providerId,
  initialLogs,
  isExcluded = false,
  providerState,
  licenseType,
  specialties = [],
  npi,
  providerName,
  dob,
}: {
  providerId: string
  initialLogs: Log[]
  isExcluded?: boolean
  providerState?: string
  licenseType?: string
  specialties?: string[]
  npi?: string
  providerName?: string
  dob?: string | null
}) {
  const router = useRouter()
  const [checkResults, setCheckResults] = useState<Partial<Record<string, CheckResult>>>(
    () => initCheckResults(initialLogs)
  )
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [showReviewInput, setShowReviewInput] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [requestCorrections, setRequestCorrections] = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [decided, setDecided] = useState(false)
  const [stateLicenseVerified, setStateLicenseVerified] = useState(
    () => initialLogs.some(l => l.check_type === 'state_license' && l.result === 'verified')
  )
  const [stateLicenseSaving, setStateLicenseSaving] = useState(false)
  const [flagging, setFlagging] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [exclusionConfirmed, setExclusionConfirmed] = useState(false)

  const allChecksRun = ['nppes', 'leie', 'sam'].every(t => checkResults[t]) && stateLicenseVerified
  const confirmedExclusion = ['leie', 'sam'].some(t => checkResults[t]?.result === 'excluded')
    || checkResults['nppes']?.result === 'excluded'
  const allThreeHaveResults = ['nppes', 'leie', 'sam'].every(t => checkResults[t])
  const autoCheckedAt = (() => {
    const autoLog = logs.find(l => ['nppes', 'leie', 'sam'].includes(l.check_type) && l.run_by === 'auto')
    return autoLog ? new Date(autoLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
  })()

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
      // Refresh server data after NPPES so gender/credential fields update in the profile section
      if (type === 'nppes') router.refresh()
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

  const C = {
    bg:     'rgba(22,11,7,0.72)',
    border: '1px solid rgba(160,106,87,0.18)',
    br:     12,
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Status overview strip ── */}
      {allThreeHaveResults && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['nppes', 'leie', 'sam'] as const).map(type => {
            const res = checkResults[type]
            const s = res ? RESULT_STYLES[res.result] : null
            if (!res || !s) return null
            return (
              <span key={type} style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                padding: '3px 10px', borderRadius: 5,
                backgroundColor: s.color + '18', color: s.color,
                border: `1px solid ${s.color}30`,
              }}>
                {s.icon} {CHECK_META[type].label}
              </span>
            )
          })}
          {stateLicenseVerified && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 5, backgroundColor: '#22c55e18', color: '#22c55e', border: '1px solid #22c55e30' }}>
              ✓ State License
            </span>
          )}
        </div>
      )}

      {/* ── Automated checks header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(251,247,239,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Automated</p>
          {autoCheckedAt && (
            <span style={{ fontSize: 10, color: 'rgba(74,180,174,0.6)', background: 'rgba(26,92,90,0.15)', border: '1px solid rgba(26,92,90,0.28)', borderRadius: 5, padding: '1px 7px' }}>
              Auto-ran {autoCheckedAt}
            </span>
          )}
        </div>
        <button
          onClick={runAllChecks}
          disabled={anyLoading || isExcluded}
          style={{
            fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7,
            backgroundColor: anyLoading || isExcluded ? 'transparent' : 'rgba(26,92,90,0.20)',
            border: `1px solid ${anyLoading || isExcluded ? 'rgba(160,106,87,0.10)' : 'rgba(26,92,90,0.40)'}`,
            color: anyLoading || isExcluded ? 'rgba(251,247,239,0.18)' : 'rgba(74,180,174,0.85)',
            cursor: anyLoading || isExcluded ? 'not-allowed' : 'pointer',
          }}
        >
          {anyLoading ? 'Running…' : allThreeHaveResults ? 'Re-run all' : 'Run all checks'}
        </button>
      </div>

      {/* ── Check cards ── */}
      <div style={{ backgroundColor: C.bg, border: C.border, borderRadius: C.br, overflow: 'hidden' }}>
        {(Object.entries(CHECK_META) as [string, { label: string; description: string }][]).map(([type, meta], idx, arr) => {
          const res = checkResults[type]
          const s = res ? RESULT_STYLES[res.result] : null
          const guidance = res ? getShortGuidance(type, res.result, res.details, providerState ?? '') : null
          const link = getCheckLink(type, npi, providerName)
          return (
            <div key={type} style={{ padding: '14px 16px', borderBottom: idx < arr.length - 1 ? '1px solid rgba(160,106,87,0.10)' : 'none' }}>
              {/* Row: name + status pill + re-run */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0 }}>{meta.label}</span>
                  {s && res && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 4,
                      backgroundColor: s.color + '18', color: s.color, border: `1px solid ${s.color}28`,
                      flexShrink: 0,
                    }}>
                      {s.icon} {res.result === 'review_required' ? 'Review' : res.result}
                    </span>
                  )}
                  {res && s && (
                    <span style={{ fontSize: 12, color: 'rgba(251,247,239,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getOneLiner(type, res.result, res.details)}
                    </span>
                  )}
                  {!res && (
                    <span style={{ fontSize: 12, color: 'rgba(251,247,239,0.22)' }}>Not run yet</span>
                  )}
                </div>
                <button
                  onClick={() => runCheck(type)}
                  disabled={!!loading[type]}
                  style={{
                    fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, flexShrink: 0,
                    backgroundColor: 'rgba(160,106,87,0.08)', border: '1px solid rgba(160,106,87,0.18)',
                    color: loading[type] ? 'rgba(251,247,239,0.18)' : 'rgba(251,247,239,0.45)',
                    cursor: loading[type] ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading[type] ? '…' : res ? 'Re-run' : 'Run'}
                </button>
              </div>

              {/* Guidance + action — only when needed */}
              {guidance && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#a88a40' }}>→ {guidance}</span>
                  {link && (
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 5, backgroundColor: 'rgba(160,106,87,0.12)', color: 'rgba(251,247,239,0.55)', border: '1px solid rgba(160,106,87,0.22)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      {link.label} ↗
                    </a>
                  )}
                </div>
              )}

              {/* Raw output — collapsed */}
              {res && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ fontSize: 10, color: 'rgba(251,247,239,0.2)', cursor: 'pointer', userSelect: 'none', listStyle: 'none' }}>
                    Raw output · {res.timestamp} ↓
                  </summary>
                  <p style={{ fontSize: 10, color: 'rgba(251,247,239,0.28)', marginTop: 6, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {res.details}
                  </p>
                  {link?.note && (
                    <p style={{ fontSize: 10, color: 'rgba(251,247,239,0.2)', marginTop: 4 }}>{link.note}</p>
                  )}
                </details>
              )}
            </div>
          )
        })}
      </div>

      {/* ── State license ── */}
      <div style={{ backgroundColor: C.bg, border: C.border, borderRadius: C.br, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>State License</span>
            {stateLicenseVerified && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 4, backgroundColor: '#22c55e18', color: '#22c55e', border: '1px solid #22c55e28' }}>
                ✓ Verified
              </span>
            )}
            {!stateLicenseVerified && (
              <span style={{ fontSize: 12, color: 'rgba(251,247,239,0.22)' }}>Manual check required</span>
            )}
          </div>
          {!stateLicenseVerified && (
            <button
              onClick={confirmStateLicense}
              disabled={stateLicenseSaving}
              style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, backgroundColor: '#1e1e1e', border: '1px solid #333', color: stateLicenseSaving ? '#444' : '#aaa', cursor: stateLicenseSaving ? 'not-allowed' : 'pointer' }}
            >
              {stateLicenseSaving ? 'Saving…' : 'Mark verified'}
            </button>
          )}
        </div>
        {providerState && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {getStateBoardLinks(providerState, licenseType ?? '', specialties).map(({ label, url }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 5, backgroundColor: 'rgba(160,106,87,0.08)', color: 'rgba(251,247,239,0.45)', border: '1px solid rgba(160,106,87,0.16)', textDecoration: 'none' }}>
                {label} ↗
              </a>
            ))}
            {getStateBoardLinks(providerState, licenseType ?? '', specialties).length === 0 && (
              <span style={{ fontSize: 11, color: '#444' }}>No board links on file for {providerState}. Search manually.</span>
            )}
          </div>
        )}
      </div>

      {/* ── Confirmed exclusion ── */}
      {confirmedExclusion && (
        <div style={{ backgroundColor: '#150808', border: '1px solid #3a1010', borderRadius: C.br, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f87171', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Confirmed Exclusion</span>
          </div>
          {flagged ? (
            <p style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}>✓ NPI blocked — account permanently locked</p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: '#7a4040', lineHeight: 1.6, marginBottom: 12 }}>
                This provider is on a federal exclusion list. Blocking their NPI prevents re-registration under any email.
                Verify identity at{' '}
                <a href="https://exclusions.oig.hhs.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#f87171' }}>exclusions.oig.hhs.gov</a>
                {' '}or{' '}
                <a href="https://sam.gov/search/?index=ei" target="_blank" rel="noopener noreferrer" style={{ color: '#f87171' }}>sam.gov</a>
                {' '}before blocking.
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={exclusionConfirmed} onChange={e => setExclusionConfirmed(e.target.checked)} style={{ marginTop: 2 }} />
                <span style={{ fontSize: 12, color: '#9a6060' }}>I have manually verified this is the same individual on the federal exclusion list</span>
              </label>
              <button
                onClick={handleFlag}
                disabled={flagging || !exclusionConfirmed}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
                  backgroundColor: exclusionConfirmed ? '#3a1010' : 'transparent',
                  color: exclusionConfirmed ? '#f87171' : '#4a2020',
                  border: '1px solid #5a1a1a',
                  cursor: (!exclusionConfirmed || flagging) ? 'not-allowed' : 'pointer',
                }}
              >
                {flagging ? 'Blocking…' : 'Confirm exclusion & block NPI'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Decision ── */}
      {!isExcluded && (
        <div style={{ backgroundColor: C.bg, border: C.border, borderRadius: C.br, padding: '14px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(251,247,239,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Decision</p>
          {decided ? (
            <p style={{ fontSize: 12, color: '#555' }}>Decision recorded. Refresh to continue.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <button
                  onClick={() => handleDecision('approve')}
                  disabled={!allChecksRun || deciding}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    backgroundColor: allChecksRun ? '#166534' : '#0f2218',
                    color: allChecksRun ? '#86efac' : '#2d4a35',
                    border: 'none', cursor: allChecksRun ? 'pointer' : 'not-allowed',
                  }}
                >
                  {deciding ? 'Saving…' : 'Approve'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewInput(v => {
                      if (!v && !reviewNotes.trim()) {
                        const suggestion = generateNoteSuggestion(checkResults, dob)
                        if (suggestion) setReviewNotes(suggestion)
                      }
                      return !v
                    })
                  }}
                  disabled={deciding}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: '#111827', color: '#93c5fd', border: '1px solid #1e3a5f', cursor: 'pointer' }}
                >
                  In Review
                </button>
              </div>
              {!allChecksRun && (
                <p style={{ fontSize: 11, color: '#444' }}>Complete all checks + state license to enable approval.</p>
              )}
              {showReviewInput && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  <textarea
                    rows={3}
                    placeholder="Internal note — what needs further verification?"
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 12, resize: 'none', backgroundColor: 'rgba(22,11,7,0.8)', border: '1px solid rgba(160,106,87,0.22)', color: '#FBF7EF', outline: 'none' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={requestCorrections} onChange={e => setRequestCorrections(e.target.checked)} style={{ marginTop: 2 }} />
                    <span style={{ fontSize: 11, color: '#888' }}>Email provider to resubmit corrected credentials</span>
                  </label>
                  <button
                    onClick={() => handleDecision('in_review')}
                    disabled={!reviewNotes.trim() || deciding}
                    style={{ padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, backgroundColor: '#1e3a5f', color: '#93c5fd', border: 'none', opacity: !reviewNotes.trim() ? 0.45 : 1, cursor: !reviewNotes.trim() ? 'not-allowed' : 'pointer' }}
                  >
                    Confirm — move to In Review
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Verification log ── */}
      <div style={{ backgroundColor: C.bg, border: C.border, borderRadius: C.br, padding: '14px 16px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(251,247,239,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Log</p>
        {logs.length === 0 ? (
          <p style={{ fontSize: 11, color: '#444' }}>No activity yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {logs.map(log => {
              const s = RESULT_STYLES[log.result] ?? { color: '#555', icon: '·' }
              return (
                <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '110px 70px 1fr', gap: 8, fontSize: 11, alignItems: 'baseline' }}>
                  <span style={{ color: '#444' }}>
                    {new Date(log.created_at).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ color: s.color, fontWeight: 600, fontSize: 10, letterSpacing: '0.06em' }}>
                    {s.icon} {log.check_type.toUpperCase()}
                  </span>
                  <span style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getOneLiner(log.check_type, log.result, log.raw_output ?? '')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
