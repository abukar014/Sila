// SAM.gov exclusions REST API requires a System Account — not accessible with a public API key.
// Using data.gov CSV snapshot as fallback. May be up to 30 days stale. Apply for System Account at sam.gov before launch.
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const SAM_CSV_URL = 'https://inventory.data.gov/dataset/7416a2e4-9aa7-4bcd-801c-20f25a545916/resource/78bb6c57-42e8-4055-931d-928ebcbde39f/download/samexclusionspublicextract-gsa-1626.csv'
const CACHE_PATH  = path.join(os.tmpdir(), 'sila-sam-cache.csv')
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

async function getCSV(): Promise<string> {
  if (fs.existsSync(CACHE_PATH)) {
    const age = Date.now() - fs.statSync(CACHE_PATH).mtimeMs
    if (age < CACHE_TTL_MS) return fs.readFileSync(CACHE_PATH, 'utf-8')
  }
  const res = await fetch(SAM_CSV_URL)
  if (!res.ok) throw new Error(`SAM download failed: ${res.status}`)
  const csv = await res.text()
  fs.writeFileSync(CACHE_PATH, csv, 'utf-8')
  return csv
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('name, state, npi')
    .eq('id', id)
    .single()

  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

  const nameParts         = provider.name.trim().split(/\s+/)
  const firstName         = nameParts[0] ?? ''
  const lastName          = nameParts[nameParts.length - 1] ?? ''
  const providerNpi       = (provider.npi ?? '').replace(/\D/g, '')
  const providerStateAbbr = provider.state
    ? (STATE_ABBR[provider.state.toLowerCase()] ?? provider.state.toUpperCase().slice(0, 2))
    : null

  const csv     = await getCSV()
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as any[]

  const formatMatch = (m: any) =>
    `${m.First} ${m.Last} | ${m['Exclusion Type']} | ${m['Excluding Agency']} | Active: ${m['Active Date']} | Address: ${m['Address 1'] ?? ''}, ${m['City'] ?? ''}, ${m['Address 2'] ?? ''}`

  if (providerNpi) {
    const npiMatch = records.find((entry: any) => {
      const entryNpi = (entry['NPI'] ?? '').replace(/\D/g, '')
      return entryNpi && entryNpi === providerNpi
    })
    if (npiMatch) {
      const details = `NPI match (definitive): ${formatMatch(npiMatch)}`
      await supabaseAdmin.from('verification_logs').insert({
        provider_id: id, check_type: 'sam', result: 'excluded', raw_output: details, run_by: 'admin',
      })
      return NextResponse.json({ result: 'excluded', details })
    }
  }

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
    const details = `No exclusion record found for ${provider.name}`
    await supabaseAdmin.from('verification_logs').insert({
      provider_id: id, check_type: 'sam', result: 'clear', raw_output: details, run_by: 'admin',
    })
    return NextResponse.json({ result: 'clear', details })
  }

  const highConfidence = nameMatches.filter((m: any) => {
    const samState = (m['Address 2'] ?? m['State/Province'] ?? '').toUpperCase().trim()
    return providerStateAbbr && samState && samState === providerStateAbbr
  })

  let result:  string
  let details: string

  if (highConfidence.length > 0) {
    result  = 'excluded'
    details = `High confidence — name + state match:\n${highConfidence.map(formatMatch).join('\n')}`
  } else {
    const allKnownStateMismatch = nameMatches.every((m: any) => {
      const samState = (m['Address 2'] ?? m['State/Province'] ?? '').toUpperCase().trim()
      return providerStateAbbr && samState && samState !== providerStateAbbr
    })
    if (allKnownStateMismatch) {
      result  = 'clear'
      details = `No exclusion record found for ${provider.name}`
    } else {
      result  = 'review_required'
      details = `Name match but state does not align with provider's submitted state (${providerStateAbbr ?? 'unknown'}) — verify manually:\n${nameMatches.map(formatMatch).join('\n')}`
    }
  }

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id, check_type: 'sam', result, raw_output: details, run_by: 'admin',
  })

  return NextResponse.json({ result, details })
}
