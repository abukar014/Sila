'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LocationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? 'all';
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = zip.trim();
    if (!/^\d{5}$/.test(clean)) {
      setError('Please enter a valid 5-digit zip code.');
      return;
    }
    router.push(`/directory/providers?type=${type}&zip=${clean}`);
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
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}>

          {/* Status bar */}
          <div style={{
            width: 388,
            height: 51.5,
            paddingLeft: 28,
            paddingRight: 28,
            paddingTop: 16,
            paddingBottom: 16,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            display: 'inline-flex',
          }}>
            <div style={{
              color: '#2A1A1A',
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              lineHeight: '19.5px',
            }}>9:41</div>
            <div style={{
              color: '#2A1A1A',
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              lineHeight: '16px',
            }}>●●●</div>
          </div>

          {/* Nav bar with back button */}
          <div style={{
            width: 388,
            paddingLeft: 28,
            paddingRight: 28,
            paddingBottom: 8,
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#1B2C4B',
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                lineHeight: '19.5px',
              }}
            >← Back</button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            paddingLeft: 18.2,
            paddingRight: 18.2,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 23.66,
            display: 'flex',
          }}>

            {/* Illustration + step label */}
            <div style={{
              height: 180,
              paddingLeft: 81.73,
              paddingRight: 81.73,
              justifyContent: 'center',
              alignItems: 'center',
              display: 'inline-flex',
            }}>
              <div style={{
                width: 188.62,
                height: 180,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  left: 24.07,
                  top: 18,
                  position: 'absolute',
                  color: '#8A6A5A',
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  lineHeight: '16.5px',
                  letterSpacing: 2,
                }}>STEP 01 - LOCATION</div>

                {/* Map pin SVG */}
                <div style={{
                  width: 114,
                  height: 114,
                  left: 37.07,
                  top: 50,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="40" cy="94" rx="20" ry="6" fill="#F0D8C8" opacity="0.6"/>
                    <path d="M40 0C22.3 0 8 14.3 8 32C8 56 40 88 40 88C40 88 72 56 72 32C72 14.3 57.7 0 40 0Z" fill="#FEF6F0" stroke="#F0D8C8" strokeWidth="2"/>
                    <circle cx="40" cy="32" r="14" fill="#8A6A5A" opacity="0.3"/>
                    <circle cx="40" cy="32" r="8" fill="#8A3520"/>
                    <circle cx="37" cy="29" r="2.5" fill="white" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Headline + description */}
            <div style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 12,
              display: 'flex',
              paddingLeft: 8,
              paddingRight: 8,
            }}>
              <div style={{
                width: 352,
                textAlign: 'center',
                color: '#2A1A1A',
                fontSize: 23.58,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                lineHeight: '28.29px',
              }}>Where are you looking for care?</div>
              <div style={{
                width: 352,
                textAlign: 'center',
                color: '#8A6A5A',
                fontSize: 11.79,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                lineHeight: '19.16px',
              }}>Enter your zip code to find verified providers near you. We never share your location with providers without your consent.</div>
            </div>

            {/* Zip code form */}
            <form onSubmit={handleSubmit} style={{
              width: '100%',
              paddingLeft: 8,
              paddingRight: 8,
              flexDirection: 'column',
              gap: 9.43,
              display: 'flex',
            }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter zip code"
                value={zip}
                onChange={(e) => {
                  setError('');
                  setZip(e.target.value.replace(/\D/g, ''));
                }}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 11,
                  border: error ? '1.5px solid #8A3520' : '1.5px solid #F0D8C8',
                  background: '#FEF6F0',
                  padding: '0 16px',
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: '#2A1A1A',
                  outline: 'none',
                  letterSpacing: 2,
                }}
              />
              {error && (
                <div style={{
                  color: '#8A3520',
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  marginTop: -4,
                }}>{error}</div>
              )}
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: 42.83,
                  background: zip.length === 5 ? '#1B2C4B' : '#8A9BB5',
                  borderRadius: 11,
                  border: 'none',
                  cursor: zip.length === 5 ? 'pointer' : 'default',
                  color: 'white',
                  fontSize: 11.79,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  lineHeight: '17.68px',
                  transition: 'background 0.15s',
                }}
              >Find providers</button>
            </form>

            {/* Feature cards */}
            <div style={{
              width: 352,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 9.43,
              display: 'flex',
              paddingLeft: 8,
              paddingRight: 8,
            }}>
              {[
                { emoji: '📍', title: 'Find nearby providers', sub: 'See verified clinicians in your area' },
                { emoji: '🔒', title: 'Private by default', sub: 'Your zip code is never stored or shared' },
              ].map((card) => (
                <div key={card.title} style={{
                  alignSelf: 'stretch',
                  paddingTop: 13.36,
                  paddingBottom: 13.36,
                  paddingLeft: 13.36,
                  paddingRight: 13.36,
                  background: 'rgba(255, 255, 255, 0.65)',
                  borderRadius: 12.57,
                  outline: '0.79px #F0D8C8 solid',
                  outlineOffset: -0.79,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 9.43,
                  display: 'inline-flex',
                }}>
                  <div style={{
                    width: 31.44,
                    height: 31.44,
                    background: '#FEF6F0',
                    borderRadius: 11,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 14.15 }}>{card.emoji}</div>
                  </div>
                  <div style={{ flexDirection: 'column', gap: 3.14, display: 'flex' }}>
                    <div style={{
                      color: '#2A1A1A',
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      lineHeight: '15.72px',
                    }}>{card.title}</div>
                    <div style={{
                      color: '#606D85',
                      fontSize: 9.43,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 400,
                      lineHeight: '12.57px',
                    }}>{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footnote */}
            <div style={{
              width: '100%',
              textAlign: 'center',
              color: '#606D85',
              fontSize: 8.65,
              fontFamily: "'DM Sans', sans-serif",
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: '12.97px',
            }}>We use your zip code only to show nearby providers. It is never stored.</div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function LocationPage() {
  return (
    <Suspense>
      <LocationContent />
    </Suspense>
  );
}
