'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

export default function BrandJourney() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
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

  async function handleGenerateJourney() {
    const outcome = getValues('bf_journey_outcome')
    const known = getValues('bf_journey_known')
    const doField = getValues('bf_journey_do')
    const learn = getValues('bf_journey_learn')
    if (!outcome.trim() || !known.trim() || !doField.trim() || !learn.trim()) return
    setIsGenerating('bf_journey_statement')
    try {
      const prompt =
        'You are a personal brand strategist. Write ONE sentence using EXACTLY this format: "I want to [desired outcome] by being known for [known for] through [actions] starting with [learning]."\n\nFill in the brackets using their exact words below. Output ONLY the single sentence. No headers, no explanation, no asterisks, no markdown, no quotation marks around the sentence.\n\nDesired Outcome: ' +
        outcome +
        '\nKnown For: ' +
        known +
        '\nActions: ' +
        doField +
        '\nLearn: ' +
        learn
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 300 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text = data.text || ''
      ;(setValue as (k: string, v: string) => void)('bf_journey_statement', text)
      if (user) saveField(user.id, MODULE_SLUG, 'bf_journey_statement', text)
    } catch {
      // silent error — user can retry
    } finally {
      setIsGenerating(null)
    }
  }

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
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.4px',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}
      >
        Brand Journey Framework
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        <strong style={{ color: 'var(--text)' }}>Why this comes first.</strong>{' '}
        Most creators start building without knowing where they&apos;re going (I did).
        They post content because they think they should. Six months later they&apos;re
        exhausted, scattered, in the same place — and they quit.
        <br /><br />
        These four questions work backwards from your desired outcome to give you
        complete clarity on what you need to do today. This is your North Star —
        come back to it whenever you feel lost.
      </p>

      {/* Question 1 */}
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
          Question 1
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '5px',
            lineHeight: 1.35,
          }}
        >
          What is my desired outcome?
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          What do you actually want to happen? Not &ldquo;grow my brand.&rdquo; What&apos;s the
          real, specific goal in 12 months?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_journey_outcome"
          value={watch('bf_journey_outcome')}
          onChange={val => setValue('bf_journey_outcome', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="e.g. I want to sign 5 high-ticket clients per month at $5K each and replace my 9-to-5 income within 12 months."
        />
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Why does this outcome matter to you?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_journey_why"
          value={watch('bf_journey_why')}
          onChange={val => setValue('bf_journey_why', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="The real reason behind the goal — go deeper than the surface answer."
        />
      </div>

      {/* Question 2 */}
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
          Question 2
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '5px',
            lineHeight: 1.35,
          }}
        >
          What do I need to be known for?
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          In order for that outcome to happen, what must people believe about you?
          What expertise must you demonstrate?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_journey_known"
          value={watch('bf_journey_known')}
          onChange={val => setValue('bf_journey_known', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="e.g. I need to be known for helping creators build premium personal brands that attract high-quality clients."
        />
      </div>

      {/* Question 3 */}
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
          Question 3
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '5px',
            lineHeight: 1.35,
          }}
        >
          What do I need to do?
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          You can&apos;t just say you&apos;re an expert. You have to demonstrate it. What
          actions do you need to take consistently?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_journey_do"
          value={watch('bf_journey_do')}
          onChange={val => setValue('bf_journey_do', val)}
          getFullResponses={getValues}
          rows={4}
          placeholder={`Post educational content 3–5x per week\nShare client results regularly\nDocument my process publicly\nShow up consistently for 6+ months without stopping`}
        />
      </div>

      {/* Question 4 */}
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
          Question 4
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '5px',
            lineHeight: 1.35,
          }}
        >
          What do I need to learn?
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          This is your starting point today. What skills or knowledge do you need to
          develop right now?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_journey_learn"
          value={watch('bf_journey_learn')}
          onChange={val => setValue('bf_journey_learn', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder={`How to write hooks that stop the scroll\nHow to show up on camera confidently\nHow to build a monetization funnel`}
        />
      </div>

      {/* Brand Journey Statement */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Brand Journey Statement
      </h2>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.2rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '0.6rem' }}>
          Your Brand Journey Statement is your North Star. It puts everything in one
          sentence so you always know where you&apos;re going and why.
        </p>
        <p
          style={{
            marginTop: '0.6rem',
            fontSize: '13.5px',
            color: 'var(--text)',
            fontStyle: 'italic',
            borderLeft: '3px solid var(--orange)',
            paddingLeft: '0.85rem',
          }}
        >
          &ldquo;I want to [desired outcome] by being known for [known for] through [actions]
          starting with [learning].&rdquo;
        </p>
        <p style={{ marginTop: '0.6rem', fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7 }}>
          Synthesize your four answers into this one sentence. Print it. Put it
          somewhere you&apos;ll see it every day. Shoot towards it every day.
        </p>
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
          Brand Journey Statement
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          Fill in all four questions above, then write your statement here.
        </div>
        <div style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={handleGenerateJourney}
            disabled={isGenerating === 'bf_journey_statement'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: isGenerating === 'bf_journey_statement' ? 'var(--dimmer)' : 'var(--orange)',
              background: 'var(--orange-tint)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--orange-border)',
              borderRadius: 'var(--radius-md)',
              cursor: isGenerating === 'bf_journey_statement' ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
              opacity: isGenerating === 'bf_journey_statement' ? 0.6 : 1,
            }}
          >
            {isGenerating === 'bf_journey_statement' ? 'Generating...' : '✦ Generate Statement'}
          </button>
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_journey_statement"
          value={watch('bf_journey_statement')}
          onChange={val => setValue('bf_journey_statement', val)}
          getFullResponses={getValues}
          rows={4}
          placeholder="Generate and write your Brand Journey Statement here..."
        />
      </div>
    </SectionWrapper>
  )
}
