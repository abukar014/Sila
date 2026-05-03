'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CheckResult = {
  result: 'clear' | 'flagged' | 'excluded' | 'review_required' | 'error'
  details: string
  timestamp: string
}

type Log = {
  id: string
  created_at: string
  check_type: string
  result: string
  raw_output: string | null
}

const CHECK_META = {
  nppes: { label: 'NPPES', description: 'Verify NPI against the national provider registry' },
  leie: { label: 'OIG LEIE', description: 'Check OIG List of Excluded Individuals/Entities' },
  sam: { label: 'SAM.gov', description: 'Check federal exclusions list' },
}

const RESULT_STYLES: Record<string, { color: string; icon: string }> = {
  clear: { color: '#22c55e', icon: '✓' },
  flagged: { color: '#f59e0b', icon: '⚠' },
  review_required: { color: '#f59e0b', icon: '⚠' },
  excluded: { color: '#ef4444', icon: '✗' },
  error: { color: '#ef4444', icon: '✗' },
  approved: { color: '#22c55e', icon: '✓' },
  rejected: { color: '#ef4444', icon: '✗' },
}

export default function VerificationPanel({
  providerId,
  initialLogs,
}: {
  providerId: string
  initialLogs: Log[]
}) {
  const router = useRouter()
  const [checkResults, setCheckResults] = useState<Partial<Record<string, CheckResult>>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [deciding, setDeciding] = useState(false)
  const [decided, setDecided] = useState(false)

  const allChecksRun = ['nppes', 'leie', 'sam'].every(t => checkResults[t])

  async function runCheck(type: string) {
    setLoading(prev => ({ ...prev, [type]: true }))
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/check/${type}`, { method: 'POST' })
      const data = await res.json()
      const timestamp = new Date().toLocaleTimeString()
      setCheckResults(prev => ({ ...prev, [type]: { ...data, timestamp } }))
      setLogs(prev => [{
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        check_type: type,
        result: data.result,
        raw_output: data.details,
      }, ...prev])
    } catch {
      setCheckResults(prev => ({ ...prev, [type]: { result: 'error', details: 'Request failed', timestamp: new Date().toLocaleTimeString() } }))
    }
    setLoading(prev => ({ ...prev, [type]: false }))
  }

  async function handleDecision(action: 'approve' | 'reject') {
    setDeciding(true)
    await fetch(`/api/admin/providers/${providerId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: rejectReason }),
    })
    setDecided(true)
    setDeciding(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Check sections */}
      {(Object.entries(CHECK_META) as [string, { label: string; description: string }][]).map(([type, meta]) => {
        const res = checkResults[type]
        const style = res ? RESULT_STYLES[res.result] : null
        return (
          <div key={type} style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-white text-sm font-semibold">{meta.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>{meta.description}</p>
              </div>
              <button
                onClick={() => runCheck(type)}
                disabled={!!loading[type]}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', color: loading[type] ? '#555' : '#aaa' }}
              >
                {loading[type] ? 'Running...' : res ? 'Re-run' : 'Run check'}
              </button>
            </div>

            {res && style && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e1e1e' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: style.color }}>
                  {style.icon} {res.result.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#777' }}>{res.details}</p>
                <p className="text-xs mt-2" style={{ color: '#444' }}>Run at {res.timestamp}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Decision buttons */}
      <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
        <p className="text-sm font-semibold text-white mb-3">Decision</p>

        {decided ? (
          <p className="text-sm" style={{ color: '#555' }}>Decision recorded. Refresh to continue.</p>
        ) : (
          <>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => handleDecision('approve')}
                disabled={!allChecksRun || deciding}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: allChecksRun ? '#166534' : '#0f2d1e',
                  color: allChecksRun ? '#86efac' : '#2d5a3d',
                  cursor: allChecksRun ? 'pointer' : 'not-allowed',
                }}
              >
                {deciding ? 'Saving...' : 'Approve provider'}
              </button>
              <button
                onClick={() => setShowRejectInput(v => !v)}
                disabled={deciding}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: '#2d0a0a', color: '#f87171', border: '1px solid #450a0a' }}
              >
                Reject provider
              </button>
            </div>

            {!allChecksRun && (
              <p className="text-xs" style={{ color: '#444' }}>Run all three checks to enable approval.</p>
            )}

            {showRejectInput && (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  rows={3}
                  placeholder="Rejection reason..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                />
                <button
                  onClick={() => handleDecision('reject')}
                  disabled={!rejectReason.trim() || deciding}
                  className="py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#450a0a', color: '#f87171' }}
                >
                  Confirm rejection
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Verification log */}
      <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
        <p className="text-sm font-semibold text-white mb-3">Verification Log</p>
        {logs.length === 0 ? (
          <p className="text-xs" style={{ color: '#444' }}>No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map(log => {
              const style = RESULT_STYLES[log.result] ?? { color: '#888', icon: '·' }
              return (
                <div key={log.id} className="flex gap-3 text-xs">
                  <span style={{ color: '#444', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  <span style={{ color: style.color, whiteSpace: 'nowrap' }}>
                    {style.icon} {log.check_type.toUpperCase()}
                  </span>
                  <span style={{ color: '#666' }}>{log.raw_output}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
