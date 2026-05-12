'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  providerId: string
  initial: {
    npi: string | null
    dob: string | null
    license_number: string | null
    license_type: string | null
    state: string | null
  }
}

export default function CredentialsEditor({ providerId, initial }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState({
    npi: initial.npi ?? '',
    dob: initial.dob ?? '',
    license_number: initial.license_number ?? '',
    license_type: initial.license_type ?? '',
    state: initial.state ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof typeof fields, value: string) {
    setFields(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setError('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/credentials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to save')
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    backgroundColor: '#0d0d0d',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    color: '#fff',
    padding: '6px 10px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  }

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #1e1e1e', paddingTop: 16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs font-medium"
        style={{ color: '#555' }}
      >
        <span style={{ fontSize: 10 }}>{open ? '▾' : '▸'}</span>
        Correct credentials
      </button>

      {open && (
        <div className="flex flex-col gap-3 mt-3">
          <p className="text-xs leading-relaxed" style={{ color: '#444' }}>
            Use this to correct submitted credential data before re-running checks. All edits are logged.
          </p>

          {[
            { key: 'npi', label: 'NPI', placeholder: '10-digit NPI' },
            { key: 'dob', label: 'Date of Birth', placeholder: 'YYYY-MM-DD', type: 'date' },
            { key: 'license_number', label: 'License Number', placeholder: '' },
            { key: 'license_type', label: 'License Type', placeholder: 'e.g. LCSW, MD, LPC' },
            { key: 'state', label: 'State', placeholder: 'e.g. TX' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-medium block mb-1" style={{ color: '#555' }}>{label}</label>
              <input
                type={type ?? 'text'}
                value={fields[key as keyof typeof fields]}
                onChange={e => set(key as keyof typeof fields, e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}

          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="py-2 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: saved ? '#052e16' : '#1e3a5f',
              color: saved ? '#86efac' : '#93c5fd',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved — re-run checks above' : 'Save corrections'}
          </button>
        </div>
      )}
    </div>
  )
}
