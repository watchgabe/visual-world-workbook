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

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 4
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

const VIBE_OPTIONS = [
  { label: 'Calm and minimal', value: 'calm-minimal' },
  { label: 'Creative and eclectic', value: 'creative-eclectic' },
  { label: 'Professional and polished', value: 'professional-polished' },
  { label: 'Luxurious and elevated', value: 'luxurious-elevated' },
  { label: 'Energetic and dynamic', value: 'energetic-dynamic' },
  { label: 'Raw and authentic', value: 'raw-authentic' },
]

const MOOD_OPTIONS = [
  { label: 'Warm and approachable', value: 'warm-approachable' },
  { label: 'Cool and authoritative', value: 'cool-authoritative' },
  { label: 'Energetic and motivating', value: 'energetic-motivating' },
  { label: 'Calm and contemplative', value: 'calm-contemplative' },
  { label: 'Bold and challenging', value: 'bold-challenging' },
  { label: 'Authentic and raw', value: 'authentic-raw' },
]

const LIGHTING_OPTIONS = [
  { label: 'Warm golden natural light', value: 'warm-golden' },
  { label: 'Bright even studio light', value: 'bright-studio' },
  { label: 'High contrast dramatic', value: 'high-contrast' },
  { label: 'Soft diffused light', value: 'soft-diffused' },
]

const GRADE_OPTIONS = [
  { label: 'Warm tones', value: 'warm' },
  { label: 'Cool tones', value: 'cool' },
  { label: 'Desaturated / film-like', value: 'desaturated' },
  { label: 'High contrast', value: 'high-contrast' },
  { label: 'Natural / ungraded', value: 'natural' },
  { label: 'Mixed by content type', value: 'mixed' },
]

const TEXTURE_OPTIONS = [
  { label: 'Natural (wood, plants, fabric, stone)', value: 'natural' },
  { label: 'Modern (concrete, metal, glass)', value: 'modern' },
  { label: 'Vintage (leather, aged wood, film grain)', value: 'vintage' },
  { label: 'Mixed / eclectic', value: 'mixed' },
]

export default function ShotSystem() {
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
        Your Perspective
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your perspective is what makes your visual world yours. Colors and fonts are tools —
        perspective is the lens. The five elements below build the foundation of how your brand
        sees, shoots, and shows up. When these are aligned, your content stops feeling like content
        and starts feeling like a point of view.
      </p>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        The Five Elements of Your Perspective
      </h2>

      {/* Element 1: Setting */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
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
            marginBottom: '4px',
          }}
        >
          Element 1
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          Setting
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '1rem' }}>
          Where does your brand live? Your setting is the physical and contextual environment of
          your brand — where your content takes place and what that environment communicates.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Where do you primarily film?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e1_location"
            value={watch('vw_shot_e1_location')}
            onChange={val => setValue('vw_shot_e1_location', val)}
            getFullResponses={getValues}
            placeholder="e.g. Home office, studio, outdoors, café..."
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Environment vibe
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e1_vibe"
            value={watch('vw_shot_e1_vibe')}
            onChange={val => setValue('vw_shot_e1_vibe', val)}
            getFullResponses={getValues}
            options={VIBE_OPTIONS}
            columns={2}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            What does your setting communicate to your audience?
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e1_communicate"
            value={watch('vw_shot_e1_communicate')}
            onChange={val => setValue('vw_shot_e1_communicate', val)}
            getFullResponses={getValues}
            placeholder="e.g. That I operate from a place of intention and calm..."
          />
        </div>

        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Setting Statement — complete this sentence:
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e1_statement"
            value={watch('vw_shot_e1_statement')}
            onChange={val => setValue('vw_shot_e1_statement', val)}
            getFullResponses={getValues}
            placeholder="My brand lives in..."
          />
        </div>
      </div>

      {/* Element 2: Mood */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
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
            marginBottom: '4px',
          }}
        >
          Element 2
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          Mood
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '1rem' }}>
          How does your content feel? Your mood is the emotional tone your content creates — the
          feeling someone gets when they encounter your brand before they process any information.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Primary Mood
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e2_mood"
            value={watch('vw_shot_e2_mood')}
            onChange={val => setValue('vw_shot_e2_mood', val)}
            getFullResponses={getValues}
            options={MOOD_OPTIONS}
            columns={2}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Lighting mood — what lighting creates your mood?
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e2_lighting"
            value={watch('vw_shot_e2_lighting')}
            onChange={val => setValue('vw_shot_e2_lighting', val)}
            getFullResponses={getValues}
            options={LIGHTING_OPTIONS}
            columns={2}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Time of day your content feels like
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e2_time"
            value={watch('vw_shot_e2_time')}
            onChange={val => setValue('vw_shot_e2_time', val)}
            getFullResponses={getValues}
            placeholder="e.g. Early morning, golden hour, late night city..."
          />
        </div>

        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Mood Statement — complete this sentence:
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e2_statement"
            value={watch('vw_shot_e2_statement')}
            onChange={val => setValue('vw_shot_e2_statement', val)}
            getFullResponses={getValues}
            placeholder="My content feels like..."
          />
        </div>
      </div>

      {/* Element 3: Color Language */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
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
            marginBottom: '4px',
          }}
        >
          Element 3
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          Color Language
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '1rem' }}>
          Your color palette and typography, defined in Workshops 3 &amp; 4. Confirm how you apply
          them to video below.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Color grade approach for video
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e3_grade"
            value={watch('vw_shot_e3_grade')}
            onChange={val => setValue('vw_shot_e3_grade', val)}
            getFullResponses={getValues}
            options={GRADE_OPTIONS}
            columns={2}
          />
        </div>

        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            A visual reference (creator or film whose color world you want to study)
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e3_ref"
            value={watch('vw_shot_e3_ref')}
            onChange={val => setValue('vw_shot_e3_ref', val)}
            getFullResponses={getValues}
            placeholder="e.g. Creator name or film director whose palette you admire"
          />
        </div>
      </div>

      {/* Element 4: Design Details */}
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
            marginBottom: '4px',
          }}
        >
          Element 4
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          Design Details
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '1rem' }}>
          The small, intentional elements that show up in your content over and over again. The
          things that make your content feel like yours even before someone sees your face.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Signature Objects (what always appears in your content)
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e4_objects"
            value={watch('vw_shot_e4_objects')}
            onChange={val => setValue('vw_shot_e4_objects', val)}
            getFullResponses={getValues}
            rows={3}
            placeholder={'1. \n2. \n3. \n4. \n5. '}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Signature Textures
          </div>
          <OptionSelector
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e4_textures"
            value={watch('vw_shot_e4_textures')}
            onChange={val => setValue('vw_shot_e4_textures', val)}
            getFullResponses={getValues}
            options={TEXTURE_OPTIONS}
            columns={2}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            Wardrobe — my signature style
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e4_wardrobe"
            value={watch('vw_shot_e4_wardrobe')}
            onChange={val => setValue('vw_shot_e4_wardrobe', val)}
            getFullResponses={getValues}
            placeholder="e.g. Clean neutrals, minimal logos, muted tones..."
          />
        </div>

        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
            What I never show (your Never Show List)
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_shot_e4_never"
            value={watch('vw_shot_e4_never')}
            onChange={val => setValue('vw_shot_e4_never', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder={'1. \n2. \n3. Defining what\'s off-brand is just as important as what\'s on-brand.'}
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
