import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { emailTemplate, emailHeading, emailP, emailList, emailDivider, emailSignature } from '@/lib/emailTemplate'

const resend = new Resend(process.env.RESEND_API_KEY)

export type DecisionStatus = 'verified' | 'in_review' | 'rejected'

export interface DecisionOptions {
  notes?: string | null
  requestCorrections?: boolean
  failedChecks?: string[]
}

/**
 * Apply a verification decision to a provider:
 * - Guards against changing an excluded provider
 * - Updates verification_status + all derived fields (verified, verified_date, status)
 * - Writes to verification_logs
 * - Sends the appropriate email to the provider
 *
 * Returns { error } if something went wrong, otherwise {}.
 */
export async function applyProviderDecision(
  providerId: string,
  decision: DecisionStatus,
  { notes = null, requestCorrections = false, failedChecks = [] }: DecisionOptions = {}
): Promise<{ error?: string }> {
  // Guard: never overwrite an exclusion
  const { data: current } = await supabaseAdmin
    .from('providers')
    .select('verification_status')
    .eq('id', providerId)
    .single()

  if (current?.verification_status === 'excluded') {
    return { error: 'Cannot change status of an excluded provider' }
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

  if (decision === 'in_review' || decision === 'rejected') {
    updates.verified = false
    updates.status = 'inactive'
  }

  const { error: updateError } = await supabaseAdmin
    .from('providers')
    .update(updates)
    .eq('id', providerId)

  if (updateError) return { error: updateError.message }

  await supabaseAdmin.from('verification_logs').insert({
    provider_id: providerId,
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
    .eq('id', providerId)
    .single()

  if (!provider?.email) return {}

  const firstName = provider.name.split(' ')[0]
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@silacare.health'
  const replyTo = process.env.RESEND_REPLY_TO ?? 'hello@silacare.health'

  if (decision === 'verified') {
    const { error: emailError } = await resend.emails.send({
      from, replyTo,
      to: provider.email,
      subject: "You're in.",
      html: emailTemplate(
        emailHeading(`Welcome to Sila, ${firstName}.`) +
        emailP(`We reviewed your application and we're really glad to say — you're approved. Your profile is live on Sila right now.`) +
        emailP(`Clients looking for someone like you can already find you in the directory. If you want to update anything before more eyes find it, sign in and make any changes you'd like.`) +
        emailDivider() +
        emailP(`We're so glad you're here. Genuinely.`) +
        emailSignature()
      ),
    })
    if (emailError) console.error('[decision] approval email failed:', emailError)
  }

  if (decision === 'in_review') {
    const { error: emailError } = await resend.emails.send({
      from, replyTo,
      to: provider.email,
      subject: requestCorrections
        ? 'Quick question about your Sila application'
        : 'Your Sila application',
      html: requestCorrections
        ? emailTemplate(
            emailHeading(`Hi ${firstName}, we just have a quick question.`) +
            emailP(`We're still working through your application and want to make sure we have everything right before we move forward. Could you reply with the following so we can take another look:`) +
            emailList([
              'Full legal name as it appears on your license',
              'NPI number',
              'Date of birth',
              'License number, type, and state',
            ]) +
            emailP(`Once we hear back we'll pick it right back up.`) +
            emailSignature()
          )
        : emailTemplate(
            emailHeading(`Hi ${firstName}, we're still on it.`) +
            emailP(`We're still working through your application and will be in touch within 1 to 3 business days. You don't need to do anything right now.`) +
            emailP(`If you have questions in the meantime, just reply to this email.`) +
            emailSignature()
          ),
    })
    if (emailError) console.error('[decision] in_review email failed:', emailError)
  }

  if (decision === 'rejected') {
    const { error: emailError } = await resend.emails.send({
      from, replyTo,
      to: provider.email,
      subject: 'Your Sila application',
      html: emailTemplate(
        emailHeading(`Hi ${firstName}.`) +
        emailP(`We're sorry it didn't work out this time. After completing our review we weren't able to verify the following and can't move your application forward:`) +
        (failedChecks.length > 0 ? emailList(failedChecks) : '') +
        emailP(`We know that's not easy to hear and we're sorry we couldn't make it work this time.`) +
        emailP(`If you believe something was submitted incorrectly or you have questions about what we found, please reply to this email. We're happy to talk through it.`) +
        emailSignature()
      ),
    })
    if (emailError) console.error('[decision] rejection email failed:', emailError)
  }

  return {}
}
