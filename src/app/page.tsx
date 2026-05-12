'use client';

import Link from 'next/link';
import StatusBar from '@/components/StatusBar';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0e1a2b] p-4">
      <div
        className="relative w-full max-w-[428px] mx-auto overflow-hidden"
        style={{
          height: '926px',
          background: '#1b2c4b',
          borderRadius: 40,
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.4)',
        }}
      >
        {/* Arch shape */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 428 926"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M214,6 C295,6 398,68 398,195 L398,930 L30,930 L30,195 C30,68 133,6 214,6 Z"
            fill="#dce8f5"
          />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <StatusBar />

          {/* Logo area */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h1
              className="text-[58px] font-bold text-[#1b2c4b] leading-none tracking-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sila
            </h1>
            <p
              className="text-[#7a8fa8] text-[15px] mt-3 text-center leading-snug"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The bond between you and better care
            </p>

            {/* Divider with diamond */}
            <div className="flex items-center gap-3 mt-12 w-full px-6">
              <div className="flex-1 h-px bg-[#b8ccd8]" />
              <div className="w-[7px] h-[7px] bg-[#b8ccd8] rotate-45 shrink-0" />
              <div className="flex-1 h-px bg-[#b8ccd8]" />
            </div>
          </div>

          {/* Action cards */}
          <div className="px-7 pb-4 flex flex-col gap-[10px]">
            <Link href="/provider">
              <div
                className="flex items-center gap-4 px-5 py-[18px] rounded-[18px]"
                style={{ backgroundColor: '#1b2c4b' }}
              >
                <div
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#2e4570' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="1.8"/>
                    <line x1="12" y1="12" x2="16" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-[15px] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Find a provider
                  </p>
                  <p className="text-[#8899bb] text-[12px] mt-[2px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Browse verified clinicians
                  </p>
                </div>
                <span className="text-white text-[18px]">→</span>
              </div>
            </Link>

            <Link href="/provider">
              <div
                className="flex items-center gap-4 px-5 py-[18px] rounded-[18px] bg-white relative"
              >
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.18)] border-solid inset-0 pointer-events-none rounded-[18px]"
                />
                <div
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#e0eeff' }}
                >
                  <span className="text-[#1b2c4b] text-[22px] font-light leading-none">+</span>
                </div>
                <div className="flex-1">
                  <p className="text-[#1b2c4b] font-semibold text-[15px] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    List your practice
                  </p>
                  <p className="text-[#6b7a8d] text-[12px] mt-[2px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    For licensed providers
                  </p>
                </div>
                <span className="text-[#1b2c4b] text-[18px]">→</span>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="px-8 pb-10 pt-4">
            <p
              className="text-[11px] text-center text-[#8899aa] leading-[18px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              By continuing, you agree to the{' '}
              <Link href="/terms" className="underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
