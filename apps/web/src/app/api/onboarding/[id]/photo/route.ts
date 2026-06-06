import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.slice(7)
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: ownership } = await supabaseAdmin.from('providers').select('user_id').eq('id', id).single()
  if (!ownership || ownership.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('photo') as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }
  const path = `${id}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabaseAdmin.storage
    .from('provider-photos')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: 'Photo upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('provider-photos')
    .getPublicUrl(path)

  await supabaseAdmin
    .from('providers')
    .update({ photo_url: publicUrl })
    .eq('id', id)

  try {
    await supabaseAdmin.from('verification_logs').insert({
      provider_id: id,
      check_type: 'photo_upload',
      result: 'uploaded',
      raw_output: `Photo uploaded by provider (user: ${user.id})`,
      run_by: 'provider',
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ url: publicUrl })
}
