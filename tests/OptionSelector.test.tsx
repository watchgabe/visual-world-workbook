import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { OptionSelector } from '../src/components/workshop/OptionSelector'

const mockHandleBlur = vi.fn()
const mockHandleFocus = vi.fn()
const mockRetry = vi.fn()
const mockUseAutoSave = vi.fn(() => ({
  saveError: null,
  isFocused: false,
  handleBlur: mockHandleBlur,
  handleFocus: mockHandleFocus,
  retry: mockRetry,
}))

vi.mock('../src/hooks/useAutoSave', () => ({
  useAutoSave: (...args: unknown[]) => mockUseAutoSave(...args),
}))

const OPTIONS = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
  { label: 'Option D', value: 'd' },
]

describe('OptionSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAutoSave.mockReturnValue({
      saveError: null,
      isFocused: false,
      handleBlur: mockHandleBlur,
      handleFocus: mockHandleFocus,
      retry: mockRetry,
    })
  })

  it('renders a button for each option', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('selected option has orange-tint background', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    const selectedBtn = screen.getByRole('button', { name: 'Option B' })
    expect(selectedBtn).toHaveStyle({ background: 'var(--orange-tint)' })
  })

  it('selected option has orange-dark text color', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    const selectedBtn = screen.getByRole('button', { name: 'Option B' })
    expect(selectedBtn).toHaveStyle({ color: 'var(--orange-dark)' })
  })

  it('non-selected option has surface background', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    const unselectedBtn = screen.getByRole('button', { name: 'Option A' })
    expect(unselectedBtn).toHaveStyle({ background: 'var(--surface)' })
  })

  it('non-selected option has dim text color', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    const unselectedBtn = screen.getByRole('button', { name: 'Option A' })
    expect(unselectedBtn).toHaveStyle({ color: 'var(--dim)' })
  })

  it('clicking an option calls onChange with that option value', () => {
    const onChange = vi.fn()
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={onChange}
        options={OPTIONS}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Option C' }))
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('clicking an option calls handleBlur for immediate save', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Option C' }))
    expect(mockHandleBlur).toHaveBeenCalledTimes(1)
  })

  it('renders error retry button when saveError is set and not focused', () => {
    mockUseAutoSave.mockReturnValue({
      saveError: 'Network error',
      isFocused: false,
      handleBlur: mockHandleBlur,
      handleFocus: mockHandleFocus,
      retry: mockRetry,
    })
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('hides error retry button when focused', () => {
    mockUseAutoSave.mockReturnValue({
      saveError: 'Network error',
      isFocused: true,
      handleBlur: mockHandleBlur,
      handleFocus: mockHandleFocus,
      retry: mockRetry,
    })
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
      />
    )
    // Only the option buttons, no retry button
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })

  it('renders label when provided', () => {
    render(
      <OptionSelector
        moduleSlug="brand-foundation"
        fieldKey="style"
        value="b"
        onChange={() => {}}
        options={OPTIONS}
        label="Visual Style"
      />
    )
    expect(screen.getByText('Visual Style')).toBeInTheDocument()
  })
})
