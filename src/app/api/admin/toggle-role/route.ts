import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

/**
 * POST /api/admin/toggle-role
 * Toggles admin role on/off for a user via app_metadata.
 * Requires admin role. Cannot remove admin from the requesting user.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId, makeAdmin } = (body as Record<string, unknown>) ?? {}
  if (!userId || typeof userId !== 'string' || typeof makeAdmin !== 'boolean') {
    return NextResponse.json({ error: 'userId (string) and makeAdmin (boolean) required' }, { status: 400 })
  }

  // Prevent removing own admin role
  if (userId === user.id && !makeAdmin) {
    return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service.auth.admin.updateUserById(userId, {
    app_metadata: { role: makeAdmin ? 'admin' : null },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
