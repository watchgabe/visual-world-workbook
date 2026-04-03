'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SKIP_KEYS } from '@/lib/admin/labels'
import UserDetailPanel from './UserDetailPanel'

// Supabase auth user shape (from listUsers response)
export interface AdminUser {
  id: string
  email?: string
  created_at: string
  last_sign_in_at?: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
}

interface AdminDashboardProps {
  users: AdminUser[]
  responsesByUser: Record<string, Record<string, Record<string, unknown>>>
  circleConfig: { circle_api_key: string; circle_community_id: string }
}

/** Port of old admin relTime() — returns "just now", "Xm ago", "Xh ago", "Xd ago", or locale date */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

/** Check if a user has any meaningful data for a given module slug */
function hasModuleData(responses: Record<string, unknown> | undefined): boolean {
  if (!responses || typeof responses !== 'object') return false
  return Object.entries(responses).some(([k, v]) => {
    if (SKIP_KEYS.has(k)) return false
    return typeof v === 'string' && v.trim().length > 0
  })
}

const MODULE_SLUGS = ['brand-foundation', 'visual-world', 'content', 'launch'] as const
const MODULE_BADGES = [
  { slug: 'brand-foundation', label: '01 Foundation' },
  { slug: 'visual-world',     label: '02 Visuals' },
  { slug: 'content',          label: '03 Content' },
  { slug: 'launch',           label: '04 Launch' },
] as const

export default function AdminDashboard({
  users,
  responsesByUser,
  circleConfig: initialCircleConfig,
}: AdminDashboardProps) {
  const router = useRouter()
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [circleApiKey, setCircleApiKey] = useState(initialCircleConfig.circle_api_key)
  const [circleCommunityId, setCircleCommunityId] = useState(initialCircleConfig.circle_community_id)
  const [configSaved, setConfigSaved] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)

  // Stat calculations
  const total = users.length
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const active7 = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() > weekAgo
  ).length

  let started = 0
  let completed = 0
  for (const user of users) {
    const userResps = responsesByUser[user.id] ?? {}
    const hasAny = MODULE_SLUGS.some((slug) => hasModuleData(userResps[slug]))
    const hasAll = MODULE_SLUGS.every((slug) => hasModuleData(userResps[slug]))
    if (hasAny) started++
    if (hasAll) completed++
  }

  async function saveConfig() {
    setConfigSaving(true)
    try {
      await fetch('/api/admin/circle-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circle_api_key: circleApiKey,
          circle_community_id: circleCommunityId,
        }),
      })
      setConfigSaved(true)
      setTimeout(() => setConfigSaved(false), 1500)
    } finally {
      setConfigSaving(false)
    }
  }

  function toggleUser(userId: string) {
    setExpandedUserId((prev) => (prev === userId ? null : userId))
  }

  const handleUserDeleted = useCallback(() => {
    setExpandedUserId(null)
    router.refresh()
  }, [router])

  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto">
      {/* Config Strip */}
      <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-[var(--radius-md)] p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[9.5px] font-bold uppercase tracking-[.1em] text-[var(--orange)] mb-1">
            Circle API Key
          </div>
          <div className="text-[11px] text-[var(--dimmer)] mb-1.5">
            Used to link users to their Circle profiles.
          </div>
          <input
            type="password"
            value={circleApiKey}
            onChange={(e) => setCircleApiKey(e.target.value)}
            placeholder="circle_api_..."
            className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] text-[var(--text)] bg-[var(--bg)] focus:outline-none focus:border-[var(--orange)]"
          />
        </div>
        <div className="flex-1 min-w-[160px] max-w-[200px]">
          <div className="text-[9.5px] font-bold uppercase tracking-[.1em] text-[var(--orange)] mb-1">
            Circle Community ID
          </div>
          <div className="text-[11px] text-[var(--dimmer)] mb-1.5">
            Found in your Circle admin URL.
          </div>
          <input
            type="text"
            value={circleCommunityId}
            onChange={(e) => setCircleCommunityId(e.target.value)}
            placeholder="12345"
            className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] text-[var(--text)] bg-[var(--bg)] focus:outline-none focus:border-[var(--orange)]"
          />
        </div>
        <button
          onClick={saveConfig}
          disabled={configSaving}
          className="bg-[var(--orange)] text-white border-none rounded-[var(--radius-md)] px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer whitespace-nowrap hover:opacity-90 disabled:opacity-60 self-end"
        >
          {configSaved ? 'Saved ✓' : configSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Users', value: total },
          { label: 'Started', value: started },
          { label: 'Completed All 4', value: completed },
          { label: 'Active Last 7 Days', value: active7 },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-5 py-4"
          >
            <div
              className="text-[40px] font-black leading-none text-[var(--text)]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {value}
            </div>
            <div className="text-[10.5px] text-[var(--dimmer)] mt-1 uppercase tracking-[.06em] font-medium">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="text-[12px] font-semibold uppercase tracking-[.08em] text-[var(--dimmer)] mb-3">
        All Users
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-[var(--dimmer)] text-[13px]">No users yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--dimmer)] text-left px-3 py-2 border-b border-[var(--border)] w-10" />
                <th className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--dimmer)] text-left px-3 py-2 border-b border-[var(--border)]">
                  Name
                </th>
                <th className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--dimmer)] text-left px-3 py-2 border-b border-[var(--border)]">
                  Email
                </th>
                <th className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--dimmer)] text-left px-3 py-2 border-b border-[var(--border)]">
                  Modules
                </th>
                <th className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--dimmer)] text-left px-3 py-2 border-b border-[var(--border)]">
                  Last Seen
                </th>
                <th className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-[var(--dimmer)] text-left px-3 py-2 border-b border-[var(--border)] w-8" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userResps = responsesByUser[user.id] ?? {}
                const initials = (user.email ?? '?').charAt(0).toUpperCase()
                const lastSeen = user.last_sign_in_at ? relTime(user.last_sign_in_at) : '—'
                const isExpanded = expandedUserId === user.id

                return (
                  <>
                    <tr
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`cursor-pointer transition-colors hover:[&>td]:bg-[var(--surface)] ${
                        isExpanded ? '[&>td]:bg-[var(--surface)]' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 border-b border-[var(--border)] align-middle text-[13px]">
                        <div className="w-8 h-8 rounded-full bg-[var(--orange-tint)] border border-[var(--orange-border)] flex items-center justify-center text-[13px] font-bold text-[var(--orange-dark)]">
                          {initials}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-[var(--border)] align-middle text-[13px]">
                        <div className="font-semibold text-[var(--text)]">
                          {user.user_metadata?.full_name as string || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-[var(--border)] align-middle text-[13px]">
                        <div className="text-[11.5px] text-[var(--dimmer)]">{user.email ?? '—'}</div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-[var(--border)] align-middle text-[13px]">
                        <div className="flex gap-1 flex-wrap">
                          {MODULE_BADGES.map((badge) => {
                            const has = hasModuleData(userResps[badge.slug])
                            return (
                              <span
                                key={badge.slug}
                                className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full font-semibold border whitespace-nowrap ${
                                  has
                                    ? 'bg-[var(--green-bg)] text-[var(--green-text)] border-[var(--green-border)]'
                                    : 'border-[var(--border)] text-[var(--dimmer)]'
                                }`}
                              >
                                {badge.label}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-[var(--border)] align-middle text-[11.5px] text-[var(--dimmer)]">
                        {lastSeen}
                      </td>
                      <td className="px-3 py-2.5 border-b border-[var(--border)] align-middle text-center">
                        <span
                          className="text-[var(--dimmer)] inline-block transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                        >
                          ▾
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${user.id}`}>
                        <td
                          colSpan={6}
                          className="p-0 border-b-2 border-[var(--orange-border)] bg-[var(--card)]"
                        >
                          <div className="p-6 px-8">
                            <UserDetailPanel
                              user={user}
                              userResponses={userResps}
                              circleApiKey={circleApiKey}
                              circleCommunityId={circleCommunityId}
                              onDeleted={handleUserDeleted}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
