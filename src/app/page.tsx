import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { error } = await supabase.from('_test_connection').select('*').limit(1)
  const connected = !error || error.code === 'PGRST116' || error.code === 'PGRST200' || error.message.includes('does not exist') || error.message.includes('schema cache')

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Sila — Connection Test</h1>
        {connected ? (
          <p className="text-green-600 font-medium">Supabase connected successfully</p>
        ) : (
          <div>
            <p className="text-red-600 font-medium">Connection failed</p>
            <p className="text-sm text-gray-500 mt-2">{error?.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
