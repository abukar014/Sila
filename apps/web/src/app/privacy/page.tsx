export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1
          className="font-normal italic text-[32px] leading-tight text-[#0a0a0a] mb-2"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-[#535b6a] text-[13px] mb-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Last updated: May 2026
        </p>

        {[
          {
            title: 'Who we are',
            body: `Sila is a directory connecting clients with Muslim and culturally-competent healthcare providers in Texas. We operate at silahealth.com. References to "we", "us", or "Sila" in this policy refer to Sila Health.`,
          },
          {
            title: 'What we collect from providers',
            body: `When you apply to join the Sila directory, we collect:
• Full legal name and work email address
• Date of birth — used solely for identity verification during credentialing (cross-referenced against federal exclusion registries)
• NPI (National Provider Identifier) number and associated public registry data (NPPES)
• State license number, license type, and state of licensure
• Specialty and credentials
• Practice information: city, state, faith approach, languages spoken, bio, scheduling link
• Insurance plans accepted and session fees
• Photo (if uploaded)

We do not collect clinical data, patient records, or any Protected Health Information (PHI).`,
          },
          {
            title: 'How we use your information',
            body: `We use provider information to:
• Verify credentials against federal registries (NPPES, OIG LEIE, SAM.gov) and state licensing boards
• Display your public profile in the Sila directory once verified
• Contact you about your application status
• Maintain audit logs of verification decisions`,
          },
          {
            title: 'Verification checks',
            body: `As part of our credentialing process, we check your information against:
• NPPES (CMS National Provider Registry) — to confirm your NPI and credentials
• OIG LEIE (Office of Inspector General List of Excluded Individuals/Entities) — to verify you are not excluded from federal healthcare programs
• SAM.gov — to verify you are not subject to federal procurement exclusions
• Texas state licensing board websites — to confirm your active license

These are standard credentialing checks used across the healthcare industry.`,
          },
          {
            title: 'Fraud prevention and the NPI blocklist',
            body: `If a provider is confirmed to appear on a federal exclusion list (OIG LEIE or SAM.gov), we retain their NPI number in an internal blocklist for fraud prevention purposes. This allows us to identify and prevent re-registration attempts under a different email address or name. This data is retained indefinitely for the safety of clients using the directory.

We believe we have a legitimate interest in maintaining this data to protect clients from excluded healthcare providers.`,
          },
          {
            title: 'Data retention',
            body: `• Active provider profiles are retained for as long as your account is active.
• Rejected applications are retained for 2 years for audit purposes.
• Excluded provider records (NPI blocklist) are retained indefinitely.
• Verification logs are retained for 5 years.

You may request deletion of your account at any time (see Your Rights below). Note that NPI blocklist entries for confirmed exclusions may be retained even after account deletion.`,
          },
          {
            title: 'Your rights',
            body: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your account and associated data
• Withdraw consent at any time

To exercise any of these rights, contact us at support@silahealth.com. We will respond within 30 days.`,
          },
          {
            title: 'Data security',
            body: `Provider data is stored in Supabase (PostgreSQL) with row-level security enabled. We use industry-standard encryption in transit (TLS) and at rest. Access to provider records is restricted to verified Sila administrators.`,
          },
          {
            title: 'Third parties',
            body: `We share data with the following third parties as necessary to operate the service:
• Supabase — database and authentication infrastructure
• Resend — transactional email delivery
• Vercel — application hosting

We do not sell provider data to any third party.`,
          },
          {
            title: 'Contact',
            body: `For privacy questions or requests, contact us at support@silahealth.com.`,
          },
        ].map((section) => (
          <div key={section.title} className="mb-10">
            <h2
              className="text-[18px] font-semibold text-[#1b2c4b] mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {section.title}
            </h2>
            <p
              className="text-[13px] leading-[22px] text-[#535b6a] whitespace-pre-line"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
