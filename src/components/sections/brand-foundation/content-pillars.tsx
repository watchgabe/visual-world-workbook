'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 5
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

const PILLAR_IDEA_OPTIONS = [
  { label: 'Yes, easily', value: 'yes' },
  { label: 'Maybe 20–30', value: 'maybe' },
]

export default function ContentPillars() {
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
        Workshop 5
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
        Content Pillars
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.25rem',
        }}
      >
        Your content pillars are the 3–5 core topics you&apos;ll talk about
        consistently. They give you structure without limiting creativity. Without
        pillars, you post whatever you feel like that day. With pillars, your
        audience knows exactly what to expect — and that consistency builds trust.
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--dim)',
            lineHeight: 1.7,
            marginBottom: '0.6rem',
          }}
        >
          Each pillar should pass five tests:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '5px' }}>
          {[
            <>You can generate <strong style={{ color: 'var(--text)' }}>50+ content ideas</strong> from it easily</>,
            <>It <strong style={{ color: 'var(--text)' }}>serves your avatar&apos;s</strong> core needs and problems</>,
            <>It <strong style={{ color: 'var(--text)' }}>connects to your offer</strong> — there&apos;s a natural bridge</>,
            <>You&apos;re <strong style={{ color: 'var(--text)' }}>genuinely passionate</strong> about this topic</>,
            <>It <strong style={{ color: 'var(--text)' }}>builds your authority</strong> in your space</>,
          ].map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '13px',
                color: 'var(--dim)',
                padding: '5px 0 5px 18px',
                position: 'relative' as const,
                lineHeight: 1.5,
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
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Pillar Discovery */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Pillar Discovery
      </h2>
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
          Discovery Questions
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
          What 10 topics could you talk about forever?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '8px' }}>
          Brain dump — don&apos;t filter yet.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_pillar_discover1"
          value={watch('bf_pillar_discover1')}
          onChange={val => setValue('bf_pillar_discover1', val)}
          getFullResponses={getValues}
          rows={4}
          placeholder="List every topic that comes to mind..."
        />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
          What 5 topics does your avatar most need help with?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_pillar_discover2"
          value={watch('bf_pillar_discover2')}
          onChange={val => setValue('bf_pillar_discover2', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="The specific problems your avatar is searching for solutions to..."
        />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
          What topics align directly with your offer?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_pillar_discover3"
          value={watch('bf_pillar_discover3')}
          onChange={val => setValue('bf_pillar_discover3', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Topics that naturally lead to what you sell..."
        />
      </div>

      {/* Content Pillars */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Your Content Pillars
      </h2>

      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1.25rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--orange-tint)',
                border: '1px solid var(--orange-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-num)',
                fontSize: '14px',
                fontWeight: 900,
                color: 'var(--orange-dark)',
                flexShrink: 0,
                marginTop: '5px',
              }}
            >
              {n}
            </div>
            <div style={{ flex: 1 }}>
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_pillar${n}_name`}
                value={watch(`bf_pillar${n}_name` as keyof ReturnType<typeof watch>)}
                onChange={val => setValue(`bf_pillar${n}_name` as keyof ReturnType<typeof watch>, val)}
                getFullResponses={getValues}
                placeholder={n <= 3 ? 'Pillar name...' : 'Pillar name (optional)...'}
              />
            </div>
            {n > 3 && (
              <span style={{ fontSize: '10px', color: 'var(--dimmer)', flexShrink: 0, alignSelf: 'flex-end' }}>Optional</span>
            )}
          </div>

          <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', marginBottom: '6px' }}>
                Sub-topics (3–5 angles)
              </div>
              <WorkshopTextarea
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_pillar${n}_sub`}
                value={watch(`bf_pillar${n}_sub` as keyof ReturnType<typeof watch>)}
                onChange={val => setValue(`bf_pillar${n}_sub` as keyof ReturnType<typeof watch>, val)}
                getFullResponses={getValues}
                rows={3}
                placeholder="Specific angles within this pillar..."
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', marginBottom: '6px' }}>
                How this serves your avatar
              </div>
              <WorkshopTextarea
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_pillar${n}_avatar`}
                value={watch(`bf_pillar${n}_avatar` as keyof ReturnType<typeof watch>)}
                onChange={val => setValue(`bf_pillar${n}_avatar` as keyof ReturnType<typeof watch>, val)}
                getFullResponses={getValues}
                rows={3}
                placeholder="The problem this pillar solves..."
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', marginBottom: '6px' }}>
                How this connects to your offer
              </div>
              <WorkshopTextarea
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_pillar${n}_offer`}
                value={watch(`bf_pillar${n}_offer` as keyof ReturnType<typeof watch>)}
                onChange={val => setValue(`bf_pillar${n}_offer` as keyof ReturnType<typeof watch>, val)}
                getFullResponses={getValues}
                rows={3}
                placeholder="The natural bridge to what you sell..."
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dim)', marginBottom: '6px' }}>
                50+ content ideas here?
              </div>
              <OptionSelector
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_pillar${n}_test`}
                value={watch(`bf_pillar${n}_test` as keyof ReturnType<typeof watch>)}
                onChange={val => setValue(`bf_pillar${n}_test` as keyof ReturnType<typeof watch>, val)}
                getFullResponses={getValues}
                options={PILLAR_IDEA_OPTIONS}
                columns={2}
              />
            </div>
          </div>
        </div>
      ))}
    </SectionWrapper>
  )
}
