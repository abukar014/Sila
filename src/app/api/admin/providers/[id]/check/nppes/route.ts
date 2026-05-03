import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('npi, name')
    .eq('id', id)
    .single()

  if (!provider?.npi) {
    return NextResponse.json({ result: 'flagged', details: 'No NPI on file for this provider' })
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
    const name = `${r.basic?.first_name ?? ''} ${r.basic?.last_name ?? ''}`.trim()
    const credential = r.basic?.credential ?? 'N/A'
    const taxonomy = r.taxonomies?.[0]?.desc ?? 'N/A'
    const state = r.addresses?.[0]?.state ?? 'N/A'
    result = 'clear'
    details = `Name: ${name} | Credential: ${credential} | Specialty: ${taxonomy} | State: ${state}`
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
