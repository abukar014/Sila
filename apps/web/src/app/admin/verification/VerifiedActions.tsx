'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const actionBtn: React.CSSProperties = {
  display: 'inline-block', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
  color: 'rgba(251,247,239,0.65)', background: 'rgba(26,92,90,0.14)',
  border: '1px solid rgba(26,92,90,0.28)', textDecoration: 'none', cursor: 'pointer',
}

export default function VerifiedActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [deactivating, setDeactivating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function deactivate() {
    setDeactivating(true)
    await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' }),
    })
    setDeactivating(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <Link href={`/admin/providers/${id}`} style={actionBtn}>View →</Link>

      <button
        onClick={deactivate}
        disabled={deactivating}
        style={{
          ...actionBtn,
          color: 'rgba(248,113,113,0.75)',
          background: 'rgba(248,113,113,0.07)',
          border: '1px solid rgba(248,113,113,0.2)',
          opacity: deactivating ? 0.5 : 1,
        }}
      >
        {deactivating ? 'Pausing...' : 'Deactivate'}
      </button>

      {confirmDelete ? (
        <>
          <span style={{ fontSize: 11, color: 'rgba(248,113,113,0.6)', whiteSpace: 'nowrap' }}>
            Delete {name.split(' ')[0]}?
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ ...actionBtn, color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', opacity: deleting ? 0.5 : 1 }}
          >
            {deleting ? '...' : 'Yes'}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{ ...actionBtn, color: 'rgba(251,247,239,0.3)', background: 'transparent', border: '1px solid rgba(251,247,239,0.1)' }}
          >
            No
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          style={{ ...actionBtn, color: 'rgba(248,113,113,0.4)', background: 'transparent', border: '1px solid rgba(248,113,113,0.15)' }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
