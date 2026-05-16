'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

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

const VideoIcon16 = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M10.6666 8.66667L14.1486 10.988C14.1988 11.0214 14.2571 11.0406 14.3174 11.0435C14.3776 11.0463 14.4375 11.0328 14.4906 11.0044C14.5438 10.9759 14.5882 10.9336 14.6192 10.8818C14.6502 10.8301 14.6666 10.771 14.6666 10.7107V5.24667C14.6666 5.18802 14.6512 5.1304 14.6218 5.07964C14.5924 5.02887 14.5502 4.98675 14.4993 4.95754C14.4485 4.92832 14.3908 4.91304 14.3322 4.91324C14.2735 4.91344 14.2159 4.92911 14.1653 4.95867L10.6666 7" stroke="#535B6A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.33325 4H2.66659C1.93021 4 1.33325 4.59695 1.33325 5.33333V10.6667C1.33325 11.403 1.93021 12 2.66659 12H9.33325C10.0696 12 10.6666 11.403 10.6666 10.6667V5.33333C10.6666 4.59695 10.0696 4 9.33325 4Z" stroke="#535B6A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type Provider = {
  id: string;
  slug: string;
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
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function modalityLabel(visit_type: string | null) {
  if (visit_type === 'In-person') return 'In-person visits';
  if (visit_type === 'Both') return 'In-person and Virtual visits';
  return 'Virtual visits';
}

function TagChip({ label }: { label: string }) {
  return (
    <div style={{ background: '#E0EEFF', borderRadius: 8, padding: '3.5px 8px', display: 'inline-flex' }}>
      <span style={{ color: '#1B2C4B', fontSize: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '13.5px' }}>{label}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', paddingTop: 17, paddingBottom: 16, paddingLeft: 17, paddingRight: 17, background: 'rgba(255,255,255,0.50)', borderRadius: 16, outline: '1px rgba(40,70,107,0.46) solid', outlineOffset: -1, flexDirection: 'column', gap: 10, display: 'flex' }}>
      <div style={{ color: '#2A1A1A', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '19.5px' }}>{title}</div>
      {children}
    </div>
  );
}

export default function ProviderDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/directory/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true);
        else setProvider(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
        <div style={{ color: '#535B6A', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Loading…</div>
      </main>
    );
  }

  if (notFound || !provider) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
        <div style={{ color: '#535B6A', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Provider not found.</div>
      </main>
    );
  }

  const init = initials(provider.name);
  const title = [provider.credentials, provider.state ? `Licensed in ${provider.state}` : null].filter(Boolean).join(' · ') || 'Provider';
  const langs = Array.isArray(provider.languages) ? provider.languages.join(', ') : (provider.languages ?? 'English');
  const firstName = provider.name.split(' ').find(w => !w.includes('.')) ?? provider.name.split(' ')[0];
  const specialties = provider.specialties ?? [];
  const approaches = provider.approaches ?? [];
  const identity = provider.identity ?? [];
  const faithApproach = provider.faith_approach ? [provider.faith_approach] : [];
  const allApproaches = [...approaches, ...faithApproach];
  const insurances = provider.insurances ?? [];
  const fees = [
    provider.fee_initial ? { label: 'Initial consultation', amount: provider.fee_initial } : null,
    provider.fee_individual ? { label: 'Individual session', amount: provider.fee_individual } : null,
    provider.fee_couples ? { label: 'Couples session', amount: provider.fee_couples } : null,
  ].filter(Boolean) as { label: string; amount: string }[];

  const schedulerUrl = provider.scheduling_url
    ? (provider.scheduling_url.startsWith('http') ? provider.scheduling_url : `https://${provider.scheduling_url}`)
    : null;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{ width: 390, height: 844, padding: 1, background: 'white', boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', borderRadius: 40, outline: '1px rgba(255,255,255,0.10) solid', outlineOffset: -1, display: 'flex', flexDirection: 'column' }}>

        {/* Nav bar */}
        <div style={{ width: 388, height: 57, paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex', flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="#1B2C4B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ color: '#1B2C4B', fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, lineHeight: '24px' }}>Back</span>
          </button>
          <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '16px' }}>●●●</div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 24, paddingBottom: 24, paddingLeft: 28, paddingRight: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Provider header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 72, height: 72, background: '#E0EEFF', borderRadius: '50%', outline: '1px #CECECE solid', outlineOffset: -1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1B2C4B', fontSize: 26, fontFamily: 'var(--font-eb-garamond), serif', fontStyle: 'italic', fontWeight: 400 }}>{init}</span>
            </div>
            <div style={{ textAlign: 'center', color: '#2A1A1A', fontSize: 22, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, lineHeight: '30px' }}>{provider.name}</div>
            <div style={{ textAlign: 'center', color: '#535B6A', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <VerifiedIcon />
              <span style={{ color: '#1B2C4B', fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Verified Provider</span>
            </div>
          </div>

          {/* Info card */}
          <div style={{ width: '100%', paddingTop: 17, paddingBottom: 16, paddingLeft: 17, paddingRight: 17, background: 'rgba(255,255,255,0.50)', borderRadius: 16, outline: '1px rgba(40,70,107,0.46) solid', outlineOffset: -1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <VideoIcon16 />
              <span style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>{modalityLabel(provider.visit_type)}</span>
            </div>
            {langs && (
              <div style={{ borderTop: '1px rgba(40,70,107,0.46) solid', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: '#535B6A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>Languages</span>
                <span style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{langs}</span>
              </div>
            )}
          </div>

          {/* About the Provider */}
          {(specialties.length > 0 || allApproaches.length > 0 || identity.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ color: '#535B6A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', lineHeight: '16.5px', letterSpacing: 0.5 }}>About the Provider</div>
              {specialties.length > 0 && (
                <SectionCard title="Focus Areas">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {specialties.map(a => <TagChip key={a} label={a} />)}
                  </div>
                </SectionCard>
              )}
              {allApproaches.length > 0 && (
                <SectionCard title="Treatment Approaches">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {allApproaches.map(a => <TagChip key={a} label={a} />)}
                  </div>
                </SectionCard>
              )}
              {identity.length > 0 && (
                <SectionCard title="Provider Identity">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {identity.map(i => <TagChip key={i} label={i} />)}
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {/* About them */}
          {provider.bio && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ color: '#535B6A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', lineHeight: '16.5px', letterSpacing: 0.5 }}>About Them</div>
              <SectionCard title={`Get to Know ${firstName}`}>
                <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '19.5px' }}>{provider.bio}</div>
              </SectionCard>
            </div>
          )}

          {/* Insurance & Fees */}
          {(insurances.length > 0 || fees.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ color: '#535B6A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', lineHeight: '16.5px', letterSpacing: 0.5 }}>Insurance &amp; Fees</div>
              {insurances.length > 0 && (
                <SectionCard title="In-Network Insurance">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {insurances.map(ins => (
                      <div key={ins} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckIcon />
                        <span style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>{ins}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: '#535B6A', fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', fontWeight: 400 }}>Always verify coverage with your insurance before scheduling.</div>
                </SectionCard>
              )}
              {fees.length > 0 && (
                <SectionCard title="Out-of-Pocket Fees">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {fees.map(f => (
                      <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#535B6A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>{f.label}</span>
                        <span style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{f.amount}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {/* Leaving app notice */}
          {schedulerUrl && (
            <div style={{ width: '100%', paddingTop: 18, paddingBottom: 20, paddingLeft: 18, paddingRight: 18, background: '#FEF0E6', borderRadius: 16, outline: '1px #8A3520 solid', outlineOffset: -1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M10.0001 18.3333C14.6025 18.3333 18.3334 14.6023 18.3334 9.99996C18.3334 5.39759 14.6025 1.66663 10.0001 1.66663C5.39771 1.66663 1.66675 5.39759 1.66675 9.99996C1.66675 14.6023 5.39771 18.3333 10.0001 18.3333Z" stroke="#1B2C4B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6.66663V9.99996" stroke="#1B2C4B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 13.3334H10.0083" stroke="#1B2C4B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#1B2C4B', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Leaving this App</div>
                  <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '19.5px' }}>You&apos;ll be taken to {firstName}&apos;s own scheduling page. We won&apos;t see any information you share there.</div>
                </div>
              </div>
              <div style={{ paddingTop: 13, paddingBottom: 12, paddingLeft: 13, paddingRight: 13, background: 'rgba(255,255,255,0.70)', borderRadius: 14, outline: '1px rgba(40,70,107,0.46) solid', outlineOffset: -1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ color: '#6B3A2A', fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Why we do this:</div>
                <div style={{ color: '#535B6A', fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '16.25px' }}>This protects your privacy and ensures we never have access to your protected health information (PHI).</div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom action bar */}
        <div style={{ width: 388, paddingTop: 17, paddingLeft: 28, paddingRight: 28, paddingBottom: 20, borderTop: '1px rgba(240,216,200,0.30) solid', background: 'white', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {schedulerUrl ? (
            <a
              href={schedulerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%', height: 54.5, background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer', color: '#FEF6F0', fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '54.5px', textAlign: 'center', textDecoration: 'none', display: 'block' }}
            >
              Continue to scheduler →
            </a>
          ) : (
            <button disabled style={{ width: '100%', height: 54.5, background: '#C8D5E5', borderRadius: 14, border: 'none', color: '#535B6A', fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              Scheduling link not set
            </button>
          )}
          <button onClick={() => router.back()} style={{ width: '100%', height: 51, background: 'white', borderRadius: 14, outline: '1.5px #1B2C4B solid', outlineOffset: -1.5, border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            Go back
          </button>
        </div>

      </div>
    </main>
  );
}
