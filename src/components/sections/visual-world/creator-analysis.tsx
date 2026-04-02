'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

export default function CreatorAnalysis() {
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
          if (typeof val === 'string') (setValue as (k: string, v: string) => void)(key, val)
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
        Workshop 1
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-num)',
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-.01em',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        Creator Analysis
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        Before you build your own visual world, you need to develop your eye. Study premium creators
        in your space and reverse-engineer their visual decisions. You&apos;re not copying them — you&apos;re
        training yourself to recognize intentional visual choices.
      </p>

      {/* Instruction box */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          marginBottom: '1.5rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        The goal is to find <strong style={{ color: 'var(--text)' }}>your gap</strong>. After
        studying premium creators, you&apos;ll have a clear picture of what&apos;s already being done —
        and where the opportunity is for you to be different.
      </div>

      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--dimmer)',
          marginBottom: '1rem',
        }}
      >
        Creator Analysis Framework
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Study 3–5 premium creators in your niche. For each creator, analyze their visual choices —
        color palette, lighting, framing, typography, and overall aesthetic. After studying them,
        answer the synthesis questions below to find your visual gap.
      </p>

      {/* Synthesis section */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '1rem',
          }}
        >
          Creator Analysis — Synthesis
        </div>

        {/* Q1 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What visual patterns appear across multiple premium creators?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_patterns"
            value={watch('vw_ca_patterns')}
            onChange={val => setValue('vw_ca_patterns', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="What are they all doing that clearly works?"
          />
        </div>

        {/* Q2 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What is everyone doing that you want to do differently?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_different"
            value={watch('vw_ca_different')}
            onChange={val => setValue('vw_ca_different', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="Where does the whole space look the same?"
          />
        </div>

        {/* Q3 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What is no one doing that you could own?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_own"
            value={watch('vw_ca_own')}
            onChange={val => setValue('vw_ca_own', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="Your visual white space — what's unclaimed?"
          />
        </div>

        {/* Q4: Gap Statement */}
        <div>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            Your gap statement — how you&apos;ll be visually different from everyone in your space:
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_gap"
            value={watch('vw_ca_gap')}
            onChange={val => setValue('vw_ca_gap', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="My visual identity will stand apart because..."
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
