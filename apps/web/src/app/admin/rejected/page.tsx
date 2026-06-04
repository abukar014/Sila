import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  })
}

export default async function RejectedPage() {
  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('id, name, credentials, city, npi, created_at, verification_notes')
    .eq('verification_status', 'rejected')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Rejected Applications</h1>
      <p className="text-sm mb-8" style={{ color: '#666' }}>
        {providers?.length ?? 0} rejected provider{providers?.length !== 1 ? 's' : ''}
      </p>

      {!providers || providers.length === 0 ? (
        <div className="flex items-center justify-center h-64" style={{ color: '#555' }}>
          No rejected applications.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#111', borderBottom: '1px solid #2a2a2a' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Name</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Credentials</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>City</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>NPI</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Submitted</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Reason</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderBottom: i < providers.length - 1 ? '1px solid #2a2a2a' : 'none',
                  }}
                  className="hover:bg-[#222222] transition-colors"
                >
                  <td className="px-5 py-4 text-white font-medium">{p.name}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{p.credentials ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{p.city ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{p.npi ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{formatDate(p.created_at)}</td>
                  <td className="px-5 py-4 max-w-[200px]" style={{ color: '#888' }}>
                    <span className="line-clamp-2 text-xs">{p.verification_notes ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/providers/${p.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #333' }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
