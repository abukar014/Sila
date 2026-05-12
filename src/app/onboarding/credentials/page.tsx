'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';
import ProgressIndicator from '@/components/ProgressIndicator';

export default function CredentialsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    npi: '',
    dob: '',
    licenseNumber: '',
    licenseType: '',
    licenseState: '',
    specialty: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setError('');

    if (!formData.npi || !formData.dob || !formData.licenseNumber || !formData.licenseType || !formData.licenseState) {
      setError('All fields except specialty are required.');
      return;
    }

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
        body: JSON.stringify({
          npi: formData.npi,
          dob: formData.dob,
          license_number: formData.licenseNumber,
          license_type: formData.licenseType,
          credentials: formData.licenseType,
          state: formData.licenseState,
          specialties: formData.specialty ? [formData.specialty] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save. Please try again.');
        return;
      }
      router.push('/onboarding/profile');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSaveAndExit() {
    router.push('/');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-full">
          <StatusBar />

          <div className="flex-1 relative w-full">
            <div className="px-[28px]">
              <ProgressIndicator currentStep={2} totalSteps={4} stepLabel="Credentials" />

              <div className="mt-[24px]">
                <h1
                  className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px]"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  Tell us how to verify you.
                </h1>
                <p
                  className="font-normal leading-[21.125px] text-[#535b6a] text-[13px] mt-[6px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                >
                  We check this against NPPES, OIG, and your state board.
                </p>
              </div>

              <div className="flex flex-col gap-[10px] mt-[24px]">
                {/* NPI */}
                <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] relative">
                  <div
                    aria-hidden="true"
                    className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                  />
                  <p
                    className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    NPI number
                  </p>
                  <input
                    type="text"
                    value={formData.npi}
                    onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                    placeholder="10-digit NPI"
                    className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  />
                </div>

                {/* Date of birth */}
                <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] relative">
                  <div
                    aria-hidden="true"
                    className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                  />
                  <p
                    className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Date of birth
                  </p>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  />
                </div>

                {/* License # and type */}
                <div className="flex gap-[8px]">
                  <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] flex-1 relative">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                    />
                    <p
                      className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      License #
                    </p>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    />
                  </div>

                  <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] flex-1 relative">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                    />
                    <p
                      className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      License type
                    </p>
                    <input
                      type="text"
                      value={formData.licenseType}
                      onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                      placeholder="MD, LCSW…"
                      className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    />
                  </div>
                </div>

                {/* License state and specialty */}
                <div className="flex gap-[8px]">
                  <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] flex-1 relative">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                    />
                    <p
                      className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      License state
                    </p>
                    <input
                      type="text"
                      value={formData.licenseState}
                      onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                      placeholder="Texas"
                      className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    />
                  </div>

                  <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] flex-1 relative">
                    <div
                      aria-hidden="true"
                      className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                    />
                    <p
                      className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    >
                      Specialty
                    </p>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      placeholder="Psychiatry"
                      className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p
                  className="mt-[12px] text-[12px] leading-[18px]"
                  style={{ color: '#c0392b', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="absolute bottom-0 w-full px-[28px] pb-[32px] pt-[20px] flex flex-col gap-[10px]">
              <button
                onClick={handleContinue}
                disabled={loading}
                className="bg-[#1b2c4b] h-[54.5px] w-full rounded-[14px] flex items-center justify-center"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <p
                  className="font-semibold leading-[22.5px] text-[#fef6f0] text-[15px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  {loading ? 'Saving…' : 'Continue'}
                </p>
              </button>

              <button
                onClick={handleSaveAndExit}
                className="h-[51px] w-full rounded-[14px] flex items-center justify-center relative"
              >
                <div
                  aria-hidden="true"
                  className="absolute border-[#1b2c4b] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[20px] text-[#1b2c4b] text-[14px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Save and exit
                </p>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
