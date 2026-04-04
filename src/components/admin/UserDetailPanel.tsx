'use client'
import { useState, useEffect } from 'react'
import { SKIP_KEYS, getLabelForKey } from '@/lib/admin/labels'
import { MODULE_SECTIONS } from '@/lib/modules'
import type { AdminUser } from './AdminDashboard'

interface CircleMember {
  name?: string
  avatar_url?: string
  role?: string
  created_at?: string
  last_seen_at?: string
  public_uid?: string
}

interface UserDetailPanelProps {
  user: AdminUser
  currentUserId: string
  userResponses: Record<string, Record<string, unknown>>
  circleApiKey: string
  circleCommunityId: string
  onDeleted: () => void
  onRoleToggled: () => void
}

const MODULE_DEFS = [
  { slug: 'brand-foundation', num: '01', title: 'Brand Foundation' },
  { slug: 'visual-world',     num: '02', title: 'Visual World' },
  { slug: 'content',          num: '03', title: 'Create Your Content' },
  { slug: 'launch',           num: '04', title: 'Launch' },
] as const

/** Count total field slots for a module (excluding empty sections) */
function getModuleTotalFields(moduleSlug: string): number {
  const sections = MODULE_SECTIONS[moduleSlug as keyof typeof MODULE_SECTIONS] ?? []
  return sections.reduce((sum, sec) => sum + sec.fields.length, 0)
}

/** Count non-empty fields in a responses object */
function countNonEmpty(responses: Record<string, unknown>): number {
  return Object.entries(responses).filter(([k, v]) => {
    if (SKIP_KEYS.has(k)) return false
    return typeof v === 'string' && v.trim().length > 0
  }).length
}

export default function UserDetailPanel({
  user,
  currentUserId,
  userResponses,
  circleApiKey,
  circleCommunityId,
  onDeleted,
  onRoleToggled,
}: UserDetailPanelProps) {
  const [circleMember, setCircleMember] = useState<CircleMember | null | 'loading'>('loading')
  const [badgeStatus, setBadgeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [badgeMessage, setBadgeMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingRole, setTogglingRole] = useState(false)

  const initials = (user.email ?? '?').charAt(0).toUpperCase()

  // Progress calculations
  const modulePcts = MODULE_DEFS.map((mod) => {
    const responses = userResponses[mod.slug] ?? {}
    const done = countNonEmpty(responses)
    const total = getModuleTotalFields(mod.slug)
    const pct = total > 0 ? Math.min(Math.round((done / total) * 100), 100) : 0
    return { ...mod, pct }
  })

  const overallDone = modulePcts.reduce((sum, m) => sum + Math.round(m.pct / 100 * getModuleTotalFields(m.slug)), 0)
  const overallTotal = MODULE_DEFS.reduce((sum, m) => sum + getModuleTotalFields(m.slug), 0)
  const overallPct = overallTotal > 0 ? Math.min(Math.round((overallDone / overallTotal) * 100), 100) : 0

  // Fetch Circle member on mount (if configured)
  useEffect(() => {
    if (!circleApiKey || !circleCommunityId || !user.email) {
      setCircleMember(null)
      return
    }
    setCircleMember('loading')
    fetch('/api/circle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_member',
        email: user.email,
        community_id: circleCommunityId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCircleMember(data.member ?? null)
      })
      .catch(() => {
        setCircleMember(null)
      })
  }, [user.email, circleApiKey, circleCommunityId])

  async function handleAwardBadge() {
    setBadgeStatus('loading')
    setBadgeMessage('')
    try {
      const res = await fetch('/api/circle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'award_badge',
          email: user.email,
          community_id: circleCommunityId,
        }),
      })
      if (res.ok) {
        setBadgeStatus('success')
        setBadgeMessage('Badge awarded successfully!')
      } else {
        setBadgeStatus('error')
        setBadgeMessage('Failed to award badge.')
      }
    } catch {
      setBadgeStatus('error')
      setBadgeMessage('Failed to award badge.')
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (res.ok) {
        onDeleted()
      } else {
        setIsDeleting(false)
        setShowDeleteConfirm(false)
        alert('Delete failed. Please try again.')
      }
    } catch {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      alert('Delete failed. Please try again.')
    }
  }

  const isAdmin = user.app_metadata?.role === 'admin'
  const isSelf = user.id === currentUserId

  async function handleToggleRole() {
    setTogglingRole(true)
    try {
      const res = await fetch('/api/admin/toggle-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, makeAdmin: !isAdmin }),
      })
      if (res.ok) onRoleToggled()
    } finally {
      setTogglingRole(false)
    }
  }

  return (
    <div>
      {/* Progress Summary */}
      <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-[var(--radius-md)] p-4 mb-5 flex gap-6 flex-wrap items-start">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-[var(--orange-tint)] border border-[var(--orange-border)] flex items-center justify-center text-[17px] font-bold text-[var(--orange-dark)]">
            {initials}
          </div>
          <div>
            <div className="text-[13px] font-bold text-[var(--text)]">
              {(user.user_metadata?.full_name as string) || '—'}
            </div>
            <div className="text-[11px] text-[var(--dimmer)] mt-0.5">{user.email}</div>
            <div className="mt-1.5 flex items-center gap-2">
              {isAdmin ? (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-[.08em] bg-[var(--orange-tint)] text-[var(--orange)] border border-[var(--orange-border)] px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                  {!isSelf && (
                    <button
                      onClick={handleToggleRole}
                      disabled={togglingRole}
                      className="text-[10px] text-[var(--dimmer)] hover:text-[#e05555] transition-colors disabled:opacity-50"
                    >
                      {togglingRole ? '...' : 'Remove'}
                    </button>
                  )}
                  {isSelf && (
                    <span className="text-[9px] text-[var(--dimmer)] italic">you</span>
                  )}
                </>
              ) : (
                <button
                  onClick={handleToggleRole}
                  disabled={togglingRole}
                  className="text-[10px] text-[var(--dimmer)] hover:text-[var(--orange)] transition-colors disabled:opacity-50"
                >
                  {togglingRole ? '...' : 'Make admin'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-[var(--border)] self-stretch flex-shrink-0" />

        {/* Progress Bars */}
        <div className="flex-1 min-w-[180px] flex flex-col gap-2">
          {/* Overall */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border)]">
            <span className="text-[10.5px] font-bold text-[var(--text)] w-[120px] flex-shrink-0">
              Playbook Overall
            </span>
            <div className="flex-1 h-[5px] bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${overallPct >= 100 ? 'bg-[var(--green-text)]' : 'bg-[var(--orange)]'}`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <span className="text-[10.5px] font-bold text-[var(--orange)] w-8 text-right flex-shrink-0">
              {overallPct}%
            </span>
          </div>
          {/* Per-module bars */}
          {modulePcts.map((mod) => (
            <div key={mod.slug} className="flex items-center gap-2">
              <span className="text-[10.5px] text-[var(--dim)] w-[120px] flex-shrink-0">
                {mod.num} — {mod.title}
              </span>
              <div className="flex-1 h-[5px] bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${mod.pct >= 100 ? 'bg-[var(--green-text)]' : 'bg-[var(--orange)]'}`}
                  style={{ width: `${mod.pct}%` }}
                />
              </div>
              <span className="text-[10.5px] font-semibold text-[var(--dimmer)] w-8 text-right flex-shrink-0">
                {mod.pct}%
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Delete Button */}
      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-[11px] font-semibold text-[#e05555] bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.25)] rounded-[var(--radius-md)] px-3 py-1.5 cursor-pointer hover:bg-[rgba(224,85,85,0.18)] hover:border-[rgba(224,85,85,0.5)] transition-colors"
        >
          Delete User
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="bg-[var(--surface)] border border-[rgba(224,85,85,0.4)] rounded-[var(--radius-md)] p-4 mb-5">
          <div className="text-[13px] font-semibold text-[var(--text)] mb-1">Delete User</div>
          <div className="text-[12px] text-[var(--dim)] mb-4">
            Delete all data for <strong>{user.email}</strong>? This removes their account and all
            saved progress. This cannot be undone.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="text-[12px] px-3 py-1.5 border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--dim)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-[12px] px-3 py-1.5 bg-[#e05555] text-white rounded-[var(--radius-md)] font-semibold hover:bg-[#c94444] transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Circle Card */}
      {(circleApiKey && circleCommunityId) && (
        <div className="mb-5">
          {circleMember === 'loading' && (
            <div className="text-[12px] text-[var(--dimmer)] italic">Looking up Circle profile...</div>
          )}
          {circleMember === null && (
            <div className="text-[11.5px] text-[var(--dimmer)] italic mb-4">
              Not found in Circle community.
            </div>
          )}
          {circleMember && circleMember !== 'loading' && (
            <div className="bg-[var(--surface)] border border-[var(--blue-border)] rounded-[var(--radius-md)] p-4 mb-3 flex items-center gap-4 flex-wrap">
              <div className="w-11 h-11 rounded-full bg-[var(--blue-bg)] border border-[var(--blue-border)] flex-shrink-0 overflow-hidden flex items-center justify-center text-[16px] font-bold text-[var(--blue-text)]">
                {circleMember.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={circleMember.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (circleMember.name ?? '?').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-[var(--text)] flex items-center gap-1">
                  {circleMember.name}
                  <span className="text-[9px] font-bold uppercase tracking-[.08em] bg-[var(--blue-bg)] text-[var(--blue-text)] border border-[var(--blue-border)] px-2 py-0.5 rounded-full ml-1">
                    Circle Member
                  </span>
                </div>
                <div className="text-[11.5px] text-[var(--dimmer)] mt-0.5">
                  {circleMember.role && <>Role: {circleMember.role}&ensp;&middot;&ensp;</>}
                  {circleMember.created_at &&
                    <>Joined: {new Date(circleMember.created_at).toLocaleDateString()}&ensp;&middot;&ensp;</>}
                  {circleMember.last_seen_at && <>Last active: {circleMember.last_seen_at}</>}
                </div>
              </div>
              {circleMember.public_uid && (
                <a
                  href={`https://community.fscreative.live/members/${circleMember.public_uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[var(--blue-text)] border border-[var(--blue-border)] px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--blue-bg)] transition-colors"
                >
                  View in Circle →
                </a>
              )}
            </div>
          )}

          {/* Award Badge button */}
          {circleMember && circleMember !== 'loading' && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleAwardBadge}
                disabled={badgeStatus === 'loading'}
                className="text-[12px] px-3 py-1.5 bg-[var(--blue-bg)] text-[var(--blue-text)] border border-[var(--blue-border)] rounded-[var(--radius-md)] font-semibold cursor-pointer hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {badgeStatus === 'loading' ? 'Awarding...' : 'Award Badge'}
              </button>
              {badgeMessage && (
                <span
                  className={`text-[12px] ${badgeStatus === 'success' ? 'text-[var(--green-text)]' : 'text-[#e05555]'}`}
                >
                  {badgeMessage}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Answer Grid — 4 module sections */}
      {MODULE_DEFS.map((mod) => {
        const responses = userResponses[mod.slug] ?? {}
        const optFields: { key: string; value: string }[] = []
        const textFields: { key: string; label: string; value: string }[] = []

        for (const [k, v] of Object.entries(responses)) {
          if (SKIP_KEYS.has(k)) continue
          if (typeof v !== 'string' || !v.trim()) continue
          if (k.startsWith('opt_')) {
            optFields.push({ key: k, value: v.trim() })
          } else {
            textFields.push({ key: k, label: getLabelForKey(k), value: v.trim() })
          }
        }

        const fieldCount = textFields.length + optFields.length

        return (
          <div key={mod.slug} className="mb-6 last:mb-0">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <div
                className="text-[22px] font-black text-[var(--orange)] opacity-50 leading-none"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {mod.num}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-[var(--orange)]">
                {mod.title}
              </div>
              <div className="flex-1 h-px bg-[var(--border)]" />
              <div className="text-[10px] text-[var(--dimmer)]">
                {fieldCount > 0
                  ? `${fieldCount} field${fieldCount !== 1 ? 's' : ''}`
                  : 'no text answers yet'}
              </div>
            </div>

            {/* Option chips */}
            {optFields.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {optFields.map(({ key, value }) => {
                  const label = getLabelForKey(key)
                  return (
                    <span
                      key={key}
                      className="text-[11.5px] bg-[var(--orange-tint)] border border-[var(--orange-border)] text-[var(--orange-dark)] px-2.5 py-0.5 rounded-full"
                    >
                      {label}: {value}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Text answer cards */}
            {textFields.length > 0 ? (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {textFields.map(({ key, label, value }) => (
                  <div
                    key={key}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5"
                  >
                    <div className="text-[9.5px] font-bold uppercase tracking-[.07em] text-[var(--dimmer)] mb-0.5">
                      {label}
                    </div>
                    <div className="text-[12.5px] text-[var(--text)] leading-snug break-words whitespace-pre-wrap">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-[var(--dimmer)] italic py-2">
                No answers yet
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
