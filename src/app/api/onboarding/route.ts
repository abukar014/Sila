import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  const { name, email, user_id, dob } = await request.json()

  if (!name || !email || !user_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`

  const { data: provider, error } = await supabaseAdmin
    .from('providers')
    .insert({
      user_id,
      name,
      email,
      slug,
      dob: dob ?? null,
      status: 'inactive',
      verification_status: 'incomplete',
      accepting_clients: false,
    })
    .select('id')
    .single()

  if (error || !provider) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create provider record' }, { status: 500 })
  }

  return NextResponse.json({ provider_id: provider.id })
}
