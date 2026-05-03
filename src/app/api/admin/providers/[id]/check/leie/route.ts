import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const LEIE_URL = 'https://oig.hhs.gov/exclusions/downloadables/UPDATED.csv'
const CACHE_PATH = path.join(os.tmpdir(), 'sila-leie-cache.csv')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('name, npi')
    .eq('id', id)
    .single()

  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

  const nameParts = provider.name.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts[nameParts.length - 1] ?? ''

  const csv = await getCSV()
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as any[]

  const npi = (provider.npi ?? '').replace(/\D/g, '')
  let result = 'clear'
  let matchDetails = ''

  for (const entry of records) {
    const entryLast = (entry.LASTNAME ?? '').toLowerCase()
    const entryFirst = (entry.FIRSTNAME ?? '').toLowerCase()
    const entryNpi = (entry.NPI ?? '').replace(/\D/g, '')

    if (npi && entryNpi && entryNpi === npi) {
      result = 'excluded'
      matchDetails = `NPI match: ${entry.FIRSTNAME} ${entry.LASTNAME} | Exclusion: ${entry.EXCLTYPE} | Date: ${entry.EXCLDATE} | State: ${entry.STATE}`
      break
    }

    if (entryLast !== lastName.toLowerCase()) continue

    const firstLower = firstName.toLowerCase()
    const entryFirstLower = entryFirst.toLowerCase()

    if (entryFirstLower === firstLower || levenshtein(firstLower, entryFirstLower) <= 2) {
      result = 'excluded'
      matchDetails = `Name match: ${entry.FIRSTNAME} ${entry.LASTNAME} | Exclusion: ${entry.EXCLTYPE} | Date: ${entry.EXCLDATE} | State: ${entry.STATE}`
      break
    }

    if (entryFirstLower.startsWith(firstLower[0]) && result !== 'excluded') {
      result = 'review_required'
      matchDetails = `Partial match: ${entry.FIRSTNAME} ${entry.LASTNAME} | Same last name and first initial — confirm manually`
    }
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
