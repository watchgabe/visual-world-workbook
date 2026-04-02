'use client'

import type { ModuleSlug } from '@/types/database'

export interface SectionField {
  key: string
  required: boolean
}

interface SectionWrapperProps {
  moduleSlug: ModuleSlug
  sectionIndex: number
  fields: SectionField[]
  responses: Record<string, unknown>
  children: React.ReactNode
}

export function checkSectionComplete(
  fields: SectionField[],
  responses: Record<string, unknown>
): boolean {
  const requiredFields = fields.filter(f => f.required)
  if (requiredFields.length === 0) return true
  return requiredFields.every(f => {
    const val = responses[f.key]
    return typeof val === 'string' && val.trim().length > 0
  })
}

export function SectionWrapper({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  moduleSlug: _moduleSlug,
  sectionIndex,
  fields,
  responses,
  children,
}: SectionWrapperProps) {
  const isComplete = checkSectionComplete(fields, responses)

  return (
    <section data-section-index={sectionIndex} data-complete={isComplete}>
      {children}
    </section>
  )
}
