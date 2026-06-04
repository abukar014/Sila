'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

function StepDots({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === current;
        const done = i + 1 < current;
        return (
          <div key={i} style={{
            width: active ? 9 : 7,
            height: active ? 9 : 7,
            borderRadius: '50%',
            background: (active || done) ? '#1B2C4B' : 'rgba(40, 70, 107, 0.46)',
            flexShrink: 0,
          }} />
        );
      })}
      <span style={{ marginLeft: 8, color: '#535B6A', fontSize: 11, fontWeight: 500, lineHeight: '16.5px', ...f }}>
        {current} of {total} · {label}
      </span>
    </div>
  );
}

const checklistItems = [
  'Identity & email confirmed',
  'NPI · License submitted',
  'Profile content complete',
  'Photo & scheduling link added',
];

export default function ReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    const providerId = localStorage.getItem('sila_provider_id');
    if (!providerId) { router.push('/onboarding/account'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/onboarding/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: 'pending' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to submit. Please try again.'); return; }
      router.push('/onboarding/pending');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{
        width: 390, height: 844, padding: 1,
        background: 'white',
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
          <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>9:41</span>
          <span style={{ color: '#2A1A1A', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>●●●</span>
        </div>

        {/* Content */}
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', paddingLeft: 28, paddingRight: 28 }}>

          {/* Back + step dots */}
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', padding: 0, ...f }}
            >
              ← Back
            </button>
            <StepDots current={4} total={4} label="Review" />
          </div>

          {/* Heading */}
          <div style={{ marginTop: 22, fontSize: 26, lineHeight: '39px' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 400 }}>Ready to </span>
            <span style={{ color: '#8A6A5A', fontWeight: 600 }}>submit</span>
          </div>

          {/* Subtitle */}
          <div style={{ marginTop: 6, color: '#535B6A', fontSize: 13, fontWeight: 400, lineHeight: '21.13px' }}>
            Quick check before we begin verification.
          </div>

          {/* Checklist */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column' }}>
            {checklistItems.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#1B2C4B', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
                </div>
                <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 400, lineHeight: '19.5px' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* What happens next card */}
          <div style={{
            marginTop: 16,
            background: '#FEF0E6', borderRadius: 14,
            outline: '1px #F0D8C8 solid', outlineOffset: -1,
            padding: '14px 16px 14px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ color: '#1B2C4B', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: '15px' }}>
              What happens next
            </div>
            <div style={{ color: '#2A1A1A', fontSize: 12, fontWeight: 400, lineHeight: '19.5px' }}>
              Automated checks run immediately. Human review of your state license takes up to 3 business days. We&apos;ll email you when you&apos;re live.
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: '#c0392b', fontSize: 12, lineHeight: '18px' }}>{error}</div>
          )}

          {/* Push button to bottom */}
          <div style={{ flex: 1 }} />

          <div style={{ paddingTop: 20, paddingBottom: 28 }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', height: 54.5,
                background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
                color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '22.5px',
                fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting…' : 'Submit for verification'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
