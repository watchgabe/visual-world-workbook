'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'brand-builder' as const
const SECTION_INDEX = 2
const SECTION_DEF = MODULE_SECTIONS['brand-builder']![SECTION_INDEX]

export interface BrandDirection {
  id: string
  name: string
  tagline: string
  personality: string
  headlineFont: string
  bodyFont: string
  palette: { hex: string; role: string; name: string }[]
  treatment: string
  treatmentDetails: string
  layoutLanguage: string
  bestFor: string
}

type FormValues = {
  bb_directions_json: string
}

// Inline mini font previewer
function FontPreview({ font, sample }: { font: string; sample: string }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{ fontSize: '10px', color: 'var(--dimmer)', marginBottom: '2px', letterSpacing: '.06em' }}>{font}</div>
      <div style={{ fontSize: '16px', fontFamily: `'${font}', serif, sans-serif`, color: 'var(--text)', lineHeight: 1.2 }}>{sample}</div>
    </div>
  )
}

// Color swatch
function Swatch({ hex, name, role }: { hex: string; name: string; role: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: hex, border: '1px solid rgba(255,255,255,.1)', flexShrink: 0 }} />
      <div style={{ fontSize: '9px', color: 'var(--dimmer)', textAlign: 'center', lineHeight: 1.3 }}>
        <div style={{ color: 'var(--dim)', fontWeight: 600 }}>{name}</div>
        <div>{role}</div>
        <div style={{ fontFamily: 'monospace' }}>{hex}</div>
      </div>
    </div>
  )
}

// Direction card
function DirectionCard({
  dir,
  selected,
  onSelect,
  idx,
}: {
  dir: BrandDirection
  selected: boolean
  onSelect: () => void
  idx: number
}) {
  const [expanded, setExpanded] = useState(idx === 0)

  return (
    <div
      style={{
        border: selected ? '2px solid var(--orange)' : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        transition: 'border-color .15s',
      }}
    >
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)' }}>
              Direction {idx + 1}
            </div>
            {selected && (
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', background: 'var(--orange)', color: '#fff', padding: '2px 8px', borderRadius: '100px' }}>
                Selected
              </div>
            )}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)', marginBottom: '2px' }}>
            {dir.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dim)', fontStyle: 'italic' }}>{dir.tagline}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
          {dir.palette.slice(0, 4).map((c, i) => (
            <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(255,255,255,.15)' }} />
          ))}
          <span style={{ fontSize: '12px', color: 'var(--dimmer)', marginLeft: '4px' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '18px' }}>
          {/* Personality */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '6px' }}>Personality</div>
            <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7 }}>{dir.personality}</p>
          </div>

          {/* Typography */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '10px' }}>Typography</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Headline</div>
                <FontPreview font={dir.headlineFont} sample="Your Bold Headline" />
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>Body</div>
                <FontPreview font={dir.bodyFont} sample="Supporting body copy that reads naturally." />
              </div>
            </div>
          </div>

          {/* Palette */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '10px' }}>Color Palette</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              {dir.palette.map((c, i) => <Swatch key={i} {...c} />)}
            </div>
          </div>

          {/* Image Treatment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '6px' }}>Image Treatment</div>
            <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{dir.treatment}</div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.6 }}>{dir.treatmentDetails}</div>
            </div>
          </div>

          {/* Layout Language */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '6px' }}>Layout Language</div>
            <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7 }}>{dir.layoutLanguage}</p>
          </div>

          {/* Best for */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '6px' }}>Best For</div>
            <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7 }}>{dir.bestFor}</p>
          </div>

          {/* Select button */}
          <button
            onClick={onSelect}
            style={{
              width: '100%', padding: '10px 20px', borderRadius: '100px',
              background: selected ? 'var(--orange)' : 'transparent',
              color: selected ? '#fff' : 'var(--orange)',
              border: '2px solid var(--orange)',
              fontSize: '12px', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font)',
              transition: 'all .15s',
            }}
          >
            {selected ? '✓ This Is My Direction' : 'Select This Direction'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function BrandDirectionsSection() {
  const { user } = useAuth()
  const { watch, setValue } = useForm<FormValues>({
    defaultValues: { bb_directions_json: '' },
  })

  const [directions, setDirections] = useState<BrandDirection[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string>('')

  const [intentData, setIntentData] = useState<Record<string, string>>({})

  // Load existing directions + intent context
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

        // Load saved intent fields
        setIntentData({
          bb_creator_type: r.bb_creator_type || '',
          bb_primary_platform: r.bb_primary_platform || '',
          bb_brand_feel: r.bb_brand_feel || '',
          bb_audience_feel: r.bb_audience_feel || '',
          bb_visual_keywords: r.bb_visual_keywords || '',
          bb_inspo_notes: r.bb_inspo_notes || '',
        })

        // Load saved directions
        if (r.bb_directions_json) {
          try {
            const parsed = JSON.parse(r.bb_directions_json)
            if (Array.isArray(parsed)) setDirections(parsed)
          } catch { /* ignore */ }
        }

        // Load saved selection
        if (r.bb_selected_direction) setSelectedId(r.bb_selected_direction)
      })
    return () => { cancelled = true }
  }, [user])

  const hasIntent = intentData.bb_creator_type || intentData.bb_brand_feel

  async function generate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/brand-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentData }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const { directions: dirs } = await res.json() as { directions: BrandDirection[] }
      setDirections(dirs)
      const json = JSON.stringify(dirs)
      setValue('bb_directions_json', json)
      if (user) saveField(user.id, MODULE_SLUG, 'bb_directions_json', json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  function selectDirection(id: string) {
    setSelectedId(id)
    if (user) saveField(user.id, MODULE_SLUG, 'bb_selected_direction', id)
    // Also write to final-kit fields
    const dir = directions.find(d => d.id === id)
    if (dir && user) {
      saveField(user.id, MODULE_SLUG, 'bb_kit_direction', id)
      saveField(user.id, MODULE_SLUG, 'bb_kit_fonts', JSON.stringify({ headline: dir.headlineFont, body: dir.bodyFont }))
      saveField(user.id, MODULE_SLUG, 'bb_kit_colors', JSON.stringify(dir.palette))
      saveField(user.id, MODULE_SLUG, 'bb_kit_treatment', dir.treatment)
      saveField(user.id, MODULE_SLUG, 'bb_kit_layout', dir.layoutLanguage)
    }
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
        Brand Builder — Step 3
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: '1rem' }}>
        Brand Directions
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Based on your inspiration and intent, we'll generate 3 distinct visual directions for your brand. Each one includes typography, a color palette, image treatment, and layout rules.
      </p>

      {/* Intent summary */}
      {hasIntent && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '10px' }}>Your Brief</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              ['Creator type', intentData.bb_creator_type],
              ['Primary platform', intentData.bb_primary_platform],
              ['Brand feel', intentData.bb_brand_feel],
              ['Audience feel', intentData.bb_audience_feel],
              ['Visual keywords', intentData.bb_visual_keywords],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasIntent && (
        <div style={{ background: 'var(--orange-tint)', border: '1px solid var(--orange-border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '1.5rem', fontSize: '13px', color: 'var(--dim)' }}>
          Complete <strong>Brand Intent</strong> first so we have enough context to generate strong directions.
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={generating || !hasIntent}
        style={{
          width: '100%', padding: '12px 24px', borderRadius: '100px',
          background: generating || !hasIntent ? 'var(--surface)' : 'var(--orange)',
          color: generating || !hasIntent ? 'var(--dimmer)' : '#fff',
          border: generating || !hasIntent ? '1px solid var(--border)' : 'none',
          fontSize: '12px', fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', cursor: generating || !hasIntent ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)', transition: 'all .15s', marginBottom: '1.5rem',
        }}
      >
        {generating
          ? '⟳  Generating your brand directions…'
          : directions.length > 0
            ? 'Regenerate Directions'
            : 'Generate My Brand Directions'}
      </button>

      {error && (
        <div style={{ background: 'rgba(255,60,60,.1)', border: '1px solid rgba(255,60,60,.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '1rem', fontSize: '13px', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {/* Direction cards */}
      {directions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {directions.map((dir, idx) => (
            <DirectionCard
              key={dir.id}
              dir={dir}
              selected={selectedId === dir.id}
              onSelect={() => selectDirection(dir.id)}
              idx={idx}
            />
          ))}
        </div>
      )}

      {selectedId && directions.length > 0 && (
        <div style={{ marginTop: '1.25rem', fontSize: '12px', color: 'var(--green-text)', fontWeight: 600 }}>
          Direction saved. Head to Preview Studio to see it on real creator templates.
        </div>
      )}
    </SectionWrapper>
  )
}
