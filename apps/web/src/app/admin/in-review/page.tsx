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
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(160,106,87,0.20)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'rgba(22,11,7,0.75)', borderBottom: '1px solid rgba(160,106,87,0.18)' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Name</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Credentials</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>City</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>NPI</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Submitted</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Needs verification</th>
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
                  <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>{formatDate(p.created_at)}</td>
                  <td className="px-5 py-4 max-w-[220px]" style={{ color: 'rgba(251,247,239,0.45)' }}>
                    <span className="text-xs line-clamp-2">{p.verification_notes ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/providers/${p.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: 'rgba(160,106,87,0.12)', color: 'rgba(251,247,239,0.7)', border: '1px solid rgba(160,106,87,0.22)' }}
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
