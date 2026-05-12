import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export const revalidate = 0

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric'
  })
}

export default async function ExcludedPage() {
  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('id, name, credentials, city, npi, created_at')
    .eq('verification_status', 'excluded')
    .order('created_at', { ascending: false })

  const { data: flaggedNpis } = await supabaseAdmin
    .from('flagged_npis')
    .select('npi, reason, flagged_at')

  const flagMap = new Map(flaggedNpis?.map(f => [f.npi, f]) ?? [])

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Excluded Providers</h1>
      <p className="text-sm mb-8" style={{ color: '#666' }}>
        {providers?.length ?? 0} provider{providers?.length !== 1 ? 's' : ''} confirmed on federal exclusion lists — NPI permanently blocked
      </p>

      {!providers || providers.length === 0 ? (
        <div className="flex items-center justify-center h-64" style={{ color: '#555' }}>
          No excluded providers.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #450a0a' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1a0a0a', borderBottom: '1px solid #450a0a' }}>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>Name</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>Credentials</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>City</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>NPI (blocked)</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>Submitted</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>Exclusion reason</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: '#888' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p, i) => {
                const flag = p.npi ? flagMap.get(p.npi) : null
                return (
                  <tr
                    key={p.id}
                    style={{
                      backgroundColor: '#120606',
                      borderBottom: i < providers.length - 1 ? '1px solid #2a1010' : 'none',
                    }}
                  >
                    <td className="px-5 py-4 font-medium" style={{ color: '#f87171' }}>{p.name}</td>
                    <td className="px-5 py-4" style={{ color: '#888' }}>{p.credentials ?? '—'}</td>
                    <td className="px-5 py-4" style={{ color: '#888' }}>{p.city ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#450a0a', color: '#f87171' }}>
                        {p.npi ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ color: '#888' }}>{formatDate(p.created_at)}</td>
                    <td className="px-5 py-4 max-w-[220px]" style={{ color: '#888' }}>
                      <span className="text-xs line-clamp-2">{flag?.reason ?? '—'}</span>
                      {flag?.flagged_at && (
                        <span className="text-xs block mt-0.5" style={{ color: '#555' }}>
                          Blocked {formatDate(flag.flagged_at)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/providers/${p.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: '#1a0a0a', color: '#f87171', border: '1px solid #450a0a' }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
