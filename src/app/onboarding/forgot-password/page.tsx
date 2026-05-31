'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const inputStyle: React.CSSProperties = {
  border: 'none', background: 'transparent', outline: 'none', width: '100%',
  color: '#2A1A1A', fontSize: 14, fontWeight: 500, lineHeight: '20px',
  fontFamily: "'DM Sans', sans-serif",
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/onboarding/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (err) { setError(err.message); return; }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
        <div style={{
          width: 390, height: 844, background: 'white',
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden', borderRadius: 40,
          outline: '1px rgba(255, 255, 255, 0.10) solid', outlineOffset: -1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          ...f,
        }}>
          <div style={{ width: 332, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#E0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 24 }}>✉</span>
            </div>
            <div style={{ fontSize: 26, lineHeight: '39px', color: '#0A0A0A', fontWeight: 400 }}>
              Check your inbox.
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: '21px', color: '#535B6A', fontWeight: 400 }}>
              We sent a reset link to{' '}
              <span style={{ fontWeight: 600, color: '#1B2C4B' }}>{email}</span>.
              Click it to choose a new password.
            </div>
            <div style={{ marginTop: 16, fontSize: 11, lineHeight: '19.5px', color: '#535B6A', fontWeight: 400 }}>
              Didn&apos;t get it? Check your spam folder, or{' '}
              <button
                onClick={() => setSent(false)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#1B2C4B', fontSize: 11, fontWeight: 600, textDecoration: 'underline', ...f }}
              >
                try again
              </button>
              .
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{
        width: 390, height: 844, background: 'white',
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
        <div style={{ flex: '1 1 0', paddingLeft: 28, paddingRight: 28, display: 'flex', flexDirection: 'column' }}>

          <button
            onClick={() => router.back()}
            style={{ marginTop: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', padding: 0, textAlign: 'left', ...f }}
          >
            ← Back
          </button>

          <div style={{ marginTop: 28, fontSize: 26, lineHeight: '39px' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 400 }}>Reset your </span>
            <span style={{ color: '#8A6A5A', fontWeight: 600 }}>password</span>
          </div>
          <div style={{ marginTop: 6, color: '#535B6A', fontSize: 13, fontWeight: 400, lineHeight: '21px' }}>
            Enter your email and we&apos;ll send you a link to choose a new one.
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={{
              background: 'white', borderRadius: 14,
              outline: '1px rgba(40, 70, 107, 0.46) solid', outlineOffset: -1,
              padding: '13px 15px 12px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ color: '#535B6A', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: '15px' }}>
                Work email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="you@clinic.com"
                style={inputStyle}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: '#c0392b', fontSize: 12, lineHeight: '18px' }}>{error}</div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ paddingBottom: 28 }}>
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
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
