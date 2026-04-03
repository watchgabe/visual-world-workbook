import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

/**
 * POST /api/admin/delete-user
 * Deletes an auth user (and cascades to blp_responses via FK).
 * Requires admin role in app_metadata.
 */
export async function POST(request: NextRequest) {
  // Auth guard — revalidates JWT (Phase 2 decision)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin check (Gate 2 — Gate 1 is in middleware)
  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId } = (body as Record<string, unknown>) ?? {}
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Delete via service role (bypasses RLS) — blp_responses cascade-deletes via FK
  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
