import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { ProgressProvider, useProgress } from '@/context/ProgressContext'

// Mock next/navigation for useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }),
}))

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    loading: false,
    signOut: vi.fn(),
  }),
}))

// ---- ThemeProvider tests ----

describe('ThemeProvider', () => {
  it('renders children and provides default theme from initialTheme prop', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
  })

  it('useTheme returns theme and setTheme function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBeDefined()
    expect(typeof result.current.setTheme).toBe('function')
  })

  it('setTheme updates the theme state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider initialTheme="dark">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
  })

  it('accepts light as initialTheme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider initialTheme="light">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
  })
})

// ---- ProgressProvider tests ----

describe('ProgressProvider', () => {
  it('renders children with empty moduleProgress initially', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressProvider>{children}</ProgressProvider>
    )

    const { result } = renderHook(() => useProgress(), { wrapper })

    expect(result.current.moduleProgress).toEqual({})
  })

  it('provides overallProgress as 0 when moduleProgress is empty', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressProvider>{children}</ProgressProvider>
    )

    const { result } = renderHook(() => useProgress(), { wrapper })

    expect(result.current.overallProgress).toBe(0)
  })

  it('useProgress returns moduleProgress and refreshProgress', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressProvider>{children}</ProgressProvider>
    )

    const { result } = renderHook(() => useProgress(), { wrapper })

    expect(result.current.moduleProgress).toBeDefined()
    expect(typeof result.current.refreshProgress).toBe('function')
  })

  it('useProgress returns overallProgress as a number', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressProvider>{children}</ProgressProvider>
    )

    const { result } = renderHook(() => useProgress(), { wrapper })

    expect(typeof result.current.overallProgress).toBe('number')
  })
})
