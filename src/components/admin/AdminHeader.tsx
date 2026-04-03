'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useTheme } from '@/context/ThemeContext'

export default function AdminHeader() {
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--border)] px-8 py-4 flex items-center justify-between">
      <div>
        <div className="text-[11px] font-bold text-[var(--orange)] tracking-[.1em] uppercase">
          FSCREATIVE
        </div>
        <div className="text-[13px] text-[var(--dim)] mt-0.5">
          Admin Dashboard
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="text-[12px] text-[var(--dimmer)] cursor-pointer bg-transparent border border-[var(--border)] px-2.5 py-1.5 rounded-[var(--radius-md)] hover:text-[var(--text)] hover:border-[var(--border2)] transition-colors"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button
          onClick={handleSignOut}
          className="text-[12px] text-[var(--dimmer)] cursor-pointer bg-transparent border border-[var(--border)] px-2.5 py-1.5 rounded-[var(--radius-md)] hover:text-[var(--text)] hover:border-[var(--border2)] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
