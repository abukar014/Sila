import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Resend } from 'resend'
import { emailTemplate, emailHeading, emailP, emailDivider, emailSignature } from '@/lib/emailTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: provider, error } = await supabaseAdmin
    .from('providers')
    .select('id, name, verification_status, status, verified_date, accepting_clients, scheduling_url, email, credentials, state, specialties, approaches, identity, visit_type, faith_approach, languages, bio, insurances, fee_individual, fee_couples, fee_initial, gender, photo_url')
    .eq('id', id)
    .single()

  if (error || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json(provider)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const updates = await request.json()

  if (updates.npi) {
    const { data: flagged } = await supabaseAdmin
      .from('flagged_npis')
      .select('npi')
      .eq('npi', updates.npi)
      .maybeSingle()

    if (flagged) {
      return NextResponse.json(
        { error: 'This NPI is not eligible for registration on Sila.' },
        { status: 403 }
      )
    }
  }

  const { error } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (updates.verification_status === 'pending') {
    const { data: provider } = await supabaseAdmin
      .from('providers')
      .select('name, email')
      .eq('id', id)
      .single()

    if (provider?.email) {
      const firstName = provider.name.split(' ')[0]
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@silacare.health',
        replyTo: process.env.RESEND_REPLY_TO ?? 'hello@silacare.health',
        to: provider.email,
        subject: 'Got your application',
        html: emailTemplate(
          emailHeading(`Hi ${firstName}, we got your application.`) +
          emailP(`We're really glad you're here. It means a lot that you want to be part of what we're building.`) +
          emailP(`Our team is reviewing your credentials now. It usually takes 1 to 3 business days — we'll be in touch as soon as we're done.`) +
          emailDivider() +
          emailP(`Questions while you wait? Just reply to this email.`) +
          emailSignature()
        ),
      })
    }
  }

  return NextResponse.json({ success: true })
}
