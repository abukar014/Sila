'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

export default function SchedulingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('sila_provider_id');
    if (!id) { router.push('/dashboard'); return; }
    fetch(`/api/onboarding/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.scheduling_url) setUrl(data.scheduling_url); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave() {
    setError('');
    const id = localStorage.getItem('sila_provider_id');
    if (!id) { router.push('/dashboard'); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduling_url: url.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save.'); return; }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const bullets = [
    'Clients click "Schedule" on your profile',
    "They're redirected to your scheduling page",
    'All booking happens directly between you and the client',
    'We never see their PHI',
  ];

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

        {/* Secondary nav */}
        <div style={{
          height: 52, flexShrink: 0,
          borderBottom: '0.64px rgba(40,70,107,0.15) solid',
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              position: 'absolute', left: 28,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', padding: 0, ...f,
            }}
          >
            ← Back
          </button>
          <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>
            Update Scheduling Link
          </span>
        </div>

        {/* Content */}
        <div style={{
          flex: '1 1 0', overflowY: 'auto',
          paddingLeft: 31.85, paddingRight: 31.85, paddingTop: 27,
          display: 'flex', flexDirection: 'column', gap: 27,
        }}>

          {/* Where you book */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65 }}>
            <div style={{
              color: '#1B2C4B', fontSize: 12.52, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 2.28, lineHeight: '18.77px',
            }}>
              Where you book
            </div>
            <div style={{ color: '#535B6A', fontSize: 14.79, fontWeight: 400, lineHeight: '24.04px' }}>
              This is the link clients will use to schedule appointments with you. We recommend using Calendly, Acuity, or your practice management system&apos;s scheduling page.
            </div>
          </div>

          {/* URL input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{
              color: '#535B6A', fontSize: 11.38, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 0.57, lineHeight: '17.07px',
            }}>
              Scheduling URL
            </div>
            <div style={{
              height: 57.17,
              paddingLeft: 18.2, paddingRight: 18.2,
              background: 'white', borderRadius: 15.93,
              outline: '0.72px rgba(117, 131, 156, 0.50) solid', outlineOffset: -0.72,
              display: 'flex', alignItems: 'center',
            }}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="calendly.com/your-name"
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  color: '#2A1A1A', fontSize: 15.93, fontWeight: 400,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
            <div style={{ color: '#535B6A', fontSize: 11.38, fontWeight: 400, lineHeight: '17.07px' }}>
              Include https:// if it&apos;s a full URL
            </div>
          </div>

          {/* How it works card */}
          <div style={{
            background: '#E0EEFF', borderRadius: 15.93,
            outline: '0.72px rgba(117, 131, 156, 0.30) solid', outlineOffset: -0.72,
            padding: 18.92,
            display: 'flex', flexDirection: 'column', gap: 9,
          }}>
            <div style={{
              color: '#1B2C4B', fontSize: 11.38, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 0.68, lineHeight: '17.07px',
            }}>
              How it works
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {bullets.map((b) => (
                <div key={b} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ color: '#1B2C4B', fontSize: 13.65, lineHeight: '20.48px', flexShrink: 0 }}>•</span>
                  <span style={{ color: '#1B2C4B', fontSize: 13.65, fontWeight: 400, lineHeight: '20.48px' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ color: '#c0392b', fontSize: 12, lineHeight: '18px' }}>{error}</div>
          )}

        </div>

        {/* Fixed bottom bar */}
        <div style={{
          flexShrink: 0,
          borderTop: '0.72px rgba(40,70,107,0.15) solid',
          paddingLeft: 31.85, paddingRight: 31.85, paddingTop: 18.92, paddingBottom: 28,
        }}>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              width: '100%', height: 61.98,
              background: '#1B2C4B', borderRadius: 15.93, border: 'none', cursor: 'pointer',
              color: '#FEF6F0', fontSize: 17.07, fontWeight: 600, lineHeight: '25.6px',
              fontFamily: "'DM Sans', sans-serif",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save link'}
          </button>
        </div>

      </div>
    </main>
  );
}
