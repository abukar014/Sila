import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })

import { parse } from 'csv-parse/sync'

const [,, firstName, lastName] = process.argv

if (!firstName || !lastName) {
  console.error('Usage: npx ts-node scripts/check-sam.ts "FirstName" "LastName"')
  process.exit(1)
}

const SAM_CSV_URL = 'https://inventory.data.gov/dataset/7416a2e4-9aa7-4bcd-801c-20f25a545916/resource/78bb6c57-42e8-4055-931d-928ebcbde39f/download/samexclusionspublicextract-gsa-1626.csv'

async function checkSAM(firstName: string, lastName: string) {
  console.log('Downloading SAM exclusions database...')

  const res = await fetch(SAM_CSV_URL)
  if (!res.ok) throw new Error(`Failed to download SAM exclusions: ${res.status}`)

  const csv = await res.text()
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
