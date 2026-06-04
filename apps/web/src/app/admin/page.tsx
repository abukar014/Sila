import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  })
}

export default async function AdminQueue() {
  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('id, name, credentials, city, npi, submitted_at, verification_status')
    .eq('verification_status', 'pending')
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: true })

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Review Queue</h1>
      <p className="text-sm mb-8" style={{ color: '#666' }}>
        {providers?.length ?? 0} provider{providers?.length !== 1 ? 's' : ''} awaiting review
      </p>

      {!providers || providers.length === 0 ? (
        <div className="flex items-center justify-center h-64" style={{ color: '#555' }}>
          No providers pending review.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(160,106,87,0.20)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'rgba(22,11,7,0.75)', borderBottom: '1px solid rgba(160,106,87,0.18)' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Name</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Credentials</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>City</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>NPI</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Submitted</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Status</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    backgroundColor: 'rgba(30,16,10,0.55)',
                    borderBottom: i < providers.length - 1 ? '1px solid rgba(160,106,87,0.10)' : 'none',
                  }}
                >
                  <td className="px-5 py-4 font-medium" style={{ color: '#FBF7EF' }}>{p.name}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>{p.credentials ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>{p.city ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>{p.npi ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>{formatDate(p.submitted_at!)}</td>
                  <td className="px-5 py-4">
                    {p.verification_status === 'pending' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(160,106,87,0.18)', color: '#fb923c', border: '1px solid rgba(160,106,87,0.30)' }}>
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
                      style={{ backgroundColor: 'rgba(160,106,87,0.12)', color: 'rgba(251,247,239,0.7)', border: '1px solid rgba(160,106,87,0.22)' }}
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
