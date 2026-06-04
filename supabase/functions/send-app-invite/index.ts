import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY        = Deno.env.get('RESEND_API_KEY')!

function toSlug(name: string): string {
  const rand = Math.random().toString(36).slice(2, 7)
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') + '-' + rand
}
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function emailBody(name: string, deepLink: string): string {
  const firstName = name.split(' ')[0] || name
  return `
    <h2 style="font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:28px;line-height:1.2;letter-spacing:-0.5px;color:#1F1B16;margin:0 0 16px;">
      We got your application, ${firstName}.
    </h2>
    <p style="font-size:15px;line-height:1.7;color:rgba(31,27,22,0.65);margin:0 0 28px;">
      The next step is creating your password and finishing your profile on the Sila app — it takes about two minutes. We'll review your credentials after that.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td>
          <a href="${deepLink}"
            style="display:inline-block;background:#134543;color:#FBF7EF;text-decoration:none;
                   font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
                   font-size:15px;font-weight:600;letter-spacing:-0.005em;
                   padding:14px 28px;border-radius:100px;
                   box-shadow:0 8px 24px rgba(14,44,42,0.28);">
            Finish setting up your profile →
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;line-height:1.6;color:rgba(31,27,22,0.45);margin:0 0 6px;">
      Don't have the Sila app yet?
    </p>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="https://apps.apple.com/app/sila" style="display:inline-block;background:rgba(26,92,90,0.08);color:#1A5C5A;text-decoration:none;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:500;padding:9px 18px;border-radius:100px;border:1px solid rgba(26,92,90,0.22);">
            App Store
          </a>
        </td>
        <td>
          <a href="https://play.google.com/store/apps/sila" style="display:inline-block;background:rgba(26,92,90,0.08);color:#1A5C5A;text-decoration:none;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:500;padding:9px 18px;border-radius:100px;border:1px solid rgba(26,92,90,0.22);">
            Google Play
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;line-height:1.6;color:rgba(31,27,22,0.32);margin:28px 0 0;">
      If the button doesn't open the app, download Sila from the App Store or Google Play, then open it and sign in to continue.
    </p>
  `
}

function wrapEmail(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @media (prefers-color-scheme: dark) {
      body { background-color: #0E2C2A !important; }
      .email-shell { background-color: #112E2B !important; border-color: rgba(160,106,87,0.30) !important; }
      .email-footer { background-color: #0A1F1D !important; }
      h2 { color: #FBF7EF !important; }
      p { color: rgba(251,247,239,0.60) !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#EEE5D3;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEE5D3;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td align="center" style="padding-bottom:20px;">
            <span style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#134543;letter-spacing:-0.5px;">Sila</span>
          </td>
        </tr>
        <tr>
          <td class="email-shell" style="background-color:#FBF7EF;border:1px solid rgba(160,106,87,0.26);border-bottom:none;border-radius:16px 16px 0 0;padding:0;">
            <div style="padding:40px 40px 36px;">${body}</div>
          </td>
        </tr>
        <tr>
          <td class="email-footer" style="background-color:#E8DDD0;border:1px solid rgba(160,106,87,0.18);border-top:none;border-radius:0 0 16px 16px;padding:16px 40px;">
            <p style="font-size:11px;line-height:1.6;color:rgba(31,27,22,0.42);margin:0;">
              Sila &nbsp;·&nbsp; <a href="mailto:hello@silacare.health" style="color:#1A5C5A;text-decoration:none;">hello@silacare.health</a><br>
              <span style="font-size:10px;color:rgba(31,27,22,0.28);">You're receiving this because you applied to join the Sila provider directory.</span>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json()
    console.log('send-app-invite received:', JSON.stringify({ email: body.email, name: body.name }))
    const { email, name, license_type, license_number, state, npi, dob } = body
    if (!email || !name) {
      return new Response(JSON.stringify({ error: 'email and name are required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Insert or skip — service role bypasses RLS
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

    const { data: existing } = await db
      .from('providers')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!existing) {
      const { error: insertErr } = await db.from('providers').insert({
        name,
        email,
        slug:           toSlug(name),
        license_type:   license_type  || null,
        license_number: license_number || null,
        state:          state ? String(state).toUpperCase() : null,
        npi:            npi   || null,
        dob:            dob   || null,
        verification_status: 'pending',
        status: 'inactive',
      })

      if (insertErr) {
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
        })
      }
    }

    // Send app invite email
    const deepLink = `sila://onboarding/account?email=${encodeURIComponent(email)}`
    const html = wrapEmail(emailBody(name, deepLink))

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Sila <noreply@silacare.health>',
        reply_to: 'hello@silacare.health',
        to: [email],
        subject: 'Finish setting up your Sila profile',
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
