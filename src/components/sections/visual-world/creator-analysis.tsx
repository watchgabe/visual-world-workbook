'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

interface CreatorAnalysis {
  setting: string
  mood: string
  lighting: string
  col1: string
  col2: string
  col3: string
  niche: string
  p1: string
  p2: string
  p3: string
  gap: string
}

interface Creator {
  id: string
  handle: string
  bio: string
  analyzed: boolean
  analysis: CreatorAnalysis | null
  notes: string
}

export default function CreatorAnalysis() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  const [creators, setCreators] = useState<Creator[]>([])
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analyzeErrors, setAnalyzeErrors] = useState<Record<string, string>>({})

  // Load saved data on mount
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
          if (key !== 'vw_ca_creators') {
            if (typeof val === 'string') (setValue as (k: string, v: string) => void)(key, val)
          }
        })
        const savedCreators = saved['vw_ca_creators']
        if (savedCreators) {
          try { setCreators(JSON.parse(savedCreators)) } catch { /* ignore parse errors */ }
        }
      })
    return () => { cancelled = true }
  }, [user, setValue])

  // Sync creators to react-hook-form for auto-save
  useEffect(() => {
    ;(setValue as (k: string, v: string) => void)('vw_ca_creators', JSON.stringify(creators))
  }, [creators, setValue])

  function addCreator() {
    setCreators(prev => [...prev, {
      id: Date.now().toString(),
      handle: '',
      bio: '',
      analyzed: false,
      analysis: null,
      notes: '',
    }])
  }

  function removeCreator(id: string) {
    setCreators(prev => prev.filter(c => c.id !== id))
    setAnalyzeErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function updateCreator(id: string, field: keyof Creator, value: string) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  async function analyzeCreator(id: string) {
    const creator = creators.find(c => c.id === id)
    if (!creator || !creator.handle.trim()) return
    setAnalyzingId(id)
    setAnalyzeErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const prompt = `Analyze Instagram creator @${creator.handle}${creator.bio ? ` (${creator.bio})` : ''}. Return ONLY valid JSON with no markdown: {"setting":"one of: calm and minimal, creative and eclectic, professional and polished, luxurious and elevated, energetic and dynamic, raw and authentic","mood":"emotional tone - one short phrase","lighting":"one of: warm golden natural, bright even studio, high contrast dramatic, soft diffused","col1":"primary color name","col2":"secondary color name","col3":"accent color name","niche":"content niche in 3-5 words","p1":"specific visual premium factor 1","p2":"specific visual premium factor 2","p3":"specific visual premium factor 3","gap":"one sentence on what you could own that they do not"}`
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 400 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let analysis: CreatorAnalysis
      try {
        analysis = JSON.parse(data.text)
      } catch {
        throw new Error('AI returned invalid JSON — try again')
      }
      setCreators(prev => prev.map(c => c.id === id ? { ...c, analyzed: true, analysis } : c))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      setAnalyzeErrors(prev => ({ ...prev, [id]: msg }))
    } finally {
      setAnalyzingId(null)
    }
  }

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
        Workshop 1
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
        Creator Analysis
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        Before you build your own visual world, you need to develop your eye. Study premium creators
        in your space and reverse-engineer their visual decisions. You&apos;re not copying them — you&apos;re
        training yourself to recognize intentional visual choices.
      </p>

      {/* Instruction box */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          marginBottom: '1.5rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        The goal is to find <strong style={{ color: 'var(--text)' }}>your gap</strong>. After
        studying premium creators, you&apos;ll have a clear picture of what&apos;s already being done —
        and where the opportunity is for you to be different.
      </div>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Creator Analysis Framework
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Study 3–5 premium creators in your niche. For each creator, analyze their visual choices —
        color palette, lighting, framing, typography, and overall aesthetic. After studying them,
        answer the synthesis questions below to find your visual gap.
      </p>

      {/* Creator Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        {creators.map((creator, idx) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            index={idx}
            isAnalyzing={analyzingId === creator.id}
            analyzeError={analyzeErrors[creator.id]}
            onUpdate={updateCreator}
            onRemove={removeCreator}
            onAnalyze={analyzeCreator}
          />
        ))}

        {/* Add Creator button */}
        <button
          type="button"
          onClick={addCreator}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--dim)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color .15s, color .15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orange)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--orange)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--dim)'
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
          Add Creator
        </button>
      </div>

      {/* Synthesis section */}
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
            marginBottom: '1rem',
          }}
        >
          Creator Analysis — Synthesis
        </div>

        {/* Q1 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What visual patterns appear across multiple premium creators?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_patterns"
            value={watch('vw_ca_patterns')}
            onChange={val => setValue('vw_ca_patterns', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="What are they all doing that clearly works?"
          />
        </div>

        {/* Q2 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What is everyone doing that you want to do differently?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_different"
            value={watch('vw_ca_different')}
            onChange={val => setValue('vw_ca_different', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="Where does the whole space look the same?"
          />
        </div>

        {/* Q3 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What is no one doing that you could own?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_own"
            value={watch('vw_ca_own')}
            onChange={val => setValue('vw_ca_own', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="Your visual white space — what's unclaimed?"
          />
        </div>

        {/* Q4: Gap Statement */}
        <div>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            Your gap statement — how you&apos;ll be visually different from everyone in your space:
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_gap"
            value={watch('vw_ca_gap')}
            onChange={val => setValue('vw_ca_gap', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="My visual identity will stand apart because..."
          />
        </div>
      </div>
    </SectionWrapper>
  )
}

// ---------------------------------------------------------------------------
// CreatorCard sub-component
// ---------------------------------------------------------------------------

interface CreatorCardProps {
  creator: Creator
  index: number
  isAnalyzing: boolean
  analyzeError: string | undefined
  onUpdate: (id: string, field: keyof Creator, value: string) => void
  onRemove: (id: string) => void
  onAnalyze: (id: string) => void
}

function CreatorCard({ creator, index, isAnalyzing, analyzeError, onUpdate, onRemove, onAnalyze }: CreatorCardProps) {
  const hasAnalysis = creator.analyzed && creator.analysis

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
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Avatar placeholder */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--orange-tint, rgba(255,130,50,.1))',
              border: '1px solid var(--orange-border, rgba(255,130,50,.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--orange)',
              flexShrink: 0,
            }}
          >
            {creator.handle ? creator.handle.charAt(0).toUpperCase() : (index + 1).toString()}
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', lineHeight: 1, marginBottom: '2px' }}>
              Creator {index + 1}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {creator.handle ? `@${creator.handle}` : 'No handle yet'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(creator.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--dimmer)',
            fontSize: '18px',
            padding: '2px 6px',
            lineHeight: 1,
          }}
          title="Remove creator"
        >
          ×
        </button>
      </div>

      {/* Handle + Bio + Analyze */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Handle row */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                padding: '0 6px 0 12px',
                fontSize: '14px',
                color: 'var(--dimmer)',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              @
            </span>
            <input
              type="text"
              value={creator.handle}
              onChange={e => onUpdate(creator.id, 'handle', e.target.value)}
              placeholder="username"
              style={{
                border: 'none',
                background: 'transparent',
                paddingLeft: 0,
                flex: 1,
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                padding: '8px 12px 8px 0',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => onAnalyze(creator.id)}
            disabled={isAnalyzing || !creator.handle.trim()}
            style={{
              padding: '8px 14px',
              background: isAnalyzing ? 'var(--surface)' : 'var(--orange)',
              border: '1px solid var(--orange)',
              borderRadius: 'var(--radius-md)',
              color: isAnalyzing ? 'var(--dimmer)' : '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isAnalyzing || !creator.handle.trim() ? 'not-allowed' : 'pointer',
              opacity: !creator.handle.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap',
              transition: 'background .15s',
            }}
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {/* Bio/context input */}
        <input
          type="text"
          value={creator.bio}
          onChange={e => onUpdate(creator.id, 'bio', e.target.value)}
          placeholder="Optional: add context (e.g. wellness coach, minimalist aesthetic)"
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Error display */}
        {analyzeError && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#e53e3e',
              background: 'rgba(229,62,62,.08)',
              border: '1px solid rgba(229,62,62,.2)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
            }}
          >
            {analyzeError}
          </div>
        )}
      </div>

      {/* Analysis results — shown when analyzed */}
      {hasAnalysis && creator.analysis && (
        <div
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--orange)',
              marginBottom: '8px',
            }}
          >
            AI Analysis
          </div>

          {/* Setting, Mood, Lighting badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {[
              { label: 'Setting', value: creator.analysis.setting },
              { label: 'Mood', value: creator.analysis.mood },
              { label: 'Lighting', value: creator.analysis.lighting },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '5px 10px',
                  fontSize: '12px',
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--dimmer)', display: 'block', marginBottom: '2px' }}>
                  {label}
                </span>
                <span style={{ color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Niche */}
          <div style={{ fontSize: '11px', color: 'var(--dim)', marginBottom: '8px', fontStyle: 'italic' }}>
            Niche: {creator.analysis.niche}
          </div>

          {/* Color palette */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--dimmer)' }}>Colors:</span>
            {[creator.analysis.col1, creator.analysis.col2, creator.analysis.col3].map((col, i) => (
              <span
                key={i}
                style={{
                  fontSize: '12px',
                  color: 'var(--text)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3px 8px',
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Premium factors */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--dimmer)', marginBottom: '4px' }}>Premium Factors</div>
            {[creator.analysis.p1, creator.analysis.p2, creator.analysis.p3].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.45, marginBottom: '3px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginTop: '5px', display: 'inline-block' }} />
                {p}
              </div>
            ))}
          </div>

          {/* Gap analysis */}
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--orange)', marginBottom: '4px' }}>Gap</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.5 }}>{creator.analysis.gap}</div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text)', marginBottom: '8px' }}>
          Notes
        </div>
        <textarea
          value={creator.notes}
          onChange={e => onUpdate(creator.id, 'notes', e.target.value)}
          placeholder="Your observations about this creator's visual identity…"
          rows={3}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '12.5px',
            color: 'var(--text)',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: 1.6,
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  )
}
