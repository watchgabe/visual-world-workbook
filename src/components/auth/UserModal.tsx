'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useProgress } from '@/context/ProgressContext'

interface UserModalProps {
  email: string
  name?: string
  handle?: string
  onSignOut: () => void
  onClose: () => void
}

const MODULES = [
  { slug: 'brand-foundation', label: '01 — Brand Foundation' },
  { slug: 'visual-world',     label: '02 — Visual World' },
  { slug: 'content',          label: '03 — Create Content' },
  { slug: 'launch',           label: '04 — Launch' },
] as const

export function UserModal({ email, name: initialName, handle: initialHandle, onSignOut, onClose }: UserModalProps) {
  const [nameVal, setNameVal] = useState(initialName ?? '')
  const [handleVal, setHandleVal] = useState(initialHandle ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clearingModule, setClearingModule] = useState<string | null>(null)
  const [confirmClearModule, setConfirmClearModule] = useState<string | null>(null)
  const [showClearAll, setShowClearAll] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)

  const { moduleProgress, overallProgress } = useProgress()

  async function handleSaveProfile() {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: {
        full_name: nameVal.trim() || null,
        ig_handle: handleVal.trim() || null,
      },
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleClearModule(moduleSlug: string) {
    setClearingModule(moduleSlug)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await (supabase as unknown as { from: (t: string) => { delete: () => { match: (m: Record<string, string>) => Promise<unknown> } } })
        .from('blp_responses')
        .delete()
        .match({ user_id: user.id, module_slug: moduleSlug })
    }
    setClearingModule(null)
    window.location.reload()
  }

  async function handleClearAll() {
    setClearingAll(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await (supabase as unknown as { from: (t: string) => { delete: () => { eq: (k: string, v: string) => Promise<unknown> } } })
        .from('blp_responses')
        .delete()
        .eq('user_id', user.id)
    }
    setClearingAll(false)
    setShowClearAll(false)
    window.location.reload()
  }

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 flex items-start justify-center overflow-y-auto p-0 sm:p-4"
        style={{
          zIndex: 99999,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Panel */}
        <div
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Your account"
          className="w-full sm:max-w-[560px] sm:my-auto sm:rounded-[var(--radius-lg)]"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border2)',
            minHeight: '100dvh',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.1rem 1.4rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--orange)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '2px' }}>
                FSCreative™
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.2px' }}>
                Your Account
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--dimmer)',
                fontSize: '16px',
                padding: '4px 6px',
                lineHeight: 1,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font)',
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.4rem' }}>

            {/* Profile Section */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dimmer)', marginBottom: '.75rem' }}>
                Profile
              </div>
              <div style={{ marginBottom: '.7rem' }}>
                <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontFamily: 'var(--font)',
                    color: 'var(--text)',
                    background: 'var(--bg)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--orange)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div style={{ marginBottom: '.7rem' }}>
                <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{
                    width: '100%',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontFamily: 'var(--font)',
                    color: 'var(--dimmer)',
                    background: 'var(--bg)',
                    boxSizing: 'border-box',
                    opacity: 0.7,
                  }}
                />
              </div>
              <div style={{ marginBottom: '.7rem' }}>
                <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={handleVal}
                  onChange={e => setHandleVal(e.target.value)}
                  placeholder="@yourhandle"
                  style={{
                    width: '100%',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 12px',
                    fontSize: '13px',
                    fontFamily: 'var(--font)',
                    color: 'var(--text)',
                    background: 'var(--bg)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--orange)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  width: '100%',
                  background: 'var(--orange)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font)',
                  marginTop: '.35rem',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && (
                <div style={{ fontSize: '12px', color: 'var(--green-text)', marginTop: '.6rem', textAlign: 'center' }}>
                  Profile updated
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.4rem' }} />

            {/* Playbook Progress */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dimmer)', marginBottom: '.75rem' }}>
                Playbook Progress
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>{overallProgress}%</span>
                <span style={{ fontSize: '11px', color: 'var(--dimmer)' }}>complete across all modules</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${overallProgress}%`, background: overallProgress >= 100 ? 'var(--green-text)' : 'var(--orange)', borderRadius: '3px', transition: 'width .3s' }} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.4rem' }} />

            {/* Module Progress */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dimmer)', marginBottom: '.75rem' }}>
                Module Progress
              </div>
              {MODULES.map(mod => {
                const pct = moduleProgress[mod.slug] ?? 0
                const isClearing = clearingModule === mod.slug
                const isConfirming = confirmClearModule === mod.slug
                return (
                  <div key={mod.slug}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.35rem 0' }}>
                      <span style={{ fontSize: '12px', color: 'var(--dim)' }}>{mod.label}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: pct >= 100 ? 'var(--green-text)' : 'var(--dimmer)', minWidth: '32px', textAlign: 'right' }}>
                          {pct}%
                        </span>
                        <button
                          onClick={() => setConfirmClearModule(isConfirming ? null : mod.slug)}
                          disabled={isClearing}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '11px',
                            color: isConfirming ? '#e05555' : 'var(--dimmer)',
                            cursor: isClearing ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font)',
                            textDecoration: 'underline',
                            padding: 0,
                            opacity: isClearing ? 0.5 : 1,
                          }}
                        >
                          {isClearing ? '...' : 'Clear'}
                        </button>
                      </span>
                    </div>
                    {isConfirming && (
                      <div style={{ padding: '.5rem .75rem', marginBottom: '.35rem', background: 'rgba(220,50,50,.07)', border: '1px solid rgba(220,50,50,.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#e05555', fontWeight: 600 }}>Clear this module?</span>
                        <span style={{ display: 'flex', gap: '.5rem' }}>
                          <button
                            onClick={() => { setConfirmClearModule(null); handleClearModule(mod.slug) }}
                            style={{ fontSize: '11px', color: '#e05555', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', textDecoration: 'underline', padding: 0 }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmClearModule(null)}
                            style={{ fontSize: '11px', color: 'var(--dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', padding: 0 }}
                          >
                            Cancel
                          </button>
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Clear All */}
              <button
                onClick={() => setShowClearAll(true)}
                style={{
                  width: '100%',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(220,50,50,.3)',
                  background: 'rgba(220,50,50,.06)',
                  color: '#e05555',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  marginTop: '.65rem',
                }}
              >
                Clear All Progress
              </button>
              {showClearAll && (
                <div style={{ marginTop: '.75rem', padding: '.85rem', background: 'rgba(220,50,50,.07)', border: '1px solid rgba(220,50,50,.2)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '12px', color: '#e05555', fontWeight: 600, margin: '0 0 .6rem' }}>
                    This will erase all your answers. Are you sure?
                  </p>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button
                      onClick={handleClearAll}
                      disabled={clearingAll}
                      style={{
                        flex: 1,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(220,50,50,.3)',
                        background: 'rgba(220,50,50,.06)',
                        color: '#e05555',
                        borderRadius: 'var(--radius-md)',
                        padding: '9px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: clearingAll ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font)',
                        opacity: clearingAll ? 0.5 : 1,
                      }}
                    >
                      {clearingAll ? 'Clearing...' : 'Yes, Clear Everything'}
                    </button>
                    <button
                      onClick={() => setShowClearAll(false)}
                      style={{
                        flex: 1,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--border2)',
                        background: 'none',
                        color: 'var(--dim)',
                        borderRadius: 'var(--radius-md)',
                        padding: '9px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'var(--font)',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.4rem' }} />

            {/* Upsell */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.4rem',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.45rem' }}>
                Take It Further
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '.35rem', letterSpacing: '-.2px' }}>
                Ready to build faster?
              </div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '.85rem' }}>
                Work with Gabe 1:1 to turn your playbook into a full launch — content calendar, offer stack, and go-to-market plan built specifically for your brand.
              </div>
              <a
                href="https://fscreative.live"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'var(--orange)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'var(--font)',
                }}
              >
                Book a Strategy Call →
              </a>
            </div>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              style={{
                width: '100%',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border2)',
                background: 'none',
                color: 'var(--dim)',
                borderRadius: 'var(--radius-md)',
                padding: '9px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              Sign Out
            </button>

          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
