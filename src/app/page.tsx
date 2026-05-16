import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#c8d5e5',
    }}>
      <div style={{
        width: 395,
        height: 844,
        position: 'relative',
        background: 'linear-gradient(180deg, #1B2C4B 0%, #9FB4DD 100%)',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        borderRadius: 40,
        outline: '1px rgba(255, 255, 255, 0.10) solid',
        outlineOffset: -1,
      }}>

        {/* Arch */}
        <div style={{ left: 0, top: 65, position: 'absolute' }}>
          <svg width="395" height="796" viewBox="0 0 395 796" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-outside-1_97_4432" maskUnits="userSpaceOnUse" x="-2" y="-0.44043" width="398" height="821" fill="black">
              <rect fill="white" x="-2" y="-0.44043" width="398" height="821"/>
              <path d="M11.5488 770.623C11.2016 676.82 10.4391 418.035 11.6934 218.709C11.804 201.134 12.1939 185.51 12.8229 171.65C16.5223 90.1299 134.195 64.6569 200.117 16.5596C259.148 67.0568 375.499 95.5047 380.966 172.995C381.903 186.283 382.453 201.445 382.538 218.709C383.363 386.622 382.878 658.478 382.643 763.368C382.615 775.773 382.601 781.976 380.741 786.992C377.695 795.206 371.203 801.683 362.983 804.711C357.963 806.56 351.694 806.56 339.158 806.56H47.7774C37.3496 806.56 32.1358 806.56 27.9561 805.022C21.1131 802.504 15.7029 797.113 13.1596 790.28C11.6061 786.106 11.587 780.945 11.5488 770.623Z"/>
            </mask>
            <path d="M11.5488 770.623C11.2016 676.82 10.4391 418.035 11.6934 218.709C11.804 201.134 12.1939 185.51 12.8229 171.65C16.5223 90.1299 134.195 64.6569 200.117 16.5596C259.148 67.0568 375.499 95.5047 380.966 172.995C381.903 186.283 382.453 201.445 382.538 218.709C383.363 386.622 382.878 658.478 382.643 763.368C382.615 775.773 382.601 781.976 380.741 786.992C377.695 795.206 371.203 801.683 362.983 804.711C357.963 806.56 351.694 806.56 339.158 806.56H47.7774C37.3496 806.56 32.1358 806.56 27.9561 805.022C21.1131 802.504 15.7029 797.113 13.1596 790.28C11.6061 786.106 11.587 780.945 11.5488 770.623Z" fill="white"/>
            <path d="M11.6934 218.709L24.6932 218.79L11.6934 218.709ZM11.5488 770.623L24.5487 770.575L11.5488 770.623ZM382.643 763.368L369.643 763.339V763.339L382.643 763.368ZM382.538 218.709L369.538 218.773V218.773L382.538 218.709ZM12.8229 171.65L-0.163766 171.06L12.8229 171.65ZM380.966 172.995L367.998 173.91V173.91L380.966 172.995ZM200.117 16.5596L208.568 6.68089L200.117 -5.14984e-05L192.455 6.05765L200.117 16.5596ZM362.983 804.711L367.476 816.909L367.476 816.909L362.983 804.711ZM380.741 786.992L392.93 791.513V791.513L380.741 786.992ZM13.1596 790.28L25.3431 785.745H25.3431L13.1596 790.28ZM27.9561 805.022L32.4454 792.821L32.4454 792.821L27.9561 805.022ZM11.6934 218.709L-1.30633 218.627C-2.5611 418.025 -1.79829 676.868 -1.45111 770.671L11.5488 770.623L24.5487 770.575C24.2015 676.772 23.4393 418.045 24.6932 218.79L11.6934 218.709ZM47.7774 806.56V819.56H339.158V806.56V793.56H47.7774V806.56ZM382.643 763.368L395.643 763.397C395.878 658.515 396.364 386.612 395.538 218.645L382.538 218.709L369.538 218.773C370.363 386.631 369.878 658.441 369.643 763.339L382.643 763.368ZM12.8229 171.65L-0.163766 171.06C-0.801627 185.116 -1.19485 200.911 -1.30633 218.627L11.6934 218.709L24.6932 218.79C24.8029 201.356 25.1894 185.904 25.8095 172.239L12.8229 171.65ZM382.538 218.709L395.538 218.645C395.452 201.148 394.895 185.698 393.934 172.08L380.966 172.995L367.998 173.91C368.912 186.867 369.454 201.741 369.538 218.773L382.538 218.709ZM380.966 172.995L393.934 172.08C390.707 126.341 354.746 96.7895 317.495 73.6165C298.646 61.8907 277.739 50.8077 258.939 40.1102C239.737 29.1837 222.321 18.4458 208.568 6.68089L200.117 16.5596L191.667 26.4382C207.429 39.9219 226.694 51.6765 246.081 62.7079C265.87 73.9683 285.461 84.3086 303.762 95.6933C340.811 118.741 365.758 142.159 367.998 173.91L380.966 172.995ZM200.117 16.5596L192.455 6.05765C176.881 17.4208 157.981 27.6308 137.636 38.0486C117.607 48.3047 96.0254 58.8322 76.5132 70.3849C37.9493 93.2176 2.0122 123.111 -0.163766 171.06L12.8229 171.65L25.8095 172.239C27.333 138.669 52.0817 115.066 89.7595 92.7576C108.368 81.7399 128.796 71.7858 149.487 61.1909C169.862 50.7576 190.393 39.747 207.78 27.0615L200.117 16.5596ZM339.158 806.56V819.56C350.552 819.56 359.733 819.761 367.476 816.909L362.983 804.711L358.489 792.512C356.193 793.358 352.836 793.56 339.158 793.56V806.56ZM382.643 763.368L369.643 763.339C369.613 776.871 369.405 780.173 368.552 782.471L380.741 786.992L392.93 791.513C395.798 783.779 395.618 774.676 395.643 763.397L382.643 763.368ZM362.983 804.711L367.476 816.909C379.26 812.569 388.563 803.287 392.93 791.513L380.741 786.992L368.552 782.471C366.826 787.124 363.146 790.796 358.489 792.512L362.983 804.711ZM11.5488 770.623L-1.45111 770.671C-1.41707 779.869 -1.58749 787.926 0.976058 794.814L13.1596 790.28L25.3431 785.745C24.7997 784.285 24.5911 782.021 24.5487 770.575L11.5488 770.623ZM47.7774 806.56V793.56C36.2102 793.56 33.9045 793.358 32.4454 792.821L27.9561 805.022L23.4667 817.222C30.367 819.761 38.4891 819.56 47.7774 819.56V806.56ZM13.1596 790.28L0.976051 794.814C4.84267 805.203 13.0633 813.394 23.4667 817.222L27.9561 805.022L32.4454 792.821C29.1629 791.613 26.5631 789.023 25.3431 785.745L13.1596 790.28Z" fill="#1B2C4B" mask="url(#path-1-outside-1_97_4432)"/>
          </svg>
        </div>

        {/* Logo + tagline */}
        <div style={{
          width: 332, height: 138, left: 29, top: 204,
          position: 'absolute',
          flexDirection: 'column', justifyContent: 'center',
          alignItems: 'flex-start', gap: 16, display: 'inline-flex',
        }}>
          <div style={{ alignSelf: 'stretch', height: 64, position: 'relative' }}>
            <div style={{
              width: 120, height: 74, left: 106, top: -18,
              position: 'absolute', textAlign: 'center',
              justifyContent: 'center', display: 'flex', flexDirection: 'column',
              color: '#1B2C4B', fontSize: 96,
              fontFamily: 'var(--font-instrument-serif), serif',
              fontWeight: 400, lineHeight: '48px',
            }}>
              Sila
            </div>
          </div>
          <div style={{
            alignSelf: 'stretch', textAlign: 'center',
            color: '#75839C', fontSize: 16,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400, lineHeight: '20px',
          }}>
            The bond between you and better care
          </div>
        </div>

        {/* Buttons + footer */}
        <div style={{ width: 332, height: 336.5, left: 29, top: 402, position: 'absolute' }}>

          {/* Find a provider */}
          <Link href="/directory" style={{
            width: 332, height: 86, padding: 20,
            left: 0, top: 95.5, position: 'absolute',
            background: '#1B2C4B', borderRadius: 16,
            justifyContent: 'flex-start', alignItems: 'center',
            gap: 14, display: 'inline-flex', textDecoration: 'none',
          }}>
            <div style={{
              width: 46, height: 46,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 14,
              justifyContent: 'center', alignItems: 'center',
              display: 'flex', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#F6FCFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'inline-flex' }}>
              <div style={{ color: '#F6FCFF', fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '24px' }}>Find a provider</div>
              <div style={{ color: '#E0EEFF', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '16px' }}>Browse verified clinicians</div>
            </div>
            <div style={{ color: '#F6FCFF', fontSize: 18, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>→</div>
          </Link>

          {/* List your practice */}
          <Link href="/provider" style={{
            width: 332, height: 88, padding: 20,
            left: 0, top: 197.5, position: 'absolute',
            background: 'rgba(255, 255, 255, 0.75)', borderRadius: 16,
            outline: '1px #F0D8C8 solid', outlineOffset: -1,
            justifyContent: 'flex-start', alignItems: 'center',
            gap: 14, display: 'inline-flex', textDecoration: 'none',
          }}>
            <div style={{
              width: 46, height: 46, background: '#FEF6F0', borderRadius: 14,
              justifyContent: 'center', alignItems: 'center',
              display: 'flex', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9.99984 4.16663V15.8333M4.1665 9.99996H15.8332" stroke="#1B2C4B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'inline-flex' }}>
              <div style={{ color: '#1B2C4B', fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, lineHeight: '24px' }}>List your practice</div>
              <div style={{ color: '#838383', fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '16px' }}>For licensed providers</div>
            </div>
            <div style={{ color: '#1B2C4B', fontSize: 18, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>→</div>
          </Link>

          {/* Footer */}
          <div style={{ width: 332, left: 0, top: 302.5, position: 'absolute', textAlign: 'center' }}>
            <span style={{ color: '#9CA4B2', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '16.5px' }}>By continuing, you agree to the </span>
            <Link href="/terms" style={{ color: '#9CA4B2', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, textDecoration: 'underline', lineHeight: '16.5px' }}>Terms of Service</Link>
            <span style={{ color: '#9CA4B2', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: '16.5px' }}> and </span>
            <Link href="/privacy" style={{ color: '#9CA4B2', fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, textDecoration: 'underline', lineHeight: '16.5px' }}>Privacy Policy</Link>
          </div>

        </div>
      </div>
    </main>
  );
}
