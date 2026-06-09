'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5"/>
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5"/>
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5"/>
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 12V8"/>
      <path d="M5.5 12V5"/>
      <path d="M9 12V2.5"/>
      <path d="M12.5 12V6.5"/>
      <path d="M1 13h13"/>
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 1.5 2 3.75v3.5c0 3.2 2.5 5.9 5.5 6.25 3-.35 5.5-3.05 5.5-6.25v-3.5z"/>
      <polyline points="5,8 6.5,9.5 10,6"/>
    </svg>
  )
}

function IconSignOut() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2H2.5v9H5"/>
      <path d="M8.5 9l3-2.5-3-2.5"/>
      <path d="M11.5 6.5H6"/>
    </svg>
  )
}

const NAV = [
  { href: '/admin',             label: 'Overview',         icon: <IconGrid />,  exact: true },
  { href: '/admin/analytics',   label: 'Data & Analytics', icon: <IconChart /> },
  { href: '/admin/verification',label: 'Verification',     icon: <IconShield /> },
]

export default function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname()
  const router   = useRouter()

  if (pathname === '/admin/login') return null

  async function signOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  function isActive(item: typeof NAV[number]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: 216,
      background: 'rgba(7,31,30,0.45)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      borderRight: '1px solid rgba(26,92,90,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxShadow: '1px 0 0 rgba(251,247,239,0.03), 4px 0 24px rgba(0,0,0,0.12)',
    }}>

      {/* Top accent gradient line */}
      <div style={{
        height: 2, flexShrink: 0,
        background: 'linear-gradient(90deg, #1A5C5A 0%, rgba(160,106,87,0.6) 55%, transparent 100%)',
      }}/>

      {/* Wordmark */}
      <div style={{ padding: '22px 18px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
          <span style={{
            fontFamily: 'var(--font-eb-garamond), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 22,
            lineHeight: 1,
            color: '#FBF7EF',
            letterSpacing: '-0.015em',
          }}>Sila</span>
          <span style={{
            fontFamily: 'var(--font-noto-naskh-arabic), serif',
            fontSize: 12,
            color: 'rgba(251,247,239,0.18)',
          }}>صلة</span>
        </div>
        <span style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(160,106,87,0.55)',
        }}>Admin</span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(26,92,90,0.18)', margin: '0 14px 8px', flexShrink: 0 }}/>

      {/* Nav */}
      <nav style={{ padding: '2px 8px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = isActive(item)
          const isVerif = item.href === '/admin/verification'
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 11px 8px 14px',
                borderRadius: 9,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: active
                  ? 'rgba(26,92,90,0.2)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(26,92,90,0.32)'
                  : '1px solid transparent',
                transition: 'background 0.14s, border-color 0.14s',
              }}
            >
              {/* Clay left accent bar */}
              {active && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: 7, bottom: 7,
                  width: 2.5,
                  background: '#A06A57',
                  borderRadius: '0 3px 3px 0',
                  boxShadow: '0 0 10px rgba(160,106,87,0.55)',
                }}/>
              )}

              {/* Icon */}
              <span style={{
                color: active ? '#5BB8B6' : 'rgba(251,247,239,0.32)',
                display: 'flex', alignItems: 'center', flexShrink: 0,
                filter: active ? 'drop-shadow(0 0 5px rgba(91,184,182,0.45))' : 'none',
                transition: 'color 0.14s, filter 0.14s',
              }}>
                {item.icon}
              </span>

              {/* Label */}
              <span style={{
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? '#FBF7EF' : 'rgba(251,247,239,0.4)',
                flex: 1,
                transition: 'color 0.14s',
                letterSpacing: '-0.005em',
              }}>
                {item.label}
              </span>

              {/* Badge */}
              {isVerif && pendingCount > 0 && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#FBF7EF',
                  background: 'rgba(160,106,87,0.8)',
                  borderRadius: 5,
                  padding: '1px 6px',
                  lineHeight: 1.7,
                  letterSpacing: 0,
                }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Spacer + Arabic watermark */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          bottom: -24, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 110,
          lineHeight: 1,
          color: '#1A5C5A',
          opacity: 0.045,
          fontFamily: 'var(--font-noto-naskh-arabic), serif',
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>صلة</div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '0 8px 18px', flexShrink: 0 }}>
        <div style={{ height: 1, background: 'rgba(26,92,90,0.15)', margin: '0 4px 8px' }}/>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '7px 12px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: 'rgba(251,247,239,0.24)',
            textAlign: 'left',
            transition: 'color 0.14s',
          }}
        >
          <IconSignOut />
          Sign out
        </button>
      </div>
    </aside>
  )
}
