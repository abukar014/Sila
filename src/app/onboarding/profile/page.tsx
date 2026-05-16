'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const f: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

function StepDots({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i + 1 === current;
        const done = i + 1 < current;
        return (
          <div key={i} style={{
            width: active ? 9 : 7,
            height: active ? 9 : 7,
            borderRadius: '50%',
            background: (active || done) ? '#1B2C4B' : 'rgba(40, 70, 107, 0.46)',
            flexShrink: 0,
          }} />
        );
      })}
      <span style={{ marginLeft: 8, color: '#535B6A', fontSize: 11, fontWeight: 500, lineHeight: '16.5px', ...f }}>
        {current} of {total} · {label}
      </span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14,
      outline: '1px rgba(40, 70, 107, 0.46) solid', outlineOffset: -1,
      ...style,
    }}>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  color: '#535B6A', fontSize: 10, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: '15px',
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle: React.CSSProperties = {
  border: 'none', background: 'transparent', outline: 'none', width: '100%',
  color: '#2A1A1A', fontSize: 14, fontWeight: 500, lineHeight: '20px',
  fontFamily: "'DM Sans', sans-serif",
};

const FAITH_OPTIONS = [
  { label: 'Faith-integrated', value: 'faith_integrated' },
  { label: 'Faith-sensitive', value: 'faith_sensitive' },
  { label: 'Faith-neutral', value: 'faith_neutral' },
  { label: 'Secular', value: 'secular' },
];

const QUICK_ADD = ['Cigna', 'United Healthcare', 'Humana', 'Medicare'];

export default function ProfilePage() {
  const router = useRouter();
  const [faithApproach, setFaithApproach] = useState('faith_integrated');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  const [schedulingUrl, setSchedulingUrl] = useState('');
  const [insurancePlans, setInsurancePlans] = useState<string[]>([]);
  const [newPlan, setNewPlan] = useState('');
  const [showPlanInput, setShowPlanInput] = useState(false);
  const [feeIndividual, setFeeIndividual] = useState('');
  const [feeCouples, setFeeCouples] = useState('');
  const [feeInitial, setFeeInitial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function removeInsurance(index: number) {
    setInsurancePlans((p) => p.filter((_, i) => i !== index));
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

  async function handleContinue() {
    setError('');
    const providerId = localStorage.getItem('sila_provider_id');
    if (!providerId) { router.push('/onboarding/account'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/onboarding/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faith_approach: faithApproach,
          languages: languages ? languages.split(',').map((l) => l.trim()).filter(Boolean) : [],
          bio: bio || null,
          scheduling_url: schedulingUrl || null,
          insurances: insurancePlans,
          fee_individual: feeIndividual || null,
          fee_couples: feeCouples || null,
          fee_initial: feeInitial || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save. Please try again.'); return; }
      router.push('/onboarding/review');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
          background: 'white', zIndex: 10,
        }}>
          <span style={{ color: '#2A1A1A', fontSize: 13, fontWeight: 600, lineHeight: '19.5px' }}>9:41</span>
          <span style={{ color: '#2A1A1A', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>●●●</span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: '1 1 0', overflowY: 'auto', paddingLeft: 28, paddingRight: 28 }}>

          {/* Back + step dots */}
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', padding: 0, ...f }}
            >
              ← Back
            </button>
            <StepDots current={3} total={4} label="Profile" />
          </div>

          {/* Heading */}
          <div style={{ marginTop: 22, fontSize: 26, lineHeight: '39px' }}>
            <span style={{ color: '#0A0A0A', fontWeight: 400 }}>How should clients </span>
            <span style={{ color: '#8A6A5A', fontWeight: 600 }}>find you?</span>
          </div>

          {/* Fields */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Photo upload */}
            <Card style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#E0EEFF', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#1B2C4B', fontSize: 16, fontFamily: "'EB Garamond', serif", fontStyle: 'italic' }}>AR</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={labelStyle}>Photo</div>
                <div style={{ color: '#535B6A', fontSize: 14, fontWeight: 400, lineHeight: '20px', ...f }}>Tap to upload</div>
              </div>
            </Card>

            {/* Faith approach */}
            <Card style={{ padding: '13px 15px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={labelStyle}>Faith approach</div>
              <select
                value={faithApproach}
                onChange={(e) => setFaithApproach(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                {FAITH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Card>

            {/* Languages */}
            <Card style={{ padding: '13px 15px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={labelStyle}>Languages</div>
              <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)}
                placeholder="English, Urdu, Arabic" style={inputStyle} />
            </Card>

            {/* Bio */}
            <Card style={{ padding: '13px 15px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={labelStyle}>Bio</div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell clients about your approach…"
                style={{ ...inputStyle, fontSize: 13, lineHeight: '21.13px', resize: 'none' }}
              />
            </Card>

            {/* Scheduling link */}
            <Card style={{ padding: '13px 15px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={labelStyle}>Scheduling link</div>
              <input type="url" value={schedulingUrl} onChange={(e) => setSchedulingUrl(e.target.value)}
                placeholder="calendly.com/your-name" style={inputStyle} />
            </Card>

            {/* Insurance */}
            <Card style={{ padding: '16px' }}>
              <div style={{ ...labelStyle, color: '#535B6A', marginBottom: 12 }}>In-Network Insurance</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insurancePlans.map((plan, i) => (
                  <div key={i} style={{
                    background: '#E0EEFF', borderRadius: 10, height: 36,
                    padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ color: '#1B2C4B', fontSize: 13, fontWeight: 500, lineHeight: '19.5px', ...f }}>{plan}</span>
                    <button onClick={() => removeInsurance(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B2C4B', fontSize: 14, lineHeight: 1 }}>✕</button>
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
                marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33 8H12.66" stroke="#1B2C4B" strokeWidth="1.33" strokeLinecap="round"/>
                  <path d="M8 3.33V12.66" stroke="#1B2C4B" strokeWidth="1.33" strokeLinecap="round"/>
                </svg>
                <span style={{ color: '#1B2C4B', fontSize: 13, fontWeight: 600, lineHeight: '19.5px', ...f }}>Add insurance plan</span>
              </button>

              <div style={{ marginTop: 16, paddingTop: 13, borderTop: '0.64px solid rgba(40,70,107,0.15)' }}>
                <div style={{ color: '#535B6A', fontSize: 10, fontWeight: 400, lineHeight: '15px', marginBottom: 8, ...f }}>Quick add:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {QUICK_ADD.map((plan) => (
                    <button key={plan} onClick={() => addInsurance(plan)} style={{
                      background: '#F0F4F8', borderRadius: 8, border: 'none', cursor: 'pointer',
                      padding: '3.63px 8px', color: '#1B2C4B', fontSize: 10, fontWeight: 500, lineHeight: '15px', ...f,
                    }}>{plan}</button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Fees */}
            <Card style={{ padding: '16px' }}>
              <div style={{ ...labelStyle, marginBottom: 12 }}>Out-of-Pocket Fees</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Individual session', value: feeIndividual, set: setFeeIndividual, placeholder: '$200-250' },
                  { label: 'Couples session (optional)', value: feeCouples, set: setFeeCouples, placeholder: 'e.g. $250-300' },
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
            </Card>

            {error && <div style={{ color: '#c0392b', fontSize: 12, lineHeight: '18px' }}>{error}</div>}

          </div>

          <div style={{ height: 28 }} />
        </div>

        {/* Fixed bottom bar */}
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid rgba(240, 216, 200, 0.30)',
          paddingLeft: 28, paddingRight: 28, paddingTop: 20, paddingBottom: 28,
        }}>
          <button
            onClick={handleContinue}
            disabled={loading}
            style={{
              width: '100%', height: 54.5,
              background: '#1B2C4B', borderRadius: 14, border: 'none', cursor: 'pointer',
              color: '#FEF6F0', fontSize: 15, fontWeight: 600, lineHeight: '22.5px',
              fontFamily: "'DM Sans', sans-serif",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </div>

      </div>
    </main>
  );
}
