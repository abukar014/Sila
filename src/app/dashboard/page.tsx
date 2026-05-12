'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';

type Provider = {
  id: string;
  name: string;
  verification_status: string;
  status: string;
  verified_date: string | null;
  accepting_clients: boolean;
  scheduling_url: string | null;
  email: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const providerId = localStorage.getItem('sila_provider_id');
    if (!providerId) {
      router.push('/onboarding/account');
      return;
    }
    fetch(`/api/onboarding/${providerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push('/onboarding/account');
        else setProvider(data);
      })
      .catch(() => router.push('/onboarding/account'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <MobileContainer>
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-[#535b6a] text-[13px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading…</p>
          </div>
        </MobileContainer>
      </main>
    );
  }

  const isExcluded = provider?.verification_status === 'excluded';
  const isVerified = provider?.verification_status === 'verified' && provider?.status === 'active';

  if (isExcluded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <MobileContainer>
          <div className="flex flex-col h-full w-full">
            <StatusBar />
            <div className="flex flex-col flex-1 w-full px-[28px] justify-center pb-[60px]">
              <h1
                className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px] mb-[12px]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                This account is not eligible.
              </h1>
              <p
                className="font-normal leading-[21px] text-[#535b6a] text-[13px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                Your application could not be approved. If you believe this is an error, contact us at{' '}
                <span className="font-semibold text-[#1b2c4b]">support@silahealth.com</span>.
              </p>
            </div>
          </div>
        </MobileContainer>
      </main>
    );
  }

  const nextReviewDate = provider?.verified_date
    ? new Date(new Date(provider.verified_date).setFullYear(new Date(provider.verified_date).getFullYear() + 1))
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const quickActions = [
    {
      icon: 'v',
      title: 'View public profile',
      subtitle: 'See what clients see',
      onClick: () => {},
    },
    {
      icon: 'e',
      title: 'Edit profile',
      subtitle: 'Bio, languages, photo',
      onClick: () => {},
    },
    {
      icon: 's',
      title: 'Update scheduling link',
      subtitle: provider?.scheduling_url ?? 'Not set',
      onClick: () => {},
    },
  ];


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="flex flex-col h-full w-full">
          <StatusBar />

          <div className="flex-1 w-full px-[28px] py-[26px]">
            <div>
              <p
                className="font-semibold leading-[16.5px] text-[#1b2c4b] text-[11px] tracking-[2px] uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
              >
                Welcome back
              </p>
              <h1
                className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px] mt-[4px]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {provider?.name ?? 'Provider'}
              </h1>
            </div>

            {/* Status badge */}
            {isVerified ? (
              <div className="bg-[#d4e4dc] rounded-[14px] px-[16px] py-[14px] mt-[16px] flex items-center gap-[12px]">
                <div className="bg-[#1c5544] rounded-full size-[32px] flex items-center justify-center shrink-0">
                  <p
                    className="font-bold leading-[20px] text-[14px] text-white"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    ✓
                  </p>
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold leading-[20px] text-[#2a1a1a] text-[14px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Verified · Active
                  </p>
                  <p
                    className="font-normal leading-[16.5px] text-[#535b6a] text-[11px] mt-[2px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                  >
                    Your profile is live{nextReviewDate ? ` · Next review ${nextReviewDate}` : ''}
                  </p>
                </div>
              </div>
            ) : provider?.verification_status === 'rejected' ? (
              <div className="bg-[#f5f0eb] rounded-[14px] px-[16px] py-[14px] mt-[16px] flex items-center gap-[12px]">
                <div className="bg-[#8c7355] rounded-full size-[32px] flex items-center justify-center shrink-0">
                  <p
                    className="font-bold leading-[20px] text-[14px] text-white"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    ·
                  </p>
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold leading-[20px] text-[#2a1a1a] text-[14px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    We weren&apos;t able to approve your application
                  </p>
                  <p
                    className="font-normal leading-[16.5px] text-[#535b6a] text-[11px] mt-[2px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                  >
                    Check your email for details. Questions? Reply to that email.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#fef3e2] rounded-[14px] px-[16px] py-[14px] mt-[16px] flex items-center gap-[12px]">
                <div className="bg-[#c89849] rounded-full size-[32px] flex items-center justify-center shrink-0">
                  <p
                    className="font-bold leading-[20px] text-[14px] text-white"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    ○
                  </p>
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold leading-[20px] text-[#2a1a1a] text-[14px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Verification pending
                  </p>
                  <p
                    className="font-normal leading-[16.5px] text-[#535b6a] text-[11px] mt-[2px]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                  >
                    We&apos;ll email you when your profile goes live
                  </p>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-[32px]">
              <p
                className="font-semibold leading-[16.5px] text-[#535b6a] text-[11px] tracking-[0.5px] uppercase mb-[8px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
              >
                Quick actions
              </p>

              <div className="flex flex-col gap-[8px]">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="bg-white rounded-[14px] px-[17px] py-[15px] flex items-center gap-[12px] relative hover:bg-gray-50 transition-colors"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute border-[0.636px] border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                    />
                    <div className="bg-[#e0eeff] rounded-[10px] size-[36px] flex items-center justify-center shrink-0">
                      <p
                        className="font-normal italic leading-[25.5px] text-[#1b2c4b] text-[17px]"
                        style={{ fontFamily: "'EB Garamond', serif" }}
                      >
                        {action.icon}
                      </p>
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="font-semibold leading-[20px] text-[#2a1a1a] text-[14px]"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                      >
                        {action.title}
                      </p>
                      <p
                        className="font-normal leading-[16.5px] text-[#535b6a] text-[11px] mt-[2px]"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                      >
                        {action.subtitle}
                      </p>
                    </div>
                    <p
                      className="font-normal leading-[24px] text-[#1b2c4b] text-[16px]"
                      style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                    >
                      →
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-[32px] text-center">
              <button
                onClick={() => {
                  localStorage.removeItem('sila_provider_id');
                  router.push('/onboarding/account');
                }}
                className="text-[#535b6a] text-[12px] underline"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                ← Sign out
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
