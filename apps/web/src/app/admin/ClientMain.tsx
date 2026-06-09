'use client'

import { usePathname } from 'next/navigation'

export default function ClientMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin  = pathname === '/admin/login'

  return (
    <main style={{
      position: 'relative',
      zIndex: 1,
      marginLeft: isLogin ? 0 : 216,
      minHeight: '100vh',
      padding: isLogin ? 0 : '40px 48px',
    }}>
      {isLogin ? children : (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      )}
    </main>
  )
}
