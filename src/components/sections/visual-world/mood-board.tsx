'use client'

import { useEffect, useRef, useState } from 'react'
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

const MB_KEY = 'vww-mb-v2'
type MBCategory = 'colorgrading' | 'fonts' | 'shots' | 'colors'
const MB_CATS: MBCategory[] = ['colorgrading', 'fonts', 'shots', 'colors']

const MB_CAT_LABELS: Record<MBCategory, { label: string; sub: string }> = {
  colorgrading: { label: 'Color Grading', sub: 'Frames from films, ads, or creators whose colors inspire you' },
  fonts:        { label: 'Fonts', sub: 'Screenshots of typography you love — from anywhere' },
  shots:        { label: 'Composition & Shots', sub: 'Shot angles, transitions, framing, effects' },
  colors:       { label: 'Colors', sub: 'Palettes, swatches, and combinations that resonate' },
}

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

export default function MoodBoard() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  // ── Mood Board State ──────────────────────────────────
  const [mbImages, setMbImages] = useState<Record<MBCategory, string[]>>({
    colorgrading: [], fonts: [], shots: [], colors: [],
  })
  const [mbStorageFull, setMbStorageFull] = useState(false)
  const [mbDragOver, setMbDragOver] = useState<MBCategory | null>(null)
  const [mosaicFilter, setMosaicFilter] = useState<'all' | MBCategory>('all')
  const mbFileInputRefs = useRef<Record<MBCategory, HTMLInputElement | null>>({
    colorgrading: null, fonts: null, shots: null, colors: null,
  })

  // ── Load from Supabase on mount ───────────────────────
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

  // ── Load mood board from localStorage on mount ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MB_KEY)
      if (saved) {
        const d = JSON.parse(saved)
        setMbImages(prev => {
          const next = { ...prev }
          MB_CATS.forEach(c => {
            if (d[c] && Array.isArray(d[c])) next[c] = d[c]
          })
          return next
        })
      }
    } catch {}
  }, [])

  // ── Save mood board to localStorage on change ─────────
  useEffect(() => {
    try {
      localStorage.setItem(MB_KEY, JSON.stringify(mbImages))
      setMbStorageFull(false)
    } catch {
      setMbStorageFull(true)
      console.warn('Mood board save failed — localStorage may be full')
    }
  }, [mbImages])

  // ── Pinterest embed effect ─────────────────────────────
  useEffect(() => {
    let url = watch('vw_mb_link') || ''
    if (!url) return
    if (!url.match(/^https?:\/\//)) url = 'https://' + url
    if (!url.includes('pinterest.com')) return

    const container = document.getElementById('pinterest-embed')
    if (!container) return

    container.innerHTML =
      '<div style="overflow:auto;-webkit-overflow-scrolling:touch;max-height:520px;border-radius:8px">' +
      '<a data-pin-do="embedBoard" data-pin-board-width="800" data-pin-scale-height="480" data-pin-scale-width="80" href="' + url + '"></a>' +
      '</div>' +
      '<div style="margin-top:10px;text-align:right">' +
      '<a href="' + url + '" target="_blank" rel="noopener" style="font-size:11px;color:var(--dimmer);text-decoration:none">Open in Pinterest</a>' +
      '</div>'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).PinUtils) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).PinUtils.build()
    } else {
      const existingScript = document.getElementById('pinterest-sdk')
      if (existingScript) existingScript.remove()
      const script = document.createElement('script')
      script.id = 'pinterest-sdk'
      script.src = 'https://assets.pinterest.com/js/pinit.js'
      script.async = true
      document.body.appendChild(script)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('vw_mb_link')])

  // ── Mood Board Handlers ───────────────────────────────
  function addImages(category: MBCategory, files: File[]) {
    const images = files.filter(f => f.type.startsWith('image/'))
    if (!images.length) return
    images.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setMbImages(prev => ({
          ...prev,
          [category]: [...prev[category], reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  function handleMbDrop(category: MBCategory, e: React.DragEvent) {
    e.preventDefault()
    setMbDragOver(null)
    const files = Array.from(e.dataTransfer.files)
    addImages(category, files)
  }

  function removeImage(category: MBCategory, index: number) {
    setMbImages(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }))
  }

  function handleMbFileInput(category: MBCategory, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    addImages(category, files)
    e.target.value = ''
  }

  const responses = watch()
  const mbTotal = MB_CATS.reduce((s, c) => s + mbImages[c].length, 0)

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
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.4px',
          lineHeight: 1.2,
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
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Your Mood Board Gallery
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Think of this as your creative cheat sheet — a snapshot of how your content should look,
        feel, and sound. Keep it close whenever you&apos;re filming, editing, or designing to stay
        sharp and on-brand. Drag and drop your references into each zone to build a clear vision
        you can return to anytime.
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
          post, add it to a Collection so it&apos;s easy to find later. When you&apos;re ready to
          build your mood board, screenshot the images from your collection and drag them into the
          zones below. If you prefer Pinterest, paste your board link below the upload zones and
          we&apos;ll pull it in automatically.
        </div>
      </div>

      {/* ── Mood Board Image Zones ─────────────────────── */}
      {mbStorageFull && (
        <div
          style={{
            background: 'rgba(220,50,50,.1)',
            border: '1px solid rgba(220,50,50,.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '1rem',
            fontSize: '12.5px',
            color: 'rgba(220,100,100,1)',
          }}
        >
          Storage is full. Remove some images to add new ones.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '10px',
        }}
        className="mb-panels-grid"
      >
        {MB_CATS.map(cat => {
          const imgs = mbImages[cat]
          const isDragTarget = mbDragOver === cat
          return (
            <div
              key={cat}
              style={{
                border: isDragTarget
                  ? '2px solid var(--orange)'
                  : '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--bg)',
                transition: 'border-color .15s',
              }}
              onDragOver={e => { e.preventDefault(); setMbDragOver(cat) }}
              onDragLeave={() => setMbDragOver(null)}
              onDrop={e => handleMbDrop(cat, e)}
            >
              {/* Panel header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)' }}>
                    {MB_CAT_LABELS[cat].label}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--dimmer)', marginTop: '1px' }}>
                    {MB_CAT_LABELS[cat].sub}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: imgs.length >= 10 ? 'var(--green-text, #4caf50)' : 'var(--dimmer)',
                  }}
                >
                  {imgs.length}
                </span>
              </div>

              {/* Image grid (only when images exist) */}
              {imgs.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '5px',
                    padding: '8px',
                  }}
                >
                  {imgs.map((src, i) => (
                    <div
                      key={i}
                      className="mb-thumb-wrap"
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        onClick={() => removeImage(cat, i)}
                        className="mb-del-btn"
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
                          background: 'rgba(0,0,0,.65)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          fontSize: '9px',
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <div
                    onClick={() => mbFileInputRefs.current[cat]?.click()}
                    style={{
                      aspectRatio: '1',
                      border: '1px dashed var(--border2)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--dimmer)',
                      fontSize: '14px',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--orange)'; (e.currentTarget as HTMLElement).style.color = 'var(--orange)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--dimmer)' }}
                  >
                    +
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={el => { mbFileInputRefs.current[cat] = el }}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleMbFileInput(cat, e)}
              />
            </div>
          )
        })}
      </div>

      {/* Total count */}
      {mbTotal > 0 && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--dimmer)',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{mbTotal} image{mbTotal === 1 ? '' : 's'} added</span>
          <button
            onClick={() => setMbImages({ colorgrading: [], fonts: [], shots: [], colors: [] })}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11px',
              color: 'var(--dimmer)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontFamily: 'var(--font)',
              padding: 0,
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mosaic Gallery */}
      {mbTotal > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)' }}>
              Your Mood Board
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {([['all', 'All'], ['colorgrading', 'Color Grading'], ['fonts', 'Fonts'], ['shots', 'Shots'], ['colors', 'Colors']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMosaicFilter(key)}
                  style={{
                    background: mosaicFilter === key ? 'var(--orange)' : 'var(--surface)',
                    color: mosaicFilter === key ? '#fff' : 'var(--dim)',
                    border: mosaicFilter === key ? 'none' : '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '3px 10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    transition: 'all .15s',
                  }}
                >
                  {label}{key !== 'all' ? ` ${mbImages[key as MBCategory].length}` : ''}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '6px',
            }}
          >
            {(mosaicFilter === 'all'
              ? MB_CATS.flatMap(c => mbImages[c].map(src => ({ src, cat: c })))
              : mbImages[mosaicFilter].map(src => ({ src, cat: mosaicFilter }))
            ).map((item, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  aspectRatio: '1',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
        {/* Pinterest embed container */}
        {watch('vw_mb_link') && watch('vw_mb_link').includes('pinterest.com') && (
          <div style={{ marginTop: '10px' }}>
            <div
              id="pinterest-embed"
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            />
          </div>
        )}
      </div>

      {/* Identify Patterns */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
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
            placeholder="List the dominant colors you see across your 30 images..."
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
    </SectionWrapper>
  )
}
