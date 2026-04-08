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
  const { moduleProgress, sectionProgress, overallProgress } = useProgress()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)

  // Auto-expand the active module on first render
  if (!initialized && pathname) {
    const activeSlug = MODULES.find(m => pathname === `/modules/${m.slug}` || pathname.startsWith(`/modules/${m.slug}/`))?.slug
    if (activeSlug) expandedSlugs.add(activeSlug)
    setInitialized(true)
  }

  const toggleExpand = (slug: string) => {
    setExpandedSlugs(prev => {
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
          padding: '1.35rem 1.25rem 1.1rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {(() => {
          const activeModule = MODULES.find(m => pathname.startsWith(`/modules/${m.slug}`))
          if (activeModule && activeModule.slug !== 'welcome') {
            return (
              <>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--orange)',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    marginBottom: '3px',
                  }}
                >
                  FSCreative&#8482; &#8212; Module {activeModule.number}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--dim)',
                    lineHeight: 1.45,
                  }}
                >
                  {activeModule.title}&#8482;
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
              </>
            )
          }
          return (
            <>
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
            </>
          )
        })()}
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
          const isExpanded = expandedSlugs.has(mod.slug)
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
                  transition: 'all .15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--card)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = ''
                  }
                }}
              >
                <Link
                  href={href}
                  onClick={() => {
                    if (hasSections && !isExpanded) toggleExpand(mod.slug)
                    onClose?.()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    padding: '14px 0 14px 1rem',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-num)',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: isActive ? 'var(--orange)' : 'var(--orange)',
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
                        color: isActive ? 'var(--orange)' : 'var(--text)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {mod.title}
                    </div>
                    {mod.subtitle && isActive && (
                      <div
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 400,
                          color: 'var(--dimmer)',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '1px',
                        }}
                      >
                        {mod.subtitle}
                      </div>
                    )}
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
                      <ProgressRing percent={progress} size={18} showLabel={false} />
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 600,
                          color: progress === 100 ? 'var(--green-text)' : 'var(--dimmer)',
                          whiteSpace: 'nowrap',
                          minWidth: '24px',
                          textAlign: 'right',
                          marginLeft: '-2px',
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
                </div>
              </div>

              {/* Section sub-items (expandable) */}
              {hasSections && isExpanded && (
                <div style={{ paddingBottom: '4px' }}>
                  {sections.filter(s => s.slug !== 'overview').map(section => {
                    const sectionHref = `/modules/${mod.slug}/${section.slug}`
                    const isSectionActive = pathname === sectionHref
                    const sectionPercent: number = sectionProgress[mod.slug]?.[section.slug] ?? 0

                    // 3 states: 0% = outline circle + gray text, >0% = filled circle + white text, 100% = green circle + green text
                    const isStarted = sectionPercent > 0
                    const isComplete = sectionPercent === 100

                    const dotColor = isComplete
                      ? 'var(--green-text)'
                      : isStarted
                        ? 'var(--text)'
                        : 'transparent'
                    const dotBorder = isComplete
                      ? '1.5px solid var(--green-text)'
                      : isStarted
                        ? '1.5px solid var(--text)'
                        : '1.5px solid var(--dimmer)'
                    const textColor = isComplete
                      ? 'var(--green-text)'
                      : isStarted
                        ? 'var(--text)'
                        : 'var(--dim)'

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
                          borderLeft: `2px solid ${isSectionActive ? 'var(--orange)' : isComplete ? 'var(--green-text)' : 'transparent'}`,
                          background: isSectionActive ? 'var(--orange-tint)' : isComplete ? 'var(--green-bg)' : undefined,
                          transition: 'all .15s',
                        }}
                        onMouseEnter={e => {
                          if (!isSectionActive) {
                            e.currentTarget.style.background = isComplete ? 'var(--green-bg)' : 'var(--card)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSectionActive) {
                            e.currentTarget.style.background = isComplete ? 'var(--green-bg)' : ''
                          }
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: isSectionActive ? 'var(--orange)' : dotColor,
                            border: isSectionActive ? '1.5px solid var(--orange)' : dotBorder,
                            marginRight: '10px',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            color: isSectionActive ? 'var(--orange)' : textColor,
                            fontWeight: isSectionActive ? 600 : 400,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {section.name}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: isComplete ? 'var(--green-text)' : (isSectionActive && sectionPercent === 0) ? 'var(--orange)' : 'var(--dimmer)',
                            marginLeft: '6px',
                          }}
                        >
                          {sectionPercent > 0 ? `${sectionPercent}%` : isSectionActive ? '–' : ''}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sidebar footer */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {/* User card row */}
        {user && (
          <button
            type="button"
            onClick={() => setModalOpen(prev => !prev)}
            aria-label="Account options"
            aria-expanded={modalOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font)',
              transition: 'background .12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--card)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--bg)',
                border: '2px solid var(--orange)',
                color: 'var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user.user_metadata?.full_name
                ? (user.user_metadata.full_name as string)[0].toUpperCase()
                : user.email
                  ? user.email[0].toUpperCase()
                  : '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {user.user_metadata?.full_name && (
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.user_metadata.full_name as string}
                </div>
              )}
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--dimmer)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </div>
            </div>
          </button>
        )}

        {/* Progress bar + theme toggle row */}
        <div
          style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ flex: 1 }}>
            <ProgressBar percent={overallProgress} />
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* User modal — centered on screen */}
      {modalOpen && user && (
        <UserModal
          email={user.email ?? ''}
          name={user.user_metadata?.full_name as string | undefined}
          handle={user.user_metadata?.ig_handle as string | undefined}
          onSignOut={signOut}
          onClose={() => setModalOpen(false)}
        />
      )}
    </aside>
  )
}
