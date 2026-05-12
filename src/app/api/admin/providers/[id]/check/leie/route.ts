import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const LEIE_URL = 'https://oig.hhs.gov/exclusions/downloadables/UPDATED.csv'
const CACHE_PATH = path.join(os.tmpdir(), 'sila-leie-cache.csv')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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

// Maps license type abbreviations to keywords that appear in LEIE specialty descriptions
const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  'lcsw': ['social worker', 'clinical social'],
  'md': ['physician', 'doctor', 'medicine', 'medical'],
  'do': ['osteopathic', 'physician'],
  'lpc': ['counselor', 'professional counselor'],
  'lmft': ['marriage', 'family therapist', 'family therapy'],
  'np': ['nurse practitioner'],
  'rn': ['registered nurse', 'nursing'],
  'phd': ['psychologist', 'psychology', 'counselor', 'therapist'],
  'psyd': ['psychologist', 'psychology'],
  'dds': ['dentist', 'dental'],
  'dmd': ['dentist', 'dental'],
  'pa': ['physician assistant'],
  'pharmd': ['pharmacist', 'pharmacy'],
  'dnp': ['nurse practitioner', 'nursing'],
}

async function getCSV(): Promise<string> {
  if (fs.existsSync(CACHE_PATH)) {
    const age = Date.now() - fs.statSync(CACHE_PATH).mtimeMs
    if (age < CACHE_TTL_MS) return fs.readFileSync(CACHE_PATH, 'utf-8')
  }
  const res = await fetch(LEIE_URL)
  if (!res.ok) throw new Error(`LEIE download failed: ${res.status}`)
  const csv = await res.text()
  fs.writeFileSync(CACHE_PATH, csv, 'utf-8')
  return csv
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
  // Also check free-text specialties the provider submitted
  return (specialties ?? []).some(s =>
    leie.includes(s.toLowerCase()) || s.toLowerCase().includes(leie.split(' ')[0])
  )
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('name, npi, state, license_type, specialties, dob')
    .eq('id', id)
    .single()

  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

  const nameParts = provider.name.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts[nameParts.length - 1] ?? ''

  const csv = await getCSV()
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as any[]

  const npi = (provider.npi ?? '').replace(/\D/g, '')
  const providerStateAbbr = provider.state
    ? (STATE_ABBR[provider.state.toLowerCase()] ?? provider.state.toUpperCase().slice(0, 2))
    : null

  let result = 'clear'
  let matchDetails = ''

  for (const entry of records) {
    const entryLast = (entry.LASTNAME ?? '').toLowerCase()
    const entryFirst = (entry.FIRSTNAME ?? '').toLowerCase()
    const entryNpi = (entry.NPI ?? '').replace(/\D/g, '')
    const leieSpecialty = entry.SPECIALTY ?? ''
    const leieDob = entry.DOB || 'N/A'
    const leieState = (entry.STATE ?? '').toUpperCase()
    const leieCity = entry.CITY ?? ''

    const baseDetails = `${entry.FIRSTNAME} ${entry.LASTNAME} | Exclusion: ${entry.EXCLTYPE} | Date: ${entry.EXCLDATE} | DOB: ${leieDob} | Specialty: ${leieSpecialty || 'N/A'} | Address: ${leieCity}, ${leieState}`

    // NPI match — definitive
    if (npi && entryNpi && entryNpi === npi) {
      result = 'excluded'
      matchDetails = `NPI match (definitive): ${baseDetails}`
      break
    }

    if (entryLast !== lastName.toLowerCase()) continue

    const firstLower = firstName.toLowerCase()
    const entryFirstLower = entryFirst.toLowerCase()
    const nameMatches = entryFirstLower === firstLower || levenshtein(firstLower, entryFirstLower) <= 2

    if (!nameMatches) {
      // Partial: same last name, same first initial only
      if (entryFirstLower.startsWith(firstLower[0]) && result !== 'excluded') {
        result = 'review_required'
        matchDetails = `Partial name match — same last name and first initial only | ${baseDetails}`
      }
      continue
    }

    // Full name match — cross-reference DOB, specialty, and state
    const leieDobNormalized = leieDob !== 'N/A' ? leieDob.replace(/\D/g, '') : null
    const providerDobNormalized = provider.dob ? provider.dob.replace(/\D/g, '') : null
    const dobMatch = leieDobNormalized && providerDobNormalized && leieDobNormalized === providerDobNormalized

    const stateMatch = providerStateAbbr && leieState && leieState === providerStateAbbr
    const specMatch = leieSpecialty && specialtyMatches(provider.license_type, provider.specialties, leieSpecialty)

    const confirmedFields: string[] = []
    if (dobMatch) confirmedFields.push('DOB')
    if (stateMatch) confirmedFields.push('state')
    if (specMatch) confirmedFields.push('specialty')

    // DOB match alone is sufficient — it's a strong identifier
    if (dobMatch || confirmedFields.length >= 2) {
      result = 'excluded'
      matchDetails = `High confidence — name + ${confirmedFields.join(' + ')} match | ${baseDetails}`
    } else if (confirmedFields.length === 1) {
      result = 'review_required'
      matchDetails = `Possible match — name + ${confirmedFields.join(' + ')} match but other fields differ — verify manually | ${baseDetails}`
    } else {
      result = 'review_required'
      matchDetails = `Name match only — state (${leieState} vs ${providerStateAbbr ?? 'unknown'}), specialty (${leieSpecialty || 'N/A'} vs ${provider.license_type ?? 'unknown'}), and DOB do not align — likely different individual | ${baseDetails}`
    }
    break
  }

  const details = result === 'clear'
    ? `No exclusion record found for ${provider.name}`
    : matchDetails

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'leie',
    result,
    raw_output: details,
    run_by: 'admin',
  })

  return NextResponse.json({ result, details })
}
