import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('npi, name, state, license_type')
    .eq('id', id)
    .single()

  if (!provider?.npi) {
    return NextResponse.json({ result: 'flagged', details: 'No NPI on file for this provider' })
  }

  // Check NPI blocklist before hitting NPPES
  const { data: flagged } = await supabaseAdmin
    .from('flagged_npis')
    .select('reason, flagged_at')
    .eq('npi', provider.npi)
    .single()

  if (flagged) {
    const flaggedDate = new Date(flagged.flagged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return NextResponse.json({
      result: 'excluded',
      details: `NPI ${provider.npi} is on the Sila blocklist (flagged ${flaggedDate}). Reason: ${flagged.reason}`,
    })
  }

  const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${provider.npi}&version=2.1`)
  const data = await res.json()

  let result: string
  let details: string

  if (!data.results || data.results.length === 0) {
    result = 'flagged'
    details = `NPI ${provider.npi} not found in NPPES registry`
  } else {
    const r = data.results[0]
    const nppesFirstName = (r.basic?.first_name ?? '').toLowerCase()
    const nppesLastName = (r.basic?.last_name ?? '').toLowerCase()
    const nppesFullName = `${r.basic?.first_name ?? ''} ${r.basic?.last_name ?? ''}`.trim()
    const nppesCredential = (r.basic?.credential ?? '').toUpperCase().replace(/\./g, '')
    const taxonomy = r.taxonomies?.[0]?.desc ?? 'N/A'
    const nppesStates: string[] = [...new Set<string>(
      ((r.addresses ?? []) as { state?: string }[]).map((a) => a.state ?? '').filter(Boolean)
    )]

    const mismatches: string[] = []

    // Name check — last name must match; first name must match or share first 3 chars (covers nicknames)
    const submittedNameClean = provider.name
      .toLowerCase()
      .replace(/,?\s*(md|do|phd|lcsw|lpc|lmft|dnp|np|rn|pa|dds|dmd|pharmd|psyd|ms|ma)\b/gi, '')
      .trim()

    const submittedFirstWord = submittedNameClean.split(/\s+/)[0] ?? ''

    const lastNameMatch = !nppesLastName || submittedNameClean.includes(nppesLastName)
    const firstNameMatch = !nppesFirstName || (
      submittedNameClean.includes(nppesFirstName) ||
      (nppesFirstName.length >= 3 && submittedFirstWord.startsWith(nppesFirstName.slice(0, 3))) ||
      (submittedFirstWord.length >= 3 && nppesFirstName.startsWith(submittedFirstWord.slice(0, 3)))
    )

    if (!lastNameMatch) {
      mismatches.push(`Name: last name mismatch — submitted "${provider.name}", NPPES shows "${nppesFullName}"`)
    } else if (!firstNameMatch) {
      mismatches.push(`Name: first name mismatch — submitted "${provider.name}", NPPES shows "${nppesFullName}"`)
    }

    // State check — normalize submitted state to abbreviation, check against all NPPES addresses
    if (provider.state && nppesStates.length > 0) {
      const submittedAbbr = STATE_ABBR[provider.state.toLowerCase()] ?? provider.state.toUpperCase().slice(0, 2)
      if (!nppesStates.includes(submittedAbbr)) {
        mismatches.push(`State: submitted "${provider.state}" — NPPES shows address(es) in ${nppesStates.join(', ')}`)
      }
    }

    // Credential check — compare license type against NPPES credential
    if (provider.license_type && nppesCredential) {
      const submittedCred = provider.license_type.toUpperCase().replace(/\./g, '')
      if (!nppesCredential.includes(submittedCred) && !submittedCred.includes(nppesCredential)) {
        mismatches.push(`Credential: submitted "${provider.license_type}" — NPPES shows "${r.basic?.credential}"`)
      }
    }

    const genderRaw = r.basic?.gender ?? r.basic?.sex ?? null
  const nppesGender = (genderRaw === 'M' || genderRaw?.toLowerCase() === 'male') ? 'male'
    : (genderRaw === 'F' || genderRaw?.toLowerCase() === 'female') ? 'female'
    : null
    const nppesLine = `NPPES — Name: ${nppesFullName} | Credential: ${r.basic?.credential ?? 'N/A'} | Specialty: ${taxonomy} | State(s): ${nppesStates.join(', ')}${nppesGender ? ` | Gender: ${nppesGender}` : ''}`

    if (mismatches.length > 0) {
      result = 'review_required'
      details = `Mismatches found:\n• ${mismatches.join('\n• ')}\n\n${nppesLine}`
    } else {
      result = 'clear'
      details = nppesLine
    }

    // Write gender to provider record if NPPES has it and we don't already have one
    if (nppesGender) {
      await supabaseAdmin
        .from('providers')
        .update({ gender: nppesGender })
        .eq('id', id)
        .is('gender', null)
    }
  }

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'nppes',
    result,
    raw_output: details,
    run_by: 'admin',
  })

  return NextResponse.json({ result, details })
}
