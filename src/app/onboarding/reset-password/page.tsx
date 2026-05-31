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

function InputCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14,
      outline: '1px rgba(40, 70, 107, 0.46) solid', outlineOffset: -1,
      padding: '13px 15px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ color: '#535B6A', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: '15px', ...f }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleReset() {
    setError('');
    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }
      setDone(true);
      setTimeout(() => router.push('/onboarding/sign-in'), 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
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
            <div style={{ fontSize: 26, lineHeight: '39px', color: '#0A0A0A', fontWeight: 400 }}>
              Password updated.
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: '21px', color: '#535B6A', fontWeight: 400 }}>
              Taking you to sign in now…
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

          <div style={{ marginTop: 38 }}>
            <div style={{ fontSize: 26, lineHeight: '39px' }}>
              <span style={{ color: '#0A0A0A', fontWeight: 400 }}>Choose a new </span>
              <span style={{ color: '#8A6A5A', fontWeight: 600 }}>password</span>
            </div>
            <div style={{ marginTop: 6, color: '#535B6A', fontSize: 13, fontWeight: 400, lineHeight: '21px' }}>
              At least 8 characters.
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InputCard label="New password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                autoFocus
              />
            </InputCard>

            <InputCard label="Confirm password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                style={inputStyle}
              />
            </InputCard>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: '#c0392b', fontSize: 12, lineHeight: '18px' }}>{error}</div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ paddingBottom: 28 }}>
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: '100%', height: 54.5,
                background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
                color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '22.5px',
                fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
