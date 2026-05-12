'use client';

import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';

export default function PendingPage() {
  const router = useRouter();

  const verificationSteps = [
    { title: 'NPPES identity match', status: 'Confirmed · 12s', completed: true },
    { title: 'OIG exclusion list', status: 'No exclusions found', completed: true },
    { title: 'SAM.gov check', status: 'Clear', completed: true },
    { title: 'Texas state license', status: 'Awaiting reviewer', completed: false },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="flex flex-col h-full w-full">
          <StatusBar />

          <div className="flex flex-col flex-1 w-full px-[28px]">
            <div className="text-center pt-[24px]">
              <h1
                className="font-normal italic leading-[42px] text-[#0a0a0a] text-[28px]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Almost there.
              </h1>
              <p
                className="font-normal leading-[19.5px] text-[#535b6a] text-[13px] mt-[6px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                3 of 4 checks complete.
              </p>
            </div>

            <div className="mt-[32px] flex flex-col">
              {verificationSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[12px] py-[12px] border-b border-[rgba(137,160,187,0.46)] last:border-b-0"
                >
                  <div
                    className={`rounded-full size-[26px] flex items-center justify-center shrink-0 ${
                      step.completed ? 'bg-[#1b2c4b]' : 'bg-[#c89849]'
                    }`}
                  >
                    <p
                      className="font-bold leading-[19.5px] text-[13px] text-white"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      {step.completed ? '✓' : '○'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-semibold leading-[20px] text-[#0a0a0a] text-[14px]"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      {step.title}
                    </p>
                    <div className="flex items-center gap-[6px] mt-[2px]">
                      {!step.completed && (
                        <div className="bg-[#c89849] rounded-full size-[7px] shrink-0" />
                      )}
                      <p
                        className="font-normal leading-[16.5px] text-[#535b6a] text-[11px]"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                      >
                        {step.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p
              className="font-normal leading-[16px] text-[#535b6a] text-[12px] text-center mt-[16px]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
            >
              We&apos;ll email you when complete.
            </p>

            {/* Spacer */}
            <div className="flex-1" />

            <div className="pb-[32px] pt-[20px]">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-[#1b2c4b] h-[54.5px] w-full rounded-[14px] flex items-center justify-center"
              >
                <p
                  className="font-semibold leading-[22.5px] text-[#fef6f0] text-[15px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Close and check back later
                </p>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
