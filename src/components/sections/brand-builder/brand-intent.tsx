'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'brand-builder' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS['brand-builder']![SECTION_INDEX]

const PLATFORM_OPTIONS = [
  'YouTube (long-form)',
  'Instagram (carousels + Reels)',
  'TikTok',
  'Newsletter',
  'Podcast',
  'X / Twitter',
  'LinkedIn',
]

const FEEL_OPTIONS = [
  'Cinematic & premium',
  'Warm & personal',
  'Bold & loud',
  'Minimal & editorial',
  'Playful & high-energy',
  'Dark & moody',
  'Clean & professional',
]

type FormValues = {
  bb_creator_type: string
  bb_primary_platform: string
  bb_brand_feel: string
  bb_audience_feel: string
  bb_visual_keywords: string
}

export default function BrandIntentSection() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      bb_creator_type: '',
      bb_primary_platform: '',
      bb_brand_feel: '',
      bb_audience_feel: '',
      bb_visual_keywords: '',
    },
  })

  useEffect(() => {
    if (!user) return
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(createClient() as any)
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .maybeSingle()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const r = data.responses
        SECTION_DEF.fields.forEach(f => {
          if (r[f.key]) setValue(f.key as keyof FormValues, r[f.key])
        })
      })
    return () => { cancelled = true }
  }, [user, setValue])

  function toggleChip(field: keyof FormValues, value: string) {
    const current = getValues(field)
    setValue(field, current === value ? '' : value)
    if (user) saveField(user.id, MODULE_SLUG, field, current === value ? '' : value)
  }

  const values = watch()

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={values}
    >
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.5rem' }}>
        Brand Builder — Step 2
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: '1rem' }}>
        Brand Intent
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '2rem' }}>
        Five quick answers. This tells the AI what you make, where you publish, and the feeling you're going for. The more specific you are, the better the brand directions will be.
      </p>

      {/* What do you create */}
      <div style={{ marginBottom: '1.75rem' }}>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bb_creator_type"
          value={values.bb_creator_type}
          onChange={val => setValue('bb_creator_type', val)}
          getFullResponses={getValues}
          label="What do you create?"
          placeholder="e.g. Cinematic vlogs about travel and mindset, Design tutorials for entrepreneurs, Long-form essays on culture and creativity…"
        />
      </div>

      {/* Primary platform */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--dim)', marginBottom: '10px' }}>
          Where do you publish most?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {PLATFORM_OPTIONS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => toggleChip('bb_primary_platform', p)}
              style={{
                padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                background: values.bb_primary_platform === p ? 'var(--orange)' : 'var(--surface)',
                color: values.bb_primary_platform === p ? '#fff' : 'var(--dim)',
                border: values.bb_primary_platform === p ? '1px solid var(--orange)' : '1px solid var(--border)',
              }}
            >{p}</button>
          ))}
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bb_primary_platform"
          value={values.bb_primary_platform}
          onChange={val => setValue('bb_primary_platform', val)}
          getFullResponses={getValues}
          placeholder="Or type your own…"
        />
      </div>

      {/* Brand feel */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--dim)', marginBottom: '10px' }}>
          How should your brand feel — to you?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {FEEL_OPTIONS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => toggleChip('bb_brand_feel', f)}
              style={{
                padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                background: values.bb_brand_feel === f ? 'var(--orange)' : 'var(--surface)',
                color: values.bb_brand_feel === f ? '#fff' : 'var(--dim)',
                border: values.bb_brand_feel === f ? '1px solid var(--orange)' : '1px solid var(--border)',
              }}
            >{f}</button>
          ))}
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bb_brand_feel"
          value={values.bb_brand_feel}
          onChange={val => setValue('bb_brand_feel', val)}
          getFullResponses={getValues}
          placeholder="Or describe in your own words…"
        />
      </div>

      {/* Audience feel */}
      <div style={{ marginBottom: '1.75rem' }}>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bb_audience_feel"
          value={values.bb_audience_feel}
          onChange={val => setValue('bb_audience_feel', val)}
          getFullResponses={getValues}
          label="How should your audience feel when they see your content?"
          placeholder="e.g. Inspired but grounded. Like someone who gets it. Calm and capable."
        />
      </div>

      {/* Visual keywords */}
      <div style={{ marginBottom: '1rem' }}>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="bb_visual_keywords"
          value={values.bb_visual_keywords}
          onChange={val => setValue('bb_visual_keywords', val)}
          getFullResponses={getValues}
          label="3–5 visual keywords"
          placeholder="e.g. grainy, high-contrast, warm, minimal, analog"
        />
        <div style={{ fontSize: '11px', color: 'var(--dimmer)', marginTop: '4px' }}>
          Words that describe how your content should look — not feel. Think: texture, contrast, color temperature, density.
        </div>
      </div>
    </SectionWrapper>
  )
}
