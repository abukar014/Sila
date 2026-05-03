import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })

import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const [,, firstName, lastName] = process.argv

if (!firstName || !lastName) {
  console.error('Usage: npx ts-node scripts/check-sam.ts "FirstName" "LastName"')
  process.exit(1)
}

const SAM_CSV_URL = 'https://inventory.data.gov/dataset/7416a2e4-9aa7-4bcd-801c-20f25a545916/resource/78bb6c57-42e8-4055-931d-928ebcbde39f/download/samexclusionspublicextract-gsa-1626.csv'
const CACHE_PATH = path.join(__dirname, '.sam-cache.csv')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

async function getCSV(): Promise<string> {
  const cacheExists = fs.existsSync(CACHE_PATH)
  if (cacheExists) {
    const age = Date.now() - fs.statSync(CACHE_PATH).mtimeMs
    if (age < CACHE_TTL_MS) {
      console.log('Using cached SAM database (updated today)')
      return fs.readFileSync(CACHE_PATH, 'utf-8')
    }
  }

  console.log('Downloading SAM exclusions database...')
  const res = await fetch(SAM_CSV_URL)
  if (!res.ok) throw new Error(`Failed to download SAM exclusions: ${res.status}`)
  const csv = await res.text()
  fs.writeFileSync(CACHE_PATH, csv, 'utf-8')
  return csv
}

async function checkSAM(firstName: string, lastName: string) {
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

  return matches
}

checkSAM(firstName, lastName)
  .then(matches => {
    if (matches.length > 0) {
      console.log('\n✗ EXCLUDED on SAM.gov — DO NOT LIST\n')
      matches.forEach((m: any) => {
        console.log(`  Name:       ${m.First} ${m.Last}`)
        console.log(`  Type:       ${m['Exclusion Type'] ?? 'N/A'}`)
        console.log(`  Agency:     ${m['Excluding Agency'] ?? 'N/A'}`)
        console.log(`  Active:     ${m['Active Date'] ?? 'N/A'}`)
        console.log(`  NPI:        ${m.NPI || 'N/A'}\n`)
      })
    } else {
      console.log('\n✓ CLEAR — Not found on SAM exclusion list\n')
    }
  })
  .catch(err => {
    console.error('\n⚠ Check failed:', err.message)
    console.error('Verify manually at https://sam.gov/search/#/exclusions\n')
    process.exit(1)
  })
