'use client';

import { useEffect, useRef, useState } from 'react';
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

const FAITH_OPTIONS = [
  { label: 'Faith-integrated', value: 'faith_integrated' },
  { label: 'Faith-sensitive', value: 'faith_sensitive' },
  { label: 'Faith-neutral', value: 'faith_neutral' },
  { label: 'Secular', value: 'secular' },
];

const QUICK_ADD = ['Cigna', 'United Healthcare', 'Humana', 'Medicare'];

const sectionLabel: React.CSSProperties = {
  color: '#535B6A', fontSize: 11.38, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: 0.57, lineHeight: '17.07px',
  ...f,
};

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: 14,
  outline: '0.64px rgba(40, 70, 107, 0.46) solid', outlineOffset: -0.64,
  padding: '13px 15px 12px',
  display: 'flex', flexDirection: 'column', gap: 4,
};

const inputStyle: React.CSSProperties = {
  border: 'none', background: 'transparent', outline: 'none', width: '100%',
  color: '#2A1A1A', fontSize: 14, fontWeight: 500, lineHeight: '20px',
  fontFamily: "'DM Sans', sans-serif",
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

  // Photo
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text fields
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('');
  const [faithApproach, setFaithApproach] = useState('faith_integrated');
  const [schedulingUrl, setSchedulingUrl] = useState('');

  // Insurance
  const [insurancePlans, setInsurancePlans] = useState<string[]>([]);
  const [newPlan, setNewPlan] = useState('');
  const [showPlanInput, setShowPlanInput] = useState(false);

  // Fees
  const [feeIndividual, setFeeIndividual] = useState('');
  const [feeCouples, setFeeCouples] = useState('');
  const [feeInitial, setFeeInitial] = useState('');

  // Multi-select
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
        if (data.photo_url) setPhotoUrl(data.photo_url);
        if (data.bio) setBio(data.bio);
        if (data.languages) setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : data.languages);
        if (data.faith_approach) setFaithApproach(data.faith_approach);
        if (data.scheduling_url) setSchedulingUrl(data.scheduling_url);
        if (data.insurances) setInsurancePlans(data.insurances);
        if (data.fee_individual) setFeeIndividual(data.fee_individual);
        if (data.fee_couples) setFeeCouples(data.fee_couples);
        if (data.fee_initial) setFeeInitial(data.fee_initial);
        if (data.specialties) setFocusAreas(data.specialties);
        if (data.approaches) setApproaches(data.approaches);
        if (data.identity) setIdentity(data.identity);
        if (data.visit_type) setVisitType(Array.isArray(data.visit_type) ? data.visit_type : [data.visit_type]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = localStorage.getItem('sila_provider_id');
    if (!id) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const res = await fetch(`/api/onboarding/${id}/photo`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) setPhotoUrl(data.url);
      else setError(data.error ?? 'Photo upload failed.');
    } catch {
      setError('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function toggleSingle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? [] : [item]);
  }

  function addInsurance(plan: string) {
    const t = plan.trim();
    if (t && !insurancePlans.includes(t)) setInsurancePlans((p) => [...p, t]);
  }

  function confirmAddPlan() {
    addInsurance(newPlan);
    setNewPlan('');
    setShowPlanInput(false);
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
          bio: bio || null,
          languages: languages ? languages.split(',').map((l) => l.trim()).filter(Boolean) : [],
          faith_approach: faithApproach,
          scheduling_url: schedulingUrl || null,
          insurances: insurancePlans,
          fee_individual: feeIndividual || null,
          fee_couples: feeCouples || null,
          fee_initial: feeInitial || null,
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

            {/* Photo */}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Photo</div>
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                  ...cardStyle, flexDirection: 'row', alignItems: 'center', gap: 14,
                  cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#E0EEFF', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#1B2C4B', fontSize: 18 }}>+</span>
                  }
                </div>
                <span style={{ color: '#535B6A', fontSize: 14, fontWeight: 400, ...f }}>
                  {uploading ? 'Uploading…' : photoUrl ? 'Tap to change photo' : 'Tap to upload photo'}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Bio</div>
              <div style={cardStyle}>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell clients about your approach…"
                  style={{ ...inputStyle, fontSize: 13, lineHeight: '21px', resize: 'none' }}
                />
              </div>
            </div>

            {/* Languages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Languages</div>
              <div style={cardStyle}>
                <input
                  type="text" value={languages} onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, Urdu, Arabic" style={inputStyle}
                />
              </div>
              <span style={{ color: '#535B6A', fontSize: 11, fontWeight: 400, lineHeight: '16.5px', ...f }}>
                Separate with commas
              </span>
            </div>

            {/* Faith approach */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Faith Approach</div>
              <div style={cardStyle}>
                <select
                  value={faithApproach}
                  onChange={(e) => setFaithApproach(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  {FAITH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Scheduling link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Scheduling Link</div>
              <div style={cardStyle}>
                <input
                  type="url" value={schedulingUrl} onChange={(e) => setSchedulingUrl(e.target.value)}
                  placeholder="calendly.com/your-name" style={inputStyle}
                />
              </div>
            </div>

            {/* Visit type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Visit Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {VISIT_TYPES.map((v) => (
                  <Checkbox key={v} label={v} checked={visitType.includes(v)}
                    onChange={() => toggleSingle(visitType, setVisitType, v)} />
                ))}
              </div>
            </div>

            {/* Focus areas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Focus Areas</div>
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
              <div style={sectionLabel}>Treatment Approaches</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {APPROACHES.map((a) => (
                  <PillToggle key={a} label={a} selected={approaches.includes(a)}
                    onToggle={() => toggle(approaches, setApproaches, a)} />
                ))}
              </div>
            </div>

            {/* Provider identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>Provider Identity</div>
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

            {/* Insurance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 27 }}>
              <div style={sectionLabel}>In-Network Insurance</div>
              <div style={{ ...cardStyle, gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {insurancePlans.map((plan, i) => (
                    <div key={i} style={{
                      background: '#E0EEFF', borderRadius: 10, height: 36,
                      padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ color: '#1B2C4B', fontSize: 13, fontWeight: 500, ...f }}>{plan}</span>
                      <button
                        onClick={() => setInsurancePlans((p) => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 14, lineHeight: 1 }}
                      >✕</button>
                    </div>
                  ))}
                </div>

                {showPlanInput && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input
                      type="text" value={newPlan} onChange={(e) => setNewPlan(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmAddPlan()}
                      placeholder="Plan name" autoFocus
                      style={{
                        flex: 1, height: 36, borderRadius: 10, border: '1px solid rgba(40,70,107,0.3)',
                        padding: '8px 12px', fontSize: 13, color: '#1B2C4B', outline: 'none', ...f,
                      }}
                    />
                    <button onClick={confirmAddPlan} style={{
                      background: '#1B2C4B', color: 'white', border: 'none', borderRadius: 10,
                      padding: '0 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', ...f,
                    }}>Add</button>
                  </div>
                )}

                <button onClick={() => setShowPlanInput(true)} style={{
                  marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.33 8H12.66" stroke="#1B2C4B" strokeWidth="1.33" strokeLinecap="round"/>
                    <path d="M8 3.33V12.66" stroke="#1B2C4B" strokeWidth="1.33" strokeLinecap="round"/>
                  </svg>
                  <span style={{ color: '#1B2C4B', fontSize: 13, fontWeight: 600, ...f }}>Add insurance plan</span>
                </button>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.64px solid rgba(40,70,107,0.15)' }}>
                  <div style={{ color: '#535B6A', fontSize: 10, fontWeight: 400, marginBottom: 8, ...f }}>Quick add:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {QUICK_ADD.map((plan) => (
                      <button key={plan} onClick={() => addInsurance(plan)} style={{
                        background: '#F0F4F8', borderRadius: 8, border: 'none', cursor: 'pointer',
                        padding: '3px 8px', color: '#1B2C4B', fontSize: 10, fontWeight: 500, ...f,
                      }}>{plan}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13.65, marginBottom: 8 }}>
              <div style={sectionLabel}>Out-of-Pocket Fees</div>
              <div style={{ ...cardStyle, gap: 12 }}>
                {[
                  { label: 'Individual session', value: feeIndividual, set: setFeeIndividual, placeholder: '$200–250' },
                  { label: 'Couples session (optional)', value: feeCouples, set: setFeeCouples, placeholder: '$250–300' },
                  { label: 'Initial consultation', value: feeInitial, set: setFeeInitial, placeholder: '$300' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ color: '#535B6A', fontSize: 11, fontWeight: 500, lineHeight: '16.5px', ...f }}>{item.label}</div>
                    <input
                      type="text" value={item.value} onChange={(e) => item.set(e.target.value)}
                      placeholder={item.placeholder}
                      style={{
                        height: 38, borderRadius: 10, border: '0.64px solid rgba(40,70,107,0.3)',
                        padding: '8px 12px', fontSize: 14, fontWeight: 500,
                        color: 'rgba(42,26,26,0.7)', outline: 'none', ...f,
                      }}
                    />
                  </div>
                ))}
              </div>
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
