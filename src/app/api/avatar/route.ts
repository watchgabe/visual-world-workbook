import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

const BUCKET = 'avatars'

/**
 * POST /api/avatar
 * Accepts a multipart form with a single "file" field (JPEG image).
 * Uploads to Supabase Storage bucket "avatars/{user_id}/avatar.jpg" and
 * writes the public URL back into the user's auth metadata.
 */
export async function POST(request: NextRequest) {
  // Verify the caller is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse multipart body
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const service = createServiceClient()

  // Ensure the bucket exists (idempotent — safe to call every time)
  const { data: buckets } = await service.storage.listBuckets()
  const bucketExists = buckets?.some(b => b.name === BUCKET)
  if (!bucketExists) {
    const { error: createErr } = await service.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2 MB max
    })
    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 })
    }
  }

  // Upload (upsert so re-uploads overwrite the same path)
  const path = `${user.id}/avatar.jpg`
  const { error: uploadErr } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  // Derive public URL — append cache-busting timestamp so browsers reload immediately
  const {
    data: { publicUrl },
  } = service.storage.from(BUCKET).getPublicUrl(path)

  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  // Persist the URL in user_metadata (small string, not base64)
  await service.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      avatar_url: urlWithBust,
    },
  })

  return NextResponse.json({ url: urlWithBust })
}
