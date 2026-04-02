import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/hooks/useAutoSave'

// We create the mockUpsert here so tests can assert on it
const mockUpsert = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}))

// Control user state via this object so we can mutate it per-test
const authState = { user: { id: 'test-user' } as { id: string } | null }

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: false,
    signOut: vi.fn(),
  }),
}))

const mockRefreshProgress = vi.fn().mockResolvedValue(undefined)

vi.mock('@/context/ProgressContext', () => ({
  useProgress: () => ({
    moduleProgress: {},
    refreshProgress: mockRefreshProgress,
    overallProgress: 0,
  }),
}))

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockUpsert.mockClear()
    mockRefreshProgress.mockClear()
    // Reset user to logged-in state
    authState.user = { id: 'test-user' }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does NOT call Supabase immediately when value is set', () => {
    renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'a',
      })
    )

    // Advance timer by less than the debounce
    vi.advanceTimersByTime(4999)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('calls Supabase after 5000ms debounce', async () => {
    renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'hello',
      })
    )

    // Advance past debounce and flush promises
    await act(async () => {
      vi.advanceTimersByTime(5000)
      await Promise.resolve()
    })

    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it('calls Supabase immediately on blur (handleBlur) without waiting for timer', async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'test-blur',
      })
    )

    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })

    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it('handleBlur sets isFocused to false', async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'test',
      })
    )

    // First focus it
    act(() => {
      result.current.handleFocus()
    })
    expect(result.current.isFocused).toBe(true)

    // Then blur it
    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })
    expect(result.current.isFocused).toBe(false)
  })

  it('handleFocus sets isFocused to true and clears saveError', async () => {
    mockUpsert.mockResolvedValueOnce({
      error: { message: 'Network error', name: 'PostgrestError' },
    })

    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'oops',
      })
    )

    // Trigger a save that fails
    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })

    expect(result.current.saveError).toBe('Network error')

    // Now focus again — error should clear
    act(() => {
      result.current.handleFocus()
    })

    expect(result.current.isFocused).toBe(true)
    expect(result.current.saveError).toBeNull()
  })

  it('sets saveError on non-abort failure', async () => {
    mockUpsert.mockResolvedValueOnce({
      error: { message: 'Network error', name: 'PostgrestError' },
    })

    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'fail',
      })
    )

    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })

    expect(result.current.saveError).toBe('Network error')
  })

  it('does NOT set saveError on AbortError', async () => {
    // Make upsert throw an AbortError (via rejection)
    mockUpsert.mockRejectedValueOnce({ name: 'AbortError', message: 'aborted' })

    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'abort',
      })
    )

    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })

    expect(result.current.saveError).toBeNull()
  })

  it('retry calls doSave directly', async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'retry-me',
      })
    )

    await act(async () => {
      result.current.retry()
      await Promise.resolve()
    })

    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it('does NOT call Supabase when user is null', async () => {
    authState.user = null

    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'should-not-save',
      })
    )

    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })

    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('calls refreshProgress after successful save', async () => {
    const { result } = renderHook(() =>
      useAutoSave({
        moduleSlug: 'brand-foundation',
        fieldKey: 'q1',
        value: 'refresh-test',
      })
    )

    await act(async () => {
      result.current.handleBlur()
      await Promise.resolve()
    })

    expect(mockRefreshProgress).toHaveBeenCalledWith('brand-foundation')
  })
})
