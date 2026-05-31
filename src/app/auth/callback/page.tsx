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
    const next = searchParams.get('next') ?? '/onboarding/credentials';

    if (code) {
      // PKCE flow (email confirmation)
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError('This link has expired. Please try again.');
        } else {
          router.push(next);
        }
      });
      return;
    }

    // Hash-based flow (password recovery) — Supabase fires PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        subscription.unsubscribe();
        router.push('/onboarding/reset-password');
      } else if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        router.push(next);
      } else if (event === 'INITIAL_SESSION' && !session) {
        subscription.unsubscribe();
        setError('This link has expired. Please try again.');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', maxWidth: 320, fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ fontSize: 14, color: '#535B6A' }}>{error}</p>
        <button
          onClick={() => router.push('/onboarding/sign-in')}
          style={{ marginTop: 16, color: '#1B2C4B', fontSize: 13, fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <p style={{ color: '#535B6A', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
      Just a moment…
    </p>
  );
}

export default function AuthCallback() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8d5e5' }}>
      <Suspense fallback={<p style={{ color: '#535B6A', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Just a moment…</p>}>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
