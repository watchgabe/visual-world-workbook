'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

const MODULE_SLUG = 'visual-world' as const

interface VisualWorldResponses {
  // Creator Analysis
  vw_ca_patterns?: string
  vw_ca_different?: string
  vw_ca_own?: string
  vw_ca_gap?: string
  // Mood Board
  vw_mb_link?: string
  vw_mb_colors?: string
  vw_mb_lighting?: string
  vw_mb_mood?: string
  vw_mb_textures?: string
  vw_mb_movie?: string
  vw_mb_time?: string
  vw_mb_place?: string
  // Color Palette
  vw_color_primary?: string
  vw_color_secondary?: string
  vw_color_accent?: string
  vw_color_neutral?: string
  vw_color_name?: string
  // Typography
  vw_typo_primary?: string
  vw_typo_body?: string
  // Shot System / Your Perspective
  vw_shot_e1_location?: string
  vw_shot_e1_vibe?: string
  vw_shot_e1_communicate?: string
  vw_shot_e1_statement?: string
  vw_shot_e2_mood?: string
  vw_shot_e2_lighting?: string
  vw_shot_e2_time?: string
  vw_shot_e2_statement?: string
  vw_shot_e3_grade?: string
  vw_shot_e3_ref?: string
  vw_shot_e4_objects?: string
  vw_shot_e4_textures?: string
  vw_shot_e4_wardrobe?: string
  vw_shot_e4_never?: string
}

function DocField({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginBottom: '2px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '13.5px',
          color: value ? 'var(--text)' : 'var(--dimmer)',
          lineHeight: 1.6,
          fontStyle: value ? 'normal' : 'italic',
        }}
      >
        {value || 'Not yet completed'}
      </div>
    </div>
  )
}

function ColorSwatch({ label, hex }: { label: string; hex?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 5,
          background: hex || 'var(--border)',
          flexShrink: 0,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border)',
        }}
      />
      <div>
        <div style={{ fontSize: '11px', color: 'var(--dim)', marginBottom: '1px' }}>{label}</div>
        <div style={{ fontSize: '13px', color: hex ? 'var(--text)' : 'var(--dimmer)', fontStyle: hex ? 'normal' : 'italic' }}>
          {hex || 'Not yet set'}
        </div>
      </div>
    </div>
  )
}

function DocCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border)',
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
          marginBottom: '.75rem',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

export default function VisualWorldDoc() {
  const { user } = useAuth()
  const [responses, setResponses] = useState<VisualWorldResponses>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .maybeSingle()
      .then(({ data }: { data: { responses: VisualWorldResponses } | null }) => {
        if (data?.responses) setResponses(data.responses)
        setLoading(false)
      })
  }, [user])

  return (
    <div style={{ maxWidth: '720px' }}>
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
        Visual World
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
        Your Visual World Doc
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your complete visual identity in one place. Use this as your reference guide whenever
        you&apos;re creating content — your colors, fonts, mood, and perspective all in one view.
      </p>

      {loading ? (
        <div style={{ color: 'var(--dim)', fontSize: '13px', padding: '2rem 0' }}>
          Loading your responses...
        </div>
      ) : (
        <>
          {/* Creator Analysis */}
          <DocCard title="Creator Analysis">
            <DocField label="Visual gap statement" value={responses.vw_ca_gap} />
            <DocField label="Patterns across premium creators" value={responses.vw_ca_patterns} />
            <DocField label="What I'll do differently" value={responses.vw_ca_different} />
            <DocField label="What I'll own" value={responses.vw_ca_own} />
          </DocCard>

          {/* Mood Board */}
          <DocCard title="Mood Board">
            <DocField label="Dominant colors" value={responses.vw_mb_colors} />
            <DocField label="Lighting style" value={responses.vw_mb_lighting} />
            <DocField label="Overall mood" value={responses.vw_mb_mood} />
            <DocField label="Textures" value={responses.vw_mb_textures} />
            <DocField label="If a movie" value={responses.vw_mb_movie} />
            <DocField label="If a time of day" value={responses.vw_mb_time} />
            <DocField label="If a place" value={responses.vw_mb_place} />
            {responses.vw_mb_link && (
              <DocField label="Board link" value={responses.vw_mb_link} />
            )}
          </DocCard>

          {/* Color Palette */}
          <DocCard title={`Color Palette${responses.vw_color_name ? ` — ${responses.vw_color_name}` : ''}`}>
            <ColorSwatch label="Primary Color" hex={responses.vw_color_primary} />
            <ColorSwatch label="Secondary Color" hex={responses.vw_color_secondary} />
            <ColorSwatch label="Accent Color" hex={responses.vw_color_accent} />
            <ColorSwatch label="Neutral Base" hex={responses.vw_color_neutral} />
          </DocCard>

          {/* Typography */}
          <DocCard title="Typography">
            <DocField label="Primary font (headlines, hooks, title cards)" value={responses.vw_typo_primary} />
            <DocField label="Body font (captions, supporting copy)" value={responses.vw_typo_body} />
          </DocCard>

          {/* Your Perspective */}
          <DocCard title="Setting">
            <DocField label="Primary filming location" value={responses.vw_shot_e1_location} />
            <DocField label="Environment vibe" value={responses.vw_shot_e1_vibe} />
            <DocField label="What it communicates" value={responses.vw_shot_e1_communicate} />
            <DocField label="Setting statement" value={responses.vw_shot_e1_statement} />
          </DocCard>

          <DocCard title="Mood">
            <DocField label="Primary mood" value={responses.vw_shot_e2_mood} />
            <DocField label="Lighting" value={responses.vw_shot_e2_lighting} />
            <DocField label="Time of day feel" value={responses.vw_shot_e2_time} />
            <DocField label="Mood statement" value={responses.vw_shot_e2_statement} />
          </DocCard>

          <DocCard title="Color Language">
            <DocField label="Color grade approach" value={responses.vw_shot_e3_grade} />
            <DocField label="Visual reference" value={responses.vw_shot_e3_ref} />
          </DocCard>

          <DocCard title="Design Details">
            <DocField label="Signature objects" value={responses.vw_shot_e4_objects} />
            <DocField label="Signature textures" value={responses.vw_shot_e4_textures} />
            <DocField label="Wardrobe" value={responses.vw_shot_e4_wardrobe} />
            <DocField label="Never show list" value={responses.vw_shot_e4_never} />
          </DocCard>
        </>
      )}
    </div>
  )
}
