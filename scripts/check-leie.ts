const [,, lastName, firstName] = process.argv

if (!lastName || !firstName) {
  console.error('Usage: npx ts-node scripts/check-leie.ts "LastName" "FirstName"')
  process.exit(1)
}

async function checkLEIE(lastName: string, firstName: string) {
  const url = `https://exclusions.oig.hhs.gov/api/v1/exclusions?search=${encodeURIComponent(lastName)}`
  const res = await fetch(url)
  const data = await res.json()

  if (!data || !Array.isArray(data)) {
    return { excluded: false, reason: null, note: 'Could not reach LEIE API — verify manually at oig.hhs.gov' }
  }

  const match = data.find((entry: any) => {
    const entryLast = entry.lastname?.toLowerCase() ?? ''
    const entryFirst = entry.firstname?.toLowerCase() ?? ''
    return entryLast === lastName.toLowerCase() && entryFirst.startsWith(firstName.toLowerCase()[0])
  })

  if (match) {
    return { excluded: true, reason: match.excltype ?? 'Unknown', note: null }
  }

  return { excluded: false, reason: null, note: null }
}

checkLEIE(lastName, firstName).then(result => {
  if (result.excluded) {
    console.log('\n✗ EXCLUDED — DO NOT LIST\n')
    console.log(`Reason: ${result.reason}\n`)
  } else {
    console.log('\n✓ CLEAR — Not on OIG exclusion list\n')
    if (result.note) console.log(`Note: ${result.note}\n`)
  }
})
