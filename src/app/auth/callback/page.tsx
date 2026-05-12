'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      router.push('/onboarding/account');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError('This confirmation link has expired. Please sign up again.');
      } else {
        router.push('/onboarding/credentials');
      }
    });
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="text-center max-w-sm">
        <p
          className="text-[14px] text-[#535b6a]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {error}
        </p>
        <button
          onClick={() => router.push('/onboarding/account')}
          className="mt-4 text-[#1b2c4b] text-[13px] font-semibold underline"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Back to sign up
        </button>
      </div>
    );
  }

  return (
    <p
      className="text-[#535b6a] text-[13px]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      Confirming your email…
    </p>
  );
}

export default function AuthCallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<p className="text-[#535b6a] text-[13px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Confirming…</p>}>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
