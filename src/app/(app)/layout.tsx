import { cookies } from 'next/headers'
import { AppShellClient } from '@/components/layout/AppShellClient'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ProgressProvider } from '@/context/ProgressContext'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <AuthProvider>
      <ThemeProvider initialTheme={theme}>
        <ProgressProvider>
          <AppShellClient>
            {children}
          </AppShellClient>
        </ProgressProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
