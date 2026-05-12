'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';

const steps = [
  'Create an account',
  'NPI · License submitted',
  'Profile and bio complete',
  'Automatic and human check of license',
];

export default function ProviderLandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="flex flex-col h-full w-full">
          <StatusBar />

          <div className="flex flex-col flex-1 w-full px-[28px] pt-[20px] pb-[32px]">
            {/* Back */}
            <button
              onClick={() => router.back()}
              className="text-[#1b2c4b] text-[13px] mb-[28px] text-left"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ← Back
            </button>

            {/* Header */}
            <p
              className="font-semibold text-[11px] tracking-[2px] uppercase text-[#1b2c4b] mb-[10px]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
            >
              For Providers
            </p>
            <h1
              className="text-[32px] leading-[38px] text-[#0a0a0a] mb-[10px]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Be found by the clients{' '}
              <span className="font-bold">you&apos;re meant to serve</span>
            </h1>
            <p
              className="text-[13px] leading-[21px] text-[#535b6a] mb-[28px]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
            >
              Free to list. Verified once. Inquiries come straight to you.
            </p>

            {/* Feature cards */}
            <div className="flex flex-col gap-[10px] mb-auto">
              {/* No middleman */}
              <div className="bg-white rounded-[14px] px-[16px] py-[14px] relative">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.18)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold text-[10px] tracking-[1.5px] uppercase text-[#535b6a] mb-[4px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  No Middleman
                </p>
                <p
                  className="text-[13px] text-[#2a1a1a]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Clients book directly with you.
                </p>
              </div>

              {/* No PHI */}
              <div className="bg-white rounded-[14px] px-[16px] py-[14px] relative">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.18)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold text-[10px] tracking-[1.5px] uppercase text-[#535b6a] mb-[4px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  No PHI
                </p>
                <p
                  className="text-[13px] text-[#2a1a1a]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  We never see your patient information.
                </p>
              </div>

              {/* Verification process */}
              <div className="bg-white rounded-[14px] px-[16px] py-[14px] relative">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.18)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold text-[10px] tracking-[1.5px] uppercase text-[#535b6a] mb-[4px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Our Verification Process
                </p>
                <p
                  className="text-[13px] text-[#2a1a1a] mb-[12px]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Our 4-step process based on security and trust.
                </p>
                <div className="flex flex-col gap-[8px]">
                  {steps.map((step) => (
                    <div key={step} className="flex items-center gap-[10px]">
                      <div className="w-[20px] h-[20px] rounded-full bg-[#1b2c4b] flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold leading-none">✓</span>
                      </div>
                      <p
                        className="text-[13px] text-[#2a1a1a]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-[10px] mt-[28px]">
              <Link href="/onboarding/account">
                <button
                  className="bg-[#1b2c4b] h-[54px] w-full rounded-[14px] flex items-center justify-center"
                >
                  <p
                    className="font-semibold text-[15px] text-[#fef6f0]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Get started
                  </p>
                </button>
              </Link>

              <Link href="/onboarding/sign-in">
                <button className="h-[51px] w-full rounded-[14px] flex items-center justify-center relative">
                  <div
                    aria-hidden="true"
                    className="absolute border-[1.5px] border-[#1b2c4b] border-solid inset-0 pointer-events-none rounded-[14px]"
                  />
                  <p
                    className="font-semibold text-[14px] text-[#1b2c4b]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Sign in
                  </p>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
