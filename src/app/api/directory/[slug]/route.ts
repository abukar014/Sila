import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id, slug, name, credentials, state, specialties, approaches, identity, faith_approach, languages, bio, scheduling_url, insurances, fee_individual, fee_couples, fee_initial, visit_type, verification_status, status')
    .eq('slug', slug)
    .eq('verification_status', 'verified')
    .eq('status', 'active')
    .single()

  if (error || !data) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  return NextResponse.json(data)
}
