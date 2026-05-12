import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  })
}

export default async function InReviewPage() {
  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('id, name, credentials, city, npi, created_at, verification_notes')
    .eq('verification_status', 'in_review')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">In Review</h1>
      <p className="text-sm mb-8" style={{ color: '#666' }}>
        {providers?.length ?? 0} provider{providers?.length !== 1 ? 's' : ''} requiring additional verification
      </p>

      {!providers || providers.length === 0 ? (
        <div className="flex items-center justify-center h-64" style={{ color: '#555' }}>
          No providers in review.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e3a5f' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#0d1f33', borderBottom: '1px solid #1e3a5f' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Name</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Credentials</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>City</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>NPI</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Submitted</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Needs verification</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#666' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    backgroundColor: '#0a1628',
                    borderBottom: i < providers.length - 1 ? '1px solid #1e3a5f' : 'none',
                  }}
                >
                  <td className="px-5 py-4 font-medium" style={{ color: '#93c5fd' }}>{p.name}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{p.credentials ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{p.city ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{p.npi ?? '—'}</td>
                  <td className="px-5 py-4" style={{ color: '#888' }}>{formatDate(p.created_at)}</td>
                  <td className="px-5 py-4 max-w-[220px]" style={{ color: '#888' }}>
                    <span className="text-xs line-clamp-2">{p.verification_notes ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/providers/${p.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#0d1f33', color: '#93c5fd', border: '1px solid #1e3a5f' }}
                    >
                      Continue review
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
