import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  })
}

export default async function AdminQueue() {
  const { data: providers } = await supabase
    .from('providers')
    .select('id, name, credentials, city, npi, created_at, verification_status')
    .in('verification_status', ['pending', 'rejected'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Review Queue</h1>
      <p className="text-sm mb-8" style={{ color: '#666' }}>
        {providers?.length ?? 0} provider{providers?.length !== 1 ? 's' : ''} pending review
      </p>

      {!providers || providers.length === 0 ? (
        <div className="flex items-center justify-center h-64" style={{ color: '#555' }}>
          No providers pending review.
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
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Status</th>
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
                  <td className="px-5 py-4">
                    {p.verification_status === 'pending' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#451a03', color: '#fb923c' }}>
                        Pending
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#450a0a', color: '#f87171' }}>
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/providers/${p.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #333' }}
                    >
                      Review
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
