import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider, error } = await supabaseAdmin
    .from('providers')
    .select('id, name, verification_status, status, verified_date, accepting_clients, scheduling_url, email, credentials, state, specialties, approaches, identity, visit_type, faith_approach, languages, bio, insurances, fee_individual, fee_couples, fee_initial, gender')
    .eq('id', id)
    .single()

  if (error || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json(provider)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const updates = await request.json()

  if (updates.npi) {
    const { data: flagged } = await supabaseAdmin
      .from('flagged_npis')
      .select('npi')
      .eq('npi', updates.npi)
      .maybeSingle()

    if (flagged) {
      return NextResponse.json(
        { error: 'This NPI is not eligible for registration on Sila.' },
        { status: 403 }
      )
    }
  }

  const { error } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
