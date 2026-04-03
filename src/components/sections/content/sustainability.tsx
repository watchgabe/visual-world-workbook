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

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 2
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function ContentSustainability() {
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
      {/* ─── WORKSHOP 2: SUSTAINABILITY ─── */}
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
        Workshop 2
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
        Your sustainable foundation
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        73% of people who start creating content quit within their first year — not because they
        ran out of ideas, but because they built a system that wasn&apos;t sustainable. Build around
        your floor, not your ceiling.
      </p>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Why most creators quit
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
        The goal is simple: build a system so frictionless it runs on your worst week — not your
        best. Most creators design for motivation spikes and imaginary future capacity. The fix is
        to strip everything back and answer your capacity questions without optimism. Don&apos;t
        count weeks where things slow down. Don&apos;t count imaginary future hires. Don&apos;t
        count motivation that won&apos;t last. Your system must work when you&apos;re tired, busy,
        and uninspired. Simplify until it feels inevitable — then add from there.
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Your focal point
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '0.85rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          At any given moment, your brand should have one clear focal point. One platform gets your
          best thinking, your best energy, and your best content. Everything else is secondary or
          repurposed. Trying to dominate every platform at once is how you spread thin, create
          diluted content, and burn out before you ever build momentum.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Solo creator:</strong> One primary platform (best thinking + full effort). One secondary platform (repurposed content only).</li>
          <li><strong style={{ color: 'var(--text)' }}>With a team:</strong> Two to three primary platforms — but only one in full focus at a time.</li>
        </ul>
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
        Your focal point only points one direction at a time. Pick your platform based on what
        medium feels most natural to you and where your ideal customer actually spends time. Then
        go all in.
      </div>

      {/* Exercise 2 */}
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
          Exercise 2 — Sustainable foundation
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>
          Realistic weekly hours for content (next 12–18 months):
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Answer without optimism — this becomes the entire basis of your system.
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_week_hours"
          value={watch('ct_sustain_week_hours')}
          onChange={val => setValue('ct_sustain_week_hours', val)}
          getFullResponses={getValues}
          placeholder="e.g. 6 hours per week"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          What gives you energy in content creation?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_energize"
          value={watch('ct_sustain_energize')}
          onChange={val => setValue('ct_sustain_energize', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Filming? Editing? Writing? Teaching? Brainstorming?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          What drains you?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Everything here needs to be minimized, batched, delegated, or removed.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_drain"
          value={watch('ct_sustain_drain')}
          onChange={val => setValue('ct_sustain_drain', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Every item is a bottleneck. Name them so you can solve for them."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          When are you most mentally sharp?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_sharp"
          value={watch('ct_sustain_sharp')}
          onChange={val => setValue('ct_sustain_sharp', val)}
          getFullResponses={getValues}
          columns={3}
          options={[
            { label: 'Morning', value: 'Morning' },
            { label: 'Afternoon', value: 'Afternoon' },
            { label: 'Evening', value: 'Evening' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          My non-negotiable content cadence:
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_cadence"
          value={watch('ct_sustain_cadence')}
          onChange={val => setValue('ct_sustain_cadence', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="e.g. 1 long-form video/month + 3 short-form posts/week"
        />
      </div>

      {/* Exercise 3 — Platform strategy */}
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
          Exercise 3 — Platform strategy
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          What medium feels most natural to you?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_medium"
          value={watch('ct_sustain_medium')}
          onChange={val => setValue('ct_sustain_medium', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Video (highest leverage)', value: 'Video (highest leverage)' },
            { label: 'Audio / Podcast', value: 'Audio / Podcast' },
            { label: 'Written (LinkedIn, newsletter)', value: 'Written (LinkedIn, newsletter)' },
            { label: 'Visual / Graphic (carousels)', value: 'Visual / Graphic (carousels)' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Where does your ideal customer spend the most time?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_audience"
          value={watch('ct_sustain_audience')}
          onChange={val => setValue('ct_sustain_audience', val)}
          getFullResponses={getValues}
          columns={3}
          options={[
            { label: 'YouTube', value: 'YouTube' },
            { label: 'Instagram', value: 'Instagram' },
            { label: 'LinkedIn', value: 'LinkedIn' },
            { label: 'Substack / Newsletter', value: 'Substack / Newsletter' },
            { label: 'X (Twitter)', value: 'X (Twitter)' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          What type of content do you most enjoy creating?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_enjoy"
          value={watch('ct_sustain_enjoy')}
          onChange={val => setValue('ct_sustain_enjoy', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Long-form video (tutorials, vlogs, deep dives)', value: 'Long-form video (tutorials, vlogs, deep dives)' },
            { label: 'Short-form video (reels, shorts, clips)', value: 'Short-form video (reels, shorts, clips)' },
            { label: 'Written posts and articles', value: 'Written posts and articles' },
            { label: 'Audio conversations', value: 'Audio conversations' },
            { label: 'Visual design and carousels', value: 'Visual design and carousels' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          How often can you realistically create new content?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_freq"
          value={watch('ct_sustain_freq')}
          onChange={val => setValue('ct_sustain_freq', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Daily', value: 'Daily' },
            { label: '3–4x per week', value: '3–4x per week' },
            { label: '1–2x per week', value: '1–2x per week' },
            { label: '1–2x per month', value: '1–2x per month' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          What&apos;s your primary goal right now?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_platgoal"
          value={watch('ct_sustain_platgoal')}
          onChange={val => setValue('ct_sustain_platgoal', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Build a long-term audience (compounding)', value: 'Build a long-term audience (compounding)' },
            { label: 'Get fast visibility and discovery', value: 'Get fast visibility and discovery' },
            { label: 'Build authority in my niche', value: 'Build authority in my niche' },
            { label: 'Drive traffic to an offer or product', value: 'Drive traffic to an offer or product' },
          ]}
        />

        {/* Platform recommendation guide */}
        <div
          style={{
            margin: '1rem 0 .5rem',
            padding: '1rem',
            background: 'var(--orange-tint)',
            border: '1px solid var(--orange-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--orange)',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: '.5rem',
            }}
          >
            Platform Recommendation Guide
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>YouTube</strong> — Best for long-form video, tutorials, and evergreen content that compounds over time. Highest trust-building platform. Ideal if you can commit to 1–2 videos/month minimum.<br />
            <strong style={{ color: 'var(--text)' }}>Instagram</strong> — Best for visual brands, short-form video, and daily presence. High discovery via Reels. Works best with 3–5x/week consistency.<br />
            <strong style={{ color: 'var(--text)' }}>LinkedIn</strong> — Best for B2B, written authority, and professional audiences. Organic reach is still excellent. 3–5 posts/week is optimal.<br />
            <strong style={{ color: 'var(--text)' }}>Substack</strong> — Best for deep written content and owning your audience. Builds the highest-quality relationship. 1–4 newsletters/month works well.<br />
            <strong style={{ color: 'var(--text)' }}>X (Twitter)</strong> — Best for fast idea testing, conversations, and building network. High volume required (daily). Great secondary platform.
          </div>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Your recommended primary platform (choose one):
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_primary"
          value={watch('ct_sustain_primary')}
          onChange={val => setValue('ct_sustain_primary', val)}
          getFullResponses={getValues}
          columns={3}
          options={[
            { label: 'YouTube', value: 'YouTube' },
            { label: 'Instagram', value: 'Instagram' },
            { label: 'LinkedIn', value: 'LinkedIn' },
            { label: 'Substack', value: 'Substack' },
            { label: 'X (Twitter)', value: 'X (Twitter)' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Your secondary platform (repurposed content only):
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_secondary"
          value={watch('ct_sustain_secondary')}
          onChange={val => setValue('ct_sustain_secondary', val)}
          getFullResponses={getValues}
          columns={3}
          options={[
            { label: 'YouTube', value: 'YouTube' },
            { label: 'Instagram', value: 'Instagram' },
            { label: 'LinkedIn', value: 'LinkedIn' },
            { label: 'Substack', value: 'Substack' },
            { label: 'X (Twitter)', value: 'X (Twitter)' },
            { label: 'None for now — single focus', value: 'None for now — single focus' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          My current focus is:
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_sustain_focus"
          value={watch('ct_sustain_focus')}
          onChange={val => setValue('ct_sustain_focus', val)}
          getFullResponses={getValues}
          placeholder="The one platform getting your full energy right now."
        />
      </div>

      {/* ─── WORKSHOP 3: BATCHING SYSTEM ─── */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginTop: '3rem',
          marginBottom: '.5rem',
        }}
      >
        Workshop 3
      </div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '1rem',
          color: 'var(--text)',
        }}
      >
        Batch your content, protect your time
      </h2>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
        {[
          { num: '01', day: 'Monday — Research & Ideation', desc: 'Find your topic, research angles, write rough outlines. This is pure thinking time. No camera, no filming — just building the foundation everything else runs on.' },
          { num: '02', day: 'Tuesday — Writing & Hooks', desc: 'Write your script or talking points. Draft 3 hook versions using the 3-step formula. Lock your structure before you touch the camera.' },
          { num: '03', day: 'Wednesday — Filming', desc: 'All A-roll in one session. Change outfits to batch 2–3 weeks at once. Capture B-roll after you finish talking head. Treat it like a shoot, not a recording.' },
          { num: '04', day: 'Thursday — Editing & Post', desc: 'Cut, color grade, add music, create thumbnails. Review for pacing — kill every moment that loses energy. Export everything in the same session.' },
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
