import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

const BUCKET = 'mood-board'

async function ensureBucket(service: ReturnType<typeof createServiceClient>) {
  const { data: buckets } = await service.storage.listBuckets()
  if (!buckets?.some(b => b.name === BUCKET)) {
    await service.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5 MB per image
    })
  }
}

/**
 * POST /api/mood-board
 * Multipart body: file (JPEG blob), category (string)
 * Uploads to mood-board/{user_id}/{category}/{uuid}.jpg and returns { url }.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const category = formData.get('category')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (typeof category !== 'string' || !['colorgrading', 'fonts', 'shots', 'colors'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const service = createServiceClient()
  await ensureBucket(service)

  const uuid = crypto.randomUUID()
  const path = `${user.id}/${category}/${uuid}.jpg`

  const { error: uploadErr } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: false })

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  const { data: { publicUrl } } = service.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}

/**
 * DELETE /api/mood-board
 * JSON body: { url: string }
 * Deletes the image from Supabase Storage.
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { url } = body
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  // Extract storage path from public URL
  // URL shape: https://{project}.supabase.co/storage/v1/object/public/mood-board/{path}
  let filePath: string | null = null
  try {
    const marker = `/object/public/${BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx !== -1) filePath = url.slice(idx + marker.length).split('?')[0]
  } catch { /* ignore */ }

  if (!filePath) return NextResponse.json({ error: 'Cannot parse URL' }, { status: 400 })

  // Security: ensure the path belongs to this user
  if (!filePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const service = createServiceClient()
  const { error } = await service.storage.from(BUCKET).remove([filePath])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
