import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })

const NPI = process.argv[2]

if (!NPI) {
  console.error('Usage: npx ts-node scripts/verify-nppes.ts <NPI>')
  process.exit(1)
}

async function verifyNPI(npi: string) {
  const url = `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`
  const res = await fetch(url)
  const data = await res.json()

  if (!data.results || data.results.length === 0) {
    return { valid: false, name: null, credential: null, taxonomy: null, state: null }
  }

  const r = data.results[0]
  const name = `${r.basic?.first_name ?? ''} ${r.basic?.last_name ?? ''}`.trim()
  const credential = r.basic?.credential ?? null
  const taxonomy = r.taxonomies?.[0]?.desc ?? null
  const state = r.addresses?.[0]?.state ?? null

  return { valid: true, name, credential, taxonomy, state }
}

verifyNPI(NPI).then(result => {
  if (result.valid) {
    console.log('\n✓ VALID NPI\n')
    console.log(`Name:       ${result.name}`)
    console.log(`Credential: ${result.credential}`)
    console.log(`Specialty:  ${result.taxonomy}`)
    console.log(`State:      ${result.state}\n`)
  } else {
    console.log('\n✗ NPI NOT FOUND\n')
  }
})
