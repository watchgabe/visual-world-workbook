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

  // Scroll to top of main content container on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      {/* Mobile topbar — visible below 768px only */}
      <MobileTopbar
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      {/* Overlay — per D-11: dark overlay on mobile when sidebar is open */}
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

      <main
        ref={mainRef}
        className="ml-0 md:ml-[280px] min-h-screen overflow-y-auto"
        style={{ height: '100vh' }}
      >
        {/* Mobile: top padding clears topbar + small gap. Desktop: standard padding, no topbar. */}
        <div className="pt-[calc(var(--topbar-h)+0.75rem)] pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
          {children}
        </div>
      </main>
    </>
  )
}
