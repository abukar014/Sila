'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';
import ProgressIndicator from '@/components/ProgressIndicator';

const FAITH_OPTIONS = [
  { label: 'Faith-integrated', value: 'faith_integrated' },
  { label: 'Faith-sensitive', value: 'faith_sensitive' },
  { label: 'Faith-neutral', value: 'faith_neutral' },
  { label: 'Secular', value: 'secular' },
];

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

  const removeInsurance = (index: number) => {
    setInsurancePlans((plans) => plans.filter((_, i) => i !== index));
  };

  const addInsurance = (plan: string) => {
    const trimmed = plan.trim();
    if (trimmed && !insurancePlans.includes(trimmed)) {
      setInsurancePlans((plans) => [...plans, trimmed]);
    }
  };

  function handleAddPlanConfirm() {
    addInsurance(newPlan);
    setNewPlan('');
    setShowPlanInput(false);
  }

  async function handleContinue() {
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
      if (!res.ok) {
        setError(data.error ?? 'Failed to save. Please try again.');
        return;
      }
      router.push('/onboarding/review');
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
        {/* Scrollable inner container */}
        <div className="flex flex-col w-full h-full overflow-y-auto">
          <StatusBar />

          <div className="w-full px-[28px]">
            <ProgressIndicator currentStep={3} totalSteps={4} stepLabel="Profile" />

            <div className="mt-[24px]">
              <h1
                className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                How should clients find you?
              </h1>
            </div>

            <div className="flex flex-col gap-[10px] mt-[24px]">
              {/* Photo */}
              <div className="bg-white rounded-[14px] relative px-[15px] py-[13px] flex items-center gap-[12px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <div className="bg-[#e0eeff] rounded-full size-[44px] flex items-center justify-center shrink-0">
                  <p
                    className="font-normal italic leading-[24px] text-[#1b2c4b] text-[16px]"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    AR
                  </p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p
                    className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Photo
                  </p>
                  <p
                    className="font-normal leading-[20px] text-[#535b6a] text-[14px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                  >
                    Tap to upload
                  </p>
                </div>
              </div>

              {/* Faith approach */}
              <div className="bg-white rounded-[14px] relative px-[15px] py-[13px] flex flex-col gap-[4px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Faith approach
                </p>
                <select
                  value={faithApproach}
                  onChange={(e) => setFaithApproach(e.target.value)}
                  className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full appearance-none"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  {FAITH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-[14px] relative px-[15px] py-[13px] flex flex-col gap-[4px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Languages
                </p>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="English, Urdu, Arabic"
                  className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                />
              </div>

              {/* Bio */}
              <div className="bg-white rounded-[14px] relative px-[15px] py-[13px] flex flex-col gap-[4px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Bio
                </p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell clients about your approach…"
                  className="font-medium leading-[21.125px] text-[#2a1a1a] text-[13px] py-[4px] bg-transparent border-none outline-none w-full resize-none placeholder:text-[#aaa]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                />
              </div>

              {/* Scheduling link */}
              <div className="bg-white rounded-[14px] relative px-[15px] py-[13px] flex flex-col gap-[4px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Scheduling link
                </p>
                <input
                  type="url"
                  value={schedulingUrl}
                  onChange={(e) => setSchedulingUrl(e.target.value)}
                  placeholder="calendly.com/your-name"
                  className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                />
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-[14px] relative px-[17px] pt-[17px] pb-[17px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[16.5px] text-[#1b2c4b] text-[11px] tracking-[2px] uppercase mb-[12px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  In-Network Insurance
                </p>

                <div className="flex flex-col gap-[8px]">
                  {insurancePlans.map((plan, index) => (
                    <div
                      key={index}
                      className="bg-[#e0eeff] h-[36px] rounded-[10px] px-[12px] py-[8px] flex items-center justify-between"
                    >
                      <p
                        className="font-medium leading-[19.5px] text-[#1b2c4b] text-[13px]"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                      >
                        {plan}
                      </p>
                      <button
                        onClick={() => removeInsurance(index)}
                        className="text-[#1b2c4b] size-[16px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {showPlanInput && (
                  <div className="flex gap-[8px] mt-[10px]">
                    <input
                      type="text"
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlanConfirm()}
                      placeholder="Plan name"
                      autoFocus
                      className="flex-1 h-[36px] rounded-[10px] border border-[rgba(40,70,107,0.3)] px-[12px] text-[13px] text-[#1b2c4b] outline-none bg-white"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <button
                      onClick={handleAddPlanConfirm}
                      className="bg-[#1b2c4b] text-white rounded-[10px] px-[12px] text-[12px] font-semibold"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Add
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowPlanInput(true)}
                  className="mt-[16px] flex items-center gap-[8px]"
                >
                  <span className="text-[#1b2c4b] text-[16px]">+</span>
                  <p
                    className="font-semibold leading-[19.5px] text-[#1b2c4b] text-[13px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Add insurance plan
                  </p>
                </button>

                <div className="mt-[16px] pt-[13px] border-t border-[rgba(40,70,107,0.15)]">
                  <p
                    className="font-normal leading-[15px] text-[#535b6a] text-[10px] mb-[8px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                  >
                    Quick add:
                  </p>
                  <div className="flex flex-wrap gap-[7px]">
                    {['Cigna', 'United Healthcare', 'Humana', 'Medicare'].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => addInsurance(plan)}
                        className="bg-[#f0f4f8] rounded-[8px] px-[12px] py-[4px]"
                      >
                        <p
                          className="font-medium leading-[15px] text-[#1b2c4b] text-[10px]"
                          style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                        >
                          {plan}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className="bg-white rounded-[14px] relative px-[17px] pt-[17px] pb-[17px]">
                <div
                  aria-hidden="true"
                  className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                />
                <p
                  className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase mb-[12px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  Out-of-Pocket Fees
                </p>

                <div className="flex flex-col gap-[12px]">
                  {[
                    { label: 'Individual session', value: feeIndividual, setter: setFeeIndividual, placeholder: 'e.g. $200-250' },
                    { label: 'Couples session (optional)', value: feeCouples, setter: setFeeCouples, placeholder: 'e.g. $250-300' },
                    { label: 'Initial consultation', value: feeInitial, setter: setFeeInitial, placeholder: 'e.g. $300' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-[4px]">
                      <p
                        className="font-medium leading-[16.5px] text-[#535b6a] text-[11px]"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                      >
                        {item.label}
                      </p>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => item.setter(e.target.value)}
                        placeholder={item.placeholder}
                        className="h-[38px] rounded-[10px] border-[0.636px] border-[rgba(40,70,107,0.3)] px-[12px] py-[8px] font-medium text-[14px] text-[rgba(42,26,26,0.7)] outline-none placeholder:text-[#bbb]"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p
                  className="text-[12px] leading-[18px]"
                  style={{ color: '#c0392b', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Bottom buttons — inline so they scroll naturally */}
            <div className="mt-[24px] pb-[32px] flex flex-col gap-[10px]">
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
