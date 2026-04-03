import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

const CONFIG_KEYS = ['circle_api_key', 'circle_community_id'] as const
type ConfigKey = (typeof CONFIG_KEYS)[number]

async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * GET /api/admin/circle-config
 * Reads Circle.so config from blp_config table.
 * Requires admin role.
 */
export async function GET() {
  const user = await getAdminUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any
  const { data, error } = await service
    .from('blp_config')
    .select('key, value')
    .in('key', [...CONFIG_KEYS])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result: Record<ConfigKey, string | null> = {
    circle_api_key: null,
    circle_community_id: null,
  }

  for (const row of (data ?? []) as { key: string; value: string }[]) {
    if (CONFIG_KEYS.includes(row.key as ConfigKey)) {
      result[row.key as ConfigKey] = row.value
    }
  }

  return NextResponse.json(result)
}

/**
 * POST /api/admin/circle-config
 * Upserts Circle.so config into blp_config table.
 * Requires admin role.
 */
export async function POST(request: NextRequest) {
  const user = await getAdminUser()

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

  const payload = (body as Record<string, unknown>) ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any

  const upserts: { key: string; value: string }[] = []
  for (const key of CONFIG_KEYS) {
    if (typeof payload[key] === 'string') {
      upserts.push({ key, value: payload[key] as string })
    }
  }

  if (upserts.length > 0) {
    const { error } = await service.from('blp_config').upsert(upserts)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
