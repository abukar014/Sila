import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const specialty = searchParams.get('specialty')
  const city = searchParams.get('city')
  const telehealth = searchParams.get('telehealth')
  const gender = searchParams.get('gender')
  const faith_approach = searchParams.get('faith_approach')
  const search = searchParams.get('search')

  let query = supabase
    .from('providers')
    .select('*')
    .eq('verification_status', 'verified')
    .eq('status', 'active')
    .eq('accepting_clients', true)

  if (city) query = query.ilike('city', `%${city}%`)
  if (gender) query = query.eq('gender', gender)
  if (faith_approach) query = query.eq('faith_approach', faith_approach)
  if (telehealth === 'true') query = query.eq('telehealth', true)
  if (specialty) query = query.contains('specialties', [specialty])
  if (search) query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
