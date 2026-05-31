export function emailTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-family:Georgia,serif;font-size:22px;font-style:italic;font-weight:400;color:#1B2C4B;letter-spacing:0.5px;">Sila</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;padding:40px 40px 32px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Sila · hello@silacare.health</p>
              <p style="margin:0;font-size:11px;color:#b0bec5;">You're receiving this because you applied to join the Sila provider directory.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailP(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">${text}</p>`
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 24px;font-size:20px;font-weight:600;color:#1B2C4B;line-height:1.3;">${text}</h1>`
}

export function emailList(items: string[]): string {
  const lis = items.map(i => `<li style="margin-bottom:8px;font-size:15px;line-height:1.6;color:#374151;">${i}</li>`).join('')
  return `<ul style="margin:0 0 16px;padding-left:20px;">${lis}</ul>`
}

export function emailDivider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`
}

export function emailSignature(): string {
  return emailP('The Sila Team')
}
