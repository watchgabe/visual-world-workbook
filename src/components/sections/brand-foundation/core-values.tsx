'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 4
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

const VALUES_COUNT = 6

export default function CoreValues() {
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
      .maybeSingle()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const saved = data.responses as Record<string, string>
        Object.entries(saved).forEach(([key, val]) => {
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
        Workshop 4
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
        Core Values
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '.5rem',
        }}
      >
        Your Avatar tells you <em>who</em> you&apos;re speaking to. Your Core Mission tells
        you <em>why</em> you&apos;re creating. Your Core Values tell you{' '}
        <em>how</em> you show up.
      </p>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        Core values are the guiding principles that shape the way you create,
        communicate, and connect. They&apos;re the guardrails that keep your brand
        authentic and aligned, no matter what trends come and go. With them, you
        build consistency, trust, and integrity in your personal brand.
      </p>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '0.85rem',
          }}
        >
          Ask Yourself These Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '7px' }}>
          {[
            'What principles guide my creativity and decision-making?',
            'What qualities do I want my brand to always reflect?',
            "What do I stand for, even if it's not popular or trendy?",
            'What do I want people to feel when they interact with my content?',
            'What traits do I admire most in the creators, brands, or mentors I look up to?',
            'What do I refuse to compromise on in my work or lifestyle?',
            "When I'm at my best, what values am I living out?",
          ].map((q, i) => (
            <div
              key={i}
              style={{
                fontSize: '13px',
                color: 'var(--dim)',
                paddingLeft: '14px',
                position: 'relative' as const,
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  position: 'absolute' as const,
                  left: 0,
                  color: 'var(--orange)',
                  fontWeight: 700,
                }}
              >
                →
              </span>
              {q}
            </div>
          ))}
        </div>
      </div>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Your Values{' '}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 400,
            color: 'var(--dimmer)',
            textTransform: 'none',
            letterSpacing: 0,
          }}
        >
          (aim for 6)
        </span>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '1.5rem' }}>
        {Array.from({ length: VALUES_COUNT }, (_, i) => i + 1).map(n => (
          <div
            key={n}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '1.3rem',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                flexShrink: 0,
                paddingTop: '6px',
              }}
            >
              {n}
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <div style={{ flex: '0 0 160px' }}>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_val${n}_name`}
                  value={watch(`bf_val${n}_name` as keyof ReturnType<typeof watch>)}
                  onChange={val => setValue(`bf_val${n}_name` as keyof ReturnType<typeof watch>, val)}
                  getFullResponses={getValues}
                  placeholder="Value name"
                />
              </div>
              <div style={{ flex: 1 }}>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_val${n}_practice`}
                  value={watch(`bf_val${n}_practice` as keyof ReturnType<typeof watch>)}
                  onChange={val => setValue(`bf_val${n}_practice` as keyof ReturnType<typeof watch>, val)}
                  getFullResponses={getValues}
                  placeholder="short description of what it means to you..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--dimmer)',
            marginBottom: '0.85rem',
          }}
        >
          Example — Mine
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
          {[
            ['Adventure', 'seeking the unknown, creatively and physically'],
            ['Ownership', 'taking control of your path and results'],
            ['Authenticity', 'showing the real story, not just the highlight reel'],
            ['Craft', 'commitment to intentional, high-quality work'],
            ['Freedom', 'designing life and business on your own terms'],
            ['Clarity', 'cutting through the noise with structure and purpose'],
          ].map(([name, desc]) => (
            <div key={name} style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>{name}</strong> — {desc}
            </div>
          ))}
        </div>
      </div>

    </SectionWrapper>
  )
}
