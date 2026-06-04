import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://esm.sh/csv-parse@5/sync'

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const LEIE_URL    = 'https://oig.hhs.gov/exclusions/downloadables/UPDATED.csv'
const SAM_CSV_URL = 'https://inventory.data.gov/dataset/7416a2e4-9aa7-4bcd-801c-20f25a545916/resource/78bb6c57-42e8-4055-931d-928ebcbde39f/download/samexclusionspublicextract-gsa-1626.csv'

const STATE_ABBR: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
}

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  'lcsw':   ['social worker', 'clinical social'],
  'md':     ['physician', 'doctor', 'medicine', 'medical'],
  'do':     ['osteopathic', 'physician'],
  'lpc':    ['counselor', 'professional counselor'],
  'lmft':   ['marriage', 'family therapist', 'family therapy'],
  'np':     ['nurse practitioner'],
  'rn':     ['registered nurse', 'nursing'],
  'phd':    ['psychologist', 'psychology', 'counselor', 'therapist'],
  'psyd':   ['psychologist', 'psychology'],
  'dds':    ['dentist', 'dental'],
  'dmd':    ['dentist', 'dental'],
  'pa':     ['physician assistant'],
  'pharmd': ['pharmacist', 'pharmacy'],
  'dnp':    ['nurse practitioner', 'nursing'],
}

function toStateAbbr(state: string | null): string | null {
  if (!state) return null
  return STATE_ABBR[state.toLowerCase()] ?? (state.length === 2 ? state.toUpperCase() : null)
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function specialtyMatches(licenseType: string | null, specialties: string[] | null, leieSpecialty: string): boolean {
  const leie = leieSpecialty.toLowerCase()
  const licenseClean = (licenseType ?? '').toLowerCase().replace(/\./g, '')
  const keywords = SPECIALTY_KEYWORDS[licenseClean] ?? []
  if (keywords.some(kw => leie.includes(kw))) return true
  return (specialties ?? []).some(s =>
    leie.includes(s.toLowerCase()) || s.toLowerCase().includes(leie.split(' ')[0])
  )
}

// Pre-filter raw CSV text to only rows matching last name or NPI.
// This keeps only ~1-5 rows as JS objects instead of 60,000+, staying well under memory limits.
function filterCsvLines(csvText: string, lastNameLower: string, npi: string): string {
  const lines = csvText.split('\n')
  const header = lines[0]
  const relevant: string[] = [header]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const lower = line.toLowerCase()
    if (lower.includes(lastNameLower) || (npi && line.includes(npi))) {
      relevant.push(line)
    }
  }
  return relevant.join('\n')
}

// ──────────────────────────────────────────────────────────── NPPES ─────

// deno-lint-ignore no-explicit-any
async function checkNppes(provider: any, supabase: any): Promise<{ result: string; details: string }> {
  if (!provider.npi) {
    return { result: 'flagged', details: 'No NPI on file for this provider' }
  }

  const { data: flagged } = await supabase
    .from('flagged_npis')
    .select('reason, flagged_at')
    .eq('npi', provider.npi)
    .single()

  if (flagged) {
    const flaggedDate = new Date(flagged.flagged_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    return {
      result: 'excluded',
      details: `NPI ${provider.npi} is on the Sila blocklist (flagged ${flaggedDate}). Reason: ${flagged.reason}`,
    }
  }

  const res  = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${provider.npi}&version=2.1`)
  const data = await res.json()

  if (!data.results || data.results.length === 0) {
    return { result: 'flagged', details: `NPI ${provider.npi} not found in NPPES registry` }
  }

  // deno-lint-ignore no-explicit-any
  const r               = data.results[0]
  const nppesFirstName  = (r.basic?.first_name ?? '').toLowerCase()
  const nppesLastName   = (r.basic?.last_name  ?? '').toLowerCase()
  const nppesFullName   = `${r.basic?.first_name ?? ''} ${r.basic?.last_name ?? ''}`.trim()
  const nppesCredential = (r.basic?.credential ?? '').toUpperCase().replace(/\./g, '')
  const taxonomy        = r.taxonomies?.[0]?.desc ?? 'N/A'
  const nppesStates: string[] = [...new Set<string>(
    // deno-lint-ignore no-explicit-any
    ((r.addresses ?? []) as { state?: string }[]).map((a: any) => a.state ?? '').filter(Boolean)
  )]

  const mismatches: string[] = []

  const submittedNameClean = provider.name
    .toLowerCase()
    .replace(/,?\s*(md|do|phd|lcsw|lpc|lmft|dnp|np|rn|pa|dds|dmd|pharmd|psyd|ms|ma)\b/gi, '')
    .trim()
  const submittedFirstWord = submittedNameClean.split(/\s+/)[0] ?? ''

  const lastNameMatch  = !nppesLastName || submittedNameClean.includes(nppesLastName)
  const firstNameMatch = !nppesFirstName || (
    submittedNameClean.includes(nppesFirstName) ||
    (nppesFirstName.length >= 3 && submittedFirstWord.startsWith(nppesFirstName.slice(0, 3))) ||
    (submittedFirstWord.length >= 3 && nppesFirstName.startsWith(submittedFirstWord.slice(0, 3)))
  )

  if (!lastNameMatch) {
    mismatches.push(`Name: last name mismatch — submitted "${provider.name}", NPPES shows "${nppesFullName}"`)
  } else if (!firstNameMatch) {
    mismatches.push(`Name: first name mismatch — submitted "${provider.name}", NPPES shows "${nppesFullName}"`)
  }

  if (provider.state && nppesStates.length > 0) {
    const submittedAbbr = STATE_ABBR[provider.state.toLowerCase()] ?? provider.state.toUpperCase().slice(0, 2)
    if (!nppesStates.includes(submittedAbbr)) {
      mismatches.push(`State: submitted "${provider.state}" — NPPES shows address(es) in ${nppesStates.join(', ')}`)
    }
  }

  if (provider.license_type && nppesCredential) {
    const submittedCred = provider.license_type.toUpperCase().replace(/\./g, '')
    if (!nppesCredential.includes(submittedCred) && !submittedCred.includes(nppesCredential)) {
      mismatches.push(`Credential: submitted "${provider.license_type}" — NPPES shows "${r.basic?.credential}"`)
    }
  }

  const genderRaw = r.basic?.gender ?? r.basic?.sex ?? null
  const nppesGender = (genderRaw === 'M' || genderRaw?.toLowerCase() === 'male') ? 'male'
    : (genderRaw === 'F' || genderRaw?.toLowerCase() === 'female') ? 'female'
    : null
  const nppesLine   = `NPPES — Name: ${nppesFullName} | Credential: ${r.basic?.credential ?? 'N/A'} | Specialty: ${taxonomy} | State(s): ${nppesStates.join(', ')}${nppesGender ? ` | Gender: ${nppesGender}` : ''}`

  const updates: Record<string, unknown> = {}
  if (nppesGender) updates.gender = nppesGender
  if (taxonomy && taxonomy !== 'N/A') updates.nppes_taxonomy = taxonomy
  if (Object.keys(updates).length > 0) {
    await supabase.from('providers').update(updates).eq('id', provider.id)
  }

  if (mismatches.length > 0) {
    return { result: 'review_required', details: `Mismatches found:\n• ${mismatches.join('\n• ')}\n\n${nppesLine}` }
  }
  return { result: 'clear', details: nppesLine }
}

// ──────────────────────────────────────────────────────────── LEIE ──────

// deno-lint-ignore no-explicit-any
async function checkLeie(provider: any): Promise<{ result: string; details: string }> {
  const nameParts = provider.name.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName  = nameParts[nameParts.length - 1] ?? ''
  const npi       = (provider.npi ?? '').replace(/\D/g, '')

  let csvText: string
  try {
    const res = await fetch(LEIE_URL)
    if (!res.ok) return { result: 'error', details: `LEIE download failed: ${res.status}` }
    csvText = await res.text()
  } catch (e) {
    return { result: 'error', details: `LEIE fetch error: ${String(e)}` }
  }

  // Pre-filter to only rows matching last name or NPI — parses a tiny subset, not all 60k rows
  const filtered = filterCsvLines(csvText, lastName.toLowerCase(), npi)
  // deno-lint-ignore no-explicit-any
  let records: any[]
  try {
    records = parse(filtered, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })
  } catch (e) {
    return { result: 'error', details: `LEIE parse error: ${String(e)}` }
  }

  const providerStateAbbr = toStateAbbr(provider.state)
  let result      = 'clear'
  let matchDetails = ''

  for (const entry of records) {
    const entryLast  = (entry.LASTNAME  ?? '').toLowerCase()
    const entryFirst = (entry.FIRSTNAME ?? '').toLowerCase()
    const entryNpi   = (entry.NPI       ?? '').replace(/\D/g, '')
    const leieSpecialty = entry.SPECIALTY ?? ''
    const leieDob   = entry.DOB   || 'N/A'
    const leieState = (entry.STATE ?? '').toUpperCase()
    const leieCity  = entry.CITY  ?? ''

    const baseDetails = `${entry.FIRSTNAME} ${entry.LASTNAME} | Exclusion: ${entry.EXCLTYPE} | Date: ${entry.EXCLDATE} | DOB: ${leieDob} | Specialty: ${leieSpecialty || 'N/A'} | Address: ${leieCity}, ${leieState}`

    if (npi && entryNpi && entryNpi === npi) {
      result       = 'excluded'
      matchDetails = `NPI match (definitive): ${baseDetails}`
      break
    }

    if (entryLast !== lastName.toLowerCase()) continue

    const firstLower      = firstName.toLowerCase()
    const entryFirstLower = entryFirst.toLowerCase()
    const nameMatches     = entryFirstLower === firstLower || levenshtein(firstLower, entryFirstLower) <= 2

    if (!nameMatches) {
      if (entryFirstLower.startsWith(firstLower[0]) && result !== 'excluded') {
        result       = 'review_required'
        matchDetails = `Partial name match — same last name and first initial only | ${baseDetails}`
      }
      continue
    }

    const leieDobNormalized     = leieDob !== 'N/A' ? leieDob.replace(/\D/g, '') : null
    const providerDobNormalized = provider.dob ? provider.dob.replace(/\D/g, '') : null
    const dobMatch   = leieDobNormalized && providerDobNormalized && leieDobNormalized === providerDobNormalized
    const stateMatch = providerStateAbbr && leieState && leieState === providerStateAbbr
    const specMatch  = leieSpecialty && specialtyMatches(provider.license_type, provider.specialties, leieSpecialty)

    const confirmedFields: string[] = []
    if (dobMatch)   confirmedFields.push('DOB')
    if (stateMatch) confirmedFields.push('state')
    if (specMatch)  confirmedFields.push('specialty')

    // If DOB is present on both sides and doesn't match — conclusively different person
    const dobMismatch = leieDobNormalized && providerDobNormalized && leieDobNormalized !== providerDobNormalized
    if (dobMismatch && confirmedFields.length === 0) continue

    if (dobMatch || confirmedFields.length >= 2) {
      result       = 'excluded'
      matchDetails = `High confidence — name + ${confirmedFields.join(' + ')} match | ${baseDetails}`
    } else if (confirmedFields.length === 1) {
      result       = 'review_required'
      matchDetails = `Possible match — name + ${confirmedFields.join(' + ')} match but other fields differ — verify manually | ${baseDetails}`
    } else {
      result       = 'review_required'
      matchDetails = `Name match only — state (${leieState} vs ${providerStateAbbr ?? 'unknown'}), specialty (${leieSpecialty || 'N/A'} vs ${provider.license_type ?? 'unknown'}), and DOB do not align — likely different individual | ${baseDetails}`
    }
    break
  }

  return {
    result,
    details: result === 'clear' ? `No exclusion record found for ${provider.name}` : matchDetails,
  }
}

// ──────────────────────────────────────────────────────────── SAM ───────
// Note: SAM.gov exclusions REST API requires a System Account (not a public key).
// Using the data.gov CSV snapshot as fallback until System Account is obtained.
// Apply at sam.gov before launch. CSV may be up to 30 days stale.

// deno-lint-ignore no-explicit-any
async function checkSam(provider: any): Promise<{ result: string; details: string }> {
  const nameParts = provider.name.trim().split(/\s+/)
  const firstName    = nameParts[0] ?? ''
  const lastName     = nameParts[nameParts.length - 1] ?? ''
  const providerStateAbbr = toStateAbbr(provider.state)
  const providerNpi  = (provider.npi ?? '').replace(/\D/g, '')

  let csvText: string
  try {
    const res = await fetch(SAM_CSV_URL)
    if (!res.ok) return { result: 'error', details: `SAM download failed: ${res.status}` }
    csvText = await res.text()
  } catch (e) {
    return { result: 'error', details: `SAM fetch error: ${String(e)}` }
  }

  const filtered = filterCsvLines(csvText, lastName.toLowerCase(), providerNpi)
  // deno-lint-ignore no-explicit-any
  let records: any[]
  try {
    records = parse(filtered, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true })
  } catch (e) {
    return { result: 'error', details: `SAM parse error: ${String(e)}` }
  }

  // deno-lint-ignore no-explicit-any
  const formatMatch = (m: any) =>
    `${m.First} ${m.Last} | ${m['Exclusion Type']} | ${m['Excluding Agency']} | Active: ${m['Active Date']} | Address: ${m['Address 1'] ?? ''}, ${m['City'] ?? ''}, ${m['Address 2'] ?? ''}`

  if (providerNpi) {
    // deno-lint-ignore no-explicit-any
    const npiMatch = records.find((entry: any) => {
      const entryNpi = (entry['NPI'] ?? '').replace(/\D/g, '')
      return entryNpi && entryNpi === providerNpi
    })
    if (npiMatch) {
      return { result: 'excluded', details: `NPI match (definitive): ${formatMatch(npiMatch)}` }
    }
  }

  // deno-lint-ignore no-explicit-any
  const nameMatches = records.filter((entry: any) => {
    if ((entry.Classification ?? '').toLowerCase() !== 'individual') return false
    const entryFirst = (entry.First ?? '').toLowerCase()
    const entryLast  = (entry.Last  ?? '').toLowerCase()
    return (
      entryLast === lastName.toLowerCase() &&
      entryFirst.startsWith(firstName.toLowerCase()[0])
    )
  })

  if (nameMatches.length === 0) {
    return { result: 'clear', details: `No exclusion record found for ${provider.name}` }
  }

  // deno-lint-ignore no-explicit-any
  const highConfidence = nameMatches.filter((m: any) => {
    const samState = (m['Address 2'] ?? m['State/Province'] ?? '').toUpperCase().trim()
    return providerStateAbbr && samState && samState === providerStateAbbr
  })

  if (highConfidence.length > 0) {
    return {
      result: 'excluded',
      details: `High confidence — name + state match:\n${highConfidence.map(formatMatch).join('\n')}`,
    }
  }

  // deno-lint-ignore no-explicit-any
  const allKnownStateMismatch = nameMatches.every((m: any) => {
    const samState = (m['Address 2'] ?? m['State/Province'] ?? '').toUpperCase().trim()
    return providerStateAbbr && samState && samState !== providerStateAbbr
  })
  if (allKnownStateMismatch) {
    return { result: 'clear', details: `No exclusion record found for ${provider.name}` }
  }

  return {
    result: 'review_required',
    details: `Name match but state does not align with provider's submitted state (${providerStateAbbr ?? 'unknown'}) — verify manually:\n${nameMatches.map(formatMatch).join('\n')}`,
  }
}

// ──────────────────────────────────────────────────────────── Handler ───

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { providerId } = await req.json()
    if (!providerId) {
      return new Response(JSON.stringify({ error: 'providerId required' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

    const { data: provider } = await supabase
      .from('providers')
      .select('id, name, npi, dob, state, license_type, specialties, gender')
      .eq('id', providerId)
      .single()

    if (!provider) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 })
    }

    // Run sequentially — each CSV is fetched + released before the next one loads,
    // keeping peak memory low enough to stay under the free-tier 150MB limit.
    const nppesResult = await checkNppes(provider, supabase)
    const leieResult  = await checkLeie(provider)
    const samResult   = await checkSam(provider)

    await supabase.from('verification_logs').insert([
      { provider_id: providerId, check_type: 'nppes', result: nppesResult.result, raw_output: nppesResult.details, run_by: 'auto' },
      { provider_id: providerId, check_type: 'leie',  result: leieResult.result,  raw_output: leieResult.details,  run_by: 'auto' },
      { provider_id: providerId, check_type: 'sam',   result: samResult.result,   raw_output: samResult.details,   run_by: 'auto' },
    ])

    return new Response(
      JSON.stringify({ nppes: nppesResult, leie: leieResult, sam: samResult }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
