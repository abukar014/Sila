import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { notFound } from 'next/navigation'
import VerificationPanel from './VerificationPanel'
import CredentialsEditor from './CredentialsEditor'

export const revalidate = 0

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
      <span className="text-xs font-medium" style={{ color: '#555' }}>{label}</span>
      <span className="text-sm" style={{ color: value ? '#ccc' : '#333' }}>
        {value || '—'}
      </span>
    </div>
  )
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: provider } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('id', id)
    .single()

  if (!provider) notFound()

  const { data: logs } = await supabaseAdmin
    .from('verification_logs')
    .select('*')
    .eq('provider_id', id)
    .order('created_at', { ascending: false })

  const statusColor = provider.verification_status === 'pending' ? '#fb923c'
    : provider.verification_status === 'in_review' ? '#93c5fd'
    : provider.verification_status === 'excluded' ? '#ef4444'
    : '#22c55e'

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">{provider.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#555' }}>
            {provider.credentials ?? 'No credentials on file'}
          </p>
        </div>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium capitalize"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
          {provider.verification_status}
        </span>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Left — provider profile */}
        <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
          <p className="text-sm font-semibold text-white mb-2">Provider Profile</p>

          <Field label="NPI" value={provider.npi} />
          <Field label="License Number" value={provider.license_number} />
          <Field label="License Type" value={provider.license_type} />
          <Field label="Location" value={[provider.city, provider.state, provider.zip].filter(Boolean).join(', ')} />
          <Field label="Telehealth" value={provider.telehealth ? 'Yes' : 'No'} />
          <Field label="In-Person" value={provider.in_person ? 'Yes' : 'No'} />
          <Field label="Languages" value={provider.languages?.join(', ')} />
          <Field label="Specialties" value={provider.specialties?.join(', ')} />
          <Field label="Faith Approach" value={provider.faith_approach?.replace(/_/g, ' ')} />
          <Field label="Gender" value={provider.gender} />
          <Field label="Accepting Clients" value={provider.accepting_clients ? 'Yes' : 'No'} />
          <Field label="Insurances" value={provider.insurances?.join(', ')} />
          <Field label="Scheduling URL" value={provider.scheduling_url} />
          <Field label="Photo URL" value={provider.photo_url} />

          {provider.bio && (
            <div className="py-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
              <span className="text-xs font-medium block mb-1" style={{ color: '#555' }}>Bio</span>
              <p className="text-sm leading-relaxed" style={{ color: '#ccc' }}>{provider.bio}</p>
            </div>
          )}

          {provider.pull_quote && (
            <div className="py-3">
              <span className="text-xs font-medium block mb-1" style={{ color: '#555' }}>Pull Quote</span>
              <p className="text-sm italic leading-relaxed" style={{ color: '#ccc' }}>"{provider.pull_quote}"</p>
            </div>
          )}

          <CredentialsEditor
            providerId={provider.id}
            initial={{
              name: provider.name,
              npi: provider.npi,
              dob: provider.dob,
              license_number: provider.license_number,
              license_type: provider.license_type,
              state: provider.state,
            }}
          />
        </div>

        {/* Right — verification panel */}
        {provider.verification_status === 'excluded' ? (
          <div className="flex flex-col gap-4">
            <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #450a0a', borderRadius: 12, padding: 20 }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#f87171' }}>⛔ Account Permanently Locked</p>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                This provider was confirmed on a federal exclusion list. Their NPI is permanently blocked
                and this account cannot be approved or reactivated. No further action is required.
              </p>
            </div>
            <VerificationPanel
              providerId={provider.id}
              initialLogs={logs ?? []}
              isExcluded
              providerState={provider.state}
              licenseType={provider.license_type}
              specialties={provider.specialties ?? []}
              npi={provider.npi}
              providerName={provider.name}
            />
          </div>
        ) : (
          <VerificationPanel
            providerId={provider.id}
            initialLogs={logs ?? []}
            providerState={provider.state}
            licenseType={provider.license_type}
            specialties={provider.specialties ?? []}
            npi={provider.npi}
            providerName={provider.name}
          />
        )}
      </div>
    </div>
  )
}
