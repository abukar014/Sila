export function emailTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <style>
    @media (prefers-color-scheme: dark) {
      .body-wrap   { background-color: #0E2C2A !important; }
      .card-cell   { background-color: #134543 !important; border-color: rgba(79,133,132,0.30) !important; }
      .footer-cell { background-color: #0A2220 !important; border-color: rgba(26,92,90,0.25) !important; }
      .wordmark    { color: #8FD4B0 !important; }
      .email-heading { color: #F5EFE6 !important; }
      .email-p     { color: rgba(245,239,230,0.78) !important; }
      .email-li    { color: rgba(245,239,230,0.78) !important; }
      .email-footer-text { color: rgba(245,239,230,0.38) !important; }
      .email-footer-link { color: #4F8584 !important; }
      .email-btn td  { background-color: #4F8584 !important; }
      .email-btn a   { background-color: #4F8584 !important; color: #0E2C2A !important; }
      .email-hr    { border-top-color: rgba(79,133,132,0.25) !important; }
    }
  </style>
</head>
<body class="body-wrap" style="margin:0;padding:0;background-color:#EEE5D3;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table class="body-wrap" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEE5D3;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span class="wordmark" style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-style:italic;font-weight:400;color:#134543;letter-spacing:-0.5px;">Sila</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="card-cell" style="background-color:#FBF7EF;border:1px solid rgba(160,106,87,0.26);border-bottom:none;border-radius:16px 16px 0 0;padding:0;">
              <div style="padding:40px 40px 36px;">${body}</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="background-color:#E8DDD0;border:1px solid rgba(160,106,87,0.18);border-top:none;border-radius:0 0 16px 16px;padding:16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="email-footer-text" style="font-size:11px;line-height:1.6;color:rgba(31,27,22,0.42);font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">
                    Sila &nbsp;·&nbsp;
                    <a class="email-footer-link" href="mailto:hello@silacare.health" style="color:#1A5C5A;text-decoration:none;">hello@silacare.health</a>
                    <br>
                    <span style="font-size:10px;">You're receiving this because you applied to join the Sila provider directory.</span>
                  </td>
                </tr>
              </table>
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
  return `<p class="email-p" style="margin:0 0 16px;font-size:15px;line-height:1.75;color:rgba(31,27,22,0.68);font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">${text}</p>`
}

export function emailHeading(text: string): string {
  return `<h1 class="email-heading" style="margin:0 0 20px;font-size:22px;font-weight:400;color:#1F1B16;line-height:1.3;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">${text}</h1>`
}

export function emailAccent(text: string): string {
  return `<span style="font-weight:600;color:#A06A57;">${text}</span>`
}

export function emailList(items: string[]): string {
  const lis = items.map(i => `<li class="email-li" style="margin-bottom:8px;font-size:15px;line-height:1.6;color:rgba(31,27,22,0.68);font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">${i}</li>`).join('')
  return `<ul style="margin:0 0 16px;padding-left:20px;">${lis}</ul>`
}

export function emailDivider(): string {
  return `<hr class="email-hr" style="border:none;border-top:1px solid rgba(160,106,87,0.15);margin:24px 0;" />`
}

export function emailButton(label: string, url: string): string {
  return `
  <table class="email-btn" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="border-radius:10px;background-color:#1A5C5A;">
        <a href="${url}" style="display:inline-block;background-color:#1A5C5A;color:#FBF7EF;font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}

export function emailSignature(): string {
  return emailP('The Sila Team')
}
