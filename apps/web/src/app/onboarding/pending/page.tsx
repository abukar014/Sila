'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const steps = [
  { title: 'NPPES identity match', status: 'Confirmed · 12s', done: true },
  { title: 'OIG exclusion list', status: 'No exclusions found', done: true },
  { title: 'SAM.gov check', status: 'Clear', done: true },
  { title: 'State license review', status: 'Awaiting reviewer', done: false },
];

export default function PendingPage() {
  const router = useRouter();

  useEffect(() => {
    const providerId = localStorage.getItem('sila_provider_id');
    if (!providerId) return;

    async function checkStatus() {
      const res = await fetch(`/api/onboarding/${providerId}`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();
      const vs = data.verification_status;
      if (vs === 'verified' && data.status === 'active') {
        router.push('/dashboard');
      } else if (vs === 'excluded' || vs === 'rejected' || vs === 'in_review') {
        router.push('/dashboard');
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30_000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{
        width: 390, height: 844,
        background: 'linear-gradient(180deg, #1B2C4B 0%, #F0D8C8 100%)',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden', borderRadius: 40,
        outline: '1px rgba(255, 255, 255, 0.10) solid', outlineOffset: -1,
        display: 'flex', flexDirection: 'column',
        ...f,
      }}>

        {/* Status bar */}
        <div style={{
          height: 51.5, flexShrink: 0,
          paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>9:41</span>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>●●●</span>
        </div>

        {/* Main content */}
        <div style={{
          flex: '1 1 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          paddingLeft: 28, paddingRight: 28, paddingBottom: 32,
        }}>

          <div>
            {/* Heading */}
            <div style={{ paddingTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 28, lineHeight: '42px', textAlign: 'center' }}>
                <span style={{ color: 'white', fontWeight: 400 }}>Almost </span>
                <span style={{ color: 'white', fontWeight: 600 }}>there</span>
              </div>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 400, lineHeight: '19.5px', textAlign: 'center' }}>
                3 of 4 checks complete.
              </div>
            </div>

            {/* Check rows */}
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column' }}>
              {steps.map((step, i) => (
                <div key={step.title} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  paddingTop: 12, paddingBottom: 12,
                  borderBottom: i < steps.length - 1 ? '1px solid rgba(137, 160, 187, 0.46)' : 'none',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: step.done ? '#1B2C4B' : '#C89849',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>
                      {step.done ? '✓' : '○'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
                      {step.title}
                    </div>
                    <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!step.done && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C89849', flexShrink: 0 }} />
                      )}
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 400, lineHeight: '16.5px' }}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: 16, textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 400, lineHeight: '19px' }}>
              We&apos;ll bring you right in when you&apos;re approved.<br />You can close the app — we&apos;ll handle the rest.
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
