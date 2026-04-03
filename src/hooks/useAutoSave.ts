'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import type { ModuleSlug } from '@/types/database'

export interface UseAutoSaveOptions {
  moduleSlug: ModuleSlug
  fieldKey: string
  value: string
  onSaveSuccess?: () => void
  /** @deprecated No longer used — merge_responses RPC handles partial merges server-side */
  getFullResponses?: () => Record<string, string>
}

export interface UseAutoSaveReturn {
  saveError: string | null  // null = no error; string = error message
  isFocused: boolean        // true while field has focus
  handleBlur: () => void    // attach to onBlur
  handleFocus: () => void   // attach to onFocus
  retry: () => void         // manual retry per D-04
}

export function useAutoSave(opts: UseAutoSaveOptions): UseAutoSaveReturn {
  // useState only for values that need to trigger re-renders for UI
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // useRef for values that must NOT cause re-renders
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const latestValueRef = useRef(opts.value)
  const mountedRef = useRef(true)

  const { user } = useAuth()
  const { refreshProgress } = useProgress()

  // Keep latestValueRef in sync (avoids stale closure pitfall)
  useEffect(() => {
    latestValueRef.current = opts.value
  }, [opts.value])

  // Mounted ref for cleanup (avoids React warning on setState after unmount)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const cancelPending = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (controllerRef.current) controllerRef.current.abort()
  }, [])

  const doSave = useCallback(async () => {
    // If user is null, do not attempt saves
    if (!user) return

    // Abort any existing in-flight request before issuing a new one
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    const supabase = createClient()
    // Read value from ref (NOT from closure) to avoid stale closure pitfall
    const currentValue = latestValueRef.current

    try {
      // Send only the changed field — Postgres merges via JSONB || operator
      const data = { [opts.fieldKey]: currentValue }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .rpc('merge_responses', {
          p_user_id: user.id,
          p_module_slug: opts.moduleSlug,
          p_data: data,
        })

      if (error) {
        // Check if this is an AbortError (expected cancellation)
        if (error.name === 'AbortError' || (error as { code?: string }).code === '20') {
          return
        }
        if (mountedRef.current) {
          setSaveError(error.message)
        }
        return
      }

      if (mountedRef.current) {
        setSaveError(null)
        opts.onSaveSuccess?.()
        await refreshProgress(opts.moduleSlug)
      }
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string }
      // Silently return on AbortError (expected cancellation)
      if (error.name === 'AbortError') return

      if (mountedRef.current) {
        setSaveError(error.message ?? 'Unknown error')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, opts.moduleSlug, opts.fieldKey, refreshProgress])

  // Track whether the user has interacted with this field (focus then change)
  const userTouchedRef = useRef(false)
  // Track the last saved/loaded value to detect real changes
  const lastSavedValueRef = useRef(opts.value)

  // Debounce effect: 5s debounce OR blur, whichever first (per D-02)
  // Only saves when the value actually differs from what was loaded/last saved
  useEffect(() => {
    // Skip if value matches what was loaded or last saved (no real change)
    if (opts.value === lastSavedValueRef.current) return
    // Skip saving empty values unless the user has explicitly interacted
    if (!opts.value && !userTouchedRef.current) {
      lastSavedValueRef.current = opts.value
      return
    }
    cancelPending()
    timerRef.current = setTimeout(() => {
      doSave()
      lastSavedValueRef.current = latestValueRef.current
    }, 5000)
    return cancelPending  // cleanup on unmount or value change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.value])

  // handleBlur: save immediately, clear timer, update focused state
  const handleBlur = useCallback(() => {
    cancelPending()
    // Only save on blur if value actually changed from last saved
    if (latestValueRef.current !== lastSavedValueRef.current) {
      doSave()
      lastSavedValueRef.current = latestValueRef.current
    }
    setIsFocused(false)
  }, [cancelPending, doSave])

  // handleFocus: mark focused, clear error (user re-engaging)
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    userTouchedRef.current = true
    setSaveError(null)
  }, [])

  // retry: call doSave directly, bypassing debounce timer
  const retry = useCallback(() => {
    doSave()
  }, [doSave])

  return {
    saveError,
    isFocused,
    handleBlur,
    handleFocus,
    retry,
  }
}
