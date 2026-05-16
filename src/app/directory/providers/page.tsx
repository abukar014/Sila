'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 1.5 }}>
    <path d="M7.91749 3.9585C7.91749 5.93503 5.72483 7.9935 4.98853 8.62925C4.91994 8.68083 4.83644 8.70872 4.75062 8.70872C4.6648 8.70872 4.5813 8.68083 4.51271 8.62925C3.77641 7.9935 1.58374 5.93503 1.58374 3.9585C1.58374 3.11859 1.91739 2.31309 2.5113 1.71918C3.1052 1.12528 3.91071 0.791626 4.75062 0.791626C5.59053 0.791626 6.39603 1.12528 6.98994 1.71918C7.58384 2.31309 7.91749 3.11859 7.91749 3.9585Z" stroke="#535B6A" strokeWidth="0.79" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.75032 5.14615C5.4062 5.14615 5.9379 4.61446 5.9379 3.95857C5.9379 3.30269 5.4062 2.771 4.75032 2.771C4.09444 2.771 3.56274 3.30269 3.56274 3.95857C3.56274 4.61446 4.09444 5.14615 4.75032 5.14615Z" stroke="#535B6A" strokeWidth="0.79" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 1.5 }}>
    <path d="M6.33374 5.14623L8.40131 6.52461C8.43112 6.54445 8.46575 6.55582 8.50151 6.55754C8.53727 6.55925 8.57283 6.55122 8.60439 6.53433C8.63595 6.51743 8.66234 6.49228 8.68075 6.46157C8.69915 6.43086 8.70888 6.39574 8.7089 6.35993V3.11547C8.70891 3.08064 8.69973 3.04643 8.68229 3.01629C8.66485 2.98614 8.63976 2.96113 8.60956 2.94378C8.57936 2.92644 8.54512 2.91736 8.5103 2.91748C8.47547 2.9176 8.44129 2.92691 8.41121 2.94446L6.33374 4.15658" stroke="#535B6A" strokeWidth="0.79" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.54206 2.37524H1.58347C1.14621 2.37524 0.791748 2.72971 0.791748 3.16696V6.33384C0.791748 6.77109 1.14621 7.12556 1.58347 7.12556H5.54206C5.97932 7.12556 6.33378 6.77109 6.33378 6.33384V3.16696C6.33378 2.72971 5.97932 2.37524 5.54206 2.37524Z" stroke="#535B6A" strokeWidth="0.79" strokeLinecap="round" strokeLinejoin="round"/>
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
  languages: string[] | null;
  visit_type: string | null;
  insurances: string[] | null;
  scheduling_url: string | null;
  bio: string | null;
  fee_individual: string | null;
  fee_couples: string | null;
  fee_initial: string | null;
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function modalityLabel(visit_type: string | null) {
  if (visit_type === 'In-person') return 'in-person visits';
  if (visit_type === 'Both') return 'in-person and virtual visits';
  return 'virtual visits';
}

const chips = [
  { label: 'Therapy', value: 'therapy' },
  { label: 'Family & couples', value: 'family' },
  { label: 'Psychiatry', value: 'psychiatry' },
  { label: 'Faith-integrated', value: 'faith' },
];

function matchesChip(p: Provider, chip: string) {
  const all = [...(p.specialties ?? []), ...(p.approaches ?? []), ...(p.identity ?? [])].map(s => s.toLowerCase());
  if (chip === 'therapy') return all.some(s => s.includes('therapy') || s.includes('cbt') || s.includes('dbt') || s.includes('emdr'));
  if (chip === 'family') return all.some(s => s.includes('family') || s.includes('couples'));
  if (chip === 'psychiatry') return all.some(s => s.includes('psychiatry') || s.includes('medication'));
  if (chip === 'faith') return all.some(s => s.includes('faith') || s.includes('islamic') || s.includes('muslim'));
  return true;
}

function ProviderCard({ p, onClick }: { p: Provider; onClick: () => void }) {
  const init = initials(p.name);
  const title = [p.credentials, p.state ? `Licensed in ${p.state}` : null].filter(Boolean).join(' · ') || 'Provider';
  const tags = (p.specialties ?? []).slice(0, 2).map((t, i) => ({ text: t, warm: i === 0 }));

  return (
    <button
      onClick={onClick}
      style={{
        alignSelf: 'stretch', width: '100%',
        paddingTop: 13.46, paddingBottom: 12, paddingLeft: 13.46, paddingRight: 13.46,
        background: 'rgba(255, 255, 255, 0.82)',
        borderRadius: 12.67,
        outline: '0.79px rgba(40, 70, 107, 0.46) solid',
        outlineOffset: -0.79,
        display: 'flex', flexDirection: 'column',
        textAlign: 'left', cursor: 'pointer', border: 'none',
      }}
    >
      <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 11.08, display: 'inline-flex' }}>
        <div style={{ width: 34.84, height: 34.84, background: '#E0EEFF', borderRadius: '50%', justifyContent: 'center', alignItems: 'center', display: 'flex', flexShrink: 0 }}>
          <div style={{ color: '#1B2C4B', fontSize: 12.67, fontFamily: 'var(--font-eb-garamond), serif', fontStyle: 'italic', fontWeight: 400, lineHeight: '19px' }}>{init}</div>
        </div>
        <div style={{ flex: '1 1 0' }}>
          <div style={{ color: 'black', fontSize: 11.88, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '17.81px' }}>{p.name}</div>
          <div style={{ color: '#535B6A', fontSize: 8.71, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '13.06px', marginTop: 1.59 }}>{title}</div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4.75, marginTop: 7.73, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <div key={tag.text} style={{ background: tag.warm ? '#F5E2D4' : '#DDE8FB', borderRadius: 3.17, padding: '1.19px 4.75px' }}>
                  <div style={{ color: tag.warm ? '#642510' : '#1B2C4B', fontSize: 7.13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '10.69px' }}>{tag.text}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 8 }}>
            <VideoIcon />
            <div style={{ color: '#535B6A', fontSize: 8.71, fontFamily: "'DM Sans', sans-serif", lineHeight: '13.06px' }}>{modalityLabel(p.visit_type)}</div>
          </div>
          {p.insurances && p.insurances.length > 0 && (
            <div style={{ color: '#535B6A', fontSize: 8.71, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '13.06px', marginTop: 4 }}>
              In network · {p.insurances.slice(0, 2).join(', ')}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function Popup({ p, onClose }: { p: Provider; onClose: () => void }) {
  const init = initials(p.name);
  const langs = Array.isArray(p.languages) ? p.languages.join(', ') : (p.languages ?? '');
  const insurance = p.insurances && p.insurances.length > 0 ? p.insurances.join(', ') : 'Out-of-network · Superbill provided';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: 40, overflow: 'hidden' }}>
      <style>{`
        @keyframes sila-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sila-card-in { from { opacity: 0; transform: translateY(28px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 40, animation: 'sila-overlay-in 0.22s ease-out both' }} />
      <div style={{ width: 332, height: 415, left: 30, top: 241, position: 'absolute', background: 'white', borderRadius: 12.52, outline: '0.78px #8CA3CD solid', outlineOffset: -0.78, overflow: 'hidden', animation: 'sila-card-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>

        <div style={{ width: 305.4, left: 13.3, top: 13.3, position: 'absolute', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10.95, display: 'inline-flex' }}>
          <div style={{ width: 34.42, height: 34.42, background: '#E0EEFF', borderRadius: '50%', justifyContent: 'center', alignItems: 'center', display: 'flex', flexShrink: 0 }}>
            <div style={{ color: '#1B2C4B', fontSize: 12.52, fontFamily: 'var(--font-eb-garamond), serif', fontStyle: 'italic', fontWeight: 400 }}>{init}</div>
          </div>
          <div style={{ flex: '1 1 0' }}>
            <div style={{ color: '#2A1A1A', fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{p.name}</div>
            <div style={{ color: '#535B6A', fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, marginTop: 4 }}>
              {[p.credentials, p.state ? `Licensed in ${p.state}` : null].filter(Boolean).join(' · ') || 'Provider'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
              <VideoIcon />
              <div style={{ color: '#535B6A', fontSize: 8.61, fontFamily: "'DM Sans', sans-serif" }}>{modalityLabel(p.visit_type)}</div>
            </div>
          </div>
        </div>

        {p.bio && (
          <>
            <div style={{ width: 331, height: 92, left: 1, top: 120, position: 'absolute', background: 'rgba(255, 243, 235, 0.57)' }} />
            <div style={{ width: 280, left: 25, top: 130, position: 'absolute', color: '#2A1A1A', fontSize: 11.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '18px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
              {p.bio}
            </div>
          </>
        )}

        <div style={{ left: 20, top: 220, position: 'absolute', flexDirection: 'column', gap: 4, display: 'flex' }}>
          <div style={{ color: '#535B6A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>Languages</div>
          <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{langs || 'English'}</div>
        </div>

        <div style={{ width: 292, height: 1, left: 20, top: 262, position: 'absolute', background: 'rgba(240, 216, 200, 0.50)' }} />

        <div style={{ left: 20, top: 268, position: 'absolute', flexDirection: 'column', gap: 4, display: 'flex' }}>
          <div style={{ color: '#535B6A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>Insurance</div>
          <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, width: 290 }}>{insurance}</div>
        </div>

        <Link
          href={`/directory/providers/${p.slug}`}
          style={{ width: 285, height: 34, left: 27, top: 332, position: 'absolute', background: '#1B2C4B', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#FFF8F4', fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
        >View profile</Link>

        <button
          onClick={onClose}
          style={{ width: 285, height: 34, left: 27, top: 373, position: 'absolute', background: 'white', borderRadius: 10, outline: '1px #1B2C4B solid', outlineOffset: -1, border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
        >Back</button>
      </div>
    </div>
  );
}

function ProvidersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState(searchParams.get('type') ?? 'all');
  const [popup, setPopup] = useState<Provider | null>(null);

  useEffect(() => {
    fetch('/api/directory')
      .then((r) => r.json())
      .then((data) => setProviders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = providers.filter((p) => {
    const matchesChip = activeChip === 'all' || matchesChip_fn(p, activeChip);
    const q = search.trim().toLowerCase();
    const matchesSearch = q === '' ||
      p.name.toLowerCase().includes(q) ||
      (p.credentials ?? '').toLowerCase().includes(q) ||
      (p.specialties ?? []).some(s => s.toLowerCase().includes(q)) ||
      (p.languages ?? []).some(l => l.toLowerCase().includes(q));
    return matchesChip && matchesSearch;
  });

  function matchesChip_fn(p: Provider, chip: string) {
    return matchesChip(p, chip);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <div style={{ width: 390, height: 844, padding: 1, background: 'white', boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', borderRadius: 40, outline: '1px rgba(255, 255, 255, 0.10) solid', outlineOffset: -1, display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ alignSelf: 'stretch', height: 842, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>

          {/* Status bar */}
          <div style={{ width: 388, height: 51.5, paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex' }}>
            <div style={{ color: '#2A1A1A', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '19.5px' }}>9:41</div>
            <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '16px' }}>●●●</div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: '1 1 0', paddingLeft: 24, paddingRight: 24, overflowY: 'auto', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex' }}>

            {/* Back + Header */}
            <div style={{ width: '100%' }}>
              <button onClick={() => router.back()} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#1B2C4B', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '19.5px', marginBottom: 8 }}>← Back</button>
              <div>
                <span style={{ color: '#1B2C4B', fontSize: 32, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '48px' }}>Welcome to </span>
                <span style={{ color: '#1B2C4B', fontSize: 36, fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic', fontWeight: 400, lineHeight: '48px' }}>Sila</span>
              </div>
            </div>

            {/* Search */}
            <div style={{ width: 332, height: 48.5, paddingLeft: 14, paddingRight: 14, paddingTop: 12, paddingBottom: 12, background: 'rgba(255, 255, 255, 0.85)', borderRadius: 14, outline: '1px rgba(40, 70, 107, 0.46) solid', outlineOffset: -1, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex' }}>
              <div style={{ color: '#1B2C4B', fontSize: 15 }}>⌕</div>
              <input type="text" placeholder="Specialty, name, language…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: '#535B6A', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }} />
            </div>

            {/* Filter chips */}
            <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex', flexWrap: 'wrap', width: '100%' }}>
              <Link href="/directory/filters" style={{ height: 31, paddingLeft: 12, paddingRight: 12, background: 'rgba(255,255,255,0.70)', borderRadius: 16, outline: '1px rgba(40, 70, 107, 0.46) solid', outlineOffset: -1, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#2A1A1A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: 'nowrap' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M3 6h6M5 9h2" stroke="#1B2C4B" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Filters
              </Link>
              {chips.map((chip) => {
                const active = activeChip === chip.value;
                return (
                  <button key={chip.value} onClick={() => setActiveChip(active ? 'all' : chip.value)} style={{ height: 31, paddingLeft: 15, paddingRight: 15, background: active ? '#1B2C4B' : 'rgba(255, 255, 255, 0.70)', borderRadius: 16, outline: `1px ${active ? '#1B2C4B' : 'rgba(40, 70, 107, 0.46)'} solid`, outlineOffset: -1, border: 'none', cursor: 'pointer', color: active ? '#F0F3FE' : '#2A1A1A', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: 'nowrap' }}>{chip.label}</button>
                );
              })}
            </div>

            {/* Results count */}
            <div style={{ width: 336, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
              <span style={{ color: '#8A6A5A', fontSize: 11.79, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                {loading ? 'Loading providers…' : `${filtered.length} verified provider${filtered.length !== 1 ? 's' : ''}`}
              </span>
              {activeChip !== 'all' && (
                <button onClick={() => setActiveChip('all')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#8A6A5A', fontSize: 11.79, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Show all</button>
              )}
            </div>

            {/* Provider cards */}
            <div style={{ width: 336, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 9.5, display: 'flex', paddingBottom: 24 }}>
              {filtered.map((p) => (
                <ProviderCard key={p.id} p={p} onClick={() => setPopup(p)} />
              ))}
              {!loading && filtered.length === 0 && (
                <div style={{ color: '#8A6A5A', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, padding: '24px 0', textAlign: 'center', width: '100%' }}>No providers match your search.</div>
              )}
            </div>
          </div>
        </div>

        {popup && <Popup p={popup} onClose={() => setPopup(null)} />}
      </div>
    </main>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense>
      <ProvidersContent />
    </Suspense>
  );
}
