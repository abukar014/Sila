'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import StatusBar from '@/components/StatusBar';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError('');
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !data.user) {
        setError(authError?.message ?? 'Invalid email or password.');
        return;
      }

      // Look up their provider record
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (!provider) {
        setError('No provider account found for this email.');
        return;
      }

      localStorage.setItem('sila_provider_id', provider.id);
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <MobileContainer>
        <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-full">
          <StatusBar />

          <div className="flex-1 relative w-full">
            <div className="px-[28px] pt-[20px]">
              <button
                onClick={() => router.back()}
                className="text-[#1b2c4b] text-[13px] mb-[28px] block"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ← Back
              </button>

              <h1
                className="font-bold text-[28px] leading-[34px] text-[#0a0a0a]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Welcome back.
              </h1>
              <p
                className="font-normal leading-[21px] text-[#535b6a] text-[13px] mt-[6px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 9" }}
              >
                Sign in to your provider dashboard.
              </p>

              <div className="flex flex-col gap-[10px] mt-[24px]">
                {/* Email */}
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

                {/* Password */}
                <div className="bg-white flex flex-col gap-[4px] pb-[12px] pt-[13px] px-[15px] rounded-[14px] relative">
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    className="font-medium leading-[20px] text-[#2a1a1a] text-[14px] bg-transparent border-none outline-none w-full"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                  />
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

            {/* Sign in button */}
            <div className="absolute bottom-0 w-full px-[28px] pb-[32px] pt-[20px]">
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="bg-[#1b2c4b] h-[54.5px] w-full rounded-[14px] flex items-center justify-center"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <p
                  className="font-semibold leading-[22.5px] text-[#fef6f0] text-[15px]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </p>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>
    </main>
  );
}
