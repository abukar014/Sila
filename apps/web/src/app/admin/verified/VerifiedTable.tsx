'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Provider = {
  id: string
  name: string
  credentials: string | null
  state: string | null
  faith_approach: string | null
  accepting_clients: boolean
  verified_date: string | null
}

function Toggle({ providerId, initial }: { providerId: string; initial: boolean }) {
  const [checked, setChecked] = useState(initial)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setSaving(true)
    await fetch(`/api/admin/providers/${providerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepting_clients: !checked }),
    })
    setChecked(v => !v)
    setSaving(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors"
      style={{ backgroundColor: checked ? '#166534' : '#2a2a2a', opacity: saving ? 0.5 : 1 }}
    >
      <span
        className="inline-block w-4 h-4 rounded-full transition-transform"
        style={{
          backgroundColor: checked ? '#86efac' : '#555',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}

function DeleteButton({ providerId, name }: { providerId: string; name: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/providers/${providerId}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirm) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'rgba(248,113,113,0.7)', whiteSpace: 'nowrap' }}>
          Delete {name.split(' ')[0]}?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}
        >
          {deleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: 'transparent', color: 'rgba(251,247,239,0.3)', border: '1px solid rgba(251,247,239,0.1)', cursor: 'pointer' }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: 'transparent', color: 'rgba(248,113,113,0.45)', border: '1px solid rgba(248,113,113,0.18)', cursor: 'pointer' }}
    >
      Delete
    </button>
  )
}

export default function VerifiedTable({ providers }: { providers: Provider[] }) {
  const router = useRouter()
  const [deactivating, setDeactivating] = useState<string | null>(null)

  async function deactivate(id: string) {
    setDeactivating(id)
    await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' }),
    })
    setDeactivating(null)
    router.refresh()
  }

  if (providers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: '#555' }}>
        No verified providers yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(160,106,87,0.20)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: 'rgba(22,11,7,0.75)', borderBottom: '1px solid rgba(160,106,87,0.18)' }}>
            <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Name</th>
            <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>State</th>
            <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Faith Approach</th>
            <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Accepting</th>
            <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Verified</th>
            <th className="text-left px-5 py-3 font-medium" style={{ color: 'rgba(251,247,239,0.35)' }}>Actions</th>
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
              <td className="px-5 py-4">
                <p style={{ color: '#FBF7EF', fontWeight: 500 }}>{p.name}</p>
                {p.credentials && <p className="text-xs mt-0.5" style={{ color: 'rgba(251,247,239,0.30)' }}>{p.credentials}</p>}
              </td>
              <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>{p.state ?? '—'}</td>
              <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>
                {p.faith_approach?.replace(/_/g, ' ') ?? '—'}
              </td>
              <td className="px-5 py-4">
                <Toggle providerId={p.id} initial={p.accepting_clients} />
              </td>
              <td className="px-5 py-4" style={{ color: 'rgba(251,247,239,0.45)' }}>
                {p.verified_date
                  ? new Date(p.verified_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                  : '—'}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <Link
                    href={`/admin/providers/${p.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'rgba(160,106,87,0.12)', color: 'rgba(251,247,239,0.65)', border: '1px solid rgba(160,106,87,0.22)' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deactivate(p.id)}
                    disabled={deactivating === p.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'rgba(100,20,20,0.5)', color: '#f87171', border: '1px solid rgba(160,40,40,0.4)', cursor: 'pointer', opacity: deactivating === p.id ? 0.5 : 1 }}
                  >
                    {deactivating === p.id ? 'Pausing...' : 'Deactivate'}
                  </button>
                  <DeleteButton providerId={p.id} name={p.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
