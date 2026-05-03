import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { decision, notes } = await request.json()

  const updates: any = {
    verification_status: decision,
    verification_notes: notes ?? null,
  }

  if (decision === 'verified') {
    updates.verified = true
    updates.verified_date = new Date().toISOString().split('T')[0]
    updates.status = 'active'
  }

  if (decision === 'rejected') {
    updates.verified = false
    updates.status = 'inactive'
  }

  const { error } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'decision',
    result: decision,
    passed: decision === 'verified',
    notes: notes ?? null,
    check_date: new Date().toISOString(),
    run_by: 'admin',
  })

  return NextResponse.json({ success: true })
}
