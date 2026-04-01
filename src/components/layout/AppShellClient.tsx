'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileTopbar } from './MobileTopbar'

interface AppShellClientProps {
  children: React.ReactNode
  currentTheme: 'dark' | 'light'
}

export function AppShellClient({ children, currentTheme }: AppShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile topbar — visible below 768px only */}
      <MobileTopbar
        onToggle={() => setSidebarOpen(prev => !prev)}
        currentTheme={currentTheme}
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
        currentTheme={currentTheme}
      />

      <main
        className="ml-0 md:ml-[280px] min-h-screen overflow-y-auto"
        style={{ height: '100vh' }}
      >
        {/* Mobile: add top padding for mobile topbar. Desktop: no topbar, no padding needed */}
        <div className="pt-[var(--topbar-h)] md:pt-0 p-6">
          {children}
        </div>
      </main>
    </>
  )
}
