'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
type ResponsesByModule = Record<string, Record<string, unknown>>


/** Map of stored option values → human-readable labels */
const OPTION_LABELS: Record<string, string> = {
  // vw_shot_e1_vibe
  'calm-minimal': 'Calm and minimal',
  'creative-eclectic': 'Creative and eclectic',
  'professional-polished': 'Professional and polished',
  'luxurious-elevated': 'Luxurious and elevated',
  'energetic-dynamic': 'Energetic and dynamic',
  'raw-authentic': 'Raw and authentic',
  // vw_shot_e2_mood
  'warm-approachable': 'Warm and approachable',
  'cool-authoritative': 'Cool and authoritative',
  'energetic-motivating': 'Energetic and motivating',
  'calm-contemplative': 'Calm and contemplative',
  'bold-challenging': 'Bold and challenging',
  'authentic-raw': 'Authentic and raw',
  // vw_shot_e2_lighting
  'warm-golden': 'Warm golden natural light',
  'bright-studio': 'Bright even studio light',
  'high-contrast': 'High contrast dramatic',
  'soft-diffused': 'Soft diffused light',
  // vw_shot_e3_grade
  'warm': 'Warm tones',
  'cool': 'Cool tones',
  'desaturated': 'Desaturated / film-like',
  'natural': 'Natural / ungraded',
  'mixed': 'Mixed by content type',
  // vw_shot_e4_textures
  'vintage': 'Vintage (leather, aged wood, film grain)',
  'modern': 'Modern (concrete, metal, glass)',
  // bf_pillar{n}_test
  'yes': 'Yes, easily',
  'maybe': 'Maybe 20–30',
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')   // **bold**
    .replace(/\*([\s\S]*?)\*/g, '$1')        // *italic*
    .replace(/__([\s\S]*?)__/g, '$1')        // __bold__
    .replace(/_([\s\S]*?)_/g, '$1')          // _italic_
    .replace(/`([\s\S]*?)`/g, '$1')          // `code`
    .replace(/^#+\s+/gm, '')                 // ## headings
    .trim()
}

function getStr(responses: Record<string, unknown>, key: string): string {
  const v = responses[key]
  if (typeof v === 'string' && v.trim()) return stripMarkdown(v.trim())
  return ''
}

/** Get a field value, resolving option keys to readable labels */
function getLabel(responses: Record<string, unknown>, key: string): string {
  const raw = getStr(responses, key)
  return OPTION_LABELS[raw] || raw
}

function FieldCard({ label, value, highlight: isHighlight }: {
  label: string
  value: unknown
  highlight?: boolean
}) {
  const displayValue = typeof value === 'string' && value.trim() ? value : null

  if (!displayValue) return null

  if (isHighlight) {
    return (
      <div style={{
        background: displayValue ? 'var(--orange-tint)' : 'var(--surface)',
        border: `1px solid ${displayValue ? 'var(--orange-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1.1rem 1.4rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
          letterSpacing: '.1em',
          color: 'var(--orange)',
          marginBottom: '5px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '14px', fontWeight: displayValue ? 500 : 400, lineHeight: 1.7,
          color: displayValue ? 'var(--text)' : 'var(--dimmer)',
          fontStyle: displayValue ? 'normal' : 'italic',
          whiteSpace: 'pre-wrap' as const,
        }}>
          {displayValue || 'Not yet completed'}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '.9rem 1rem',
    }}>
      <div style={{
        fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px', lineHeight: 1.6,
        color: displayValue ? 'var(--text)' : 'var(--dimmer)',
        fontStyle: displayValue ? 'normal' : 'italic',
        whiteSpace: 'pre-wrap' as const,
      }}>
        {displayValue || 'Not yet completed'}
      </div>
    </div>
  )
}

interface ColorSwatchProps {
  label: string
  hex: string
}
function ColorSwatch({ label, hex }: ColorSwatchProps) {
  const [hovered, setHovered] = useState(false)
  const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: hovered ? '2' : '1',
        transition: 'flex 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <div style={{
        height: '140px',
        borderRadius: '6px',
        background: isValidHex ? hex : 'var(--border2)',
        border: '1px solid var(--border2)',
        transition: 'height 0.3s ease',
        marginBottom: '10px',
      }} />
      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--dimmer)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {hex}
      </div>
    </div>
  )
}

interface PillarCardProps {
  number: string
  name: string
  sub?: string
}
function PillarCard({ number, name, sub }: PillarCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '.85rem',
    }}>
      <div style={{
        fontFamily: 'var(--font-num)', fontSize: '22px', fontWeight: 900,
        color: 'var(--orange)', opacity: 0.4, lineHeight: 1, marginBottom: '4px',
      }}>
        {number}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
        {name}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--dimmer)', marginTop: '3px', lineHeight: 1.4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label, values }: { label: string; values?: unknown[] }) {
  if (values && values.every(v => typeof v !== 'string' || !v.trim())) return null
  return (
    <div style={{ margin: '.75rem 0 .4rem' }}>
      <div style={{
        fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '.1em', color: 'var(--dimmer)',
      }}>
        {label}
      </div>
    </div>
  )
}

function ChapterHeader({ num, moduleLabel, title }: { num: string; moduleLabel: string; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      marginBottom: '0.75rem',
    }}>
      <div style={{
        fontFamily: 'var(--font-num)', fontSize: '48px', fontWeight: 900,
        color: 'var(--orange)', lineHeight: 1, opacity: 0.35, flexShrink: 0,
      }}>
        {num}
      </div>
      <div>
        <div style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '.14em',
          textTransform: 'uppercase' as const, color: 'var(--dimmer)', marginBottom: '2px',
        }}>
          {moduleLabel}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
          {title}
        </div>
      </div>
    </div>
  )
}

function EmptyChapter({ moduleNum }: { moduleNum: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' as const,
      marginBottom: '1rem',
    }}>
      <div style={{ fontSize: '13px', color: 'var(--dimmer)', lineHeight: 1.6 }}>
        No answers yet — open Module {moduleNum} to get started.
      </div>
    </div>
  )
}

function PlaybookSkeleton() {
  return (
    <div style={{ width: '100%', padding: '2rem 2rem 5rem' }}>
      <div style={{
        textAlign: 'center', padding: '4rem 0',
        color: 'var(--dimmer)', fontSize: '13px',
      }}>
        Loading your playbook...
      </div>
    </div>
  )
}

// ─── CHAPTER RENDERERS ───────────────────────────────────────────────────────

// ── Brand guidelines sub-components ─────────────────────────────────────────

interface GuidelineRowProps {
  number: string
  title: string
  children: React.ReactNode
}
function GuidelineRow({ number, title, children }: GuidelineRowProps) {
  return (
    <div style={{ marginTop: '20px' }}>
      {/* Single full-width line spanning both columns */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '10px' }} />
      <div className="guideline-row">
        {/* Left: number + title on one line */}
        <div style={{ paddingTop: '1px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--orange)', letterSpacing: '.06em' }}>
            {number}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: '.1em', color: 'var(--dim)', marginLeft: '8px',
          }}>
            {title}
          </span>
        </div>
        {/* Right: content */}
        <div>{children}</div>
      </div>
    </div>
  )
}

function GuidelineHero({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: '15px', fontWeight: 400, color: 'var(--text)',
      lineHeight: 1.65, marginBottom: '18px',
    }}>
      {text}
    </div>
  )
}

function GuidelineQuote({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: '13px', fontStyle: 'italic', fontWeight: 400,
      color: 'var(--dim)', lineHeight: 1.65, marginBottom: '4px',
    }}>
      &ldquo;{text}&rdquo;
    </div>
  )
}

function GuidelineCol({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <div style={{
        fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' as const,
        letterSpacing: '.1em', color: 'var(--dimmer)', marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.55 }}>
        {value}
      </div>
    </div>
  )
}

// ── Collapsible sub-components ────────────────────────────────────────────────

function CollapsibleAvatarCard({
  num,
  r,
}: {
  num: number
  r: Record<string, unknown>
}) {
  const [expanded, setExpanded] = useState(false)
  const g = (k: string) => getStr(r, k)
  const image = r[`bf_av${num}_image`]
  const name = g(`bf_av${num}_name`)
  const age = g(`bf_av${num}_age`)
  const occupation = g(`bf_av${num}_occupation`)
  const statement = g(`bf_av${num}_statement`)
  const struggle = g(`bf_av${num}_struggle`)
  const desired = g(`bf_av${num}_desired`)
  const platforms = g(`bf_av${num}_platforms`)
  const fears = g(`bf_av${num}_fears`)
  const demographics = [age, occupation].filter(Boolean).join(' · ')

  // Skip if no meaningful data
  if (!name && !statement && !struggle && !g(`bf_av${num}_who`)) return null

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '10px',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--surface)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font)',
          width: '100%',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {/* 30px circle */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: `1.5px solid ${image ? 'var(--orange)' : 'var(--border2)'}`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg)',
              flexShrink: 0,
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--orange)',
            }}
          >
            {image ? (
              <img
                src={image as string}
                alt={name || `Avatar ${num}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dimmer)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" /><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--orange)', lineHeight: 1, marginBottom: '2px' }}>
              Avatar {num}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {name || 'No name yet'}
            </div>
            {demographics && (
              <div style={{ fontSize: '10.5px', color: 'var(--dimmer)', marginTop: '1px' }}>
                {demographics}
              </div>
            )}
          </div>
        </div>
        <span style={{ color: 'var(--dimmer)', fontSize: '12px', transition: 'transform .2s', display: 'inline-block', transform: expanded ? 'none' : 'rotate(-90deg)' }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '14px 16px' }}>
          {statement && (
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '14px' }}>
              {statement}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            <GuidelineCol label="Their Struggle" value={struggle} />
            <GuidelineCol label="Their Goal" value={desired} />
            <GuidelineCol label="Where They Hang Out" value={platforms} />
            <GuidelineCol label="What They Fear" value={fears} />
          </div>
        </div>
      )}
    </div>
  )
}

function CollapsibleOriginStory({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW_LEN = 280
  const isLong = text.length > PREVIEW_LEN

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--dim)',
          lineHeight: 1.65,
          marginBottom: '6px',
        }}
      >
        &ldquo;
        {expanded || !isLong ? text : text.slice(0, PREVIEW_LEN) + '…'}
        &rdquo;
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            fontSize: '11px',
            color: 'var(--orange)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 0',
            fontFamily: 'var(--font)',
            fontWeight: 600,
          }}
        >
          {expanded ? '− Show less' : '+ Read more'}
        </button>
      )}
    </div>
  )
}

// ── Main chapter ──────────────────────────────────────────────────────────────

function BrandFoundationChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  const values: { name: string; practice: string }[] = []
  for (let i = 1; i <= 6; i++) {
    const name = g(`bf_val${i}_name`)
    if (name) values.push({ name, practice: g(`bf_val${i}_practice`) })
  }

  const pillars: { name: string; sub: string }[] = []
  for (let i = 1; i <= 5; i++) {
    const name = g(`bf_pillar${i}_name`)
    if (name) pillars.push({ name, sub: g(`bf_pillar${i}_sub`) })
  }

  return (
    <>
      {/* 1.1 Brand Journey */}
      <GuidelineRow number="1.1" title="Brand Journey">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
          <GuidelineCol label="Desired Outcome" value={g('bf_journey_outcome')} />
          <GuidelineCol label="Known For" value={g('bf_journey_known')} />
          <GuidelineCol label="What I Do" value={g('bf_journey_do')} />
          <GuidelineCol label="Learning Priority" value={g('bf_journey_learn')} />
        </div>
      </GuidelineRow>

      {/* 1.2 Core Mission */}
      <GuidelineRow number="1.2" title="Core Mission">
        {g('bf_core_mission') && <GuidelineHero text={g('bf_core_mission')} />}
        {g('bf_ikigai_center') && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '5px' }}>
              Ikigai — Sweet Spot
            </div>
            <div style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.5 }}>
              {g('bf_ikigai_center')}
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
          <GuidelineCol label="What I Love" value={g('bf_ikigai_love')} />
          <GuidelineCol label="What I'm Good At" value={g('bf_ikigai_good')} />
          <GuidelineCol label="What the World Needs" value={g('bf_ikigai_world')} />
          <GuidelineCol label="What I Can Be Paid For" value={g('bf_ikigai_paid')} />
        </div>
      </GuidelineRow>

      {/* 1.3 Avatars */}
      <GuidelineRow number="1.3" title="Avatars">
        {[1, 2, 3, 4, 5].map((n) => (
          <CollapsibleAvatarCard key={n} num={n} r={r} />
        ))}
      </GuidelineRow>

      {/* 1.4 Core Values */}
      {values.length > 0 && (
        <GuidelineRow number="1.4" title="Core Values">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 28px' }}>
            {values.map((v, i) => (
              <GuidelineCol key={i} label={`${String(i + 1).padStart(2, '0')} — ${v.name}`} value={v.practice || v.name} />
            ))}
          </div>
        </GuidelineRow>
      )}

      {/* 1.5 Content Pillars */}
      {pillars.length > 0 && (
        <GuidelineRow number="1.5" title="Content Pillars">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            {pillars.map((p, i) => (
              <GuidelineCol key={i} label={`${String(i + 1).padStart(2, '0')} — ${p.name}`} value={p.sub || p.name} />
            ))}
          </div>
        </GuidelineRow>
      )}

      {/* 1.6 Origin Story */}
      <GuidelineRow number="1.6" title="Origin Story">
        {g('bf_origin_story') && (
          <CollapsibleOriginStory text={g('bf_origin_story')} />
        )}
      </GuidelineRow>

      {/* 1.7 Brand Vision */}
      <GuidelineRow number="1.7" title="Brand Vision">
        {g('bf_brand_vision') && <GuidelineHero text={g('bf_brand_vision')} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
          <GuidelineCol label="3-Year Vision" value={g('bf_vision_3yr')} />
          <GuidelineCol label="Impact" value={g('bf_vision_impact')} />
          {g('bf_vision_legacy') && <GuidelineCol label="Legacy" value={g('bf_vision_legacy')} />}
        </div>
      </GuidelineRow>
    </>
  )
}

// ── Creator card for playbook ─────────────────────────────────────────────────

interface PlaybookCreator {
  id: string
  handle: string
  profile?: { fullName?: string; picUrl?: string; followers?: string } | null
  notes?: string
  analysis?: { gap?: string; niche?: string } | null
  detailedNotes?: { steal?: string; avoid?: string; gap?: string; strengths?: string; impressions?: string } | null
}

function CollapsibleCreatorPlaybookCard({
  creator,
  index,
}: {
  creator: PlaybookCreator
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const name = creator.profile?.fullName || (creator.handle ? `@${creator.handle}` : null)
  const sub = creator.profile?.fullName && creator.handle
    ? `@${creator.handle}${creator.profile.followers ? ` · ${creator.profile.followers}` : ''}`
    : creator.profile?.followers || null
  const hasContent = creator.notes || creator.detailedNotes?.steal || creator.detailedNotes?.avoid || creator.analysis?.gap || creator.detailedNotes?.strengths

  if (!name && !hasContent) return null

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '10px',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--surface)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font)',
          width: '100%',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--orange-tint)',
              border: '1px solid var(--orange-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--orange)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {creator.profile?.picUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(creator.profile.picUrl)}&w=60&h=60&fit=cover&mask=circle`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              creator.handle ? creator.handle.charAt(0).toUpperCase() : String(index + 1)
            )}
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--orange)', lineHeight: 1, marginBottom: '2px' }}>
              Creator {index + 1}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {name || `Creator ${index + 1}`}
            </div>
            {sub && (
              <div style={{ fontSize: '10.5px', color: 'var(--dimmer)', marginTop: '1px' }}>
                {sub}
              </div>
            )}
          </div>
        </div>
        <span style={{ color: 'var(--dimmer)', fontSize: '12px', transition: 'transform .2s', display: 'inline-block', transform: expanded ? 'none' : 'rotate(-90deg)' }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '14px 16px' }}>
          {creator.analysis?.niche && (
            <div style={{ fontSize: '11px', color: 'var(--dim)', marginBottom: '10px', fontStyle: 'italic' }}>
              {creator.analysis.niche}
            </div>
          )}
          {creator.notes && (
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '12px' }}>
              {creator.notes}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
            {creator.detailedNotes?.strengths && (
              <GuidelineCol label="Strengths" value={creator.detailedNotes.strengths} />
            )}
            {creator.detailedNotes?.steal && (
              <GuidelineCol label="What to Steal" value={creator.detailedNotes.steal} />
            )}
            {creator.detailedNotes?.avoid && (
              <GuidelineCol label="What to Avoid" value={creator.detailedNotes.avoid} />
            )}
            {(creator.detailedNotes?.gap || creator.analysis?.gap) && (
              <GuidelineCol label="Gap / Opportunity" value={creator.detailedNotes?.gap || creator.analysis?.gap} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function VisualWorldChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  // Parse creators from JSON field
  let creators: PlaybookCreator[] = []
  try {
    const raw = r['vw_ca_creators']
    if (typeof raw === 'string' && raw.trim()) {
      creators = JSON.parse(raw) as PlaybookCreator[]
    }
  } catch { /* ignore */ }
  const hasCreators = creators.some(c => c.handle || c.notes || c.detailedNotes?.steal)

  const colorPrimary   = g('vw_color_primary')
  const colorSecondary = g('vw_color_secondary')
  const colorAccent    = g('vw_color_accent')
  const colorNeutral   = g('vw_color_neutral')
  const colorName      = g('vw_color_name')
  const hasColors      = colorPrimary || colorSecondary || colorAccent || colorNeutral

  const primaryFont = g('vw_typo_primary')
  const bodyFont    = g('vw_typo_body')
  const settingStatement = g('vw_shot_e1_statement')
  const moodStatement    = g('vw_shot_e2_statement')
  const hasPersp = g('vw_shot_e1_location') || g('vw_shot_e1_vibe') || g('vw_shot_e2_mood') || settingStatement || moodStatement
  const hasDesign = g('vw_shot_e4_objects') || g('vw_shot_e4_wardrobe') || g('vw_shot_e4_textures') || g('vw_shot_e4_never')
  const hasDiff   = g('vw_ca_different') || g('vw_ca_own')

  return (
    <>
      {hasCreators && (
        <GuidelineRow number="2.1" title="Creator Analysis">
          {creators.map((c, i) => (
            <CollapsibleCreatorPlaybookCard key={c.id || String(i)} creator={c} index={i} />
          ))}
        </GuidelineRow>
      )}

      {hasColors && (
        <GuidelineRow number="2.2" title="Color Palette">
          {colorName && (
            <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.08em', color: 'var(--dim)', marginBottom: '10px' }}>
              {colorName}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            {colorPrimary   && <ColorSwatch label="Primary"   hex={colorPrimary}   />}
            {colorSecondary && <ColorSwatch label="Secondary" hex={colorSecondary} />}
            {colorAccent    && <ColorSwatch label="Accent"    hex={colorAccent}    />}
            {colorNeutral   && <ColorSwatch label="Neutral"   hex={colorNeutral}   />}
          </div>
        </GuidelineRow>
      )}

      {(primaryFont || bodyFont) && (
        <GuidelineRow number="2.3" title="Typography">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Primary Font" value={primaryFont} />
            <GuidelineCol label="Body Font"    value={bodyFont}    />
          </div>
        </GuidelineRow>
      )}

      {hasPersp && (
        <GuidelineRow number="2.4" title="Perspective">
          {settingStatement && <GuidelineHero text={settingStatement} />}
          {moodStatement    && <GuidelineQuote text={moodStatement} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Setting"      value={g('vw_shot_e1_location')} />
            <GuidelineCol label="Environment"  value={getLabel(r, 'vw_shot_e1_vibe')} />
            <GuidelineCol label="Primary Mood" value={getLabel(r, 'vw_shot_e2_mood')} />
            <GuidelineCol label="Lighting"     value={getLabel(r, 'vw_shot_e2_lighting')} />
            <GuidelineCol label="Time of Day"  value={g('vw_shot_e2_time')} />
            <GuidelineCol label="Color Grade"  value={getLabel(r, 'vw_shot_e3_grade')} />
          </div>
        </GuidelineRow>
      )}

      {hasDesign && (
        <GuidelineRow number="2.5" title="Design Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Signature Objects" value={g('vw_shot_e4_objects')} />
            <GuidelineCol label="Wardrobe"          value={g('vw_shot_e4_wardrobe')} />
            <GuidelineCol label="Textures"          value={getLabel(r, 'vw_shot_e4_textures')} />
            <GuidelineCol label="Never On Camera"   value={g('vw_shot_e4_never')} />
          </div>
        </GuidelineRow>
      )}

      {hasDiff && (
        <GuidelineRow number="2.6" title="Visual Identity">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="What Makes You Different" value={g('vw_ca_different')} />
            <GuidelineCol label="What You Own"             value={g('vw_ca_own')} />
          </div>
        </GuidelineRow>
      )}
    </>
  )
}

function ContentChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)
  const hasSustain  = g('ct_sustain_primary') || g('ct_sustain_week_hours') || g('ct_sustain_cadence')
  const hasPillars  = [1,2,3,4,5].some(i => g(`ct_ig_pillar${i}`))
  const hasStory    = g('ct_story_idea') || g('ct_story_hook') || g('ct_story_prob')
  const hasLadder   = g('ct_tm_free') || g('ct_tm_lead') || g('ct_tm_low') || g('ct_tm_mid') || g('ct_tm_high')

  return (
    <>
      <GuidelineRow number="3.1" title="Strategy">
        {g('ct_strategy_pain_problem') && <GuidelineHero text={g('ct_strategy_pain_problem')} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
          <GuidelineCol label="My Unique Solution"       value={g('ct_strategy_unique_sol')} />
          <GuidelineCol label="Contextual Credibility"   value={g('ct_strategy_credibility')} />
        </div>
      </GuidelineRow>

      {hasSustain && (
        <GuidelineRow number="3.2" title="Sustainability">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Primary Platform"  value={g('ct_sustain_primary')} />
            <GuidelineCol label="Weekly Hours"      value={g('ct_sustain_week_hours')} />
            <GuidelineCol label="Content Cadence"   value={g('ct_sustain_cadence')} />
          </div>
        </GuidelineRow>
      )}

      {hasPillars && (
        <GuidelineRow number="3.3" title="Content Pillars">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
            {[1,2,3,4,5].map(i => {
              const name = g(`ct_ig_pillar${i}`)
              return name ? <GuidelineCol key={i} label={`0${i}`} value={name} /> : null
            })}
          </div>
        </GuidelineRow>
      )}

      {hasStory && (
        <GuidelineRow number="3.4" title="Story Framework">
          {g('ct_story_idea') && <GuidelineHero text={g('ct_story_idea')} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Hook"    value={g('ct_story_hook')} />
            <GuidelineCol label="Problem" value={g('ct_story_prob')} />
            <GuidelineCol label="Journey" value={g('ct_story_journey')} />
            <GuidelineCol label="Lesson"  value={g('ct_story_lesson')} />
            <GuidelineCol label="CTA"     value={g('ct_story_cta')} />
          </div>
        </GuidelineRow>
      )}

      {hasLadder && (
        <GuidelineRow number="3.5" title="Offer Ladder">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Free Content"         value={g('ct_tm_free')} />
            <GuidelineCol label="Lead Magnet"          value={g('ct_tm_lead')} />
            <GuidelineCol label="Low-Ticket"           value={g('ct_tm_low')} />
            <GuidelineCol label="Mid-Ticket"           value={g('ct_tm_mid')} />
            <GuidelineCol label="High-Ticket"          value={g('ct_tm_high')} />
            <GuidelineCol label="Conversion Strategy"  value={g('ct_tm_conv')} />
            <GuidelineCol label="CTA Strategy"         value={g('ct_tm_cta_strat')} />
          </div>
        </GuidelineRow>
      )}
    </>
  )
}

function LaunchChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)
  const bioFull        = [g('la_bio_line1'), g('la_bio_line2'), g('la_bio_line3'), g('la_bio_line4')].filter(Boolean).join('\n')
  const offerPrice     = [g('la_funnel_offer'), g('la_funnel_price')].filter(Boolean).join(' — ')
  const formatDelivery = [g('la_lm_format'), g('la_lm_delivery')].filter(Boolean).join(' · ')
  const hasBio     = g('la_bio_username') || bioFull
  const hasFunnel  = g('la_funnel_platforms') || g('la_funnel_cta') || offerPrice
  const hasLM      = g('la_lm_name') || g('la_lm_big_win')
  const hasVideos  = g('la_lc_story_hook') || g('la_lc_pos_claim')
  const hasGoals   = g('la_goal_followers') || g('la_goal_content') || g('la_goal_offer')

  return (
    <>
      {hasBio && (
        <GuidelineRow number="4.1" title="Bio">
          {bioFull && <GuidelineHero text={bioFull} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Username"    value={g('la_bio_username')} />
            <GuidelineCol label="Link in Bio" value={g('la_bio_link')} />
          </div>
        </GuidelineRow>
      )}

      {hasFunnel && (
        <GuidelineRow number="4.2" title="Funnel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Content Platforms" value={g('la_funnel_platforms')} />
            <GuidelineCol label="Email Platform"    value={g('la_funnel_email_platform')} />
            <GuidelineCol label="Primary CTA"       value={g('la_funnel_cta')} />
            <GuidelineCol label="Core Offer"        value={offerPrice || g('la_funnel_offer')} />
          </div>
        </GuidelineRow>
      )}

      {hasLM && (
        <GuidelineRow number="4.3" title="Lead Magnet">
          {g('la_lm_name') && <GuidelineHero text={g('la_lm_name')} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="The One Big Win"    value={g('la_lm_big_win')} />
            <GuidelineCol label="Format + Delivery"  value={formatDelivery || g('la_lm_format')} />
            <GuidelineCol label="CTA"                value={g('la_lm_cta')} />
          </div>
        </GuidelineRow>
      )}

      {hasVideos && (
        <GuidelineRow number="4.4" title="Launch Videos">
          {g('la_lc_story_hook') && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '8px' }}>
                Video 1 — Your Story
              </div>
              <GuidelineHero text={g('la_lc_story_hook')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                <GuidelineCol label="Why You Do This"  value={g('la_lc_story_why')} />
                <GuidelineCol label="The Challenge"    value={g('la_lc_story_challenge')} />
                <GuidelineCol label="The Turn"         value={g('la_lc_story_turning')} />
                <GuidelineCol label="What You Learned" value={g('la_lc_story_learned')} />
                <GuidelineCol label="CTA"              value={g('la_lc_story_cta')} />
              </div>
            </div>
          )}
          {g('la_lc_pos_claim') && (
            <div>
              <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '8px' }}>
                Video 2 — Positioning
              </div>
              <GuidelineHero text={g('la_lc_pos_claim')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                <GuidelineCol label="Core Belief"      value={g('la_lc_pos_belief')} />
                <GuidelineCol label="Anchor Statement" value={g('la_lc_pos_anchor')} />
              </div>
            </div>
          )}
        </GuidelineRow>
      )}

      {hasGoals && (
        <GuidelineRow number="4.5" title="90-Day Goals">
          {g('la_goal_content') && <GuidelineHero text={g('la_goal_content')} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
            <GuidelineCol label="Followers Goal"    value={g('la_goal_followers')} />
            <GuidelineCol label="Email Subscribers" value={g('la_goal_email')} />
            <GuidelineCol label="Revenue Goal"      value={g('la_goal_revenue')} />
            <GuidelineCol label="Review Date"       value={g('la_goal_review_date')} />
            <GuidelineCol label="Offer Goal"        value={g('la_goal_offer')} />
            <GuidelineCol label="Accountability"    value={g('la_goal_accountability')} />
          </div>
        </GuidelineRow>
      )}
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PlaybookPage() {
  const { user } = useAuth()
  const [responses, setResponses] = useState<ResponsesByModule>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('blp_responses')
      .select('module_slug, responses')
      .eq('user_id', user.id)
      .then(({ data }: { data: { module_slug: string; responses: Record<string, unknown> }[] | null }) => {
        const byModule: ResponsesByModule = {}
        for (const row of data ?? []) {
          byModule[row.module_slug] = row.responses as Record<string, unknown>
        }
        setResponses(byModule)
        setLoading(false)
      })
  }, [user])

  if (loading) return <PlaybookSkeleton />

  const bf = responses['brand-foundation'] ?? {}
  const vw = responses['visual-world']     ?? {}
  const ct = responses['content']          ?? {}
  const la = responses['launch']           ?? {}

  // Cover metadata
  const brandName = (user?.user_metadata?.full_name as string) || getStr(la, 'la_bio_username') || 'Your Brand'
  const handle    = getStr(la, 'la_bio_username')  || (user?.user_metadata?.ig_handle as string) || ''
  const knownFor  = getStr(bf, 'bf_journey_known') || ''
  const goal90    = getStr(la, 'la_goal_content')  || getStr(la, 'la_goal_audience') || getStr(la, 'la_goal_revenue') || ''

  function MetaCell({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
    return (
      <div style={{ padding: '.65rem 0' }}>
        <div style={{
          fontSize: '8px', fontWeight: 700, letterSpacing: '.12em',
          textTransform: 'uppercase' as const, color: 'var(--dimmer)', marginBottom: '3px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '12px', fontWeight: value ? 700 : 400, lineHeight: 1.4,
          color: value ? 'var(--text)' : 'var(--dimmer)',
          fontStyle: value ? 'normal' : 'italic',
          wordWrap: 'break-word' as const,
        }}>
          {value || placeholder}
        </div>
      </div>
    )
  }

  const chapters = [
    { slug: 'brand-foundation', num: '01', label: 'Module 01', title: 'Brand Foundation',      data: bf },
    { slug: 'visual-world',     num: '02', label: 'Module 02', title: 'Your Visual World',      data: vw },
    { slug: 'content',          num: '03', label: 'Module 03', title: 'Create Your Content',    data: ct },
    { slug: 'launch',           num: '04', label: 'Module 04', title: 'Launch',                 data: la },
  ]

  return (
    <div style={{ width: '100%', padding: '2rem 2rem 5rem' }}>

      {/* ── COVER ── */}
      <div style={{ textAlign: 'left', paddingTop: '2.5rem', marginBottom: '0' }}>
        <div style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '.18em',
          textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.75rem',
        }}>
          FSCreative&#8482;
        </div>
        <div style={{
          fontFamily: 'var(--font-num)',
          fontSize: 'clamp(72px, 13vw, 140px)',
          fontWeight: 900, lineHeight: 0.95,
          letterSpacing: '-2px', color: 'var(--text)',
          marginBottom: '2.5rem',
        }}>
          YOUR BRAND<br />PLAYBOOK
        </div>

        {/* Metadata row */}
        <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '1.5rem' }}>
          <MetaCell label="Creator"    value={brandName} placeholder="Your Name"                  />
          <MetaCell label="Handle"     value={handle}    placeholder="Not set"                     />
          <MetaCell label="Known For"  value={knownFor}  placeholder="Complete Brand Foundation"   />
          <MetaCell label="90-Day Goal" value={goal90}   placeholder="Complete Launch module"      />
        </div>

        {/* Chapter nav */}
        <div className="playbook-grid-responsive" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          columnGap: '1rem', marginTop: '1.25rem', marginBottom: '3rem',
        }}>
          {chapters.map(c => {
            const navLabels: Record<string, string> = {
              'brand-foundation': 'Foundation',
              'visual-world': 'Visuals',
              'content': 'Content',
              'launch': 'Launch',
            }
            return (
            <a
              key={c.slug}
              href={`#ch${c.num}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.65rem 0', fontSize: '9px', fontWeight: 700, letterSpacing: '.08em',
                textTransform: 'uppercase', color: 'var(--dim)', textDecoration: 'none',
                borderTop: '1.5px solid var(--dimmer)',
                borderBottom: '1.5px solid var(--dimmer)',
              }}
            >
              {navLabels[c.slug] || c.title}
              <span style={{ color: 'var(--orange)', fontSize: '11px', flexShrink: 0, marginLeft: '4px' }}>
                &#8599;
              </span>
            </a>
          )})}
        </div>
      </div>

      {/* ── CHAPTERS ── */}
      {chapters.map(c => (
        <div key={c.slug} id={`ch${c.num}`} className="pb-chapter" style={{ marginBottom: '3rem' }}>
          <ChapterHeader num={c.num} moduleLabel={c.label} title={c.title} />
          {c.slug === 'brand-foundation' && (
            Object.keys(c.data).length > 0
              ? <BrandFoundationChapter r={c.data} />
              : <EmptyChapter moduleNum={c.num} />
          )}
          {c.slug === 'visual-world' && (
            Object.keys(c.data).length > 0
              ? <VisualWorldChapter r={c.data} />
              : <EmptyChapter moduleNum={c.num} />
          )}
          {c.slug === 'content' && (
            Object.keys(c.data).length > 0
              ? <ContentChapter r={c.data} />
              : <EmptyChapter moduleNum={c.num} />
          )}
          {c.slug === 'launch' && (
            Object.keys(c.data).length > 0
              ? <LaunchChapter r={c.data} />
              : <EmptyChapter moduleNum={c.num} />
          )}
        </div>
      ))}

      {/* ── CTA ── */}
      <div style={{
        marginTop: '3rem',
        background: 'var(--orange-tint)',
        border: '1px solid var(--orange-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '.6rem' }}>
          Want help implementing your brand?
        </div>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          The Brand Launch Sprint&#8482; is a focused 30-day execution environment where you install
          your complete premium personal brand with direct creative direction from Gabe.
          Weekly live sessions. Direct feedback on every step. A community of creators doing the work alongside you.
        </p>
        <a
          href="https://fscreative.live"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            background: 'var(--orange)', color: '#fff',
            fontSize: '13px', fontWeight: 600,
            padding: '.7rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Join Brand Launch Sprint&#8482; &#8594;
        </a>
      </div>

      {/* ── PRINT BUTTON ── */}
      <button
        onClick={() => window.print()}
        className="print-btn"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '10px 18px', fontSize: '12px', fontWeight: 600,
          color: 'var(--text)', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          cursor: 'pointer', fontFamily: 'var(--font)', marginTop: '2rem',
        }}
      >
        Print / Save as PDF
      </button>
    </div>
  )
}
