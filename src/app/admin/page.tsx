import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  // Gate 2 (defense-in-depth): server component role check.
  // Gate 1 is in middleware. Both must pass to see any admin data.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/')
  }

  // Privileged queries via service role — bypasses RLS
  const service = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceAny = service as any

  // TODO: paginate if users > 1000
  const {
    data: { users },
  } = await serviceAny.auth.admin.listUsers()

  const { data: responses } = await serviceAny
    .from('blp_responses')
    .select('user_id, module_slug, responses, updated_at')

  const { data: configRows } = await serviceAny
    .from('blp_config')
    .select('key, value')

  // Build serializable responsesByUser: Record<userId, Record<moduleSlug, Record<fieldKey, unknown>>>
  const responsesByUser: Record<string, Record<string, Record<string, unknown>>> = {}
  for (const row of (responses ?? []) as {
    user_id: string
    module_slug: string
    responses: Record<string, unknown>
  }[]) {
    if (!responsesByUser[row.user_id]) {
      responsesByUser[row.user_id] = {}
    }
    responsesByUser[row.user_id][row.module_slug] = row.responses ?? {}
  }

  // Build Circle config from blp_config rows
  const configMap: Record<string, string> = {}
  for (const row of (configRows ?? []) as { key: string; value: string }[]) {
    configMap[row.key] = row.value
  }
  const circleConfig = {
    circle_api_key: configMap['circle_api_key'] ?? '',
    circle_community_id: configMap['circle_community_id'] ?? '',
  }

  // Sort users by last_sign_in_at descending (most recent first)
  const sortedUsers = [...(users ?? [])].sort((a, b) => {
    const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
    const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
    return bTime - aTime
  })

  return (
    <AdminDashboard
      users={sortedUsers}
      currentUserId={user.id}
      responsesByUser={responsesByUser}
      circleConfig={circleConfig}
    />
  )
}
