import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const [,, firstName, lastName] = process.argv

if (!firstName || !lastName) {
  console.error('Usage: npx ts-node scripts/check-sam.ts "FirstName" "LastName"')
  process.exit(1)
}

const SAM_API_KEY = process.env.SAM_API_KEY

if (!SAM_API_KEY) {
  console.error('Missing SAM_API_KEY in environment variables')
  process.exit(1)
}

async function checkSAM(firstName: string, lastName: string) {
  const name = encodeURIComponent(`${firstName} ${lastName}`)
  const url = `https://api.sam.gov/entity-information/v4/exclusions?api_key=${SAM_API_KEY}&exclusionName=${name}&classification=Individual&recordStatus=Active`

  const res = await fetch(url)

  if (!res.ok) {
    return {
      excluded: false,
      matches: [],
      note: `SAM.gov API returned ${res.status} — verify manually at sam.gov/search/#/exclusions`
    }
  }

  const data = await res.json()
  const results: any[] = data?.excludedEntity ?? []

  const matches = results.filter((entry: any) => {
    const entryFirst = (entry.exclusionIdentification?.firstName ?? '').toLowerCase()
    const entryLast = (entry.exclusionIdentification?.lastName ?? '').toLowerCase()
    return (
      entryLast === lastName.toLowerCase() &&
      entryFirst.startsWith(firstName.toLowerCase()[0])
    )
  })

  return { excluded: matches.length > 0, matches, note: null }
}

checkSAM(firstName, lastName)
  .then(result => {
    if (result.excluded) {
      console.log('\n✗ EXCLUDED on SAM.gov — DO NOT LIST\n')
      result.matches.forEach((m: any) => {
        const id = m.exclusionIdentification ?? {}
        const details = m.exclusionDetails ?? {}
        const actions = m.exclusionActions ?? {}
        console.log(`  Name:       ${id.firstName} ${id.lastName}`)
        console.log(`  Type:       ${details.exclusionType ?? 'N/A'}`)
        console.log(`  Agency:     ${details.excludingAgencyName ?? 'N/A'}`)
        console.log(`  Active from:${actions.startDate ?? 'N/A'}`)
        console.log(`  NPI:        ${id.npi ?? 'N/A'}\n`)
      })
    } else {
      console.log('\n✓ CLEAR — Not found on SAM.gov exclusion list\n')
      if (result.note) console.log(`  Note: ${result.note}\n`)
    }
  })
  .catch(err => {
    console.error('\n⚠ Check failed:', err.message)
    console.error('Verify manually at https://sam.gov/search/#/exclusions\n')
    process.exit(1)
  })
