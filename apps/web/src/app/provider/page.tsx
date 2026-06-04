'use client';

import Link from 'next/link';

const steps = [
  'Create an account',
  'NPI · License submitted',
  'Profile and bio complete',
  'Automatic and human check of license',
];

export default function ProviderSplashPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#c8d5e5',
    }}>
      <div style={{
        width: 390,
        height: 844,
        padding: 1,
        background: '#FEF6F0',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        borderRadius: 40,
        outline: '1px rgba(255, 255, 255, 0.10) solid',
        outlineOffset: -1,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Status bar */}
        <div style={{
          height: 51.5, flexShrink: 0,
          paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <span style={{ color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>9:41</span>
          <span style={{ color: '#1B2C4B', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>●●●</span>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: '1 1 0',
          overflowY: 'auto',
          paddingLeft: 28, paddingRight: 28,
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>

          {/* Arabic watermark */}
          <div style={{
            position: 'absolute', top: -10, right: -20,
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: 180, color: '#8A6A5A', opacity: 0.06,
            pointerEvents: 'none', userSelect: 'none', lineHeight: 1, zIndex: 0,
          }}>صلة</div>

          {/* "For providers" label */}
          <div style={{
            marginTop: 10, position: 'relative', zIndex: 1,
            color: '#1B2C4B', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 2, lineHeight: '16.5px',
          }}>
            For providers
          </div>

          {/* Heading */}
          <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
            <span style={{
              fontFamily: "'EB Garamond', serif", fontStyle: 'italic',
              fontSize: 34, lineHeight: '1.15', color: '#0A0A0A', fontWeight: 400,
            }}>Be found by the clients </span>
            <span style={{
              fontFamily: "'EB Garamond', serif", fontStyle: 'italic',
              fontSize: 34, lineHeight: '1.15', color: '#8A6A5A', fontWeight: 400,
            }}>you&apos;re meant to serve</span>
          </div>

          {/* Subtitle */}
          <div style={{
            marginTop: 18,
            color: '#4F5B69', fontSize: 13, fontWeight: 400, lineHeight: '21.13px',
          }}>
            Free to list. Verified once. Inquiries come straight to you.
          </div>

          {/* No middleman card */}
          <div style={{
            marginTop: 20,
            background: 'white', borderRadius: 14,
            outline: '0.5px #75839C solid', outlineOffset: -0.5,
            padding: '14.5px 16.5px 12px',
          }}>
            <div style={{ color: '#1B2C4B', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: '15px' }}>
              No middleman
            </div>
            <div style={{ marginTop: 4, color: '#1B2C4B', fontSize: 13, fontWeight: 400, lineHeight: '21.13px' }}>
              Clients book directly with you.
            </div>
          </div>

          {/* No PHI card */}
          <div style={{
            marginTop: 10,
            background: 'white', borderRadius: 14,
            outline: '0.5px #75839C solid', outlineOffset: -0.5,
            padding: '14.5px 16.5px 12px',
          }}>
            <div style={{ color: '#1B2C4B', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: '15px' }}>
              No PHI
            </div>
            <div style={{ marginTop: 4, color: '#1B2C4B', fontSize: 13, fontWeight: 400, lineHeight: '21.13px' }}>
              We never see your patient information.
            </div>
          </div>

          {/* Verification process card */}
          <div style={{
            marginTop: 10,
            background: '#FEF6F0', borderRadius: 14,
            outline: '0.5px #75839C solid', outlineOffset: -0.5,
            padding: '14.5px 16.5px 18px',
          }}>
            <div style={{ color: '#1B2C4B', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: '15px' }}>
              Our Verification Process
            </div>
            <div style={{ marginTop: 4, color: '#1B2C4B', fontSize: 13, fontWeight: 400, lineHeight: '21.13px' }}>
              Our 4-step process based on security and trust.
            </div>

            {/* Steps */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {steps.map((step) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#1B2C4B', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
                  </div>
                  <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 400, lineHeight: '19.5px' }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: 20 }} />

        </div>

        {/* CTA buttons */}
        <div style={{
          flexShrink: 0,
          paddingLeft: 28, paddingRight: 28, paddingTop: 20, paddingBottom: 28,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <Link href="/onboarding/account" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', height: 54.5,
              background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
              color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '22.5px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Get started
            </button>
          </Link>

          <Link href="/onboarding/sign-in" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', height: 51,
              background: 'transparent', borderRadius: 14,
              border: '1.5px solid #1B2C4B', cursor: 'pointer',
              color: '#1B2C4B', fontSize: 14, fontWeight: 600, lineHeight: '20px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Sign in
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}
