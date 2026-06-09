import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { applyProviderDecision, DecisionStatus } from '@/lib/providerDecision'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('providers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const updates = await request.json()

  // If verification_status is being changed, route through the full decision
  // flow (guards, derived field updates, audit log, email). Strip it from the
  // plain update so it isn't double-written.
  if ('verification_status' in updates) {
    const { verification_status, verification_notes, ...rest } = updates

    const { error } = await applyProviderDecision(id, verification_status as DecisionStatus, {
      notes: verification_notes ?? null,
    })

    if (error) {
      const status = error.includes('excluded') ? 400 : 500
      return NextResponse.json({ error }, { status })
    }

    // If there were other fields in the same PATCH (unlikely but safe), write them now.
    if (Object.keys(rest).length > 0) {
      const { error: restError } = await supabaseAdmin
        .from('providers')
        .update(rest)
        .eq('id', id)
      if (restError) return NextResponse.json({ error: restError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  // Plain field updates (accepting_clients, status, etc.) — no email, no log.
  const { error } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
