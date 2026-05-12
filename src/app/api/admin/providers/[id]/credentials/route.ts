import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const ALLOWED_FIELDS = ['npi', 'dob', 'license_number', 'license_type', 'state'] as const
type AllowedField = typeof ALLOWED_FIELDS[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updates: Partial<Record<AllowedField, string>> = {}
  const changed: string[] = []

  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined && body[field] !== null) {
      updates[field] = body[field]
      changed.push(`${field} → ${body[field]}`)
    }
  }

  if (changed.length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'credential_edit',
    result: 'updated',
    raw_output: `Admin corrected: ${changed.join(', ')}`,
  })

  return NextResponse.json({ success: true, updated: Object.keys(updates) })
}
