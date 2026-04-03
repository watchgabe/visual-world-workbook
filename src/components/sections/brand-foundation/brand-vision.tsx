'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 7
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

export default function BrandVision() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .single()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const saved = data.responses as Record<string, string>
        Object.entries(saved).forEach(([key, val]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof val === "string") (setValue as (k: string, v: string) => void)(key, val)
        })
      })
    return () => { cancelled = true }
  }, [user, setValue])

  const responses = watch()

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={responses}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginBottom: '.5rem',
        }}
      >
        Workshop 7
      </div>
      <h1
        style={{
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.4px',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}
      >
        Brand Vision
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        Your vision is where your brand is going — not next month, but in 3 years.
        It&apos;s the picture of the future you&apos;re building toward. Without a vision,
        you&apos;re just executing tactics. With one, every decision has direction.
      </p>

      {/* 3-Year Vision */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '.5rem',
          }}
        >
          3-Year Vision
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
          Where is your brand in 3 years?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '8px', lineHeight: 1.6 }}>
          Be specific — revenue, audience size, offers, impact, team, lifestyle.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_vision_3yr"
          value={watch('bf_vision_3yr')}
          onChange={val => setValue('bf_vision_3yr', val)}
          getFullResponses={getValues}
          rows={4}
          placeholder="In 3 years, my brand has [audience size], generates [revenue], I'm known for [what], and I spend my time [how]..."
        />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
          What does your ideal day look like in this vision?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_vision_day"
          value={watch('bf_vision_day')}
          onChange={val => setValue('bf_vision_day', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="Wake up at... work on... create... connect with... finish by..."
        />
      </div>

      {/* Impact Vision */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '.5rem',
          }}
        >
          Impact Vision
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
          What change do you want to create in the world?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_vision_impact"
          value={watch('bf_vision_impact')}
          onChange={val => setValue('bf_vision_impact', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="The shift you want to cause in your industry or in people's lives..."
        />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
          What will people say about your brand in 10 years?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_vision_legacy"
          value={watch('bf_vision_legacy')}
          onChange={val => setValue('bf_vision_legacy', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="The legacy you're building..."
        />
      </div>

      {/* Brand Vision Statement */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
          Brand Vision Statement
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_brand_vision"
          value={watch('bf_brand_vision')}
          onChange={val => setValue('bf_brand_vision', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="Write your brand vision statement here..."
        />
      </div>
    </SectionWrapper>
  )
}
