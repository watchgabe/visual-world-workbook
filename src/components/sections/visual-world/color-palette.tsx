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
  colorgrading: { label: 'Color Grading', sub: 'Color tones, filters, and moods' },
  fonts:        { label: 'Fonts & Typography', sub: 'Type styles, headlines, body text' },
  shots:        { label: 'Composition & Shots', sub: 'Shot angles, transitions, framing, effects' },
  colors:       { label: 'Colors', sub: 'Palettes, swatches, and combinations that resonate' },
}

type ExtractedPalette = {
  name: string
  mood: string
  primary: string
  secondary: string
  accent: string
  neutral: string
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

export default function ColorPalette() {
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
  const mbFileInputRefs = useRef<Record<MBCategory, HTMLInputElement | null>>({
    colorgrading: null, fonts: null, shots: null, colors: null,
  })

  // ── Color Extraction State ────────────────────────────
  const [extractPhoto, setExtractPhoto] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractResults, setExtractResults] = useState<ExtractedPalette[]>([])
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractDragOver, setExtractDragOver] = useState(false)
  const extractFileInputRef = useRef<HTMLInputElement | null>(null)

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

  // ── Color Extraction Handlers ─────────────────────────
  function handleExtractFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      setExtractPhoto({ base64, mime: file.type, preview: dataUrl })
      setExtractResults([])
      setExtractError(null)
    }
    reader.readAsDataURL(file)
  }

  function handleExtractDrop(e: React.DragEvent) {
    e.preventDefault()
    setExtractDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) handleExtractFile(files[0])
  }

  async function extractColors() {
    if (!extractPhoto) return
    setIsExtracting(true)
    setExtractError(null)
    setExtractResults([])

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxTokens: 800,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: extractPhoto.mime,
                  data: extractPhoto.base64,
                },
              },
              {
                type: 'text',
                text: 'Analyze this image and extract 3 color palette options. Follow these rules exactly:\n\nPalette 1 -- Neutral Foundation: Put the ONE bold/saturated color from the image as "primary" (it will appear largest on the left). The other three -- secondary, accent, neutral -- must be true neutrals ONLY: pure grays, near-blacks (#111-#555), or near-whites/off-whites (#E0-#F8). No tans, beiges, or muted colors. Think monochrome base + one pop.\n\nPalette 2 -- pick two colors from the image that come from DIFFERENT hue families (e.g. a warm and a cool), plus 2 true neutrals.\n\nPalette 3 -- must look visually DIFFERENT from Palette 2. Use a completely different dominant hue or mood. If Palette 2 is warm, make Palette 3 cool or dark.\n\nFor each, return exactly 4 hex codes and a short 2-3 word name. Return ONLY valid JSON:\n[\n  {\n    "name": "Palette Name",\n    "mood": "One sentence mood description",\n    "primary": "#hexcode",\n    "secondary": "#hexcode",\n    "accent": "#hexcode",\n    "neutral": "#hexcode"\n  }\n]\nOnly return the JSON, no other text.',
              },
            ],
          }],
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text: string = data.text || ''
      const cleaned = text.replace(/```json|```/g, '').trim()
      const jsonStart = cleaned.indexOf('[')
      const jsonEnd = cleaned.lastIndexOf(']')
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON array found in response')
      const palettes: ExtractedPalette[] = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
      setExtractResults(palettes)
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : 'Extraction failed')
    } finally {
      setIsExtracting(false)
    }
  }

  function applyPalette(palette: ExtractedPalette) {
    ;(setValue as (k: string, v: string) => void)('vw_color_primary', palette.primary)
    ;(setValue as (k: string, v: string) => void)('vw_color_secondary', palette.secondary)
    ;(setValue as (k: string, v: string) => void)('vw_color_accent', palette.accent)
    ;(setValue as (k: string, v: string) => void)('vw_color_neutral', palette.neutral)
    if (palette.name) {
      ;(setValue as (k: string, v: string) => void)('vw_color_name', palette.name)
    }
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '1.25rem',
        }}
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
                background: 'var(--card)',
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
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                    {MB_CAT_LABELS[cat].label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--dimmer)', marginTop: '1px' }}>
                    {MB_CAT_LABELS[cat].sub}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: imgs.length >= 10 ? 'var(--green, #4caf50)' : 'var(--dimmer)',
                    background: 'var(--card)',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {imgs.length}
                </span>
              </div>

              {/* Drop zone or grid */}
              <div style={{ padding: '10px' }}>
                {imgs.length === 0 ? (
                  <div
                    onClick={() => mbFileInputRefs.current[cat]?.click()}
                    style={{
                      border: '1.5px dashed var(--border2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px 12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: 'var(--dimmer)',
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>+</div>
                    <div style={{ fontSize: '11.5px' }}>Drop images or click to browse</div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: '6px',
                    }}
                  >
                    {imgs.map((src, i) => (
                      <div
                        key={i}
                        style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', aspectRatio: '1' }}
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
                          style={{
                            position: 'absolute',
                            top: '3px',
                            right: '3px',
                            background: 'rgba(0,0,0,.65)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            lineHeight: '18px',
                            textAlign: 'center',
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
                        border: '1.5px dashed var(--border2)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--dimmer)',
                        fontSize: '20px',
                      }}
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

      {/* ── Extract Colors From a Photo ──────────────────── */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Extract Colors From a Photo
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '.85rem' }}>
        Drop a photo that captures the mood you want — AI will extract multiple palette options. Pick the one that feels right.
      </p>

      {/* Photo drop zone */}
      <div
        onClick={() => extractFileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setExtractDragOver(true) }}
        onDragLeave={() => setExtractDragOver(false)}
        onDrop={handleExtractDrop}
        style={{
          border: extractDragOver ? '2px solid var(--orange)' : '2px dashed var(--border2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '.75rem',
          background: extractDragOver ? 'var(--orange-tint)' : 'var(--card)',
          transition: 'border-color .15s, background .15s',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input
          ref={extractFileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) handleExtractFile(e.target.files[0]); e.target.value = '' }}
        />
        {extractPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={extractPhoto.preview}
              alt="Photo for color extraction"
              style={{
                maxHeight: '160px',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto 8px',
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--dimmer)' }}>Click or drop to replace</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎨</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
              Drop a photo here
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dimmer)' }}>
              or click to upload · Mood board images, brand inspo, photography you love
            </div>
          </>
        )}
      </div>

      {/* Extract button */}
      {extractPhoto && (
        <button
          onClick={extractColors}
          disabled={isExtracting}
          style={{
            display: 'block',
            width: '100%',
            padding: '11px',
            marginBottom: '1rem',
            background: isExtracting ? 'var(--dimmer)' : 'var(--orange)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: isExtracting ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font)',
            transition: 'background .15s',
          }}
        >
          {isExtracting ? 'Extracting...' : 'Extract Color Palettes →'}
        </button>
      )}

      {/* Extraction error */}
      {extractError && (
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,100,100,.9)',
            padding: '.5rem 0',
            marginBottom: '.75rem',
          }}
        >
          Error: {extractError}. Make sure your API key is set.
        </div>
      )}

      {/* Extraction results */}
      {extractResults.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          {extractResults.map((palette, idx) => (
            <div
              key={idx}
              onClick={() => applyPalette(palette)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '.75rem',
                cursor: 'pointer',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--orange)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
              title="Click to use this palette"
            >
              {/* Color bar */}
              <div style={{ display: 'flex', height: '60px' }}>
                <div style={{ flex: 2.5, background: palette.primary || '#ccc' }} />
                <div style={{ flex: 2, background: palette.secondary || '#999' }} />
                <div style={{ flex: 1, background: palette.accent || '#666' }} />
                <div style={{ flex: 1.5, background: palette.neutral || '#f0f0f0' }} />
              </div>
              {/* Info row */}
              <div style={{ padding: '.75rem 1rem', background: 'var(--surface)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                  {palette.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--dimmer)', marginBottom: '10px' }}>
                  {palette.mood}
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {[palette.primary, palette.secondary, palette.accent, palette.neutral].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: 'var(--dim)',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '3px',
                        padding: '2px 6px',
                      }}
                    >
                      {h}
                    </span>
                  ))}
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '11.5px',
                      background: 'var(--orange)',
                      color: '#fff',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Use This →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Color Palette Framework */}
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
          Enter hex codes (e.g. #F0601B) or color names. The swatches will update live. Click any swatch to fine-tune the color with the picker.
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
            <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: watch('vw_color_primary') || 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border)',
                }}
                title="Click to pick color"
              />
              <input
                type="color"
                value={watch('vw_color_primary') && /^#[0-9a-fA-F]{6}$/.test(watch('vw_color_primary')) ? watch('vw_color_primary') : '#cccccc'}
                onChange={e => (setValue as (k: string, v: string) => void)('vw_color_primary', e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }}
              />
            </label>
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
            <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: watch('vw_color_secondary') || 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border)',
                }}
                title="Click to pick color"
              />
              <input
                type="color"
                value={watch('vw_color_secondary') && /^#[0-9a-fA-F]{6}$/.test(watch('vw_color_secondary')) ? watch('vw_color_secondary') : '#cccccc'}
                onChange={e => (setValue as (k: string, v: string) => void)('vw_color_secondary', e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }}
              />
            </label>
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
            <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: watch('vw_color_accent') || 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border)',
                }}
                title="Click to pick color"
              />
              <input
                type="color"
                value={watch('vw_color_accent') && /^#[0-9a-fA-F]{6}$/.test(watch('vw_color_accent')) ? watch('vw_color_accent') : '#cccccc'}
                onChange={e => (setValue as (k: string, v: string) => void)('vw_color_accent', e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }}
              />
            </label>
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
            <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: watch('vw_color_neutral') || 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border)',
                }}
                title="Click to pick color"
              />
              <input
                type="color"
                value={watch('vw_color_neutral') && /^#[0-9a-fA-F]{6}$/.test(watch('vw_color_neutral')) ? watch('vw_color_neutral') : '#cccccc'}
                onChange={e => (setValue as (k: string, v: string) => void)('vw_color_neutral', e.target.value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, top: 0, left: 0 }}
              />
            </label>
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
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
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
