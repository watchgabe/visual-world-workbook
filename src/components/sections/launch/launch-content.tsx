'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'launch' as const
const SECTION_INDEX = 5
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function LaunchContent() {
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
        Launch Content
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Three pinned pieces of content that work 24/7. Every new visitor lands on your profile and
        immediately knows who you are, what you stand for, and why they should follow you. Build
        these once. Let them run forever.
      </p>

      <div
        style={{
          borderLeft: '3px solid var(--orange)',
          padding: '11px 15px',
          background: 'var(--orange-tint)',
          marginBottom: '1.25rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--orange-dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          <strong>Format is flexible.</strong> These don&apos;t have to be videos — a reel, a
          carousel, or a long-form post all work. The medium is secondary. The message is
          everything. Pin all three and let them do the selling while you sleep.
        </p>
      </div>

      {/* Post #1 — Your Story */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Post #1 — Your Story
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          This is the single best use of real estate on your profile. Every person who lands on your
          page will see this first — it gives them an immediate look into who you are, what you do,
          and why they might want to stick around. This is not a highlight reel. This is the honest
          version: the real journey, the real turning point, the real reason you show up. A new
          visitor should finish this and feel like they already know you.
        </p>
      </div>

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
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--orange)',
            marginBottom: '.75rem',
          }}
        >
          Why I Create
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Why do you create? (the real answer — not the polished one)
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_why"
          value={watch('la_lc_story_why')}
          onChange={val => setValue('la_lc_story_why', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="What drives you to show up and make content? Why this topic, why now? Go deeper than the obvious answer."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          The challenge or struggle you faced
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_challenge"
          value={watch('la_lc_story_challenge')}
          onChange={val => setValue('la_lc_story_challenge', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="What were you going through before you figured this out? Be specific. The more real, the more relatable."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          The turning point
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_turning"
          value={watch('la_lc_story_turning')}
          onChange={val => setValue('la_lc_story_turning', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="What changed? What did you learn, discover, or decide that shifted everything for you?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          What you&apos;ve learned (that you&apos;re now teaching)
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_learned"
          value={watch('la_lc_story_learned')}
          onChange={val => setValue('la_lc_story_learned', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="The insight, system, or belief you figured out that your audience desperately needs."
        />
      </div>

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
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--orange)',
            marginBottom: '.75rem',
          }}
        >
          Script Notes
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Your story hook (the first line of the video)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_hook"
          value={watch('la_lc_story_hook')}
          onChange={val => setValue('la_lc_story_hook', val)}
          getFullResponses={getValues}
          placeholder="e.g. Three years ago I almost quit creating entirely. Here's what changed."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Examples, proof, or moments that make your story credible
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_examples"
          value={watch('la_lc_story_examples')}
          onChange={val => setValue('la_lc_story_examples', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Real examples, before/afters, specific results, or pivotal moments that prove your story is true."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Your CTA at the end of this video
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_story_cta"
          value={watch('la_lc_story_cta')}
          onChange={val => setValue('la_lc_story_cta', val)}
          getFullResponses={getValues}
          placeholder="e.g. Follow for weekly [topic] content. The free [lead magnet] is in my bio."
        />
      </div>

      {/* Post #2 — Positioning Deep Dive */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Post #2 — Your Positioning Deep Dive
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          This is your flag in the ground. You&apos;re not just introducing yourself — you&apos;re
          teaching the subject you want to be known for through your beliefs. This video tells the
          world exactly where you stand, what you believe that others don&apos;t say out loud, and
          why your POV matters. It&apos;s not broad education. It&apos;s how you see the space
          differently. This is what separates you from every other creator in your niche.
        </p>
      </div>

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
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--orange)',
            marginBottom: '.75rem',
          }}
        >
          5-Step Positioning Framework
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Step 1 — Contrarian Belief: &ldquo;I believe ___&rdquo;
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_pos_belief"
          value={watch('la_lc_pos_belief')}
          onChange={val => setValue('la_lc_pos_belief', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="State the belief that sets you apart. What do you believe that most creators or experts in your space don't say out loud?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Step 2 — Claim Subject: &ldquo;I help people understand ___&rdquo;
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_pos_claim"
          value={watch('la_lc_pos_claim')}
          onChange={val => setValue('la_lc_pos_claim', val)}
          getFullResponses={getValues}
          placeholder="The specific thing you teach or the shift you create in people's thinking."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Step 3 — Key Breakthroughs (3–5 things your audience needs to understand)
        </div>
        {(['la_lc_pos_b1', 'la_lc_pos_b2', 'la_lc_pos_b3', 'la_lc_pos_b4', 'la_lc_pos_b5'] as const).map((key, i) => (
          <div key={key} style={{ marginBottom: '6px' }}>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey={key}
              value={watch(key)}
              onChange={val => setValue(key, val)}
              getFullResponses={getValues}
              placeholder={i < 3 ? `Breakthrough #${i + 1}` : `Breakthrough #${i + 1} (optional)`}
            />
          </div>
        ))}

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Step 4 — Make Their Life Easier (the mindset shift)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--dimmer)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
              Stop doing
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_lc_pos_stop"
              value={watch('la_lc_pos_stop')}
              onChange={val => setValue('la_lc_pos_stop', val)}
              getFullResponses={getValues}
              placeholder="What to stop..."
            />
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--dimmer)',
                margin: '10px 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
              Old belief
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_lc_pos_oldbelief"
              value={watch('la_lc_pos_oldbelief')}
              onChange={val => setValue('la_lc_pos_oldbelief', val)}
              getFullResponses={getValues}
              placeholder="What they currently believe..."
            />
          </div>
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--dimmer)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
              Start doing
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_lc_pos_start"
              value={watch('la_lc_pos_start')}
              onChange={val => setValue('la_lc_pos_start', val)}
              getFullResponses={getValues}
              placeholder="What to start..."
            />
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--dimmer)',
                margin: '10px 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
              New belief
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_lc_pos_newbelief"
              value={watch('la_lc_pos_newbelief')}
              onChange={val => setValue('la_lc_pos_newbelief', val)}
              getFullResponses={getValues}
              placeholder="What you want them to believe..."
            />
          </div>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Step 5 — Anchor POV: &ldquo;If you understand this belief, it will change how you ___&rdquo;
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_pos_anchor"
          value={watch('la_lc_pos_anchor')}
          onChange={val => setValue('la_lc_pos_anchor', val)}
          getFullResponses={getValues}
          placeholder="Complete the sentence. What changes for them when they truly get this?"
        />
      </div>

      {/* Post #3 — Authority Masterclass */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Post #3 — The Authority Masterclass
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          This is a 30+ minute long-form video that covers everything you know about your subject
          — a complete, comprehensive resource that someone could watch and immediately understand
          why they should trust you. This is not bragging. This is proof. Someone who has never
          heard of you will finish this and think: <em>this person knows exactly what they&apos;re
          talking about.</em> The best part? This single video becomes months of short-form content
          through your waterfall system. Build it once. Repurpose it forever.
        </p>
      </div>

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
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--orange)',
            marginBottom: '.75rem',
          }}
        >
          Masterclass Blueprint
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          What is this masterclass about? (your definitive subject)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_mc_subject"
          value={watch('la_lc_mc_subject')}
          onChange={val => setValue('la_lc_mc_subject', val)}
          getFullResponses={getValues}
          placeholder="e.g. Everything I know about building a personal brand from zero"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Who is this for? (be specific)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_mc_audience"
          value={watch('la_lc_mc_audience')}
          onChange={val => setValue('la_lc_mc_audience', val)}
          getFullResponses={getValues}
          placeholder="e.g. Creators who want to go full-time but don't know where to start"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Your authority proof — why you can teach this
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_mc_authority"
          value={watch('la_lc_mc_authority')}
          onChange={val => setValue('la_lc_mc_authority', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Results, experience, track record, or the specific journey that makes you the right person to teach this."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          The 5–7 core sections you&apos;ll cover (your chapters)
        </div>
        {(
          [
            ['la_lc_mc_s1', 'Section 1...'],
            ['la_lc_mc_s2', 'Section 2...'],
            ['la_lc_mc_s3', 'Section 3...'],
            ['la_lc_mc_s4', 'Section 4...'],
            ['la_lc_mc_s5', 'Section 5...'],
            ['la_lc_mc_s6', 'Section 6 (optional)...'],
            ['la_lc_mc_s7', 'Section 7 (optional)...'],
          ] as const
        ).map(([key, placeholder]) => (
          <div key={key} style={{ marginBottom: '6px' }}>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey={key}
              value={watch(key)}
              onChange={val => setValue(key, val)}
              getFullResponses={getValues}
              placeholder={placeholder}
            />
          </div>
        ))}

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Your opening hook (the first 60 seconds that justify 30+ minutes)
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_mc_hook"
          value={watch('la_lc_mc_hook')}
          onChange={val => setValue('la_lc_mc_hook', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="What promise do you make in the first minute? Why should they stay for the full thing?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Waterfall plan — how will you break this into short-form clips?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lc_mc_waterfall"
          value={watch('la_lc_mc_waterfall')}
          onChange={val => setValue('la_lc_mc_waterfall', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="e.g. Each section becomes 1 short-form clip (5–7 clips total), quotes become carousels, key moments become Reels..."
        />
      </div>
    </SectionWrapper>
  )
}
