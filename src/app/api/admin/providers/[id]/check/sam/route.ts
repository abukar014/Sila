import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const SAM_CSV_URL = 'https://inventory.data.gov/dataset/7416a2e4-9aa7-4bcd-801c-20f25a545916/resource/78bb6c57-42e8-4055-931d-928ebcbde39f/download/samexclusionspublicextract-gsa-1626.csv'
const CACHE_PATH = path.join(os.tmpdir(), 'sila-sam-cache.csv')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

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
    .select('name')
    .eq('id', id)
    .single()

  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

  const nameParts = provider.name.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts[nameParts.length - 1] ?? ''

  const csv = await getCSV()
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as any[]

  const matches = records.filter((entry: any) => {
    if ((entry.Classification ?? '').toLowerCase() !== 'individual') return false
    const entryFirst = (entry.First ?? '').toLowerCase()
    const entryLast = (entry.Last ?? '').toLowerCase()
    return (
      entryLast === lastName.toLowerCase() &&
      entryFirst.startsWith(firstName.toLowerCase()[0])
    )
  })

  const result = matches.length > 0 ? 'excluded' : 'clear'
  const details = matches.length > 0
    ? matches.map((m: any) => `${m.First} ${m.Last} | ${m['Exclusion Type']} | ${m['Excluding Agency']} | Active: ${m['Active Date']}`).join('\n')
    : `No exclusion record found for ${provider.name}`

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'sam',
    result,
    raw_output: details,
    run_by: 'admin',
  })

  return NextResponse.json({ result, details })
}
