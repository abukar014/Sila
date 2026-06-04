'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SiteNav() {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => (
    <Link href={href} style={{
      color: pathname === href ? 'var(--ink)' : 'var(--ink-mute)',
      fontWeight: pathname === href ? 500 : 400,
      textDecoration: 'none',
      fontSize: '13.5px',
      letterSpacing: '0.005em',
      position: 'relative',
    }}>
      {label}
    </Link>
  );

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '18px 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 32,
      }}>

        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Sila
          </span>
          <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400, letterSpacing: '0.005em' }}>
            صلة
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {navLink('/directory', 'Find a provider')}
          {navLink('/about', 'About')}
          {navLink('/how-it-works', 'How verification works')}
          {navLink('/provider', 'For providers')}
        </nav>

        {/* Right CTAs */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/onboarding/sign-in" style={{
            fontSize: 13, color: 'var(--ink-mute)',
            textDecoration: 'none', padding: '7px 14px',
          }}>
            Sign in
          </Link>
          <Link href="/provider" style={{
            fontSize: 13, fontWeight: 500,
            color: 'var(--bg-elev)',
            background: 'var(--accent)',
            borderRadius: 999,
            padding: '8px 18px',
            textDecoration: 'none',
          }}>
            Apply as a provider
          </Link>
        </div>

      </div>
    </header>
  );
}
