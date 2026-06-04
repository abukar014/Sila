import Link from 'next/link';

const categories = [
  {
    emoji: '👤',
    title: 'Individual therapy',
    subtitle: 'One-on-one support for anxiety, depression, life transitions',
    type: 'individual',
    active: true,
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Family/couples therapy',
    subtitle: 'Support for family dynamics and relationship challenges',
    type: 'family',
    active: false,
  },
  {
    emoji: '💊',
    title: 'Psychiatry',
    subtitle: 'Psychiatric evaluation and medication support',
    type: 'psychiatry',
    active: false,
  },
  {
    emoji: '🧠',
    title: 'Clinical psychologist',
    subtitle: 'Doctoral-level assessment & evidence-based therapy',
    type: 'psychologist',
    active: false,
  },
  {
    emoji: '💭',
    title: 'See all providers',
    subtitle: 'Browse all providers and explore options',
    type: 'all',
    active: false,
  },
];

export default function DirectoryMenuPage() {
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
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}>
        <div style={{
          alignSelf: 'stretch',
          height: 842,
          background: '#FEF6F0',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
        }}>

          {/* Nav bar */}
          <div style={{
            width: 388,
            height: 52.5,
            paddingLeft: 28,
            paddingRight: 28,
            paddingTop: 16,
            paddingBottom: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex',
          }}>
            <Link href="/" style={{
              width: 46.79,
              height: 19.5,
              position: 'relative',
              textDecoration: 'none',
            }}>
              <div style={{
                left: 1,
                top: 0,
                position: 'absolute',
                textAlign: 'center',
                color: '#1B2C4B',
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                lineHeight: '19.5px',
              }}>← Back</div>
            </Link>
            <div style={{
              width: 38,
              height: 16,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              display: 'flex',
            }}>
              <div style={{
                flex: '1 1 0',
                color: '#2A1A1A',
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                lineHeight: '16px',
              }}>●●●</div>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{
            width: 388,
            flex: '1 1 0',
            overflow: 'hidden',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            display: 'flex',
            position: 'relative',
          }}>

            {/* Arabic watermark */}
            <div style={{
              position: 'absolute', top: -10, right: -20,
              fontFamily: "var(--font-noto-naskh-arabic), serif",
              fontSize: 180, color: '#8A6A5A', opacity: 0.06,
              pointerEvents: 'none', userSelect: 'none', lineHeight: 1, zIndex: 0,
            }}>صلة</div>

            <div style={{
              alignSelf: 'stretch',
              paddingTop: 32,
              paddingLeft: 28,
              paddingRight: 28,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 32,
              display: 'flex',
              position: 'relative', zIndex: 1,
            }}>

              {/* Header */}
              <div style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 12,
                display: 'flex',
              }}>
                <div style={{
                  color: '#8A6A5A',
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  lineHeight: '16.5px',
                  letterSpacing: 2,
                }}>find a provider</div>
                <div style={{ alignSelf: 'stretch' }}>
                  <span style={{
                    fontFamily: "var(--font-eb-garamond), serif",
                    fontStyle: 'italic',
                    color: '#2A1A1A',
                    fontSize: 34,
                    fontWeight: 400,
                    lineHeight: '1.15',
                  }}>What type of help </span>
                  <span style={{
                    fontFamily: "var(--font-eb-garamond), serif",
                    fontStyle: 'italic',
                    color: '#8A6A5A',
                    fontSize: 34,
                    fontWeight: 400,
                    lineHeight: '1.15',
                  }}>are you looking for?</span>
                </div>
                <div style={{
                  color: '#8A6A5A',
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  lineHeight: '21.13px',
                }}>We'll help you find the right provider for your needs.</div>
              </div>

              {/* Category cards */}
              <div style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 12,
                display: 'flex',
              }}>
                {categories.map((cat) => (
                  <Link
                    key={cat.type}
                    href={`/directory/location?type=${cat.type}`}
                    style={{
                      alignSelf: 'stretch',
                      height: 99.5,
                      position: 'relative',
                      background: cat.active ? '#FEF6F0' : 'rgba(255, 255, 255, 0.70)',
                      borderRadius: 16,
                      outline: '1px #F0D8C8 solid',
                      outlineOffset: -1,
                      display: 'block',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      left: 17,
                      top: 17,
                      position: 'absolute',
                      background: '#FEF6F0',
                      borderRadius: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                      display: 'inline-flex',
                    }}>
                      <div style={{ fontSize: 24, lineHeight: '32px' }}>{cat.emoji}</div>
                    </div>
                    <div style={{
                      width: 200,
                      height: 65.5,
                      left: 81,
                      top: 17,
                      position: 'absolute',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 4,
                      display: 'inline-flex',
                    }}>
                      <div style={{
                        color: '#2A1A1A',
                        fontSize: 15,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        lineHeight: '22.5px',
                      }}>{cat.title}</div>
                      <div style={{
                        color: '#8A6A5A',
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        lineHeight: '19.5px',
                      }}>{cat.subtitle}</div>
                    </div>
                    <div style={{
                      left: 297,
                      top: 29,
                      position: 'absolute',
                      color: '#8A3520',
                      fontSize: 18,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      lineHeight: '27px',
                    }}>→</div>
                  </Link>
                ))}
              </div>

              {/* Crisis banner */}
              <div style={{
                alignSelf: 'stretch',
                paddingTop: 17,
                paddingBottom: 1,
                paddingLeft: 17,
                paddingRight: 17,
                background: '#FFF8F0',
                borderRadius: 16,
                outline: '1px #F0D8C8 solid',
                outlineOffset: -1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
              }}>
                <div style={{ alignSelf: 'stretch', paddingBottom: 16 }}>
                  <span style={{
                    color: '#8A3520',
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    lineHeight: '17.88px',
                  }}>Need immediate help? </span>
                  <span style={{
                    color: '#8A6A5A',
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400,
                    lineHeight: '17.88px',
                  }}>If you're in crisis, call 988 (Suicide & Crisis Lifeline) or text "HELLO" to 741741 (Crisis Text Line).</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
