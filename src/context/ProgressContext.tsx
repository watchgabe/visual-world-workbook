'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { MODULE_SECTIONS } from '@/lib/modules'
import type { BlpResponse, ModuleSlug } from '@/types/database'

interface ProgressContextValue {
  moduleProgress: Record<string, number>
  sectionProgress: Record<string, Record<string, number>>
  refreshProgress: (slug: ModuleSlug) => Promise<void>
  overallProgress: number
}

const ProgressContext = createContext<ProgressContextValue>({
  moduleProgress: {},
  sectionProgress: {},
  refreshProgress: async () => {},
  overallProgress: 0,
})

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({})
  const [sectionProgress, setSectionProgress] = useState<Record<string, Record<string, number>>>({})
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
    const sections = MODULE_SECTIONS[slug]

    if (!sections) return

    const responses = (data?.responses ?? {}) as Record<string, unknown>

    // Per-section progress: filled fields / total fields
    const secProg: Record<string, number> = {}
    for (const section of sections) {
      if (section.fields.length === 0) {
        secProg[section.slug] = 0
        continue
      }
      const filled = section.fields.filter(f => typeof responses[f.key] === 'string' && (responses[f.key] as string).trim() !== '').length
      secProg[section.slug] = Math.round((filled / section.fields.length) * 100)
    }
    setSectionProgress(prev => ({ ...prev, [slug]: secProg }))

    // Module progress: average of sections that have fields
    const sectionsWithFields = sections.filter(s => s.fields.length > 0)
    const modulePct = sectionsWithFields.length > 0
      ? Math.round(sectionsWithFields.reduce((sum, s) => sum + (secProg[s.slug] ?? 0), 0) / sectionsWithFields.length)
      : 0
    setModuleProgress(prev => ({ ...prev, [slug]: modulePct }))
  }, [user])

  // Load progress for all modules on mount
  useEffect(() => {
    if (!user) return
    const slugs: ModuleSlug[] = ['brand-foundation', 'visual-world', 'content', 'launch']
    slugs.forEach(slug => refreshProgress(slug))
  }, [user, refreshProgress])

  const overallProgress = useMemo(() => {
    const values = Object.values(moduleProgress)
    return values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0
  }, [moduleProgress])

  return (
    <ProgressContext.Provider value={{ moduleProgress, sectionProgress, refreshProgress, overallProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
