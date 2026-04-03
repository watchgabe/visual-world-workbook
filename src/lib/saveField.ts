import { createClient } from '@/lib/supabase/client'

/**
 * Immediately save a single field value to Supabase via merge_responses RPC.
 * Used after AI generation to persist without waiting for the auto-save debounce.
 */
export async function saveField(
  userId: string,
  moduleSlug: string,
  fieldKey: string,
  value: string,
) {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('merge_responses', {
    p_user_id: userId,
    p_module_slug: moduleSlug,
    p_data: { [fieldKey]: value },
  })
}
