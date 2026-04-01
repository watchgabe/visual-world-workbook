'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MODULES } from '@/lib/modules'
import { ProgressBar } from './ProgressBar'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: 'dark' | 'light'
}

export function Sidebar({ isOpen, onClose, currentTheme }: SidebarProps) {
  const pathname = usePathname()

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
        // On mobile: slide in/out. On desktop (md+): always visible.
        transform: isOpen ? 'translateX(0)' : undefined,
      }}
      className={[
        // Desktop: always visible (no transform)
        // Mobile: hidden by default, visible when isOpen
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

          return (
            <div
              key={mod.slug}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      marginLeft: '8px',
                      paddingRight: '1rem',
                    }}
                  >
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
                      0%
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Sidebar footer — progress bar + theme toggle (matches original layout) */}
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
          <ProgressBar percent={0} />
        </div>
        <ThemeToggle currentTheme={currentTheme} />
      </div>
    </aside>
  )
}
