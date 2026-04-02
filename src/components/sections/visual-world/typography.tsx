'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 3
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

const AESTHETIC_MOODS = [
  { num: '01', label: 'Dark & Cinematic', tags: ['bold', 'dramatic', 'cinematic'] },
  { num: '02', label: 'Clean & Minimal', tags: ['modern', 'digital', 'precise'] },
  { num: '03', label: 'Bold & Statement', tags: ['loud', 'confident', 'energy'] },
  { num: '04', label: 'Warm & Approachable', tags: ['warm', 'trusting', 'personal'] },
  { num: '05', label: 'Luxury & Editorial', tags: ['refined', 'premium', 'editorial'] },
  { num: '06', label: 'Creative & Expressive', tags: ['artistic', 'unique', 'expressive'] },
]

export default function Typography() {
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
        Workshop 4
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
        Define Your Typography
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your typography is the written voice of your visual world. The right font pairing creates
        instant recognition — people see your type before they read your words. Choose fonts that
        match your brand aesthetic and stick with them consistently.
      </p>

      {/* Font Finder reference section */}
      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--dimmer)',
          marginBottom: '.75rem',
        }}
      >
        Font Finder
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Which of these feels closest to your brand world? Use this as a reference when picking your
        fonts below.
      </p>

      {/* Aesthetic mood grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '6px',
          marginBottom: '1.5rem',
        }}
      >
        {AESTHETIC_MOODS.map(mood => (
          <div
            key={mood.num}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '4px',
              }}
            >
              {mood.num}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              {mood.label}
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {mood.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '10px',
                    color: 'var(--dimmer)',
                    background: 'var(--surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                    borderRadius: '3px',
                    padding: '1px 5px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Font entry section */}
      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--dimmer)',
          marginBottom: '.75rem',
        }}
      >
        Already Know Your Fonts?
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Enter them directly below. You can also{' '}
        <a
          href="https://fonts.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--orange)', textDecoration: 'none' }}
        >
          browse Google Fonts →
        </a>{' '}
        to preview and pick from thousands of options.
      </p>

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
          Enter Your Fonts
        </div>

        {/* Primary Font */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Primary Font — headlines, hooks, title cards
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '6px' }}>
            This is what people see in your thumbnails, title cards, and major hooks.
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_typo_primary"
            value={watch('vw_typo_primary')}
            onChange={val => setValue('vw_typo_primary', val)}
            getFullResponses={getValues}
            placeholder="e.g. Bebas Neue, Playfair Display, Montserrat..."
          />
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              color: 'var(--orange)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Browse Google Fonts →
          </a>
        </div>

        {/* Body Font */}
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Body Font — captions, supporting copy, longer text
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '6px' }}>
            Used for captions, supporting text, and any longer copy in your content.
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_typo_body"
            value={watch('vw_typo_body')}
            onChange={val => setValue('vw_typo_body', val)}
            getFullResponses={getValues}
            placeholder="e.g. Inter, DM Sans, Source Sans Pro..."
          />
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              color: 'var(--orange)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Browse Google Fonts →
          </a>
        </div>
      </div>

      {/* Custom fonts note */}
      <div
        style={{
          background: 'var(--orange-tint)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          padding: '.75rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--orange-dark)', lineHeight: 1.6 }}>
          If you use custom / brand fonts (not on Google Fonts), type the font name exactly as it
          appears in your design tool (Figma, Canva, Adobe). Your style guide will reference it —
          just make sure you have the license.
        </div>
      </div>
    </SectionWrapper>
  )
}
