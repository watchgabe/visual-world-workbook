import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { WorkshopInput } from '../src/components/workshop/WorkshopInput'

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

describe('WorkshopInput', () => {
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

  it('renders an input element with type="text"', () => {
    const { container } = render(
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
        placeholder="Brand name"
      />
    )
    const input = container.querySelector('input[type="text"]')
    expect(input).toBeInTheDocument()
  })

  it('renders input with placeholder text', () => {
    render(
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
        placeholder="Brand name"
      />
    )
    expect(screen.getByPlaceholderText('Brand name')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
        label="Brand Name"
      />
    )
    expect(screen.getByText('Brand Name')).toBeInTheDocument()
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
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
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
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull()
  })

  it('calls handleBlur on input blur event', () => {
    render(
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
      />
    )
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    expect(mockHandleBlur).toHaveBeenCalledTimes(1)
  })

  it('calls handleFocus on input focus event', () => {
    render(
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
      />
    )
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
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
      <WorkshopInput
        moduleSlug="brand-foundation"
        fieldKey="brand_name"
        value=""
        onChange={() => {}}
      />
    )
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
})
