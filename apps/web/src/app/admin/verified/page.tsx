import { supabaseAdmin } from '@/lib/supabaseAdmin'
import VerifiedTable from './VerifiedTable'

export const revalidate = 0

export default async function VerifiedPage() {
  const { data: providers } = await supabaseAdmin
    .from('providers')
    .select('id, name, credentials, state, faith_approach, accepting_clients, verified_date')
    .eq('verification_status', 'verified')
    .eq('status', 'active')
    .order('verified_date', { ascending: false })

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Verified Providers</h1>
      <p className="text-sm mb-8" style={{ color: '#666' }}>
        {providers?.length ?? 0} active provider{providers?.length !== 1 ? 's' : ''} in the directory
      </p>
      <VerifiedTable providers={providers ?? []} />
    </div>
  )
}
