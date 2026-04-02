import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectionWrapper, checkSectionComplete } from '../src/components/workshop/SectionWrapper'
import type { SectionField } from '../src/components/workshop/SectionWrapper'

const FIELDS: SectionField[] = [
  { key: 'q1', required: true },
  { key: 'q2', required: true },
  { key: 'q3', required: false },
]

describe('SectionWrapper', () => {
  it('renders children', () => {
    render(
      <SectionWrapper
        moduleSlug="brand-foundation"
        sectionIndex={0}
        fields={FIELDS}
        responses={{ q1: 'answer', q2: 'answer', q3: '' }}
      >
        <p>Child content</p>
      </SectionWrapper>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('data-complete="true" when all required fields are filled', () => {
    const { container } = render(
      <SectionWrapper
        moduleSlug="brand-foundation"
        sectionIndex={0}
        fields={FIELDS}
        responses={{ q1: 'answer', q2: 'answer', q3: '' }}
      >
        <span>content</span>
      </SectionWrapper>
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('data-complete', 'true')
  })

  it('data-complete="false" when a required field is empty', () => {
    const { container } = render(
      <SectionWrapper
        moduleSlug="brand-foundation"
        sectionIndex={0}
        fields={FIELDS}
        responses={{ q1: 'answer', q2: '', q3: '' }}
      >
        <span>content</span>
      </SectionWrapper>
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('data-complete', 'false')
  })

  it('data-complete="false" when a required field is whitespace only', () => {
    const { container } = render(
      <SectionWrapper
        moduleSlug="brand-foundation"
        sectionIndex={0}
        fields={FIELDS}
        responses={{ q1: 'answer', q2: '  ', q3: '' }}
      >
        <span>content</span>
      </SectionWrapper>
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('data-complete', 'false')
  })

  it('sets data-section-index attribute', () => {
    const { container } = render(
      <SectionWrapper
        moduleSlug="brand-foundation"
        sectionIndex={2}
        fields={FIELDS}
        responses={{ q1: 'a', q2: 'b' }}
      >
        <span>content</span>
      </SectionWrapper>
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('data-section-index', '2')
  })
})

describe('checkSectionComplete', () => {
  it('returns true when all required fields have non-empty values', () => {
    expect(
      checkSectionComplete(FIELDS, { q1: 'answer', q2: 'answer', q3: '' })
    ).toBe(true)
  })

  it('returns false when a required field is empty string', () => {
    expect(
      checkSectionComplete(FIELDS, { q1: 'answer', q2: '', q3: '' })
    ).toBe(false)
  })

  it('returns false when a required field is whitespace only', () => {
    expect(
      checkSectionComplete(FIELDS, { q1: 'answer', q2: '  ', q3: '' })
    ).toBe(false)
  })

  it('returns true when no required fields exist', () => {
    const optionalFields: SectionField[] = [{ key: 'q1', required: false }]
    expect(checkSectionComplete(optionalFields, {})).toBe(true)
  })

  it('returns false when required field is missing from responses', () => {
    expect(
      checkSectionComplete(FIELDS, { q1: 'answer' })
    ).toBe(false)
  })
})
