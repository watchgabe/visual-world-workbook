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
  const avatarLabel =
    num === 1 ? 'Primary' : num === 2 ? 'Secondary' : `Avatar ${num}`

  // Skip if no meaningful data
  if (!name && !statement && !struggle && !g(`bf_av${num}_who`)) return null

  return (
    <div style={{ marginBottom: '12px' }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: '6px 0',
          fontFamily: 'var(--font)',
        }}
      >
        {/* Avatar image circle */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: `1.5px solid ${image ? 'var(--orange)' : 'var(--border2)'}`,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            flexShrink: 0,
          }}
        >
          {image ? (
            <img
              src={image as string}
              alt={name || avatarLabel}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--dimmer)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
            </svg>
          )}
        </div>
        {/* Name + demographics */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {name ? (
            <>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1.2,
                }}
              >
                {name}
              </div>
              {demographics && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--dim)',
                    marginTop: '1px',
                  }}
                >
                  {demographics}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--dimmer)',
                fontStyle: 'italic',
              }}
            >
              {avatarLabel}
              {demographics ? ` · ${demographics}` : ''}
            </div>
          )}
        </div>
        {/* Chevron */}
        <span
          style={{
            fontSize: '10px',
            color: 'var(--dimmer)',
            flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .15s',
          }}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ paddingTop: '10px', paddingLeft: '56px' }}>
          {statement && (
            <div
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--text)',
                lineHeight: 1.65,
                marginBottom: '16px',
              }}
            >
              {statement}
            </div>
          )}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}
          >
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

function VisualWorldChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  const colorPrimary   = g('vw_color_primary')
  const colorSecondary = g('vw_color_secondary')
  const colorAccent    = g('vw_color_accent')
  const colorNeutral   = g('vw_color_neutral')
  const colorName      = g('vw_color_name')
  const hasColors      = colorPrimary || colorSecondary || colorAccent || colorNeutral

  return (
    <>
      {hasColors && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1rem 1.2rem',
          marginBottom: '10px',
        }}>
          <div style={{
            fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const,
            letterSpacing: '.1em', color: 'var(--orange)', marginBottom: '12px',
          }}>
            Color Palette{colorName ? ` — ${colorName}` : ''}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            {colorPrimary   && <ColorSwatch label="Primary"   hex={colorPrimary}   />}
            {colorSecondary && <ColorSwatch label="Secondary" hex={colorSecondary} />}
            {colorAccent    && <ColorSwatch label="Accent"    hex={colorAccent}    />}
            {colorNeutral   && <ColorSwatch label="Neutral"   hex={colorNeutral}   />}
          </div>
        </div>
      )}

      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Primary Font" value={r.vw_typo_primary} />
        <FieldCard label="Body Font"    value={r.vw_typo_body}    />
      </div>

      <SectionLabel label="Mood &amp; Setting" values={[r.vw_shot_e1_location, getLabel(r, 'vw_shot_e1_vibe'), getLabel(r, 'vw_shot_e2_mood'), getLabel(r, 'vw_shot_e2_lighting'), r.vw_shot_e2_time, getLabel(r, 'vw_shot_e3_grade'), r.vw_shot_e1_statement, r.vw_shot_e2_statement]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Setting"      value={r.vw_shot_e1_location} />
        <FieldCard label="Environment"  value={getLabel(r, 'vw_shot_e1_vibe')}     />
        <FieldCard label="Primary Mood" value={getLabel(r, 'vw_shot_e2_mood')}     />
      </div>
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Lighting"     value={getLabel(r, 'vw_shot_e2_lighting')} />
        <FieldCard label="Time of Day"  value={r.vw_shot_e2_time}     />
        <FieldCard label="Color Grade"  value={getLabel(r, 'vw_shot_e3_grade')}    />
      </div>
      <FieldCard label="Setting Statement" value={r.vw_shot_e1_statement} highlight />
      <FieldCard label="Mood Statement"    value={r.vw_shot_e2_statement} highlight />

      <SectionLabel label="Design Details" values={[r.vw_shot_e4_objects, r.vw_shot_e4_wardrobe, getLabel(r, 'vw_shot_e4_textures'), r.vw_shot_e4_never]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Signature Objects" value={r.vw_shot_e4_objects}  />
        <FieldCard label="Wardrobe"          value={r.vw_shot_e4_wardrobe} />
        <FieldCard label="Textures"          value={getLabel(r, 'vw_shot_e4_textures')} />
      </div>
      <FieldCard label="Never On Camera" value={r.vw_shot_e4_never} />

      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="What Makes You Different" value={r.vw_ca_different} />
        <FieldCard label="What You Own" value={r.vw_ca_own} />
      </div>
    </>
  )
}

function ContentChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)

  return (
    <>
      <FieldCard label="The Painful Problem"     value={r.ct_strategy_pain_problem} highlight />
      <FieldCard label="My Unique Solution"      value={r.ct_strategy_unique_sol}   highlight />
      <FieldCard label="My Contextual Credibility"  value={r.ct_strategy_credibility}  highlight />

      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Primary Platform"  value={r.ct_sustain_primary}    />
        <FieldCard label="Weekly Hours"      value={r.ct_sustain_week_hours} />
        <FieldCard label="Content Cadence"   value={r.ct_sustain_cadence}    />
      </div>

      <SectionLabel label="Content Pillars" values={[g('ct_ig_pillar1'), g('ct_ig_pillar2'), g('ct_ig_pillar3'), g('ct_ig_pillar4'), g('ct_ig_pillar5')]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
        {[1, 2, 3, 4, 5].map(i => {
          const name = g(`ct_ig_pillar${i}`)
          return name ? <PillarCard key={i} number={`0${i}`} name={name} /> : null
        })}
      </div>

      <SectionLabel label="Story Framework" values={[r.ct_story_idea, r.ct_story_hook, r.ct_story_prob, r.ct_story_journey, r.ct_story_lesson, r.ct_story_cta]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Identity (I Am)" value={r.ct_story_idea} />
        <FieldCard label="Hook"    value={r.ct_story_hook}    />
        <FieldCard label="Problem" value={r.ct_story_prob}    />
        <FieldCard label="Journey" value={r.ct_story_journey} />
        <FieldCard label="Lesson"  value={r.ct_story_lesson}  />
        <FieldCard label="CTA"     value={r.ct_story_cta}     />
      </div>

      <SectionLabel label="Offer Ladder" values={[r.ct_tm_free, r.ct_tm_lead, r.ct_tm_low, r.ct_tm_mid, r.ct_tm_high, r.ct_tm_conv, r.ct_tm_cta_strat]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Free Content"  value={r.ct_tm_free} />
        <FieldCard label="Lead Magnet"   value={r.ct_tm_lead} />
        <FieldCard label="Low-Ticket"    value={r.ct_tm_low}  />
        <FieldCard label="Mid-Ticket"    value={r.ct_tm_mid}  />
        <FieldCard label="High-Ticket"   value={r.ct_tm_high} />
        <FieldCard label="Conversion Strategy" value={r.ct_tm_conv} />
      </div>
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="CTA Strategy" value={r.ct_tm_cta_strat} />
      </div>
    </>
  )
}

function LaunchChapter({ r }: { r: Record<string, unknown> }) {
  const g = (k: string) => getStr(r, k)
  const bioFull = [g('la_bio_line1'), g('la_bio_line2'), g('la_bio_line3'), g('la_bio_line4')].filter(Boolean).join('\n')
  const offerPrice = [g('la_funnel_offer'), g('la_funnel_price')].filter(Boolean).join(' — ')
  const formatDelivery = [g('la_lm_format'), g('la_lm_delivery')].filter(Boolean).join(' · ')

  return (
    <>
      <SectionLabel label="Bio" values={[r.la_bio_username, r.la_bio_link, g('la_bio_line1'), g('la_bio_line2'), g('la_bio_line3'), g('la_bio_line4')]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Username"    value={r.la_bio_username} />
        <FieldCard label="Link in Bio" value={r.la_bio_link}     />
      </div>
      {bioFull && <FieldCard label="Instagram Bio" value={bioFull} highlight />}

      <SectionLabel label="Your Funnel" values={[r.la_funnel_platforms, r.la_funnel_email_platform, r.la_funnel_cta, r.la_funnel_offer, r.la_funnel_price]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Content Platforms" value={r.la_funnel_platforms}      />
        <FieldCard label="Email Platform"    value={r.la_funnel_email_platform} />
        <FieldCard label="Primary CTA"       value={r.la_funnel_cta}            />
        <FieldCard label="Core Offer + Price" value={offerPrice || g('la_funnel_offer') || null} />
      </div>

      <SectionLabel label="Lead Magnet" values={[r.la_lm_name, r.la_lm_big_win, r.la_lm_format, r.la_lm_delivery, r.la_lm_cta]} />
      <FieldCard label="Lead Magnet Name" value={r.la_lm_name} highlight />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="The One Big Win"    value={r.la_lm_big_win} />
        <FieldCard label="Format + Delivery"  value={formatDelivery || g('la_lm_format') || null} />
      </div>
      <FieldCard label="CTA" value={r.la_lm_cta} />

      <SectionLabel label="Launch Videos" values={[r.la_lc_story_hook, r.la_lc_story_why, r.la_lc_story_challenge, r.la_lc_story_turning, r.la_lc_story_learned, r.la_lc_story_cta, r.la_lc_pos_claim, r.la_lc_pos_belief, r.la_lc_pos_anchor]} />

      <SectionLabel label="Video 1 — Your Story" values={[r.la_lc_story_hook, r.la_lc_story_why, r.la_lc_story_challenge, r.la_lc_story_turning, r.la_lc_story_learned, r.la_lc_story_cta]} />
      <FieldCard label="Hook" value={r.la_lc_story_hook} highlight />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Why You Do This" value={r.la_lc_story_why}       />
        <FieldCard label="The Challenge"   value={r.la_lc_story_challenge} />
        <FieldCard label="The Turn"        value={r.la_lc_story_turning}   />
        <FieldCard label="What You Learned" value={r.la_lc_story_learned}  />
      </div>
      <FieldCard label="CTA" value={r.la_lc_story_cta} />

      <SectionLabel label="Video 2 — Positioning Deep Dive" values={[r.la_lc_pos_claim, r.la_lc_pos_belief, r.la_lc_pos_anchor]} />
      <FieldCard label="Core Claim"       value={r.la_lc_pos_claim}   highlight />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Core Belief"      value={r.la_lc_pos_belief} />
        <FieldCard label="Anchor Statement" value={r.la_lc_pos_anchor} />
      </div>

      <SectionLabel label="90-Day Goals" values={[r.la_goal_followers, r.la_goal_email, r.la_goal_revenue, r.la_goal_review_date, r.la_goal_audience, r.la_goal_system, r.la_goal_content, r.la_goal_offer, r.la_goal_accountability]} />
      <div className="playbook-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <FieldCard label="Followers Goal"    value={r.la_goal_followers}   />
        <FieldCard label="Email Subscribers" value={r.la_goal_email}       />
        <FieldCard label="Revenue Goal"      value={r.la_goal_revenue}     />
        <FieldCard label="Review Date"       value={r.la_goal_review_date} />
        <FieldCard label="Audience Goal"     value={r.la_goal_audience}    />
        <FieldCard label="System Goal"       value={r.la_goal_system}      />
      </div>
      <FieldCard label="Content Goal" value={r.la_goal_content} highlight />
      <FieldCard label="Offer Goal"   value={r.la_goal_offer}   highlight />
      <FieldCard label="Accountability Partner" value={r.la_goal_accountability} />
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
