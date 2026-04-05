'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 7
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function IdeaGeneration() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  // AI generation state — tracks which idea is being generated (e.g. "1_1" = pillar 1, idea 1)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

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

  /**
   * AI generation handler — generates 4 content angles for a given idea.
   * Calls /api/claude, populates individual angle fields a1–a4.
   * Auto-save fires naturally on each setValue call per D-06.
   *
   * @param pillarIdx — 1-5
   * @param ideaIdx   — 1-4
   */
  async function handleGenerateAngles(pillarIdx: number, ideaIdx: number) {
    const ideaKey = `ct_ig_p${pillarIdx}i${ideaIdx}`
    const pillarKey = `ct_ig_pillar${pillarIdx}`
    const generateKey = `${pillarIdx}_${ideaIdx}`

    const idea = (getValues() as Record<string, string>)[ideaKey] || ''
    const pillarName = (getValues() as Record<string, string>)[pillarKey] || ''

    if (!idea.trim()) {
      setGenerateError('Add an idea title first, then generate angles for it.')
      return
    }

    setIsGenerating(generateKey)
    setGenerateError(null)

    try {
      const ctx = pillarName ? ` (pillar: "${pillarName}")` : ''
      const prompt = `You are a social media content strategist. Generate EXACTLY 4 specific content angles for this idea: "${idea}"${ctx}. Each angle should be a punchy hook or take under 10 words — specific enough to film. Output ONLY 4 lines, one angle per line, no numbers, no headers, no explanations.`

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 300 }),
      })

      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const text: string = data.text || data.content || ''
      if (text) {
        // D-06: setValue triggers useAutoSave 5s debounce naturally.
        // Parse into 4 individual angle fields.
        const lines = text.split('\n').filter((l: string) => l.trim())
        const updates: Record<string, string> = {}
        for (let a = 0; a < 4; a++) {
          const angleKey = `ct_ig_p${pillarIdx}i${ideaIdx}a${a + 1}`
          const val = lines[a] || ''
          ;(setValue as (k: string, v: string) => void)(angleKey, val)
          updates[angleKey] = val
        }
        if (user) {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(supabase as any).rpc('merge_responses', {
            p_user_id: user.id,
            p_module_slug: MODULE_SLUG,
            p_data: updates,
          })
        }
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(null)
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
      {/* ─── WORKSHOP 7: IDEA GENERATION ─── */}
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
        Workshop 7
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
        Idea Generation
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        For each pillar, add 4 ideas — then generate 10 specific content angles for any idea with
        AI. One session fills your entire content calendar.
      </p>
      <div
        style={{
          padding: '.55rem .85rem',
          borderRadius: '0 6px 6px 0',
          borderLeft: '3px solid var(--orange)',
          background: 'rgba(241,96,27,.08)',
          marginBottom: '1.25rem',
          fontSize: '12.5px',
          color: 'var(--dim)',
          lineHeight: 1.5,
        }}
      >
        Pillar names can be filled in from your Brand Foundation module. Enter each pillar name
        below, then add 4 ideas per pillar. Use the <strong style={{ color: 'var(--orange)' }}>Generate angles with AI</strong> button
        on any idea to get 10 specific content angles instantly.
      </div>

      {/* AI error display */}
      {generateError && (
        <div
          style={{
            padding: '.65rem .85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,.1)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(239,68,68,.25)',
            marginBottom: '1rem',
            fontSize: '12.5px',
            color: '#ef4444',
          }}
        >
          {generateError}
        </div>
      )}

      {/* Pillars 1–5 */}
      {[1, 2, 3, 4, 5].map(pillarIdx => (
        <div
          key={pillarIdx}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
          }}
        >
          {/* Pillar header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--orange)',
                opacity: 0.6,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {String(pillarIdx).padStart(2, '0')}
            </span>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey={`ct_ig_pillar${pillarIdx}`}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value={(watch as any)(`ct_ig_pillar${pillarIdx}`) as string}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={val => (setValue as any)(`ct_ig_pillar${pillarIdx}`, val)}
              getFullResponses={getValues}
              placeholder="Pillar name…"
            />
          </div>

          {/* Ideas A–D */}
          {[1, 2, 3, 4].map(ideaIdx => {
            const ideaKey = `ct_ig_p${pillarIdx}i${ideaIdx}` as Parameters<typeof setValue>[0]
            const genKey = `${pillarIdx}_${ideaIdx}`
            const isThisGenerating = isGenerating === genKey
            const ideaLabel = ['A', 'B', 'C', 'D'][ideaIdx - 1]

            return (
              <div
                key={ideaIdx}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '.85rem 1rem',
                  marginBottom: ideaIdx < 4 ? '8px' : 0,
                }}
              >
                {/* Idea label + input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--orange)',
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      flexShrink: 0,
                      width: '14px',
                    }}
                  >
                    {ideaLabel}
                  </span>
                  <WorkshopInput
                    moduleSlug={MODULE_SLUG}
                    fieldKey={ideaKey}
                    value={watch(ideaKey)}
                    onChange={val => setValue(ideaKey, val)}
                    getFullResponses={getValues}
                    placeholder={`Idea ${ideaLabel}…`}
                  />
                </div>

                {/* Generate angles with AI button */}
                <div style={{ marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateAngles(pillarIdx, ideaIdx)}
                    disabled={isThisGenerating}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isThisGenerating ? 'var(--dimmer)' : 'var(--orange)',
                      background: 'var(--orange-tint)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--orange-border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: isThisGenerating ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {isThisGenerating ? 'Generating…' : 'Generate angles with AI'}
                  </button>
                </div>

                {/* 4 individual angle inputs in a 2x2 grid */}
                <div
                  className="grid-form"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                  }}
                >
                  {[1, 2, 3, 4].map(angleIdx => {
                    const angleKey = `ct_ig_p${pillarIdx}i${ideaIdx}a${angleIdx}` as Parameters<typeof setValue>[0]
                    return (
                      <div key={angleIdx}>
                        <div
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            color: 'var(--dimmer)',
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                            marginBottom: '3px',
                          }}
                        >
                          Angle {angleIdx}
                        </div>
                        <WorkshopInput
                          moduleSlug={MODULE_SLUG}
                          fieldKey={angleKey}
                          value={(watch as (k: string) => string)(angleKey)}
                          onChange={val => (setValue as (k: string, v: string) => void)(angleKey, val)}
                          getFullResponses={getValues}
                          placeholder={`Angle ${angleIdx}…`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </SectionWrapper>
  )
}
