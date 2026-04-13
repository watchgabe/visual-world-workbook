'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileTopbar } from './MobileTopbar'

interface AppShellClientProps {
  children: React.ReactNode
}

export function AppShellClient({ children }: AppShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Open sidebar by default on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true)
  }, [])

  // Scroll to top of main content container on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      {/* Mobile topbar — visible below 768px only */}
      <MobileTopbar onToggle={() => setSidebarOpen(prev => !prev)} />

      {/* Overlay — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[150] md:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Desktop toggle button — only visible when sidebar is closed */}
      {!sidebarOpen && (
        <button
          className="hidden md:flex"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 201,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '7px',
            cursor: 'pointer',
            color: 'var(--text)',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background .12s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      <main
        ref={mainRef}
        className="ml-0 min-h-screen overflow-y-auto"
        style={{
          height: '100vh',
          marginLeft: sidebarOpen ? undefined : undefined,
          transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div
          className="pt-[calc(var(--topbar-h)+0.75rem)] pb-4 px-3 md:pt-6 md:pb-6 md:px-6"
          style={{
            marginLeft: sidebarOpen ? 'var(--sidebar-w)' : 0,
            transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {children}
        </div>
      </main>
    </>
  )
}
