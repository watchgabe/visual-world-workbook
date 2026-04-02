'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import { ProgressBar } from './ProgressBar'
import { ProgressRing } from '@/components/workshop/ProgressRing'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import { UserModal } from '@/components/auth/UserModal'
import type { ModuleSlug } from '@/types/database'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { moduleProgress, overallProgress } = useProgress()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleExpand = (slug: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        minWidth: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 200,
        overflow: 'hidden',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        transform: isOpen ? 'translateX(0)' : undefined,
      }}
      className={[
        'md:translate-x-0',
        !isOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
      ].join(' ')}
    >
      {/* Sidebar header */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--orange)',
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          FSCreative&#8482;
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.35,
          }}
        >
          The Brand Launch Playbook&#8482;
        </div>
        <div
          style={{
            height: '2px',
            background: 'var(--orange)',
            borderRadius: '1px',
            marginTop: '10px',
            opacity: 0.7,
          }}
        />
      </div>

      {/* Module navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '.5rem 0',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border2) transparent',
        }}
      >
        {MODULES.map(mod => {
          const href = `/modules/${mod.slug}`
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          const sections = MODULE_SECTIONS[mod.slug as ModuleSlug]
          const hasSections = sections && sections.length > 0
          const isExpanded = isActive || expandedModules.has(mod.slug)
          const progress = moduleProgress[mod.slug] ?? 0

          return (
            <div
              key={mod.slug}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {/* Module row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: `2px solid ${isActive ? 'var(--orange)' : 'transparent'}`,
                  background: isActive ? 'var(--orange-tint)' : undefined,
                  transition: 'background .15s, border-color .15s',
                }}
              >
                <Link
                  href={href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    padding: '10px 0 10px 1rem',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-num)',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: 'var(--orange)',
                      lineHeight: 1,
                      marginRight: '10px',
                      flexShrink: 0,
                      minWidth: '28px',
                    }}
                  >
                    {mod.number}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: 'var(--text)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {mod.title}
                    </div>
                  </div>
                </Link>

                {/* Progress + expand toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    paddingRight: '0.75rem',
                  }}
                >
                  {hasSections && (
                    <>
                      <ProgressRing percent={progress} size={20} />
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 600,
                          color: 'var(--dimmer)',
                          whiteSpace: 'nowrap',
                          minWidth: '24px',
                          textAlign: 'right',
                        }}
                      >
                        {progress}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleExpand(mod.slug)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--dimmer)',
                          fontSize: '10px',
                          padding: '2px 4px',
                          lineHeight: 1,
                          transition: 'transform .15s',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        aria-label={isExpanded ? 'Collapse sections' : 'Expand sections'}
                      >
                        ▼
                      </button>
                    </>
                  )}
                  {!hasSections && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 600,
                        color: 'var(--dimmer)',
                        whiteSpace: 'nowrap',
                        minWidth: '24px',
                        textAlign: 'right',
                        paddingRight: '18px',
                      }}
                    >
                      {progress}%
                    </span>
                  )}
                </div>
              </div>

              {/* Section sub-items (expandable) */}
              {hasSections && isExpanded && (
                <div style={{ paddingBottom: '4px' }}>
                  {sections.filter(s => s.slug !== 'overview').map(section => {
                    const sectionHref = `/modules/${mod.slug}/${section.slug}`
                    const isSectionActive = pathname === sectionHref
                    const sectionComplete = false // TODO: wire to real completion data

                    return (
                      <Link
                        key={section.slug}
                        href={sectionHref}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 1rem 6px 3.5rem',
                          textDecoration: 'none',
                          background: isSectionActive ? 'var(--orange-tint)' : undefined,
                          transition: 'background .12s',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: sectionComplete ? 'var(--green-text)' : 'var(--dimmer)',
                            marginRight: '10px',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            color: sectionComplete ? 'var(--green-text)' : 'var(--dim)',
                            fontWeight: isSectionActive ? 600 : 400,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {section.name}
                        </span>
                        {sectionComplete && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: 'var(--green-text)',
                              marginLeft: '6px',
                            }}
                          >
                            100%
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sidebar footer — progress bar + user trigger + theme toggle */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div style={{ flex: 1 }}>
          <ProgressBar percent={overallProgress} />
        </div>

        {user && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setModalOpen(prev => !prev)}
              aria-label="Account options"
              aria-expanded={modalOpen}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--border2)',
                color: 'var(--dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'var(--font)',
                transition: 'background .12s, color .12s',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--orange-tint)'
                e.currentTarget.style.color = 'var(--orange)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--border2)'
                e.currentTarget.style.color = 'var(--dim)'
              }}
            >
              {user.email ? user.email[0].toUpperCase() : '?'}
            </button>

            {modalOpen && (
              <UserModal
                email={user.email ?? ''}
                onSignOut={signOut}
                onClose={() => setModalOpen(false)}
              />
            )}
          </div>
        )}

        <ThemeToggle />
      </div>
    </aside>
  )
}
