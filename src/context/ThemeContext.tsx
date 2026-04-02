'use client'
import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ThemeContextValue {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
})

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme: 'dark' | 'light'
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<'dark' | 'light'>(initialTheme)
  const router = useRouter()

  function setTheme(next: 'dark' | 'light') {
    setThemeState(next)
    document.cookie = `blp-theme=${next}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
