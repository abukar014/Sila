'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z" stroke="#4ADE80" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 6L5.5 7L7.5 5" stroke="#4ADE80" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VerifiedIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z" stroke="#1B2C4B" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 6L5.5 7L7.5 5" stroke="#1B2C4B" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M10.6666 8.66667L14.1486 10.988C14.2988 11.0848 14.6666 10.9893 14.6666 10.7107V5.24667C14.6666 4.96807 14.2988 4.87254 14.1486 4.96934L10.6666 7" stroke="#535B6A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.33325 4H2.66659C1.93021 4 1.33325 4.59695 1.33325 5.33333V10.6667C1.33325 11.403 1.93021 12 2.66659 12H9.33325C10.0696 12 10.6666 11.403 10.6666 10.6667V5.33333C10.6666 4.59695 10.0696 4 9.33325 4Z" stroke="#535B6A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function TagChip({ label }: { label: string }) {
  return (
    <span style={{
      background: '#E0EEFF', color: '#1B2C4B',
      fontSize: 9, fontWeight: 500, borderRadius: 8,
      padding: '4px 8px', lineHeight: '14px', ...f,
    }}>{label}</span>
  );
}

type Provider = {
  id: string;
  name: string;
  credentials: string | null;
  state: string | null;
  specialties: string[] | null;
  approaches: string[] | null;
  identity: string[] | null;
  faith_approach: string | null;
  languages: string[] | null;
  bio: string | null;
  scheduling_url: string | null;
  insurances: string[] | null;
  fee_individual: string | null;
  fee_couples: string | null;
  fee_initial: string | null;
  visit_type: string | null;
  verification_status: string;
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function ProfilePreviewPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('sila_provider_id');
    if (!id) { router.push('/dashboard'); return; }
    fetch(`/api/onboarding/${id}`)
      .then((r) => r.json())
      .then((data) => { if (!data.error) setProvider(data); else router.push('/dashboard'); })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !provider) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
        <div style={{ color: '#535B6A', fontSize: 13, ...f }}>Loading…</div>
      </main>
    );
  }

  const init = initials(provider.name);
  const title = [provider.credentials, provider.state ? `Licensed in ${provider.state}` : null].filter(Boolean).join(' · ') || 'Provider';
  const langs = Array.isArray(provider.languages) ? provider.languages.join(', ') : (provider.languages ?? '');
  const specialties = provider.specialties ?? [];
  const approaches = provider.approaches ?? [];
  const identity = provider.identity ?? [];
  const faithApproach = provider.faith_approach ? [provider.faith_approach.replace('_', '-')] : [];
  const insurances = provider.insurances ?? [];
  const visitTypeLabel = provider.visit_type === 'In-person' ? 'In-person visits available'
    : provider.visit_type === 'Both' ? 'In-person & virtual visits available'
    : 'Virtual visits available';
  const fees = [
    provider.fee_initial ? { label: 'Initial consultation', amount: provider.fee_initial } : null,
    provider.fee_individual ? { label: 'Individual session', amount: provider.fee_individual } : null,
    provider.fee_couples ? { label: 'Couples session', amount: provider.fee_couples } : null,
  ].filter(Boolean) as { label: string; amount: string }[];

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

        {/* Nav bar */}
        <div style={{
          height: 51.5, flexShrink: 0,
          paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 13, fontWeight: 600, padding: 0, ...f }}
          >
            ← Back
          </button>
          <span style={{ color: '#535B6A', fontSize: 11, fontWeight: 500, lineHeight: '19.5px' }}>Client view</span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: '1 1 0', overflowY: 'auto', paddingLeft: 28, paddingRight: 28 }}>

          {/* Provider header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#E0EEFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>
              <span style={{ color: '#1B2C4B', fontSize: 24, fontFamily: "'EB Garamond', serif", fontStyle: 'italic' }}>{init}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ color: '#2A1A1A', fontSize: 17, fontWeight: 600, lineHeight: '25.5px' }}>{provider.name}</span>
              <VerifiedIcon />
            </div>
            <span style={{ color: '#535B6A', fontSize: 13, fontWeight: 400, lineHeight: '19.5px' }}>{title}</span>
          </div>

          {/* Info card */}
          <div style={{
            background: '#FAFAFA', borderRadius: 14,
            outline: '1px rgba(40,70,107,0.15) solid', outlineOffset: -1,
            padding: '14px 16px', marginBottom: 16,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <VideoIcon />
              <span style={{ color: '#535B6A', fontSize: 13, fontWeight: 400 }}>{visitTypeLabel}</span>
            </div>
            {langs && (
              <div style={{ borderTop: '1px solid rgba(40,70,107,0.10)', paddingTop: 10 }}>
                <span style={{ color: '#535B6A', fontSize: 13, fontWeight: 400 }}>🌐 {langs}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {provider.bio && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 6 }}>About</div>
              <div style={{ color: '#535B6A', fontSize: 13, fontWeight: 400, lineHeight: '21px' }}>{provider.bio}</div>
            </div>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>Focus Areas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {specialties.map((s) => <TagChip key={s} label={s} />)}
              </div>
            </div>
          )}

          {/* Faith approach */}
          {faithApproach.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>Faith Approach</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {faithApproach.map((a) => <TagChip key={a} label={a} />)}
              </div>
            </div>
          )}

          {/* Treatment approaches */}
          {approaches.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>Treatment Approaches</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {approaches.map((a) => <TagChip key={a} label={a} />)}
              </div>
            </div>
          )}

          {/* Provider identity */}
          {identity.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>Provider Identity</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {identity.map((i) => <TagChip key={i} label={i} />)}
              </div>
            </div>
          )}

          {/* Insurance */}
          {insurances.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>Insurance</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {insurances.map((ins) => (
                  <div key={ins} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckIcon />
                    <span style={{ color: '#535B6A', fontSize: 13, fontWeight: 400 }}>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fees */}
          {fees.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>Fees</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fees.map((fee) => (
                  <div key={fee.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#535B6A', fontSize: 13, fontWeight: 400 }}>{fee.label}</span>
                    <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600 }}>{fee.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview notice */}
          <div style={{
            background: '#FEF0E6', borderRadius: 14,
            outline: '1px #F0D8C8 solid', outlineOffset: -1,
            padding: '12px 14px', marginBottom: 28,
          }}>
            <div style={{ color: '#8A3520', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              Preview mode
            </div>
            <div style={{ color: '#2A1A1A', fontSize: 12, fontWeight: 400, lineHeight: '19px' }}>
              This is how clients see your profile. Your scheduling link and full details will appear once your profile is live.
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid rgba(240, 216, 200, 0.30)',
          paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 28,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {provider.scheduling_url ? (
            <a
              href={provider.scheduling_url.startsWith('http') ? provider.scheduling_url : `https://${provider.scheduling_url}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', width: '100%', height: 54.5,
                background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
                color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '54.5px',
                textAlign: 'center', textDecoration: 'none', ...f,
              }}
            >
              Continue to scheduler
            </a>
          ) : (
            <button
              onClick={() => router.back()}
              style={{
                width: '100%', height: 54.5,
                background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
                color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '22.5px', ...f,
              }}
            >
              Go back
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
