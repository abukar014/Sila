'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

function StepDots({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === current;
        return (
          <div key={i} style={{
            width: active ? 9 : 7,
            height: active ? 9 : 7,
            borderRadius: '50%',
            background: active ? '#1B2C4B' : 'rgba(40, 70, 107, 0.46)',
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

const inputStyle: React.CSSProperties = {
  border: 'none', background: 'transparent', outline: 'none', width: '100%',
  color: '#2A1A1A', fontSize: 14, fontWeight: 500, lineHeight: '20px',
  fontFamily: "'DM Sans', sans-serif",
};

export default function AccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(key: keyof typeof formData) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleContinue() {
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError || !authData.user) {
        setError(authError?.message ?? 'Failed to create account. Please try again.');
        return;
      }

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          user_id: authData.user.id,
          dob: formData.dob || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      localStorage.setItem('sila_provider_id', data.provider_id);
      if (authData.session) {
        router.push('/onboarding/credentials');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Email confirmation state
  if (submitted) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
        <div style={{
          width: 390, height: 844, padding: 1,
          background: '#F9F9F9',
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden', borderRadius: 40,
          outline: '1px rgba(255, 255, 255, 0.10) solid', outlineOffset: -1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          ...f,
        }}>
          <div style={{ width: 332, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#E0EEFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 24, fontFamily: "'EB Garamond', serif" }}>✉</span>
            </div>
            <div style={{ fontSize: 26, lineHeight: '39px', color: '#0A0A0A', fontWeight: 400 }}>
              Check your inbox.
            </div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: '21px', color: '#535B6A', fontWeight: 400 }}>
              We sent a confirmation link to{' '}
              <span style={{ fontWeight: 600, color: '#1B2C4B' }}>{formData.email}</span>.
              Click it to continue your application.
            </div>
            <div style={{ marginTop: 16, fontSize: 11, lineHeight: '19.5px', color: '#535B6A', fontWeight: 400 }}>
              Once confirmed you&apos;ll be taken straight to the next step.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{
        width: 390, height: 844, padding: 1,
        background: '#F9F9F9',
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

        {/* Scrollable content */}
        <div style={{ flex: '1 1 0', overflowY: 'auto', paddingLeft: 28, paddingRight: 28 }}>

          {/* Back + step dots */}
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', padding: 0, ...f }}
            >
              ← Back
            </button>
            <StepDots current={1} total={4} label="Account" />
          </div>

          {/* Heading */}
          <div style={{ marginTop: 22, fontSize: 26, lineHeight: '39px' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 400 }}>Let&apos;s get you </span>
            <span style={{ color: '#8A6A5A', fontWeight: 600 }}>started</span>
          </div>

          {/* Subtitle */}
          <div style={{ marginTop: 6, color: '#535B6A', fontSize: 13, fontWeight: 400, lineHeight: '21.13px' }}>
            Two minutes is all it takes to sign up.
          </div>

          {/* Fields */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>

            <InputCard label="Full legal name">
              <input type="text" value={formData.fullName} onChange={set('fullName')}
                placeholder="Dr. Aisha Rahman" style={inputStyle} />
            </InputCard>

            <InputCard label="Work email">
              <input type="email" value={formData.email} onChange={set('email')}
                placeholder="you@clinic.com" style={inputStyle} />
            </InputCard>

            {/* Password row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <InputCard label="Password">
                  <input type="password" value={formData.password} onChange={set('password')} style={inputStyle} />
                </InputCard>
              </div>
              <div style={{ flex: 1 }}>
                <InputCard label="Confirm">
                  <input type="password" value={formData.confirmPassword} onChange={set('confirmPassword')} style={inputStyle} />
                </InputCard>
              </div>
            </div>

            <InputCard label="Date of birth">
              <input type="text" value={formData.dob} onChange={set('dob')}
                placeholder="MM/DD/YYYY" style={inputStyle} />
            </InputCard>

          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, color: '#c0392b', fontSize: 12, lineHeight: '18px' }}>
              {error}
            </div>
          )}

          {/* Privacy policy */}
          <div style={{ marginTop: 16, fontSize: 11, lineHeight: '17.88px' }}>
            <span style={{ color: '#535B6A', fontWeight: 400 }}>By continuing you agree to our </span>
            <Link href="/privacy" target="_blank" style={{ color: '#1B2C4B', fontWeight: 600, textDecoration: 'none' }}>
              Privacy Policy.
            </Link>
          </div>

          <div style={{ height: 28 }} />
        </div>

        {/* Continue button */}
        <div style={{
          flexShrink: 0,
          paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 28,
        }}>
          <button
            onClick={handleContinue}
            disabled={loading}
            style={{
              width: '100%', height: 54.5,
              background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
              color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '22.5px',
              fontFamily: "'DM Sans', sans-serif",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account…' : 'Continue'}
          </button>
        </div>

      </div>
    </main>
  );
}
