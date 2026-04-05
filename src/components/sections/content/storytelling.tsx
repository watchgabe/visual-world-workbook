'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 8
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function Storytelling() {
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
      {/* ─── WORKSHOP 8: STORYTELLING ─── */}
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
        Workshop 8
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
        Storytelling
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        You have 2–3 seconds on short-form, 15–20 on long-form. If you don&apos;t capture attention
        in that window, you&apos;ve lost them forever — and they&apos;ll never see the valuable part.
      </p>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The 4C&apos;s intro (long-form)
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
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Call Out:</strong> Who is this for? Make it explicit. &quot;If you&apos;re a creator who&apos;s been posting for months without results, this is for you.&quot;</li>
          <li><strong style={{ color: 'var(--text)' }}>Credibility:</strong> Why should they listen to you on this specific topic? Contextual credibility — not general credentials.</li>
          <li><strong style={{ color: 'var(--text)' }}>Compass:</strong> Give them the roadmap. &quot;In this video I&apos;m going to show you the three things making your content look amateur and exactly how to fix them.&quot; Tell them exactly what they&apos;ll learn in this piece.</li>
          <li><strong style={{ color: 'var(--text)' }}>Core Learning:</strong> Give a valuable insight in the first 60 seconds. If they learn something immediately, they&apos;ll assume the rest is just as valuable.</li>
        </ul>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The 3-Step Hook Formula
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.1rem' }}>
        {[
          { num: '01', name: 'Context Lean', desc: 'Establish the topic. Get them leaning in. Just enough context to understand why they should care.' },
          { num: '02', name: 'Scroll Stop', desc: 'Hit them with a contrasting word — But. However. Yet. The pattern interrupt. A sudden gear shift that makes the brain pay attention.' },
          { num: '03', name: 'Contrarian Snapback', desc: 'Go the opposite direction. Challenge their assumption. Create a curiosity gap. Make them need to know what\'s next.' },
        ].map(({ num, name, desc }) => (
          <div
            key={num}
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
              }}
            >
              {num}
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
                {name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          border: '1px solid var(--orange-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '.9rem 1.2rem',
          background: 'var(--orange-tint)',
          marginBottom: '1.1rem',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--orange-dark)', lineHeight: 1.75, margin: 0 }}>
          &ldquo;Most creators spend hours on content that gets zero engagement... BUT it&apos;s not
          because their content is bad. It&apos;s because they&apos;re solving the wrong problem.&rdquo;
        </p>
      </div>

      <div
        style={{
          borderLeft: '3px solid var(--orange)',
          padding: '11px 15px',
          background: 'var(--orange-tint)',
          marginBottom: '1.1rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--orange-dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          Visual hooks are 100× more powerful than spoken hooks alone. Motion + text on screen +
          spoken word = three simultaneous pattern interrupts.{' '}
          <strong style={{ fontWeight: 700 }}>Rule:</strong>{' '}
          3–5 words max on screen, bold sans-serif, high contrast, first 2 seconds.
        </p>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The Five-Part Story Framework
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
        Every great piece of content follows a structure. The hook (using your 3-step formula) grabs attention. The problem sets
        the stakes. The journey is the messy middle most creators skip. The lesson is your expertise
        made actionable. The CTA tells them what&apos;s next. Build one complete story below.
      </div>

      {/* Story Builder */}
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
          Story Builder — 4 C&apos;s + Hook Formula + Five-Part Framework
        </div>
        <div
          style={{
            marginBottom: '1rem',
            padding: '.75rem 1rem',
            background: 'var(--orange-tint)',
            borderLeft: '3px solid var(--orange)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontSize: '12.5px',
            color: 'var(--dim)',
            lineHeight: 1.6,
          }}
        >
          Start with your 4 C&apos;s intro (Call Out, Credibility, Compass, Core Learning), then
          build your full story using the 3-step hook and five-part framework below.
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>
          Content idea (what&apos;s this piece about?):
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_idea"
          value={watch('ct_story_idea')}
          onChange={val => setValue('ct_story_idea', val)}
          getFullResponses={getValues}
          placeholder="e.g. Why most creators never make money from content"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '12px 0 3px' }}>
          ① Hook — Write your full hook (context lean → scroll stop → contrarian angle):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_hook"
          value={watch('ct_story_hook')}
          onChange={val => setValue('ct_story_hook', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="e.g. Most creators spend hours on content that gets zero engagement... BUT it's not because their content is bad. It's because they're solving the wrong problem."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ② Problem — Set the stakes (specific and relatable conflict):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_prob"
          value={watch('ct_story_prob')}
          onChange={val => setValue('ct_story_prob', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="What's the problem they recognize? Make it specific and painful..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ③ Journey — The messy middle (low points, mistakes, real struggle — don&apos;t skip this):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_journey"
          value={watch('ct_story_journey')}
          onChange={val => setValue('ct_story_journey', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="What did you go through to find the answer? The struggle is what makes it real..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ④ Lesson — Actionable takeaway (the insight tied to your expertise):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_lesson"
          value={watch('ct_story_lesson')}
          onChange={val => setValue('ct_story_lesson', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="What's the one thing they should walk away knowing or doing?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ⑤ CTA — What do they do next?
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_cta"
          value={watch('ct_story_cta')}
          onChange={val => setValue('ct_story_cta', val)}
          getFullResponses={getValues}
          placeholder="Save this. Follow for more. Book a call. Download the guide..."
        />
      </div>
    </SectionWrapper>
  )
}
