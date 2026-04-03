'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 3
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

export default function CoreMission() {
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

  async function handleGenerateIkigai() {
    const love = getValues('bf_ikigai_love')
    const good = getValues('bf_ikigai_good')
    const world = getValues('bf_ikigai_world')
    const paid = getValues('bf_ikigai_paid')
    if (!love.trim() || !good.trim() || !world.trim() || !paid.trim()) return
    setIsGenerating('bf_ikigai_center')
    try {
      const prompt =
        "You are a personal brand strategist. Identify this creator's Ikigai.\n\nLOVE: " +
        love +
        '\nGOOD AT: ' +
        good +
        '\nWORLD NEEDS: ' +
        world +
        '\nPAID FOR: ' +
        paid +
        '\n\nIn 3 sentences: (1) State the Ikigai clearly \u2014 the thread that runs through all four. (2) Why this is their unique intersection. (3) A single-line Ikigai statement they can use as a mission foundation. Be specific and show them something they might not have articulated. No preamble.'
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 400 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      ;(setValue as (k: string, v: string) => void)('bf_ikigai_center', data.text || '')
    } catch {
      // silent error
    } finally {
      setIsGenerating(null)
    }
  }

  const responses = watch()

  const missionAvatar = watch('bf_mission_avatar')
  const missionOutcome = watch('bf_mission_outcome')
  const missionMethod = watch('bf_mission_method')
  const missionWhy = watch('bf_mission_why')

  const missionPreview =
    missionAvatar || missionOutcome || missionMethod || missionWhy
      ? `"I help ${missionAvatar || '[avatar]'} achieve ${missionOutcome || '[desired outcome]'} through ${missionMethod || '[your unique method]'} so that ${missionWhy || '[deeper why]'}."`
      : 'Your mission statement will appear here as you type...'

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
        Core Mission + Ikigai
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        Your core mission is your &ldquo;why.&rdquo; Ikigai is a Japanese concept meaning
        &ldquo;reason for being&rdquo; — the intersection of what you love, what you&apos;re
        good at, what the world needs, and what you can be paid for. When your
        mission aligns with your Ikigai, your brand has purpose people can feel.
      </p>

      <div style={{ marginBottom: '1.5rem', textAlign: 'center' as const }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://res.cloudinary.com/dy0kchxh8/image/upload/v1774367914/_make_the_background_less_color_0a0a0a_drop_the_copy_on_the_bottom_left_and_bottom_right_remove_the_k7lyamv8nltjtlc1eetm_zyxfv3.png"
          alt="Ikigai Diagram"
          style={{ width: '100%', display: 'block', borderRadius: '8px' }}
        />
      </div>

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
        The Ikigai Exercise
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
        <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7 }}>
          Answer each quadrant honestly. The more specific your answers, the
          clearer your Ikigai becomes. Avoid generic answers — go deep.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            What do you LOVE doing?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="bf_ikigai_love"
            value={watch('bf_ikigai_love')}
            onChange={val => setValue('bf_ikigai_love', val)}
            getFullResponses={getValues}
            rows={4}
            placeholder="What activities make you lose track of time? What would you do even if you weren't paid?"
          />
        </div>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            What are you GOOD AT?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="bf_ikigai_good"
            value={watch('bf_ikigai_good')}
            onChange={val => setValue('bf_ikigai_good', val)}
            getFullResponses={getValues}
            rows={4}
            placeholder="What skills come naturally? What do people always ask you for help with?"
          />
        </div>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            What does the WORLD NEED?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="bf_ikigai_world"
            value={watch('bf_ikigai_world')}
            onChange={val => setValue('bf_ikigai_world', val)}
            getFullResponses={getValues}
            rows={4}
            placeholder="What problems do you see that need solving? What's missing in your industry?"
          />
        </div>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            What can you be PAID FOR?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="bf_ikigai_paid"
            value={watch('bf_ikigai_paid')}
            onChange={val => setValue('bf_ikigai_paid', val)}
            getFullResponses={getValues}
            rows={4}
            placeholder="What skills or knowledge do people value enough to pay for?"
          />
        </div>
      </div>

      <div
        style={{
          background: 'var(--orange-tint)',
          border: '1px solid var(--orange-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.2rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--orange)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          Your Ikigai — Where All Four Overlap
        </div>
        <div style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={handleGenerateIkigai}
            disabled={isGenerating === 'bf_ikigai_center'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: isGenerating === 'bf_ikigai_center' ? 'var(--dimmer)' : 'var(--orange)',
              background: 'var(--orange-tint)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--orange-border)',
              borderRadius: 'var(--radius-md)',
              cursor: isGenerating === 'bf_ikigai_center' ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
              opacity: isGenerating === 'bf_ikigai_center' ? 0.6 : 1,
            }}
          >
            {isGenerating === 'bf_ikigai_center' ? 'Generating...' : '✦ Find My Ikigai'}
          </button>
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_ikigai_center"
          value={watch('bf_ikigai_center')}
          onChange={val => setValue('bf_ikigai_center', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="The sweet spot where all four answers converge..."
        />
      </div>

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
        Your Core Mission Statement
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
        <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
          <strong style={{ color: 'var(--text)' }}>Format:</strong>{' '}
          &ldquo;I help [avatar] achieve [desired outcome] through [your unique method] so
          that [deeper why].&rdquo;
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>Example:</strong>{' '}
          &ldquo;I help creators who already sell offers but look amateur build premium
          personal brands with clear positioning and cinematic content systems that
          attract high-quality clients.&rdquo;
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
            marginBottom: '.75rem',
          }}
        >
          Mission Builder
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '6px' }}>
          I help <span style={{ color: 'var(--orange)' }}>[avatar]</span>
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_mission_avatar"
          value={watch('bf_mission_avatar')}
          onChange={val => setValue('bf_mission_avatar', val)}
          getFullResponses={getValues}
          placeholder="creators who already sell offers but look amateur"
        />
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '6px' }}>
          achieve <span style={{ color: 'var(--orange)' }}>[desired outcome]</span>
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_mission_outcome"
          value={watch('bf_mission_outcome')}
          onChange={val => setValue('bf_mission_outcome', val)}
          getFullResponses={getValues}
          placeholder="build premium personal brands with clear positioning"
        />
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '6px' }}>
          through <span style={{ color: 'var(--orange)' }}>[your unique method]</span>
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_mission_method"
          value={watch('bf_mission_method')}
          onChange={val => setValue('bf_mission_method', val)}
          getFullResponses={getValues}
          placeholder="cinematic content systems and brand strategy"
        />
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '6px' }}>
          so that <span style={{ color: 'var(--orange)' }}>[deeper why]</span>
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_mission_why"
          value={watch('bf_mission_why')}
          onChange={val => setValue('bf_mission_why', val)}
          getFullResponses={getValues}
          placeholder="they attract high-quality clients and stop being overlooked"
        />

        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '13.5px',
            color: 'var(--dim)',
            fontStyle: 'italic',
            lineHeight: 1.7,
            margin: '0.75rem 0',
          }}
        >
          {missionPreview}
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Core Mission Statement (final)
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_core_mission"
          value={watch('bf_core_mission')}
          onChange={val => setValue('bf_core_mission', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="Write or refine your final mission statement here..."
        />
      </div>
    </SectionWrapper>
  )
}
