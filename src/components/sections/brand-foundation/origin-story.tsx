'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 6
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

const STORY_PARTS = [
  {
    part: 'Part 1',
    title: 'Where You Started',
    subtitle: 'The Relatable Struggle',
    fieldKey: 'bf_story1',
    placeholder: "What was your situation before everything changed? What pain were you experiencing? Why were you stuck?",
  },
  {
    part: 'Part 2',
    title: 'The Turning Point',
    subtitle: 'The Catalyst',
    fieldKey: 'bf_story2',
    placeholder: "What made you decide to change? What was the aha moment? What risk did you take?",
  },
  {
    part: 'Part 3',
    title: 'The Journey',
    subtitle: 'The Believable Steps',
    fieldKey: 'bf_story3',
    placeholder: "What obstacles did you overcome? What failures? What almost made you quit?",
  },
  {
    part: 'Part 4',
    title: 'Where You Are Now',
    subtitle: 'The Transformation',
    fieldKey: 'bf_story4',
    placeholder: "What's different now? What results have you achieved? What's the lesson for your avatar?",
  },
]

export default function OriginStory() {
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
        Workshop 6
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
        Origin Story
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '.5rem',
        }}
      >
        Your origin story is what makes you human. People don&apos;t connect with your
        success — they connect with your struggle. Your 80% honest story is more
        powerful than a 100% polished one. Don&apos;t sanitize it.
      </p>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        For each part, be as in-depth as possible. Hit the 10-minute timer, let the
        thoughts flow, and don&apos;t filter yourself — just write everything down.
        We&apos;ll whittle it down into the final story after.
      </p>

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
        The Four-Part Story Arc
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '1.5rem',
        }}
      >
        {STORY_PARTS.map(({ part, title, subtitle, fieldKey, placeholder }) => (
          <div
            key={fieldKey}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.13em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '4px',
              }}
            >
              {part}
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '2px',
                lineHeight: 1.3,
              }}
            >
              {title}
              <br />
              <small style={{ fontWeight: 400, fontSize: '11px', color: 'var(--dimmer)' }}>
                {subtitle}
              </small>
            </div>
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={fieldKey}
              value={watch(fieldKey as keyof ReturnType<typeof watch>)}
              onChange={val => setValue(fieldKey as keyof ReturnType<typeof watch>, val)}
              getFullResponses={getValues}
              rows={6}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
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
            marginBottom: '.5rem',
          }}
        >
          Your Complete Origin Story
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          Fill in all four parts above, then use this space to write or generate your
          complete origin story. The AI will piece together exactly what you wrote —
          it won&apos;t fill in gaps or assume anything. If something is unclear it will
          flag it with [???] for you to fill in.
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Your Complete Origin Story
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '8px' }}>
          Use the AI output as a starting point and refine in your own voice.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_origin_story"
          value={watch('bf_origin_story')}
          onChange={val => setValue('bf_origin_story', val)}
          getFullResponses={getValues}
          rows={8}
          placeholder="Write or paste your complete origin story here..."
        />
      </div>
    </SectionWrapper>
  )
}
