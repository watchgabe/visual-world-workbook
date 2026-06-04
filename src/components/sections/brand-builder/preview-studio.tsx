'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import type { BrandDirection } from './brand-directions'

const MODULE_SLUG = 'brand-builder' as const
const SECTION_INDEX = 3
const SECTION_DEF = MODULE_SECTIONS['brand-builder']![SECTION_INDEX]

type PreviewTab = 'carousel' | 'quote' | 'thumbnail' | 'landing'

const PREVIEW_TABS: { id: PreviewTab; label: string }[] = [
  { id: 'carousel', label: 'Carousel Cover' },
  { id: 'quote', label: 'Quote Card' },
  { id: 'thumbnail', label: 'Video Title' },
  { id: 'landing', label: 'Landing Hero' },
]

// ── Carousel Cover Preview ─────────────────────────────────────────────────
function CarouselPreview({ dir }: { dir: BrandDirection }) {
  const bg = dir.palette[0]?.hex ?? '#0a0a0a'
  const text = dir.palette[1]?.hex ?? '#ffffff'
  const accent = dir.palette[2]?.hex ?? '#ee663e'

  return (
    <div style={{
      width: '100%', aspectRatio: '1', background: bg,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      padding: '28px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      borderRadius: '8px',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(160deg, transparent 40%, ${bg}dd 100%)`,
      }} />
      {/* Accent bar */}
      <div style={{ width: '32px', height: '3px', background: accent, marginBottom: '12px', position: 'relative', zIndex: 1 }} />
      {/* Eyebrow */}
      <div style={{
        fontSize: '9px', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase',
        color: accent, marginBottom: '8px', fontFamily: 'monospace', position: 'relative', zIndex: 1,
      }}>
        Creator Tutorial
      </div>
      {/* Headline */}
      <div style={{
        fontSize: '22px', fontWeight: 700, lineHeight: 1.15, color: text,
        fontFamily: `'${dir.headlineFont}', serif, sans-serif`, position: 'relative', zIndex: 1,
        marginBottom: '10px',
      }}>
        5 Things That Made My Brand Click
      </div>
      {/* Subtext */}
      <div style={{
        fontSize: '11px', color: text, opacity: 0.55, lineHeight: 1.5,
        fontFamily: `'${dir.bodyFont}', sans-serif`, position: 'relative', zIndex: 1,
      }}>
        Swipe to learn the framework →
      </div>
      {/* Direction label */}
      <div style={{
        position: 'absolute', top: '14px', right: '14px', fontSize: '8px', fontWeight: 700,
        letterSpacing: '.12em', textTransform: 'uppercase', color: text, opacity: 0.35,
        fontFamily: 'monospace',
      }}>
        {dir.name}
      </div>
    </div>
  )
}

// ── Quote Card Preview ────────────────────────────────────────────────────
function QuotePreview({ dir }: { dir: BrandDirection }) {
  const bg = dir.palette[0]?.hex ?? '#0a0a0a'
  const text = dir.palette[1]?.hex ?? '#ffffff'
  const accent = dir.palette[2]?.hex ?? '#ee663e'
  const muted = dir.palette[3]?.hex ?? '#888888'

  return (
    <div style={{
      width: '100%', aspectRatio: '1', background: bg,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '36px', boxSizing: 'border-box', borderRadius: '8px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '28px', color: accent, marginBottom: '16px', fontFamily: `'${dir.headlineFont}', serif`, opacity: 0.7 }}>"</div>
      <div style={{
        fontSize: '17px', fontWeight: 700, lineHeight: 1.4, color: text,
        fontFamily: `'${dir.headlineFont}', serif, sans-serif`, marginBottom: '20px', maxWidth: '340px',
      }}>
        The best brands don't compete. They create a world people want to live in.
      </div>
      <div style={{ width: '24px', height: '2px', background: accent, marginBottom: '12px' }} />
      <div style={{
        fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase',
        color: muted, fontFamily: 'monospace',
      }}>
        @yourcreatorhandle
      </div>
    </div>
  )
}

// ── Video Title/Thumbnail Preview ─────────────────────────────────────────
function ThumbnailPreview({ dir }: { dir: BrandDirection }) {
  const bg = dir.palette[0]?.hex ?? '#0a0a0a'
  const text = dir.palette[1]?.hex ?? '#ffffff'
  const accent = dir.palette[2]?.hex ?? '#ee663e'

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9', background: bg,
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      borderRadius: '8px', overflow: 'hidden', position: 'relative',
    }}>
      {/* Left: fake image placeholder */}
      <div style={{
        background: `linear-gradient(135deg, ${bg}, ${dir.palette[3]?.hex ?? '#333'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8,
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: accent, opacity: 0.4 }} />
      </div>
      {/* Right: text overlay */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: bg }}>
        <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '6px', fontFamily: 'monospace' }}>
          New Video
        </div>
        <div style={{
          fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: text,
          fontFamily: `'${dir.headlineFont}', serif, sans-serif`, marginBottom: '8px',
        }}>
          I Rebuilt My Brand From Scratch
        </div>
        <div style={{ fontSize: '10px', color: text, opacity: 0.5, fontFamily: `'${dir.bodyFont}', sans-serif` }}>
          Watch until the end
        </div>
      </div>
      {/* Corner badge */}
      <div style={{
        position: 'absolute', bottom: '10px', right: '10px',
        background: accent, color: bg === '#ffffff' ? '#000' : '#fff',
        fontSize: '8px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
        fontFamily: 'monospace', letterSpacing: '.08em',
      }}>
        {dir.name}
      </div>
    </div>
  )
}

// ── Landing Page Hero Preview ─────────────────────────────────────────────
function LandingPreview({ dir }: { dir: BrandDirection }) {
  const bg = dir.palette[0]?.hex ?? '#0a0a0a'
  const text = dir.palette[1]?.hex ?? '#ffffff'
  const accent = dir.palette[2]?.hex ?? '#ee663e'
  const muted = dir.palette[3]?.hex ?? '#888888'

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9', background: bg, borderRadius: '8px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '32px', boxSizing: 'border-box', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Fake nav */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', borderBottom: `1px solid ${muted}22`,
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: text, fontFamily: `'${dir.headlineFont}', sans-serif` }}>YourBrand</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Work', 'About', 'Join'].map(n => (
            <div key={n} style={{ fontSize: '9px', color: muted, fontFamily: 'monospace', letterSpacing: '.1em' }}>{n}</div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: accent, marginBottom: '12px', fontFamily: 'monospace' }}>
        Creator Program
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 700, lineHeight: 1.15, color: text, maxWidth: '480px',
        fontFamily: `'${dir.headlineFont}', serif, sans-serif`, marginBottom: '10px',
      }}>
        Build a Brand People Actually Remember
      </div>
      <div style={{ fontSize: '12px', color: muted, maxWidth: '320px', lineHeight: 1.6, marginBottom: '20px', fontFamily: `'${dir.bodyFont}', sans-serif` }}>
        A community for serious creators ready to build something that lasts.
      </div>
      <div style={{
        padding: '9px 22px', background: accent, color: '#fff', borderRadius: '100px',
        fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        fontFamily: 'monospace',
      }}>
        Join the Waitlist
      </div>
    </div>
  )
}

export default function PreviewStudioSection() {
  const { user } = useAuth()
  const [directions, setDirections] = useState<BrandDirection[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [activeDir, setActiveDir] = useState<BrandDirection | null>(null)
  const [activeTab, setActiveTab] = useState<PreviewTab>('carousel')

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
        if (r.bb_directions_json) {
          try {
            const dirs = JSON.parse(r.bb_directions_json) as BrandDirection[]
            setDirections(dirs)
            const selId = r.bb_selected_direction || dirs[0]?.id || ''
            setSelectedId(selId)
            setActiveDir(dirs.find(d => d.id === selId) || dirs[0] || null)
          } catch { /* ignore */ }
        }
      })
    return () => { cancelled = true }
  }, [user])

  function switchDir(dir: BrandDirection) {
    setActiveDir(dir)
    setSelectedId(dir.id)
  }

  const responses = { bb_selected_direction: selectedId }

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={responses}
    >
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.5rem' }}>
        Brand Builder — Step 4
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: '1rem' }}>
        Preview Studio
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        See each brand direction applied to real creator formats. Switch between directions to compare. Use the format tabs to preview how the system holds across different content types.
      </p>

      {directions.length === 0 && (
        <div style={{ background: 'var(--orange-tint)', border: '1px solid var(--orange-border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', fontSize: '13px', color: 'var(--dim)' }}>
          No brand directions yet. Complete <strong>Brand Directions</strong> first.
        </div>
      )}

      {directions.length > 0 && activeDir && (
        <>
          {/* Direction switcher */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {directions.map(d => (
              <button
                key={d.id}
                onClick={() => switchDir(d)}
                style={{
                  padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                  background: activeDir.id === d.id ? 'var(--orange)' : 'var(--surface)',
                  color: activeDir.id === d.id ? '#fff' : 'var(--dim)',
                  border: activeDir.id === d.id ? 'none' : '1px solid var(--border)',
                }}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Format tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '1.25rem',
            background: 'var(--surface)', borderRadius: '100px', padding: '4px', width: 'fit-content',
          }}>
            {PREVIEW_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '5px 14px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '.08em', textTransform: 'uppercase',
                  transition: 'all .15s', border: 'none',
                  background: activeTab === t.id ? 'var(--orange)' : 'transparent',
                  color: activeTab === t.id ? '#fff' : 'var(--dimmer)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {activeTab === 'carousel' && <CarouselPreview dir={activeDir} />}
            {activeTab === 'quote' && <QuotePreview dir={activeDir} />}
            {activeTab === 'thumbnail' && <ThumbnailPreview dir={activeDir} />}
            {activeTab === 'landing' && <LandingPreview dir={activeDir} />}
          </div>

          {/* Direction summary */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{activeDir.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--dim)', fontStyle: 'italic' }}>{activeDir.tagline}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {activeDir.palette.map((c, i) => (
                  <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(255,255,255,.15)' }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '2px' }}>Headline font</div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontFamily: `'${activeDir.headlineFont}', serif` }}>{activeDir.headlineFont}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '2px' }}>Treatment</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{activeDir.treatment}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </SectionWrapper>
  )
}
