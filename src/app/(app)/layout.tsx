import { cookies } from 'next/headers'
import { AppShellClient } from '@/components/layout/AppShellClient'
import { AuthProvider } from '@/context/AuthContext'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <AuthProvider>
      <AppShellClient currentTheme={theme}>
        {children}
      </AppShellClient>
    </AuthProvider>
  )
}
