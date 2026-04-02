'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import type { BlpResponse, ModuleSlug } from '@/types/database'

interface ProgressContextValue {
  moduleProgress: Record<string, number>
  refreshProgress: (slug: ModuleSlug) => Promise<void>
  overallProgress: number
}

const ProgressContext = createContext<ProgressContextValue>({
  moduleProgress: {},
  refreshProgress: async () => {},
  overallProgress: 0,
})

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({})
  const { user } = useAuth()

  const refreshProgress = useCallback(async (slug: ModuleSlug) => {
    if (!user) return

    const supabase = createClient()
    const { data: rawData } = await supabase
      .from('blp_responses')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_slug', slug as string)
      .single()

    // Cast through unknown to handle Supabase generic type narrowing on union columns
    const data = rawData as BlpResponse | null

    if (!data) {
      setModuleProgress(prev => ({ ...prev, [slug]: 0 }))
      return
    }

    const responses = data.responses as Record<string, unknown>
    const keys = Object.keys(responses)
    if (keys.length === 0) {
      setModuleProgress(prev => ({ ...prev, [slug]: 0 }))
      return
    }

    const filled = keys.filter(k => typeof responses[k] === 'string' && (responses[k] as string).trim() !== '').length
    const pct = Math.round((filled / keys.length) * 100)
    setModuleProgress(prev => ({ ...prev, [slug]: pct }))
  }, [user])

  const overallProgress = useMemo(() => {
    const values = Object.values(moduleProgress)
    return values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0
  }, [moduleProgress])

  return (
    <ProgressContext.Provider value={{ moduleProgress, refreshProgress, overallProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
