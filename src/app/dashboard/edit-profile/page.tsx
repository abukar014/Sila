'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const FOCUS_AREAS = [
  'Anxiety and stress management', 'Depression', 'Trauma & PTSD',
  'Islamic mental health integration', 'Cultural adjustment and identity',
  'Family therapy', 'Couples therapy', 'Grief and loss',
];

const APPROACHES = [
  'Cognitive Behavioral Therapy (CBT)', 'Dialectical Behavior Therapy (DBT)',
  'Faith-integrated therapy', 'Trauma-focused therapy',
  'Psychodynamic therapy', 'EMDR', 'Medication management',
];

const IDENTITY = [
  'Muslim provider', 'South Asian', 'Middle Eastern', 'African American',
  'Immigrant experience', 'LGBTQ+ affirming', 'Multilingual',
];

const VISIT_TYPES = ['In-person', 'Virtual visits', 'Both'];

const sectionLabel: React.CSSProperties = {
  color: '#535B6A', fontSize: 11.38, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: 0.57, lineHeight: '17.07px',
  ...f,
};

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} style={{
      display: 'flex', alignItems: 'center', gap: 13.65,
      background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
    }}>
      <div style={{
        width: 24, height: 20, borderRadius: 6, flexShrink: 0,
        background: checked ? '#1B2C4B' : 'white',
        outline: '0.5px rgba(40,70,107,0.46) solid', outlineOffset: -0.5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: 'white', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ color: '#2A1A1A', fontSize: 14.79, fontWeight: 500, lineHeight: '22.19px', ...f }}>{label}</span>
    </button>
  );
}

function PillToggle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      background: selected ? '#1B2C4B' : 'white',
      borderRadius: 9999, border: 'none', cursor: 'pointer',
      outline: selected ? 'none' : '0.72px rgba(40,70,107,0.46) solid',
      outlineOffset: -0.72,
      padding: '7px 14px',
      color: selected ? 'white' : '#2A1A1A',
      fontSize: 12.52, fontWeight: 600, lineHeight: '18.77px',
      whiteSpace: 'nowrap',
      ...f,
    }}>{label}</button>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [visitType, setVisitType] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [approaches, setApproaches] = useState<string[]>([]);
  const [identity, setIdentity] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('sila_provider_id');
    if (!id) { router.push('/dashboard'); return; }
    fetch(`/api/onboarding/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.specialties) setFocusAreas(data.specialties);
        if (data.approaches) setApproaches(data.approaches);
        if (data.identity) setIdentity(data.identity);
        if (data.visit_type) setVisitType(Array.isArray(data.visit_type) ? data.visit_type : [data.visit_type]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function toggleSingle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? [] : [item]);
  }

  async function handleSave() {
    setError('');
    const id = localStorage.getItem('sila_provider_id');
    if (!id) { router.push('/dashboard'); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialties: focusAreas,
          approaches,
          identity,
          visit_type: visitType[0] ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save.'); return; }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

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

        {/* Status bar */}
        <div style={{
          height: 51.5, flexShrink: 0,
          paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          background: 'white',
        }}>
          <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>9:41</span>
          <span style={{ color: '#2A1A1A', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>●●●</span>
        </div>

        {/* Secondary nav */}
        <div style={{
          height: 52, flexShrink: 0,
          borderBottom: '0.64px rgba(40,70,107,0.15) solid',
          background: 'white', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              position: 'absolute', left: 28,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', padding: 0, ...f,
            }}
          >
            ← Back
          </button>
          <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>Edit Profile</span>
        </div>

        {/* Scrollable content */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#535B6A', fontSize: 13 }}>Loading…</span>
          </div>
        ) : (
          <div style={{ flex: '1 1 0', overflowY: 'auto', padding: '27px 32px 24px' }}>

            {/* Visit type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Visit Type *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {VISIT_TYPES.map((v) => (
                  <Checkbox key={v} label={v} checked={visitType.includes(v)}
                    onChange={() => toggleSingle(visitType, setVisitType, v)} />
                ))}
              </div>
            </div>

            {/* Focus areas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Focus Areas *</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOCUS_AREAS.map((a) => (
                  <PillToggle key={a} label={a} selected={focusAreas.includes(a)}
                    onToggle={() => toggle(focusAreas, setFocusAreas, a)} />
                ))}
              </div>
              <span style={{ color: '#535B6A', fontSize: 11.38, fontWeight: 400, lineHeight: '17.07px', ...f }}>
                Select all that apply
              </span>
            </div>

            {/* Treatment approaches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Treatment Approaches *</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {APPROACHES.map((a) => (
                  <PillToggle key={a} label={a} selected={approaches.includes(a)}
                    onToggle={() => toggle(approaches, setApproaches, a)} />
                ))}
              </div>
            </div>

            {/* Provider identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 8 }}>
              <div style={sectionLabel}>Provider Identity *</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {IDENTITY.map((id) => (
                  <PillToggle key={id} label={id} selected={identity.includes(id)}
                    onToggle={() => toggle(identity, setIdentity, id)} />
                ))}
              </div>
              <span style={{ color: '#535B6A', fontSize: 11.38, fontWeight: 400, lineHeight: '17.07px', ...f }}>
                Help clients find providers who share their background
              </span>
            </div>

            {error && <div style={{ color: '#c0392b', fontSize: 12, lineHeight: '18px', marginTop: 12 }}>{error}</div>}

            <div style={{ height: 24 }} />
          </div>
        )}

        {/* Fixed bottom bar */}
        <div style={{
          flexShrink: 0,
          borderTop: '0.72px rgba(40,70,107,0.15) solid',
          background: 'white',
          paddingLeft: 32, paddingRight: 32, paddingTop: 19, paddingBottom: 28,
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', height: 62,
              background: '#1B2C4B', borderRadius: 16, border: 'none', cursor: 'pointer',
              color: '#FEF6F0', fontSize: 17, fontWeight: 600, lineHeight: '25.6px',
              fontFamily: "'DM Sans', sans-serif",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>

      </div>
    </main>
  );
}
