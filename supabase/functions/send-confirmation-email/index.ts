import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY          = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function emailTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
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
          <td style="background-color:#FBF7EF;border:1px solid rgba(160,106,87,0.26);border-bottom:none;border-radius:16px 16px 0 0;padding:0;">
            <div style="padding:40px 40px 36px;">${body}</div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#E8DDD0;border:1px solid rgba(160,106,87,0.18);border-top:none;border-radius:0 0 16px 16px;padding:16px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:11px;line-height:1.6;color:rgba(31,27,22,0.42);">
                  Sila &nbsp;·&nbsp; <a href="mailto:hello@silacare.health" style="color:#1A5C5A;text-decoration:none;">hello@silacare.health</a><br>
                  <span style="font-size:10px;color:rgba(31,27,22,0.28);">You're receiving this because you applied to join the Sila provider directory.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { providerId } = await req.json()
    if (!providerId) {
      return new Response(JSON.stringify({ error: 'providerId required' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    const { data: provider } = await supabase
      .from('providers')
      .select('name, email')
      .eq('id', providerId)
      .single()

    if (!provider?.email) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 })
    }

    const firstName = provider.name.split(' ')[0]

    const html = emailTemplate(`
      <h1 style="margin:0 0 20px;font-size:22px;font-weight:400;color:#1F1B16;line-height:1.3;">
        Hi ${firstName}, <span style="font-weight:600;color:#A06A57;">we got your application.</span>
      </h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:rgba(31,27,22,0.68);">
        We're really glad you're here. It means a lot that you want to be part of what we're building.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:rgba(31,27,22,0.68);">
        Our team is reviewing your credentials now. It usually takes 1 to 3 business days — we'll be in touch as soon as we're done.
      </p>
      <hr style="border:none;border-top:1px solid rgba(160,106,87,0.15);margin:24px 0;" />
      <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:rgba(31,27,22,0.68);">
        Questions while you wait? Reach us at <a href="mailto:hello@silacare.health" style="color:#1A5C5A;text-decoration:none;">hello@silacare.health</a>
      </p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:rgba(31,27,22,0.68);">The Sila Team</p>
    `)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sila <noreply@silacare.health>',
        reply_to: 'hello@silacare.health',
        to: provider.email,
        subject: 'Got your application',
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
