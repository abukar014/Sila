import { supabaseAdmin } from '@/lib/supabaseAdmin'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { count: pendingCount } = await supabaseAdmin
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .in('verification_status', ['pending', 'in_review'])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #071F1E 0%, #0C2E2C 50%, #071F1E 100%)',
      color: '#FBF7EF',
      fontFamily: 'var(--font-dm-sans), sans-serif',
      position: 'relative',
    }}>
      {/* Ambient glow — top right */}
      <div style={{
        position: 'fixed',
        top: -280, right: -280,
        width: 900, height: 900,
        background: 'radial-gradient(circle, rgba(26,92,90,0.09) 0%, transparent 62%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* Ambient glow — bottom left (offset for sidebar) */}
      <div style={{
        position: 'fixed',
        bottom: -180, left: 80,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(160,106,87,0.05) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      <AdminNav pendingCount={pendingCount ?? 0} />

      <main style={{
        position: 'relative',
        zIndex: 1,
        marginLeft: 216,
        minHeight: '100vh',
        padding: '40px 48px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
