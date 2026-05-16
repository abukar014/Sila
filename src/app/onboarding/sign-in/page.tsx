'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !data.user) {
        setError(authError?.message ?? 'Invalid email or password.');
        return;
      }

      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (!provider) {
        setError('No provider account found for this email.');
        return;
      }

      localStorage.setItem('sila_provider_id', provider.id);
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

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
        background: 'white',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        borderRadius: 40,
        outline: '1px rgba(255, 255, 255, 0.10) solid',
        outlineOffset: -1,
        display: 'flex',
        flexDirection: 'column',
        ...f,
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

        {/* Back button */}
        <div style={{ paddingLeft: 28, paddingTop: 16 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px',
              fontFamily: "'DM Sans', sans-serif", padding: 0,
            }}
          >
            ← Back
          </button>
        </div>

        {/* Main content */}
        <div style={{
          flex: '1 1 0',
          paddingLeft: 31.85, paddingRight: 31.85, paddingTop: 24,
          display: 'flex', flexDirection: 'column', gap: 36,
          overflowY: 'auto',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{
              color: '#1B2C4B', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: 2, lineHeight: '17px',
            }}>
              For providers
            </div>
            <div style={{ marginTop: 18, fontSize: 34, lineHeight: '38.68px' }}>
              <span style={{ color: '#0A0A0A', fontWeight: 400 }}>Welcome </span>
              <span style={{ color: '#8A6A5A', fontWeight: 600 }}>back</span>
            </div>
            <div style={{
              marginTop: 14,
              color: '#4F5B69', fontSize: 14.79, fontWeight: 400, lineHeight: '24px',
            }}>
              Sign in to manage your provider profile and view inquiries.
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Email field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <label style={{
                color: '#535B6A', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 0.68, lineHeight: '17px',
              }}>
                Email address
              </label>
              <div style={{
                height: 57,
                paddingLeft: 18, paddingRight: 18,
                background: 'white', borderRadius: 16,
                outline: '0.72px rgba(117, 131, 156, 0.50) solid', outlineOffset: -0.72,
                display: 'flex', alignItems: 'center',
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    color: '#2A1A1A', fontSize: 15.93, fontWeight: 400,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <label style={{
                color: '#535B6A', fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 0.68, lineHeight: '17px',
              }}>
                Password
              </label>
              <div style={{
                height: 57,
                paddingLeft: 18, paddingRight: 18,
                background: 'white', borderRadius: 16,
                outline: '0.72px rgba(117, 131, 156, 0.50) solid', outlineOffset: -0.72,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  placeholder="Enter your password"
                  style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    color: '#2A1A1A', fontSize: 15.93, fontWeight: 400,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#535B6A', fontSize: 12.5, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/onboarding/forgot-password" style={{
                color: '#1B2C4B', fontSize: 14.79, fontWeight: 600,
                lineHeight: '22px', textDecoration: 'none',
              }}>
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 12,
                color: '#c0392b', fontSize: 12, lineHeight: '18px',
              }}>
                {error}
              </div>
            )}

            {/* Sign in button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              style={{
                marginTop: 24,
                width: '100%', height: 62,
                background: '#1B2C4B', borderRadius: 16, border: 'none', cursor: 'pointer',
                color: '#FEF6F0', fontSize: 17, fontWeight: 600, lineHeight: '25.6px',
                fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ flex: 1, height: 0.57, background: 'rgba(117, 131, 156, 0.30)' }} />
            <span style={{ color: '#535B6A', fontSize: 12.5, fontWeight: 500, lineHeight: '18.77px' }}>OR</span>
            <div style={{ flex: 1, height: 0.57, background: 'rgba(117, 131, 156, 0.30)' }} />
          </div>

          {/* Sign up link */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 28 }}>
            <span style={{ color: '#535B6A', fontSize: 14.79, fontWeight: 400, lineHeight: '22px' }}>
              Don&apos;t have an account?
            </span>
            <Link href="/onboarding/account" style={{
              color: '#1B2C4B', fontSize: 15, fontWeight: 600,
              lineHeight: '27px', textDecoration: 'none',
            }}>
              Get started
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
