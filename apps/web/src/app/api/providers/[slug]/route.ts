import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { data, error } = await supabase
    .from('providers')
    .select('id, slug, name, license_type, credentials, state, specialties, approaches, identity, faith_approach, languages, bio, pull_quote, scheduling_url, insurances, fee_individual, fee_couples, fee_initial, sliding_scale, visit_type, telehealth, in_person, photo_url, accepting_clients, verified_date, gender, age_groups')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
