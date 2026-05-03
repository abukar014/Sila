import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { check_type, result, passed, notes } = await request.json()

  const { error } = await supabaseAdmin
    .from('verification_logs')
    .insert({
      provider_id: id,
      check_type,
      result,
      passed,
      notes,
      check_date: new Date().toISOString(),
      run_by: 'admin',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
