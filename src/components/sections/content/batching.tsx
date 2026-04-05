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
const SECTION_INDEX = 3
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function ContentBatching() {
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
      {/* ─── WORKSHOP 3: BATCHING SYSTEM ─── */}
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
        Workshop 3
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
        Batch your content, protect your time
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Sustainability means you show up consistently. Batching is the mechanism that makes
        consistency possible — even on your worst weeks. Stop creating on demand. Start creating in
        advance.
      </p>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Why batching works
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '.85rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          Every time you switch between &ldquo;creator mode&rdquo; and &ldquo;distribution mode&rdquo; you waste time on
          mental context-switching. Batching collapses that. You get into a creative state once,
          film everything you need for the next 2–3 weeks, then exit. Your calendar fills itself.
          Your output looks consistent even when life isn&apos;t.
        </p>
        <p style={{ margin: 0 }}>
          The goal is a buffer — never be less than 2 weeks ahead. That buffer is what separates
          creators who last from creators who burn out. When something goes sideways in your life,
          your content keeps running. That reliability compounds into audience trust.
        </p>
      </div>
      <div
        style={{
          padding: '.75rem 1rem',
          background: 'var(--surface)',
          borderLeft: '3px solid var(--orange)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.6,
        }}
      >
        Maker time is sacred. Deep work, no meetings, no notifications. Your best creative output
        happens in uninterrupted blocks — protect them like your income depends on it. It does.
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The weekly batching rhythm
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
        Protect your maker time. The moment a calendar notification interrupts a creative session,
        the session is over. Film in the same outfit to batch 2–3 weeks of content at once. Run your
        week on this system and content stops feeling like a grind.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
        {[
          { num: '01', day: 'Monday — Research & Ideation', desc: 'Find your topic, research angles, write rough outlines. This is pure thinking time. No camera, no filming — just building the foundation everything else runs on.' },
          { num: '02', day: 'Tuesday — Writing & Hooks', desc: 'Write your script or talking points. Draft 3 hook versions using the 3-step formula. Lock your structure before you touch the camera.' },
          { num: '03', day: 'Wednesday — Filming', desc: 'All A-roll in one session. Change outfits to batch 2–3 weeks at once. Capture B-roll after you finish talking head. Treat it like a shoot, not a recording.' },
          { num: '04', day: 'Thursday — Editing & Post', desc: 'Cut, color grade, add music, create thumbnails. Review for pacing — kill every moment that loses energy. Export everything in the same session. Or send to your editor if you have one.' },
          { num: '05', day: 'Friday — Publishing & Engagement', desc: 'Schedule or publish. Reply to every comment in the first hour — the algorithm rewards it and so does your audience. Track what lands, kill what doesn\'t.' },
        ].map(({ num, day, desc }) => (
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
                {day}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise — Build your batching plan */}
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
          Exercise — Build your batching plan
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>
          Your dedicated filming day:
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Block this on your calendar as non-negotiable maker time. No meetings, no calls.
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_batch_film_day"
          value={watch('ct_batch_film_day')}
          onChange={val => setValue('ct_batch_film_day', val)}
          getFullResponses={getValues}
          placeholder="e.g. Every Wednesday from 9am–1pm"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          How many pieces can you realistically batch per session?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Think about what&apos;s sustainable, not your best-case scenario.
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_batch_count"
          value={watch('ct_batch_count')}
          onChange={val => setValue('ct_batch_count', val)}
          getFullResponses={getValues}
          placeholder="e.g. 3 short-form videos + 1 carousel worth of footage"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          What do you need to set up your filming space in advance?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Lighting, backdrop, teleprompter, outfit changes — list everything so you never waste filming time on setup.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_batch_setup"
          value={watch('ct_batch_setup')}
          onChange={val => setValue('ct_batch_setup', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="e.g. Ring light positioned, backdrop clean, script on teleprompter, 3 outfit changes ready..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          Your batching commitment:
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_batch_commit"
          value={watch('ct_batch_commit')}
          onChange={val => setValue('ct_batch_commit', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="e.g. I will batch every Wednesday and stay at least 2 weeks ahead at all times..."
        />
      </div>
    </SectionWrapper>
  )
}
