import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action, reason } = await request.json()

  const updates = action === 'approve'
    ? {
        verification_status: 'verified',
        verified: true,
        verified_date: new Date().toISOString().split('T')[0],
        status: 'active',
      }
    : {
        verification_status: 'rejected',
        verification_notes: reason ?? '',
      }

  const { error } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'decision',
    result: action === 'approve' ? 'approved' : 'rejected',
    raw_output: action === 'approve'
      ? 'Provider approved and set to active'
      : `Rejected: ${reason}`,
    run_by: 'admin',
  })

  return NextResponse.json({ success: true })
}
