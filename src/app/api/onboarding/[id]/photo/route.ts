import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const formData = await request.formData()
  const file = formData.get('photo') as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${id}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabaseAdmin.storage
    .from('provider-photos')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('provider-photos')
    .getPublicUrl(path)

  await supabaseAdmin
    .from('providers')
    .update({ photo_url: publicUrl })
    .eq('id', id)

  return NextResponse.json({ url: publicUrl })
}
