'use client'

import { ThemeToggle } from './ThemeToggle'

interface MobileTopbarProps {
  onToggle: () => void
  currentTheme: 'dark' | 'light'
}

export function MobileTopbar({ onToggle, currentTheme }: MobileTopbarProps) {
  return (
    <header
      className="flex md:hidden fixed top-0 left-0 right-0 items-center z-[200]"
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1rem',
        gap: '12px',
      }}
    >
      <button
        onClick={onToggle}
        aria-label="Open menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          flexShrink: 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--orange)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          FSCreative&#8482;
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          The Brand Launch Playbook&#8482;
        </div>
      </div>

      <ThemeToggle currentTheme={currentTheme} />
    </header>
  )
}
