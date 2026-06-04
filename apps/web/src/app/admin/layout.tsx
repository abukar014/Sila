'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin',          label: 'Queue' },
  { href: '/admin/in-review', label: 'In Review' },
  { href: '/admin/excluded',  label: 'Excluded' },
  { href: '/admin/verified',  label: 'Verified' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  async function signOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #071F1E 0%, #0C2E2C 50%, #071F1E 100%)',
      color: '#FBF7EF',
      fontFamily: 'var(--font-dm-sans), sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background Arabic watermark */}
      <div style={{
        position: 'fixed',
        bottom: -120, right: -80,
        fontSize: 520,
        lineHeight: 1,
        color: '#1A5C5A',
        opacity: 0.045,
        fontFamily: 'var(--font-noto-naskh-arabic), serif',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
      }}>صلة</div>

      {/* Top-right radial glow */}
      <div style={{
        position: 'fixed',
        top: -240, right: -240,
        width: 900, height: 900,
        background: 'radial-gradient(circle, rgba(26,92,90,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Bottom-left clay warmth */}
      <div style={{
        position: 'fixed',
        bottom: -160, left: -120,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(160,106,87,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 58,
        background: 'rgba(6,25,24,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26,92,90,0.22)',
        boxShadow: 'inset 0 -1px 0 rgba(251,247,239,0.03)',
      }}>

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-eb-garamond), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 26,
            lineHeight: 1,
            color: '#FBF7EF',
            letterSpacing: '-0.015em',
          }}>Sila</span>
          <span style={{
            fontFamily: 'var(--font-noto-naskh-arabic), serif',
            fontSize: 13,
            color: 'rgba(251,247,239,0.22)',
            marginLeft: 2,
          }}>صلة</span>
          <span style={{
            fontSize: 9,
            color: 'rgba(160,106,87,0.65)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginLeft: 10,
            paddingLeft: 10,
            borderLeft: '1px solid rgba(26,92,90,0.35)',
          }}>Admin</span>
        </div>

        {/* Nav links + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV.map(({ href, label }) => {
            const active = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '5px 13px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FBF7EF' : 'rgba(251,247,239,0.42)',
                  background: active ? 'rgba(26,92,90,0.28)' : 'transparent',
                  border: active ? '1px solid rgba(26,92,90,0.38)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {label}
              </Link>
            )
          })}

          <div style={{ width: 1, height: 18, background: 'rgba(26,92,90,0.38)', margin: '0 8px' }} />

          <button
            onClick={signOut}
            style={{
              padding: '5px 13px',
              borderRadius: 8,
              fontSize: 13,
              color: 'rgba(251,247,239,0.38)',
              background: 'transparent',
              border: '1px solid rgba(26,92,90,0.28)',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        padding: '36px 32px',
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {children}
      </main>
    </div>
  )
}
