import { cookies } from 'next/headers'
import { ThemeProvider } from '@/context/ThemeContext'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <ThemeProvider initialTheme={theme}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <AdminHeader />
        {children}
      </div>
    </ThemeProvider>
  )
}
