import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id, slug, name, credentials, state, specialties, approaches, identity, faith_approach, languages, bio, scheduling_url, insurances, fee_individual, fee_couples, fee_initial, sliding_scale, visit_type, photo_url')
    .eq('verification_status', 'verified')
    .eq('status', 'active')
    .eq('directory_consent', true)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
