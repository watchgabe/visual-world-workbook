'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 2
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

const LIGHTING_OPTIONS = [
  { label: 'Warm, golden natural', value: 'warm-golden' },
  { label: 'Bright, even studio', value: 'bright-studio' },
  { label: 'High contrast dramatic', value: 'high-contrast' },
  { label: 'Soft, diffused', value: 'soft-diffused' },
]

const TEXTURE_OPTIONS = [
  { label: 'Natural (wood, plants, stone)', value: 'natural' },
  { label: 'Modern (concrete, metal, glass)', value: 'modern' },
  { label: 'Vintage (leather, aged wood)', value: 'vintage' },
  { label: 'Mixed / eclectic', value: 'mixed' },
]

export default function ColorPalette() {
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
      {/* ── MOOD BOARD ─────────────────────────────────── */}
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
          fontFamily: 'var(--font-num)',
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-.01em',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        Creator Mood Board
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        Your mood board is the visual DNA of your brand. Not a Pinterest board of things you think
        look cool — a curated collection of images that, when placed together, tell one clear story
        about the world your brand lives in. The mood board comes before the color palette, before
        the typography, before any design decisions. All of those decisions should flow from the
        mood you create here.
      </p>

      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Think of this as your creative cheat sheet — a snapshot of how your content should look,
        feel, and sound. Keep it close whenever you&apos;re filming, editing, or designing to stay
        sharp and on-brand.
      </p>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
        Collect visuals that truly reflect your vibe. Focus on things you can realistically achieve
        with your environment, gear, and skillset. Pay attention to color, tone, framing, and
        texture. Pull from creators who inspire you, ads that grab your attention, or reels you
        can&apos;t stop rewatching. Stay selective — 10–15 strong references beat 100 random saves.
        Refresh it regularly as your style grows.
      </p>

      {/* Pro tip */}
      <div
        style={{
          background: 'var(--orange-tint)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
          <strong>Pro tip:</strong> Curate your inspiration directly in Instagram — when you save a
          post, add it to a Collection so it&apos;s easy to find later. If you prefer Pinterest,
          paste your board link below and we&apos;ll reference it.
        </div>
      </div>

      {/* Link Existing Board */}
      <div
        style={{
          borderWidth: '1px',
          borderStyle: 'dashed',
          borderColor: 'var(--border2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            color: 'var(--orange)',
            marginBottom: '6px',
          }}
        >
          Link Your Existing Board
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.6, marginBottom: '.75rem' }}>
          Already building your mood board somewhere? Paste your board URL below — e.g.{' '}
          <span style={{ color: 'var(--dimmer)', fontFamily: 'monospace', fontSize: '12px' }}>
            www.pinterest.com/yourname/yourboard
          </span>
        </p>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="vw_mb_link"
          value={watch('vw_mb_link')}
          onChange={val => setValue('vw_mb_link', val)}
          getFullResponses={getValues}
          placeholder="www.pinterest.com/yourname/yourboard"
        />
      </div>

      {/* Identify Patterns */}
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
        Identify Patterns
      </h2>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: '2rem',
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
          Mood Board Analysis
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            What colors appear most frequently?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_colors"
            value={watch('vw_mb_colors')}
            onChange={val => setValue('vw_mb_colors', val)}
            getFullResponses={getValues}
            placeholder="List the dominant colors you see across your images..."
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            What lighting style appears most frequently?
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_lighting"
            value={watch('vw_mb_lighting')}
            onChange={val => setValue('vw_mb_lighting', val)}
            getFullResponses={getValues}
            options={LIGHTING_OPTIONS}
            columns={2}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            What mood do the images collectively create?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_mood"
            value={watch('vw_mb_mood')}
            onChange={val => setValue('vw_mb_mood', val)}
            getFullResponses={getValues}
            placeholder="In one word or phrase..."
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            What textures appear most frequently?
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_textures"
            value={watch('vw_mb_textures')}
            onChange={val => setValue('vw_mb_textures', val)}
            getFullResponses={getValues}
            options={TEXTURE_OPTIONS}
            columns={2}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            If your mood board were a movie, what movie would it be?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_movie"
            value={watch('vw_mb_movie')}
            onChange={val => setValue('vw_mb_movie', val)}
            getFullResponses={getValues}
            placeholder="e.g. Arrival, Amélie, Heat, The Social Network..."
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            If your mood board were a time of day, what time would it be?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_time"
            value={watch('vw_mb_time')}
            onChange={val => setValue('vw_mb_time', val)}
            getFullResponses={getValues}
            placeholder="e.g. Golden hour, overcast morning, 2am city..."
          />
        </div>

        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            If your mood board were a place, where would it be?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_mb_place"
            value={watch('vw_mb_place')}
            onChange={val => setValue('vw_mb_place', val)}
            getFullResponses={getValues}
            placeholder="e.g. A minimalist Tokyo apartment, a coastal studio..."
          />
        </div>
      </div>

      {/* ── COLOR PALETTE ──────────────────────────────── */}
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
      <h2
        style={{
          fontFamily: 'var(--font-num)',
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          fontWeight: 900,
          letterSpacing: '-.01em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        Define Your Color Palette
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
        Color is emotion. Before someone reads a single word of your content, before they hear your
        voice — they feel your color palette. Your colors communicate who you are, who you&apos;re for,
        and what you stand for before you say anything.
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
            marginBottom: '.75rem',
          }}
        >
          The Color Palette Framework
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '12px' }}>
          Enter hex codes (e.g. #F0601B) or color names. The swatches will update live.
        </div>

        {/* Safe place to start tip */}
        <div
          style={{
            background: 'var(--orange-tint)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--orange-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 13px',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              marginBottom: '4px',
            }}
          >
            A safe place to start
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.65 }}>
            Pick 1–2 vibrant colors and fill the rest of your palette with neutrals. Neutrals give
            your brand room to breathe — and make those accent colors hit harder. Most premium brands
            are 80% neutral, 20% bold.
          </div>
        </div>

        {/* Primary Color */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Primary Color — your dominant brand color
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: watch('vw_color_primary') || 'var(--border)',
                flexShrink: 0,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border)',
              }}
            />
            <div style={{ flex: 1 }}>
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="vw_color_primary"
                value={watch('vw_color_primary')}
                onChange={val => setValue('vw_color_primary', val)}
                getFullResponses={getValues}
                placeholder="#hex or color name — e.g. #F0601B"
              />
            </div>
          </div>
        </div>

        {/* Secondary Color */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Secondary Color — your supporting color
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: watch('vw_color_secondary') || 'var(--border)',
                flexShrink: 0,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border)',
              }}
            />
            <div style={{ flex: 1 }}>
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="vw_color_secondary"
                value={watch('vw_color_secondary')}
                onChange={val => setValue('vw_color_secondary', val)}
                getFullResponses={getValues}
                placeholder="#hex or color name — e.g. #1A1A1A"
              />
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Accent Color — used sparingly, for emphasis
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: watch('vw_color_accent') || 'var(--border)',
                flexShrink: 0,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border)',
              }}
            />
            <div style={{ flex: 1 }}>
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="vw_color_accent"
                value={watch('vw_color_accent')}
                onChange={val => setValue('vw_color_accent', val)}
                getFullResponses={getValues}
                placeholder="#hex or color name — e.g. #FFD700"
              />
            </div>
          </div>
        </div>

        {/* Neutral Base */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Neutral Base — your background canvas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: watch('vw_color_neutral') || 'var(--border)',
                flexShrink: 0,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border)',
              }}
            />
            <div style={{ flex: 1 }}>
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="vw_color_neutral"
                value={watch('vw_color_neutral')}
                onChange={val => setValue('vw_color_neutral', val)}
                getFullResponses={getValues}
                placeholder="#hex or color name — e.g. #F7F6F4"
              />
            </div>
          </div>
        </div>

        {/* Palette Name */}
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', marginTop: '4px' }}>
            Give your palette a name that captures the mood
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_color_name"
            value={watch('vw_color_name')}
            onChange={val => setValue('vw_color_name', val)}
            getFullResponses={getValues}
            placeholder='"Warm Minimal" · "Dark Cinematic" · "Cool Authority" · "Golden Hour"'
          />
        </div>
      </div>

      {/* Color Psychology Primer */}
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
        Color Psychology Primer
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
        {[
          {
            gradient: 'linear-gradient(180deg,#F0601B 0%,#D62828 50%,#FCBF49 100%)',
            title: 'Warm',
            sub: 'Oranges · Yellows · Reds · Warm browns',
            traits: ['Energy', 'Warmth', 'Approachability', 'Passion'],
          },
          {
            gradient: 'linear-gradient(180deg,#003049 0%,#4A9EDE 50%,#5DCAA5 100%)',
            title: 'Cool',
            sub: 'Blues · Greens · Grays · Cool whites',
            traits: ['Calm', 'Clarity', 'Authority', 'Professionalism'],
          },
          {
            gradient: 'linear-gradient(180deg,#EAE2B7 0%,#D8CBA6 50%,#c4b49c 100%)',
            title: 'Neutral',
            sub: 'Beiges · Creams · Warm whites · Soft grays',
            traits: ['Timelessness', 'Elegance', 'Simplicity', 'Premium'],
          },
          {
            gradient: 'linear-gradient(180deg,#0a0a0a 0%,#1f1f1f 50%,#2a2a2a 100%)',
            title: 'Dark',
            sub: 'Deep blacks · Charcoals · Dark navies',
            traits: ['Drama', 'Luxury', 'Depth', 'Mystery'],
          },
          {
            gradient: 'linear-gradient(180deg,#c9b4b4 0%,#b5c4b1 50%,#b0bec5 100%)',
            title: 'Muted',
            sub: 'Dusty pinks · Sage greens · Muted blues',
            traits: ['Authenticity', 'Warmth', 'Nostalgia', 'Lifestyle'],
          },
        ].map(item => (
          <div
            key={item.title}
            style={{
              display: 'flex',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '52px', flexShrink: 0, background: item.gradient }} />
            <div style={{ padding: '.7rem 1rem' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--dimmer)', marginBottom: '4px' }}>
                {item.sub}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {item.traits.map((t, i) => (
                  <span key={t} style={{ fontSize: '11.5px', color: 'var(--dim)' }}>
                    {i > 0 && <span style={{ color: 'var(--border2)', marginRight: '8px' }}>·</span>}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
