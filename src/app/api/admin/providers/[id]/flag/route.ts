import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { reason } = await request.json()

  const { data: provider, error: fetchError } = await supabaseAdmin
    .from('providers')
    .select('npi, name, email')
    .eq('id', id)
    .single()

  if (fetchError || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  if (!provider.npi) {
    return NextResponse.json({ error: 'Provider has no NPI on file' }, { status: 400 })
  }

  // Add NPI to blocklist
  const { error: flagError } = await supabaseAdmin
    .from('flagged_npis')
    .upsert({
      npi: provider.npi,
      provider_name: provider.name,
      provider_id: id,
      reason: reason ?? 'Confirmed OIG/SAM exclusion',
      flagged_by: 'admin',
    })

  if (flagError) {
    return NextResponse.json({ error: flagError.message }, { status: 500 })
  }

  // Lock the provider account
  const { error: updateError } = await supabaseAdmin
    .from('providers')
    .update({ verification_status: 'excluded', status: 'inactive' })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Log it
  await supabaseAdmin.from('verification_logs').insert({
    provider_id: id,
    check_type: 'decision',
    result: 'excluded',
    passed: false,
    notes: reason ?? 'Confirmed OIG/SAM exclusion — NPI blocked',
    check_date: new Date().toISOString(),
    run_by: 'admin',
  })

  // Pull the exclusion check details to include in the email
  const { data: exclusionLogs } = await supabaseAdmin
    .from('verification_logs')
    .select('check_type, raw_output')
    .eq('provider_id', id)
    .in('check_type', ['leie', 'sam'])
    .eq('result', 'excluded')
    .order('created_at', { ascending: false })
    .limit(2)

  const exclusionDetails = exclusionLogs?.map(log => {
    const source = log.check_type === 'leie'
      ? 'OIG List of Excluded Individuals/Entities (LEIE)'
      : 'SAM.gov Federal Exclusions'
    return `<li><strong>${source}:</strong> ${log.raw_output}</li>`
  }).join('')

  if (provider.email) {
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: provider.email,
      subject: 'Your Sila application — account status',
      html: `
        <p>Hi ${provider.name},</p>
        <p>Thank you for applying to join the Sila provider directory. After completing our credentialing review, we are unable to approve your application.</p>
        <p>During our review, your information was matched against federal exclusion registries maintained by the U.S. Department of Health and Human Services:</p>
        <ul style="margin: 12px 0; padding-left: 20px; color: #444;">
          ${exclusionDetails || `<li>${reason ?? 'Confirmed match on a federal exclusion list'}</li>`}
        </ul>
        <p>As a result, your account has been marked ineligible and your NPI has been flagged in our system. You will not be able to register again using this NPI.</p>
        <p>If you believe this is an error, please reply to this email with supporting documentation and our team will review your case within 5 business days.</p>
        <p>— The Sila Team</p>
      `,
    })
    if (emailError) console.error('Resend exclusion email error:', emailError.message)
  }

  return NextResponse.json({ success: true })
}
