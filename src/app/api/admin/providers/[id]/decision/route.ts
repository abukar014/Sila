import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { decision, notes, requestCorrections = false } = await request.json()

  // Never overwrite an exclusion
  const { data: current } = await supabaseAdmin
    .from('providers')
    .select('verification_status')
    .eq('id', id)
    .single()

  if (current?.verification_status === 'excluded') {
    return NextResponse.json({ error: 'Cannot change status of an excluded provider' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    verification_status: decision,
    verification_notes: notes ?? null,
  }

  if (decision === 'verified') {
    updates.verified = true
    updates.verified_date = new Date().toISOString().split('T')[0]
    updates.status = 'active'
  }

  if (decision === 'in_review') {
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

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('name, email')
    .eq('id', id)
    .single()

  if (provider?.email) {
    if (decision === 'verified') {
      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: provider.email,
        subject: "You're live on Sila",
        html: `
          <p>Hi ${provider.name},</p>
          <p>Your profile has been verified and is now live on Sila. Clients can find you in the directory.</p>
          <p>If you need to update your profile or scheduling link, sign in to your provider dashboard.</p>
          <p>— The Sila Team</p>
        `,
      })
      if (emailError) console.error('Resend approval email error:', emailError)
    }

    if (decision === 'in_review') {
      const html = requestCorrections
        ? `
          <p>Hi ${provider.name},</p>
          <p>Thank you for applying to Sila. During our review we encountered an issue verifying one or more of your submitted credentials (NPI, license number, or date of birth).</p>
          <p><strong>We need you to send us your correct information so we can complete your verification.</strong> Please reply to this email with the following:</p>
          <ul>
            <li>Full legal name (as it appears on your license)</li>
            <li>NPI number</li>
            <li>Date of birth (MM/DD/YYYY)</li>
            <li>License number and type</li>
            <li>State of licensure</li>
          </ul>
          <p>Once we receive and verify the corrected details, we'll update your application and be in touch within 2–3 business days.</p>
          <p>If you believe your original submission was correct, reply and let us know — we're happy to take another look.</p>
          <p>— The Sila Team</p>
        `
        : `
          <p>Hi ${provider.name},</p>
          <p>Thank you for your patience. Your application is currently undergoing additional verification and our team is reviewing it carefully.</p>
          <p>You don't need to do anything right now. We'll be in touch within 2–3 business days once our review is complete.</p>
          <p>If you have questions in the meantime, reply to this email and we'll get back to you.</p>
          <p>— The Sila Team</p>
        `
      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: provider.email,
        subject: requestCorrections
          ? 'Action needed — please verify your credentials with Sila'
          : 'Your Sila application — additional review underway',
        html,
      })
      if (emailError) console.error('Resend in-review email error:', emailError)
    }
  }

  return NextResponse.json({ success: true })
}
