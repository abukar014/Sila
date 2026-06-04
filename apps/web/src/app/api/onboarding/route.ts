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

  // Check if a partial row already exists from the website signup form
  const { data: existing } = await supabaseAdmin
    .from('providers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    // Provider came through the website form first — attach their user account
    const { data: updated, error } = await supabaseAdmin
      .from('providers')
      .update({
        user_id,
        name,
        dob: dob ?? null,
        status: 'inactive',
      })
      .eq('id', existing.id)
      .select('id')
      .single()

    if (error || !updated) {
      return NextResponse.json({ error: error?.message ?? 'Failed to update provider record' }, { status: 500 })
    }
    return NextResponse.json({ provider_id: updated.id })
  }

  // No existing row — direct app signup, create fresh
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
