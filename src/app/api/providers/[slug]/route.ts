import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
