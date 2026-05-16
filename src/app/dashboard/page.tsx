'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

type Provider = {
  id: string;
  name: string;
  verification_status: string;
  status: string;
  verified_date: string | null;
  accepting_clients: boolean;
  scheduling_url: string | null;
  email: string | null;
};

function PhoneShell({ children, gradient = false }: { children: React.ReactNode; gradient?: boolean }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{
        width: 390, height: 844,
        background: gradient ? 'linear-gradient(180deg, white 0%, #F0D8C8 100%)' : 'white',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden', borderRadius: 40,
        outline: '1px rgba(255, 255, 255, 0.10) solid', outlineOffset: -1,
        display: 'flex', flexDirection: 'column',
        ...f,
      }}>
        {children}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const providerId = localStorage.getItem('sila_provider_id');
    if (!providerId) { router.push('/onboarding/account'); return; }
    fetch(`/api/onboarding/${providerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push('/onboarding/account');
        else setProvider(data);
      })
      .catch(() => router.push('/onboarding/account'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <PhoneShell>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#535B6A', fontSize: 13 }}>Loading…</span>
        </div>
      </PhoneShell>
    );
  }

  if (provider?.verification_status === 'excluded') {
    return (
      <PhoneShell>
        <div style={{ height: 51.5, flexShrink: 0, paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600 }}>9:41</span>
          <span style={{ color: '#2A1A1A', fontSize: 12, fontWeight: 600 }}>●●●</span>
        </div>
        <div style={{ flex: 1, paddingLeft: 28, paddingRight: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 60 }}>
          <div style={{ fontSize: 26, lineHeight: '39px', color: '#0A0A0A', fontWeight: 400, marginBottom: 12 }}>
            This account is not eligible.
          </div>
          <div style={{ fontSize: 13, lineHeight: '21px', color: '#535B6A', fontWeight: 400 }}>
            Your application could not be approved. If you believe this is an error, contact us at{' '}
            <span style={{ fontWeight: 600, color: '#1B2C4B' }}>support@silahealth.com</span>.
          </div>
        </div>
      </PhoneShell>
    );
  }

  const isVerified = provider?.verification_status === 'verified' && provider?.status === 'active';
  const isRejected = provider?.verification_status === 'rejected';

  function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const nextReviewDate = provider?.verified_date
    ? new Date(new Date(provider.verified_date).setFullYear(new Date(provider.verified_date).getFullYear() + 1))
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const quickActions = [
    { emoji: '🔍', title: 'View public profile', subtitle: 'See what clients see', href: '/dashboard/preview' },
    { emoji: '✏️', title: 'Edit profile', subtitle: 'Bio, languages, photo', href: '/dashboard/edit-profile' },
    { emoji: '🗓️', title: 'Update scheduling link', subtitle: provider?.scheduling_url ? provider.scheduling_url.replace(/^https?:\/\//, '').replace(/\/.{20,}/, '/…') : 'Not set', href: '/dashboard/scheduling' },
  ];

  return (
    <PhoneShell gradient>

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
      <div style={{ flex: '1 1 0', overflowY: 'auto', paddingLeft: 28, paddingRight: 28 }}>

        {/* Welcome block */}
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ color: '#1B2C4B', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, lineHeight: '16.5px' }}>
            Welcome back
          </div>
          <div style={{ color: '#8A6A5A', fontSize: 26, fontWeight: 600, lineHeight: '39px' }}>
            {provider?.name ?? 'Provider'}
          </div>
        </div>

        {/* Status card */}
        {isVerified ? (
          <div style={{
            marginTop: 16, background: '#D4E4DC', borderRadius: 14,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1C5544', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#2A1A1A', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>Verified · Active</div>
              <div style={{ color: '#535B6A', fontSize: 11, fontWeight: 400, lineHeight: '16.5px', marginTop: 2 }}>
                Your profile is live{nextReviewDate ? ` · Next review ${nextReviewDate}` : ''}
              </div>
            </div>
          </div>
        ) : isRejected ? (
          <div style={{
            marginTop: 16, background: '#F5F0EB', borderRadius: 14,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8C7355', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>·</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#2A1A1A', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>We weren&apos;t able to approve your application</div>
              <div style={{ color: '#535B6A', fontSize: 11, fontWeight: 400, lineHeight: '16.5px', marginTop: 2 }}>Check your email for details. Questions? Reply to that email.</div>
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: 16, background: '#FEF3E2', borderRadius: 14,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C89849', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>○</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#2A1A1A', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>Verification pending</div>
              <div style={{ color: '#535B6A', fontSize: 11, fontWeight: 400, lineHeight: '16.5px', marginTop: 2 }}>We&apos;ll email you when your profile goes live</div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginTop: 32 }}>
          <div style={{ color: '#535B6A', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: '16.5px', marginBottom: 10 }}>
            Quick actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: 14,
                  outline: '0.64px rgba(40, 70, 107, 0.46) solid', outlineOffset: -0.64,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#E0EEFF', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                  }}>
                    {action.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#2A1A1A', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>{action.title}</div>
                    <div style={{ color: '#535B6A', fontSize: 11, fontWeight: 400, lineHeight: '16.5px', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.subtitle}</div>
                  </div>
                  <span style={{ color: '#1B2C4B', fontSize: 16, lineHeight: '24px' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div style={{ marginTop: 32, textAlign: 'center', paddingBottom: 32 }}>
          <button
            onClick={() => { localStorage.removeItem('sila_provider_id'); router.push('/onboarding/account'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#535B6A', fontSize: 12, textDecoration: 'underline', ...f }}
          >
            ← Sign out
          </button>
        </div>

      </div>
    </PhoneShell>
  );
}
