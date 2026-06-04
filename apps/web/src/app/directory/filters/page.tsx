'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const ChevronUp = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M13.9692 11.6411L9.31281 6.98468L4.65638 11.6411" stroke="#535B6A" strokeWidth="1.55214" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M4.65649 6.98462L9.31292 11.641L13.9694 6.98462" stroke="#535B6A" strokeWidth="1.55214" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const specialtyTags = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Couples Therapy',
  'Family Therapy', 'Addiction', 'Grief & Loss', 'OCD',
  'Bipolar', 'Eating Disorders', 'ADHD', 'Autism Spectrum',
];

const ageGroups = ['Children (0–12)', 'Teens (13–17)', 'Adults (18–24)', 'Adults (25–64)', 'Seniors (65+)', 'All ages'];
const insuranceOptions = ['In network', 'Out of network', 'Sliding scale', 'No insurance needed'];
const visitTypes = ['In-person', 'Virtual', 'In-person & virtual'];
const languages = ['English', 'Arabic', 'Spanish', 'French', 'Somali', 'Amharic'];
const approaches = ['CBT', 'DBT', 'Psychodynamic', 'EMDR', 'ACT', 'Faith-integrated', 'Humanistic'];
const genders = ['Male', 'Female', 'Non-binary', 'No preference'];

const sections = [
  { key: 'specialty', label: 'Specialty', options: specialtyTags },
  { key: 'age', label: 'Age Group', options: ageGroups },
  { key: 'insurance', label: 'Insurance', options: insuranceOptions },
  { key: 'visitType', label: 'Visit Type', options: visitTypes },
  { key: 'language', label: 'Language', options: languages },
  { key: 'approach', label: 'Therapeutic Approach', options: approaches },
  { key: 'gender', label: 'Provider Gender', options: genders },
];

function FiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? 'all';
  const zip = searchParams.get('zip') ?? '';

  const [openSection, setOpenSection] = useState<string>('specialty');
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [filterSearch, setFilterSearch] = useState('');

  function toggleOption(section: string, option: string) {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(prev[section] ?? []);
      if (set.has(option)) set.delete(option);
      else set.add(option);
      next[section] = set;
      return next;
    });
  }

  function isSelected(section: string, option: string) {
    return selected[section]?.has(option) ?? false;
  }

  const totalSelected = Object.values(selected).reduce((n, s) => n + s.size, 0);

  function handleApply() {
    router.push(`/directory/providers?type=${type}&zip=${zip}`);
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#c8d5e5',
    }}>
      <div style={{
        width: 390,
        height: 844,
        padding: 1,
        background: 'white',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        borderRadius: 40,
        outline: '1px rgba(255, 255, 255, 0.10) solid',
        outlineOffset: -1,
        display: 'inline-flex',
        flexDirection: 'column',
      }}>
        <div style={{
          alignSelf: 'stretch',
          height: 842,
          background: 'white',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}>

          {/* Status bar */}
          <div style={{
            width: 388, height: 52.5,
            paddingLeft: 28, paddingRight: 28, paddingTop: 16, paddingBottom: 16,
            justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex',
          }}>
            <div style={{ color: '#2A1A1A', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '19.5px' }}>9:41</div>
            <div style={{ color: '#2A1A1A', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '16px' }}>●●●</div>
          </div>

          {/* Search bar */}
          <div style={{
            width: 388, height: 73.5,
            paddingTop: 16, paddingLeft: 28, paddingRight: 28,
            flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex',
          }}>
            <div style={{ alignSelf: 'stretch', height: 45.5, position: 'relative' }}>
              <div style={{
                width: 332, height: 45.5,
                paddingLeft: 40, paddingRight: 40, paddingTop: 12, paddingBottom: 12,
                left: 0, top: 0, position: 'absolute',
                background: 'rgba(255, 255, 255, 0.85)', overflow: 'hidden', borderRadius: 14,
                outline: '1px rgba(40, 70, 107, 0.46) solid', outlineOffset: -1,
                justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex',
              }}>
                <input
                  type="text"
                  placeholder="Search filters..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    color: '#A08878', fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                  }}
                />
              </div>
              <div style={{ left: 14, top: 14.75, position: 'absolute' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#1B2C4B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L11.1333 11.1333" stroke="#1B2C4B" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Filter accordion list */}
          <div style={{
            width: 388, flex: '1 1 0',
            paddingLeft: 28, paddingRight: 28,
            overflowY: 'auto',
            flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex',
          }}>
            <div style={{
              width: 332,
              flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start',
              gap: 18.63, display: 'flex', paddingBottom: 16,
            }}>
              {sections.map((section) => {
                const isOpen = openSection === section.key;
                const sectionSelected = selected[section.key]?.size ?? 0;
                const filteredOptions = filterSearch.trim()
                  ? section.options.filter(o => o.toLowerCase().includes(filterSearch.toLowerCase()))
                  : section.options;

                return (
                  <div key={section.key} style={{
                    alignSelf: 'stretch',
                    background: 'rgba(255, 255, 255, 0.50)',
                    overflow: 'hidden',
                    borderRadius: 18.64,
                    outline: '0.74px rgba(40, 70, 107, 0.46) solid',
                    outlineOffset: -0.74,
                  }}>
                    {/* Header row */}
                    <button
                      onClick={() => setOpenSection(isOpen ? '' : section.key)}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        padding: '13.98px 18.63px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#2A1A1A', fontSize: 15.14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '22.71px' }}>
                          {section.label}
                        </span>
                        {sectionSelected > 0 && (
                          <span style={{
                            background: '#1B2C4B', color: 'white',
                            fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                            borderRadius: '50%', width: 18, height: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>{sectionSelected}</span>
                        )}
                      </div>
                      {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {/* Tags */}
                    {isOpen && (
                      <div style={{
                        padding: '4px 19.37px 18px',
                        display: 'flex', flexWrap: 'wrap', gap: 8,
                      }}>
                        {filteredOptions.map((opt) => {
                          const active = isSelected(section.key, opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => toggleOption(section.key, opt)}
                              style={{
                                background: active ? '#1B2C4B' : '#FFEEE2',
                                borderRadius: 18.64,
                                outline: `0.74px rgba(40,70,107,0.46) solid`,
                                outlineOffset: -0.74,
                                border: 'none',
                                padding: '6.99px 16.30px',
                                cursor: 'pointer',
                                color: active ? '#FEF6F0' : '#2A1A1A',
                                fontSize: 12.81,
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                lineHeight: '19.22px',
                                whiteSpace: 'nowrap',
                              }}
                            >{opt}</button>
                          );
                        })}
                        {filteredOptions.length === 0 && (
                          <span style={{ color: '#8A6A5A', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>No matches</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div style={{
            width: 388, height: 87.5,
            paddingTop: 17, paddingLeft: 28, paddingRight: 28,
            borderTop: '1px rgba(240, 216, 200, 0.30) solid',
            flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex',
          }}>
            <button
              onClick={handleApply}
              style={{
                alignSelf: 'stretch', height: 54.5,
                background: '#1B2C4B', borderRadius: 14,
                border: 'none', cursor: 'pointer',
                color: '#FEF6F0', fontSize: 15,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '22.5px',
              }}
            >
              {totalSelected > 0 ? `Show providers (${totalSelected} filter${totalSelected > 1 ? 's' : ''})` : 'Show all providers'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function FiltersPage() {
  return (
    <Suspense>
      <FiltersContent />
    </Suspense>
  );
}
