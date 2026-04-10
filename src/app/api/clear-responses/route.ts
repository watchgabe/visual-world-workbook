import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

/**
 * POST /api/clear-responses
 * Clears a user's saved responses for a specific module or all modules.
 * Uses the service role client to bypass RLS.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { moduleSlug } = (body as Record<string, unknown>) ?? {}

  const service = createServiceClient()

  if (typeof moduleSlug === 'string') {
    // Clear a single module
    const { error } = await service
      .from('blp_responses')
      .delete()
      .match({ user_id: user.id, module_slug: moduleSlug })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Clear all modules
    const { error } = await service
      .from('blp_responses')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
