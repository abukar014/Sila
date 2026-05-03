import { parse } from 'csv-parse/sync'

const [,, lastName, firstName, npi] = process.argv

if (!lastName || !firstName) {
  console.error('Usage: npx ts-node scripts/check-leie.ts "LastName" "FirstName" [NPI]')
  process.exit(1)
}

const LEIE_URL = 'https://oig.hhs.gov/exclusions/downloadables/UPDATED.csv'

// Common transliterations for names frequently seen in Muslim/South Asian communities
const NAME_ALIASES: Record<string, string[]> = {
  'mohammed': ['mohammad', 'muhammad', 'mohamed', 'muhammed', 'mohamad'],
  'mohammad': ['mohammed', 'muhammad', 'mohamed', 'muhammed', 'mohamad'],
  'muhammad': ['mohammed', 'mohammad', 'mohamed', 'muhammed', 'mohamad'],
  'ali': ['aly'],
  'omar': ['umar', 'omer'],
  'fatima': ['fatimah', 'fatemah'],
  'aisha': ['ayesha', 'aysha', 'aiesha'],
}

function nameVariants(name: string): string[] {
  const lower = name.toLowerCase()
  return [lower, ...(NAME_ALIASES[lower] ?? [])]
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

function firstNameMatch(input: string, entry: string): 'exact' | 'fuzzy' | 'initial' | null {
  const inputLower = input.toLowerCase()
  const entryLower = entry.toLowerCase()

  // Exact or known alias
  if (nameVariants(inputLower).includes(entryLower)) return 'exact'

  // Close spelling (edit distance ≤ 2, guards against typos in the DB)
  if (levenshtein(inputLower, entryLower) <= 2) return 'fuzzy'

  // First initial only
  if (entryLower.startsWith(inputLower[0])) return 'initial'

  return null
}

type MatchLevel = 'NPI' | 'exact_name' | 'fuzzy_name' | 'initial_only'

interface Match {
  level: MatchLevel
  record: any
}

async function checkLEIE(lastName: string, firstName: string, npi?: string): Promise<Match[]> {
  console.log('Downloading OIG LEIE database...\n')

  const res = await fetch(LEIE_URL)
  if (!res.ok) throw new Error(`Failed to download LEIE database: ${res.status}`)

  const csv = await res.text()
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as any[]

  const matches: Match[] = []

  for (const entry of records) {
    const entryLast = (entry.LASTNAME ?? '').toLowerCase()
    const entryFirst = (entry.FIRSTNAME ?? '').toLowerCase()
    const entryNpi = (entry.NPI ?? '').replace(/\D/g, '')

    // Layer 1: NPI match — definitive
    if (npi && entryNpi && entryNpi === npi) {
      matches.push({ level: 'NPI', record: entry })
      continue
    }

    // Remaining layers require last name to match exactly
    if (entryLast !== lastName.toLowerCase()) continue

    const firstMatch = firstNameMatch(firstName, entryFirst)
    if (firstMatch === 'exact') matches.push({ level: 'exact_name', record: entry })
    else if (firstMatch === 'fuzzy') matches.push({ level: 'fuzzy_name', record: entry })
    else if (firstMatch === 'initial') matches.push({ level: 'initial_only', record: entry })
  }

  return matches
}

function printRecord(r: any) {
  console.log(`  Name:      ${r.FIRSTNAME} ${r.LASTNAME}`)
  console.log(`  Exclusion: ${r.EXCLTYPE}`)
  console.log(`  Date:      ${r.EXCLDATE}`)
  console.log(`  NPI:       ${r.NPI || 'N/A'}`)
  console.log(`  State:     ${r.STATE || 'N/A'}`)
}

checkLEIE(lastName, firstName, npi)
  .then(matches => {
    const npiHit = matches.filter(m => m.level === 'NPI')
    const exactHits = matches.filter(m => m.level === 'exact_name')
    const fuzzyHits = matches.filter(m => m.level === 'fuzzy_name')
    const initialHits = matches.filter(m => m.level === 'initial_only')

    if (npiHit.length > 0) {
      console.log('✗ EXCLUDED — NPI MATCH — DO NOT LIST\n')
      npiHit.forEach(m => printRecord(m.record))
      process.exit(2)
    }

    if (exactHits.length > 0) {
      console.log('✗ EXCLUDED — EXACT NAME MATCH — DO NOT LIST\n')
      exactHits.forEach(m => printRecord(m.record))
      process.exit(2)
    }

    if (fuzzyHits.length > 0) {
      console.log('⚠ REVIEW REQUIRED — CLOSE NAME MATCH\n')
      console.log('These records closely match but may be a different person.')
      console.log('Verify manually at https://exclusions.oig.hhs.gov\n')
      fuzzyHits.forEach(m => { printRecord(m.record); console.log() })
      process.exit(1)
    }

    if (initialHits.length > 0) {
      console.log('⚠ REVIEW REQUIRED — PARTIAL NAME MATCH\n')
      console.log('Same last name and first initial — likely a different person but confirm.\n')
      initialHits.forEach(m => { printRecord(m.record); console.log() })
      process.exit(1)
    }

    console.log('✓ CLEAR — Not found on OIG exclusion list\n')
    if (npi) console.log('  NPI checked: ' + npi)
    console.log('  Last name checked: ' + lastName)
    console.log('  First name checked: ' + firstName + '\n')
  })
  .catch(err => {
    console.error('\n⚠ Check failed:', err.message)
    console.error('Verify manually at https://exclusions.oig.hhs.gov\n')
    process.exit(1)
  })
