'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';
import ProgressIndicator from '@/components/ProgressIndicator';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleContinue() {
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError || !authData.user) {
        setError(authError?.message ?? 'Failed to create account. Please try again.');
        return;
      }

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          user_id: authData.user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      localStorage.setItem('sila_provider_id', data.provider_id);
      // If email confirmation is disabled, session is available immediately
      if (authData.session) {
        router.push('/onboarding/credentials');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <MobileContainer>
          <div className="flex flex-col h-full w-full">
            <StatusBar />
            <div className="flex flex-col flex-1 w-full px-[28px] justify-center pb-[60px]">
              <div className="bg-[#e0eeff] rounded-full size-[56px] flex items-center justify-center mb-[24px]">
                <p className="text-[#1b2c4b] text-[24px]" style={{ fontFamily: "'EB Garamond', serif" }}>✉</p>
              </div>
              <h1
                className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Check your inbox.
              </h1>
              <p
                className="font-normal leading-[21.125px] text-[#535b6a] text-[13px] mt-[8px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                We sent a confirmation link to{' '}
                <span className="font-semibold text-[#1b2c4b]">{formData.email}</span>.
                Click it to continue your application.
              </p>
              <p
                className="font-normal leading-[19.5px] text-[#535b6a] text-[11px] mt-[16px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                Once confirmed you&apos;ll be taken straight to the next step.
              </p>
            </div>
          </div>
        </MobileContainer>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-full">
          <StatusBar />

          <div className="flex-1 relative w-full">
            <div className="px-[28px]">
              <button
                onClick={() => router.back()}
                className="text-[#1b2c4b] text-[13px] mb-[16px] block"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ← Back
              </button>
              <ProgressIndicator currentStep={1} totalSteps={4} stepLabel="Account" />

              <div className="mt-[24px]">
                <h1
                  className="font-normal italic leading-[39px] text-[#0a0a0a] text-[26px]"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  Let&apos;s get you started.
                </h1>
                <p
                  className="font-normal leading-[21.125px] text-[#535b6a] text-[13px] mt-[6px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                >
                  Two minutes. We save your progress as you go.
                </p>
              </div>

              <div className="flex flex-col gap-[10px] mt-[24px]">
                {/* Full name */}
                <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] relative">
                  <div
                    aria-hidden="true"
                    className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                  />
                  <p
                    className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Full legal name
                  </p>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Dr. Aisha Rahman"
                    className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  />
                </div>

                {/* Work email */}
                <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] relative">
                  <div
                    aria-hidden="true"
                    className="absolute border border-[rgba(40,70,107,0.46)] border-solid inset-0 pointer-events-none rounded-[14px]"
                  />
                  <p
                    className="font-semibold leading-[15px] text-[#535b6a] text-[10px] tracking-[0.5px] uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  >
                    Work email
                  </p>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@clinic.com"
                    className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full placeholder:text-[#aaa]"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  />
                </div>

                {/* Password row */}
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
                      Password
                    </p>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      Confirm
                    </p>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full"
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

              <div className="mt-[20px]">
                <p
                  className="font-normal leading-[17.875px] text-[#535b6a] text-[11px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
                >
                  By continuing you agree to our{' '}
                  <span
                    className="font-semibold text-[#1b2c4b]"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Provider Terms
                  </span>
                  {' '}and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-[#1b2c4b]"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    Privacy Policy.
                  </Link>
                </p>
              </div>
            </div>

            {/* Continue button */}
            <div className="absolute bottom-0 w-full px-[28px] pb-[32px] pt-[20px]">
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
                  {loading ? 'Creating account…' : 'Continue'}
                </p>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
