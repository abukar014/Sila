'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-dm-sans), sans-serif',
      background: '#071F1E',
    }}>

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div style={{
        flex: '0 0 58%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 80px',
        background: 'linear-gradient(145deg, #061A19 0%, #0C2E2C 55%, #0F3835 100%)',
        borderRight: '1px solid rgba(26,92,90,0.2)',
        overflow: 'hidden',
      }}>

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: '38%', left: '48%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(26,92,90,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Clay warmth spot */}
        <div style={{
          position: 'absolute',
          bottom: '18%', left: '10%',
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,106,87,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Arabic watermark */}
        <div style={{
          position: 'absolute',
          bottom: -80, right: -60,
          fontSize: 380,
          lineHeight: 1,
          color: '#1A5C5A',
          opacity: 0.07,
          fontFamily: 'var(--font-noto-naskh-arabic), serif',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>صلة</div>

        {/* Grain */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035, pointerEvents: 'none' }} aria-hidden>
          <filter id="noise-l">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise-l)"/>
        </svg>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 28 }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-eb-garamond), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 92,
              lineHeight: 0.9,
              color: '#FBF7EF',
              letterSpacing: '-0.025em',
            }}>Sila</span>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-noto-naskh-arabic), serif',
              fontSize: 30,
              color: 'rgba(251,247,239,0.26)',
              marginTop: 12,
            }}>صلة</span>
          </div>

          <div style={{
            width: 52, height: 1.5,
            background: 'linear-gradient(90deg, rgba(160,106,87,0.65), transparent)',
            marginBottom: 28, borderRadius: 1,
          }} />

          <p style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: 'rgba(251,247,239,0.36)',
            maxWidth: 240,
            fontWeight: 400,
            margin: 0,
          }}>
            Muslim mental health<br />provider directory.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 36 }}>
            <div style={{ width: 24, height: 1, background: 'rgba(26,92,90,0.5)' }} />
            <span style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: 'rgba(160,106,87,0.6)',
              fontWeight: 600,
            }}>Internal access only</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 56px',
        background: 'linear-gradient(170deg, #061918 0%, #071F1E 100%)',
      }}>
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{
            position: 'relative',
            background: 'rgba(26,92,90,0.08)',
            border: '1px solid rgba(26,92,90,0.28)',
            borderRadius: 20,
            padding: '40px 36px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 32px 72px rgba(0,0,0,0.45), inset 0 1px 0 rgba(251,247,239,0.05)',
          }}>
            {/* Top highlight */}
            <div style={{
              position: 'absolute',
              top: 0, left: '8%', right: '8%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(251,247,239,0.11), transparent)',
            }} />

            <p style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: 'rgba(160,106,87,0.72)',
              fontWeight: 600,
              marginBottom: 28,
            }}>Admin Access</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: 'rgba(251,247,239,0.05)',
                  border: error ? '1px solid rgba(224,112,112,0.45)' : '1px solid rgba(26,92,90,0.38)',
                  borderRadius: 12,
                  color: '#FBF7EF',
                  fontSize: 14,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />

              {error && (
                <p style={{ fontSize: 12, color: '#E07070', margin: '2px 0 0' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '13px',
                  background: loading || !password
                    ? 'rgba(26,92,90,0.18)'
                    : 'linear-gradient(135deg, #1A5C5A 0%, #0F3835 100%)',
                  border: '1px solid rgba(26,92,90,0.4)',
                  borderRadius: 12,
                  color: loading || !password ? 'rgba(251,247,239,0.28)' : '#FBF7EF',
                  fontSize: 13,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  cursor: loading || !password ? 'not-allowed' : 'pointer',
                  boxShadow: loading || !password ? 'none' : '0 4px 20px rgba(26,92,90,0.35)',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
