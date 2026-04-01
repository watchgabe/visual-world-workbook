'use client'

import { ThemeToggle } from './ThemeToggle'
import { ProgressBar } from './ProgressBar'

interface TopbarProps {
  currentTheme: 'dark' | 'light'
}

export function Topbar({ currentTheme }: TopbarProps) {
  return (
    <header
      className="hidden md:flex fixed top-0 right-0 items-center justify-between z-[100]"
      style={{
        left: 'var(--sidebar-w)',
        height: 'var(--topbar-h)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--orange)',
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        FSCreative&#8482;
      </span>
      <div style={{ flex: 1, maxWidth: '300px', margin: '0 2rem' }}>
        <ProgressBar percent={0} />
      </div>
      <ThemeToggle currentTheme={currentTheme} />
    </header>
  )
}
