'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  async function signOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-white text-base" style={{ fontWeight: 700 }}>Sila Admin</span>
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-white/60 text-sm hover:text-white transition-colors">Queue</Link>
          <Link href="/admin/verified" className="text-white/60 text-sm hover:text-white transition-colors">Verified</Link>
          <button
            onClick={signOut}
            className="text-sm px-4 py-1.5 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="px-8 py-8">
        {children}
      </main>
    </div>
  )
}
