import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { WorkshopTextarea } from '../src/components/workshop/WorkshopTextarea'

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

describe('WorkshopTextarea', () => {
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

  it('renders textarea with placeholder text', () => {
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
        placeholder="Describe your brand vision..."
      />
    )
    expect(screen.getByPlaceholderText('Describe your brand vision...')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
        label="Brand Vision"
      />
    )
    expect(screen.getByText('Brand Vision')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    const { container } = render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
      />
    )
    expect(container.querySelector('label')).toBeNull()
  })

  it('error icon visible when saveError is non-null and isFocused is false', () => {
    mockUseAutoSave.mockReturnValue({
      saveError: 'Network error',
      isFocused: false,
      handleBlur: mockHandleBlur,
      handleFocus: mockHandleFocus,
      retry: mockRetry,
    })
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('error icon hidden when isFocused is true even if saveError exists', () => {
    mockUseAutoSave.mockReturnValue({
      saveError: 'Network error',
      isFocused: true,
      handleBlur: mockHandleBlur,
      handleFocus: mockHandleFocus,
      retry: mockRetry,
    })
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull()
  })

  it('calls handleBlur on textarea blur event', () => {
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
      />
    )
    const textarea = screen.getByRole('textbox')
    fireEvent.blur(textarea)
    expect(mockHandleBlur).toHaveBeenCalledTimes(1)
  })

  it('calls handleFocus on textarea focus event', () => {
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
      />
    )
    const textarea = screen.getByRole('textbox')
    fireEvent.focus(textarea)
    expect(mockHandleFocus).toHaveBeenCalledTimes(1)
  })

  it('retry button calls retry function', () => {
    mockUseAutoSave.mockReturnValue({
      saveError: 'Network error',
      isFocused: false,
      handleBlur: mockHandleBlur,
      handleFocus: mockHandleFocus,
      retry: mockRetry,
    })
    render(
      <WorkshopTextarea
        moduleSlug="brand-foundation"
        fieldKey="brand_vision"
        value=""
        onChange={() => {}}
      />
    )
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
})
