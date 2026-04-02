'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function ContentStrategy() {
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
        The strategy behind the content
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Content strategy isn&apos;t about what to post and when. It&apos;s about understanding why
        you&apos;re creating, who it&apos;s for, and what you want them to do after they consume it.
        Without that clarity, you&apos;re creating for the sake of creating — and that&apos;s how
        you burn out.
      </p>

      {/* The trust-first framework */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The trust-first framework
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        Optimizing for virality is not the same as optimizing for customers. When you optimize for
        virality, you make wide, broad content designed to appeal to everyone — and it converts no
        one. When you optimize for trust, you make specific, deep content designed to solve real
        problems for a specific group. Fewer views. But the people who watch will believe you can
        help them. And belief is what drives purchases.
      </div>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--orange)',
          lineHeight: 1.8,
          borderLeft: '3px solid var(--orange)',
          paddingTop: '.75rem',
          paddingBottom: '.75rem',
          paddingLeft: '1.1rem',
          paddingRight: '1rem',
          background: 'var(--orange-tint)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.25rem',
          fontStyle: 'italic',
        }}
      >
        A thousand raving fans is much better than a hundred thousand followers who don&apos;t know
        who you actually are — or care.
      </p>

      {/* Content formula */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The content formula
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--text)',
          fontWeight: 500,
          lineHeight: 1.7,
        }}
      >
        Painful Problem + Unique Solution × Contextual Credibility + Proven Wrapper = Content That
        Gets Customers
      </div>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Painful Problem:</strong> What specific problem does this content solve?</li>
          <li><strong style={{ color: 'var(--text)' }}>Unique Solution:</strong> How do you solve it differently than everyone else?</li>
          <li><strong style={{ color: 'var(--text)' }}>Contextual Credibility:</strong> Why should they believe you on this specific topic — not general credentials, direct experience with this problem.</li>
          <li><strong style={{ color: 'var(--text)' }}>Proven Wrapper:</strong> How are you packaging it to get attention?</li>
        </ul>
      </div>

      {/* Exercise 1 */}
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
            marginBottom: '.75rem',
          }}
        >
          Exercise 1 — Define your content goal
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Primary goal of your content right now:
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_strategy_goal"
          value={watch('ct_strategy_goal')}
          onChange={val => setValue('ct_strategy_goal', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Build brand awareness', value: 'Build brand awareness' },
            { label: 'Generate leads', value: 'Generate leads' },
            { label: 'Convert leads to customers', value: 'Convert leads to customers' },
            { label: 'Retain existing customers', value: 'Retain existing customers' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          After consuming my content, I want my avatar to:
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Not &ldquo;follow me.&rdquo; What&apos;s the actual next step you want them to take?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_strategy_next_step"
          value={watch('ct_strategy_next_step')}
          onChange={val => setValue('ct_strategy_next_step', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="e.g. Book a discovery call / Download my lead magnet / Buy my course..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          The painful problem I solve:
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_strategy_pain_problem"
          value={watch('ct_strategy_pain_problem')}
          onChange={val => setValue('ct_strategy_pain_problem', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Be specific. What keeps them up at night?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          My unique solution:
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_strategy_unique_sol"
          value={watch('ct_strategy_unique_sol')}
          onChange={val => setValue('ct_strategy_unique_sol', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="How do you solve it differently than everyone else?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          My contextual credibility:
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Not your general credentials — your specific experience with this exact problem.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_strategy_credibility"
          value={watch('ct_strategy_credibility')}
          onChange={val => setValue('ct_strategy_credibility', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="e.g. I spent 3 years creating content that got views but zero clients before I figured out what was broken..."
        />
      </div>

      {/* The 70/20/10 content mix */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '2rem 0 8px' }}>
        The 70/20/10 content mix
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        Once you have a strategy, you need a framework for what you actually make. The 70/20/10 rule
        keeps your output sharp without killing your momentum — most creators fail because they
        either repeat themselves into irrelevance or experiment so chaotically they never build an
        audience.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
        {[
          { pct: '70%', label: 'Proven Content', desc: 'Formats and topics you know work. Your reliable output — the content your audience expects and engages with consistently. This is your foundation.' },
          { pct: '20%', label: 'Iterations', desc: 'Same content, different hook, setting, or delivery. Take what\'s already working and test a new angle. Low risk, high learning.' },
          { pct: '10%', label: 'Big Swings', desc: 'New formats, new topics, experiments. This is where most creators fail — they get comfortable and stop experimenting. Then their audience gets bored. The 10% keeps you sharp.' },
        ].map(({ pct, label, desc }) => (
          <div
            key={pct}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '32px',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                flexShrink: 0,
                opacity: 0.5,
                minWidth: '60px',
              }}
            >
              {pct}
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: 'var(--orange)',
                  marginBottom: '3px',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
