'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 11
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

const MOOD_VIBE_OPTIONS = [
  { label: 'Dark & Cinematic', value: 'Dark & Cinematic' },
  { label: 'Bright & Clean', value: 'Bright & Clean' },
  { label: 'Warm & Organic', value: 'Warm & Organic' },
  { label: 'Cool & Professional', value: 'Cool & Professional' },
  { label: 'Raw & Documentary', value: 'Raw & Documentary' },
]

export default function ContentBlueprint() {
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

  // Derived values for live compiled view
  const color1 = watch('ct_bp_color1')
  const color2 = watch('ct_bp_color2')
  const color3 = watch('ct_bp_color3')
  const moodVibe = watch('ct_bp_mood_vibe')
  const narrative = watch('ct_bp_narrative')
  const objects = watch('ct_bp_objects')
  const references = watch('ct_bp_references')

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
        Part 6 — Your Blueprint
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
        Your personalized playbook
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        You&apos;ve done the work. Here&apos;s everything you built — your complete content strategy, sustainable system, and monetization plan in one place. Return here whenever you need to recalibrate.
      </p>

      {/* ─── MOOD BOARD & VISUAL IDENTITY ─── */}
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
          Mood Board &amp; Visual Identity
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: '0 0 1rem' }}>
          Define the visual world you&apos;re creating — colors, feeling, references. Everything that makes your brand immediately recognizable before anyone hears you speak.
        </p>

        {/* Color palette */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Color palette
        </div>
        <div
          className="grid-form"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '1rem',
          }}
        >
          {([
            { key: 'ct_bp_color1', label: 'Primary', placeholder: 'e.g. #1a1a1a — deep black' },
            { key: 'ct_bp_color2', label: 'Accent', placeholder: 'e.g. #f1601b — burnt orange' },
            { key: 'ct_bp_color3', label: 'Neutral', placeholder: 'e.g. #e8e4df — warm white' },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--dimmer)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  marginBottom: '4px',
                }}
              >
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    background: watch(key) || 'var(--border)',
                    flexShrink: 0,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <WorkshopInput
                    moduleSlug={MODULE_SLUG}
                    fieldKey={key}
                    value={watch(key)}
                    onChange={val => setValue(key, val)}
                    getFullResponses={getValues}
                    placeholder={placeholder}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual feeling */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Visual feeling
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_bp_mood_vibe"
          value={watch('ct_bp_mood_vibe')}
          onChange={val => setValue('ct_bp_mood_vibe', val)}
          getFullResponses={getValues}
          columns={3}
          options={MOOD_VIBE_OPTIONS}
        />

        {/* Visual world narrative */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          Visual world narrative
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '4px' }}>
          The feeling your content creates before anyone hears you speak.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_bp_narrative"
          value={watch('ct_bp_narrative')}
          onChange={val => setValue('ct_bp_narrative', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="e.g. Premium and cinematic, but human — the aesthetic of an expensive production with the intimacy of a one-on-one conversation..."
        />

        {/* Recurring props & objects */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          Recurring props &amp; objects
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_bp_objects"
          value={watch('ct_bp_objects')}
          onChange={val => setValue('ct_bp_objects', val)}
          getFullResponses={getValues}
          placeholder="e.g. Coffee, notebooks, camera gear, clean minimal desk setup..."
        />

        {/* Visual references */}
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          Visual references
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '4px' }}>
          Creators, films, brands, or photographers whose visual world inspires yours.
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_bp_references"
          value={watch('ct_bp_references')}
          onChange={val => setValue('ct_bp_references', val)}
          getFullResponses={getValues}
          placeholder="e.g. Peter McKinnon, A24 films, Apple product photography, @visualathletes..."
        />
      </div>

      {/* ─── CREATOR ANALYSIS ─── */}
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
          Creator Analysis
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: '0 0 1rem' }}>
          Study the creators doing what you want to do. Don&apos;t copy — extract the principles, then find your own angle on each one.
        </p>

        {([1, 2, 3] as const).map(num => (
          <div
            key={num}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '.85rem 1rem',
              marginBottom: num < 3 ? '8px' : 0,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--orange)',
                opacity: 0.45,
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              {String(num).padStart(2, '0')}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>
              Creator name / channel
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey={`ct_bp_creator${num}_name`}
              value={(watch as (k: string) => string)(`ct_bp_creator${num}_name`)}
              onChange={val => (setValue as (k: string, v: string) => void)(`ct_bp_creator${num}_name`, val)}
              getFullResponses={getValues}
              placeholder={num === 1 ? 'e.g. Peter McKinnon' : num === 2 ? 'e.g. Alex Hormozi' : 'e.g. Ali Abdaal'}
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
              What they do exceptionally well
            </div>
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`ct_bp_creator${num}_why`}
              value={(watch as (k: string) => string)(`ct_bp_creator${num}_why`)}
              onChange={val => (setValue as (k: string, v: string) => void)(`ct_bp_creator${num}_why`, val)}
              getFullResponses={getValues}
              rows={2}
              placeholder={
                num === 1
                  ? 'Cinematic YouTube production, aspirational B-roll, premium personal brand positioning...'
                  : num === 2
                  ? 'High-density educational content, ruthless positioning, clear frameworks...'
                  : 'Relatable storytelling, evidence-based advice, premium editing that feels personal not corporate...'
              }
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
              What I take from them
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey={`ct_bp_creator${num}_takeaway`}
              value={(watch as (k: string) => string)(`ct_bp_creator${num}_takeaway`)}
              onChange={val => (setValue as (k: string, v: string) => void)(`ct_bp_creator${num}_takeaway`, val)}
              getFullResponses={getValues}
              placeholder={
                num === 1
                  ? 'e.g. Shot variety — switching setups every 60–90 seconds holds attention'
                  : num === 2
                  ? 'e.g. The hook — lead with the most valuable insight, not the build-up'
                  : 'e.g. Story structure — opening with a personal moment before any advice'
              }
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
              What I do differently
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey={`ct_bp_creator${num}_difference`}
              value={(watch as (k: string) => string)(`ct_bp_creator${num}_difference`)}
              onChange={val => (setValue as (k: string, v: string) => void)(`ct_bp_creator${num}_difference`, val)}
              getFullResponses={getValues}
              placeholder={
                num === 1
                  ? 'e.g. More structured education — I teach frameworks, not just document life'
                  : num === 2
                  ? 'e.g. My content is more visual and aspirational — I pair education with cinematic production'
                  : 'e.g. Tighter niche — everything I create connects back to one specific outcome for one specific person'
              }
            />
          </div>
        ))}
      </div>

      {/* ─── COMPILED SUMMARY VIEW ─── */}
      {(color1 || color2 || color3 || moodVibe || narrative || objects || references) && (
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
            Your Visual Blueprint — Compiled
          </div>

          {/* Color swatches */}
          {(color1 || color2 || color3) && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  marginBottom: '6px',
                }}
              >
                Brand Colors
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: color1, label: 'Primary' },
                  { value: color2, label: 'Accent' },
                  { value: color3, label: 'Neutral' },
                ].map(({ value, label }) =>
                  value ? (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: value,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'var(--border)',
                        }}
                      />
                      <div style={{ fontSize: '10px', color: 'var(--dimmer)' }}>{label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--dim)', fontFamily: 'monospace' }}>{value}</div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {moodVibe && (
            <div style={{ marginBottom: '.65rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Visual Feeling: </span>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{moodVibe}</span>
            </div>
          )}

          {narrative && (
            <div style={{ marginBottom: '.65rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '2px' }}>Narrative</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{narrative}</div>
            </div>
          )}

          {objects && (
            <div style={{ marginBottom: '.65rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Props & Objects: </span>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{objects}</span>
            </div>
          )}

          {references && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.06em' }}>References: </span>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{references}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── 30-DAY CONTENT ELEVATION PLAN ─── */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '2rem 0' }} />
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '1.25rem',
          color: 'var(--text)',
        }}
      >
        Your 30-day content elevation plan
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {[
          {
            week: 'Week 1 — Foundation',
            desc: 'Complete all foundation exercises. Define your content goal, platform strategy, and non-negotiable cadence. Write your content formula. Commit to your schedule and don\'t adjust it until week 4.',
          },
          {
            week: 'Week 2 — System Setup',
            desc: 'Set up your batching schedule. Map your complete content waterfall. Define your visual identity and filming setup. Batch your first week of content using the new system. Aim to stay at least one week ahead.',
          },
          {
            week: 'Week 3 — Content Creation',
            desc: 'Write your hook library (10 hooks minimum). Finalize your storytelling framework. Plan your first 30 pieces across all formats. Film your first batch using your new visual standards and review critically.',
          },
          {
            week: 'Week 4 — Launch & Calibrate',
            desc: 'Go live with your elevated content. Build your monetization funnel. Engage in the first hour of every post. Review at end of week 4 — what worked, what didn\'t, what to adjust. Then run the system again.',
          },
        ].map(({ week, desc }) => (
          <div
            key={week}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.1rem',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                color: 'var(--orange)',
                marginBottom: '5px',
              }}
            >
              {week}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '.75rem 1rem',
          background: 'var(--surface)',
          borderLeft: '3px solid var(--orange)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.5rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.6,
        }}
      >
        Building a premium personal brand is not about being perfect. It&apos;s about showing up intentionally. Consistently. With a clear point of view and a genuine desire to help the people you serve. The creators who win are the most consistent. You have everything you need. Now go build it.
      </div>
    </SectionWrapper>
  )
}
