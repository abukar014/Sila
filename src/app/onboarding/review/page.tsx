'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';
import ProgressIndicator from '@/components/ProgressIndicator';

export default function ReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checklistItems = [
    'Identity & email confirmed',
    'NPI · License submitted',
    'Profile content complete',
    'Photo & scheduling link added',
  ];

  async function handleSubmit() {
    setError('');
    const providerId = localStorage.getItem('sila_provider_id');
    if (!providerId) {
      router.push('/onboarding/account');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/onboarding/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: 'pending' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit. Please try again.');
        return;
      }
      router.push('/onboarding/pending');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="flex flex-col h-full w-full">
          <StatusBar />

          <div className="flex flex-col flex-1 w-full px-[28px]">
            <ProgressIndicator currentStep={4} totalSteps={4} stepLabel="Review" />

            <div className="mt-[24px]">
              <h1
                className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Ready to submit.
              </h1>
              <p
                className="font-normal leading-[21.125px] text-[#535b6a] text-[13px] mt-[6px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                Quick check before we begin verification.
              </p>
            </div>

            <div className="flex flex-col gap-0 mt-[24px]">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-[12px] py-[8px]">
                  <div className="bg-[#1b2c4b] rounded-full size-[20px] flex items-center justify-center shrink-0">
                    <p
                      className="font-bold leading-[16.5px] text-[11px] text-white"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      ✓
                    </p>
                  </div>
                  <p
                    className="font-normal leading-[19.5px] text-[#2a1a1a] text-[13px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#e0eeff] rounded-[14px] px-[16px] pt-[14px] pb-[14px] mt-[16px]">
              <p
                className="font-semibold leading-[15px] text-[#1b2c4b] text-[10px] tracking-[0.6px] uppercase mb-[6px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
              >
                What happens next
              </p>
              <p
                className="font-normal leading-[19.5px] text-[#2a1a1a] text-[12px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                Automated checks run immediately. Human review of your state license takes up to 3
                business days. We&apos;ll email you when you&apos;re live.
              </p>
            </div>

            {error && (
              <p
                className="mt-[12px] text-[12px] leading-[18px]"
                style={{ color: '#c0392b', fontFamily: "'DM Sans', sans-serif" }}
              >
                {error}
              </p>
            )}

            {/* Spacer pushes button to bottom */}
            <div className="flex-1" />

            <div className="pb-[32px] pt-[20px]">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#1b2c4b] h-[54.5px] w-full rounded-[14px] flex items-center justify-center"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <p
                  className="font-semibold leading-[22.5px] text-[#fef6f0] text-[15px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  {loading ? 'Submitting…' : 'Submit for verification'}
                </p>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
