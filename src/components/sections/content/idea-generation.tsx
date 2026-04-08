'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

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

  const [refreshStatus, setRefreshStatus] = useState<string | null>(null)

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

  const handleRefreshPillars = useCallback(async () => {
    if (!user) return
    setRefreshStatus(null)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('blp_responses')
        .select('responses')
        .eq('user_id', user.id)
        .eq('module_slug', 'brand-foundation')
        .maybeSingle()

      if (!data?.responses) {
        setRefreshStatus('Brand Foundation not found. Enter your pillars below, or complete the Brand Foundation module first for auto-fill.')
        return
      }

      const inp = data.responses as Record<string, string>
      let found = 0
      for (let i = 1; i <= 5; i++) {
        const v = inp[`bf_pillar${i}_name`] || ''
        if (v) {
          ;(setValue as (k: string, v: string) => void)(`ct_ig_pillar${i}`, v)
          found++
        }
      }

      if (found > 0) {
        setRefreshStatus(`✓ ${found} pillar${found === 1 ? '' : 's'} loaded from your Brand Foundation. Edit any below if needed.`)
      } else {
        setRefreshStatus('Brand Foundation found but no pillars defined yet. Enter them in Brand Foundation or type them below.')
      }
    } catch {
      setRefreshStatus('Could not read Brand Foundation data.')
    }
  }, [user, setValue])

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
        For each pillar, add 4 ideas — then expand any idea into 4 specific angles you could
        actually film. One session fills your entire content calendar.
      </p>

      {/* .ins block */}
      <div
        style={{
          borderLeft: '3px solid var(--orange)',
          padding: '11px 15px',
          background: 'var(--orange-tint)',
          marginBottom: '1.1rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--orange-dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          Pillar names auto-load from <Link href="/modules/brand-foundation" style={{ color: 'var(--orange-dark)', textDecoration: 'underline', fontWeight: 700 }}>Brand Foundation</Link> if
          you&apos;ve completed it. Hit ↻ Refresh to pull them in, or type them directly into each
          pillar below.
        </p>
      </div>

      {/* Refresh status */}
      {refreshStatus && (
        <div
          style={{
            fontSize: '12.5px',
            padding: '.55rem .85rem',
            borderRadius: '0 6px 6px 0',
            borderLeft: '3px solid var(--orange)',
            background: 'rgba(241,96,27,.08)',
            marginBottom: '.85rem',
            lineHeight: 1.5,
            color: 'var(--dim)',
          }}
          dangerouslySetInnerHTML={{ __html: refreshStatus }}
        />
      )}

      {/* Refresh button */}
      <button
        type="button"
        onClick={handleRefreshPillars}
        style={{
          fontSize: '11.5px',
          padding: '5px 13px',
          marginBottom: '1rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          fontWeight: 500,
        }}
      >
        ↻ Refresh from Brand Foundation
      </button>

      {/* Pillars 1–5 — collapsible accordions */}
      {[1, 2, 3, 4, 5].map(pillarIdx => (
        <PillarAccordion
          key={pillarIdx}
          pillarIdx={pillarIdx}
          userId={user?.id ?? null}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
        />
      ))}
    </SectionWrapper>
  )
}

/* ─── Pillar Accordion ─── */
function PillarAccordion({
  pillarIdx,
  userId,
  watch,
  setValue,
  getValues,
}: {
  pillarIdx: number
  userId: string | null
  watch: ReturnType<typeof useForm>['watch']
  setValue: ReturnType<typeof useForm>['setValue']
  getValues: ReturnType<typeof useForm>['getValues']
}) {
  const pillarKey = `ct_ig_pillar${pillarIdx}`

  return (
    <details
      className="ig-pacc"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '8px',
        overflow: 'visible',
      }}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          cursor: 'pointer',
          listStyle: 'none',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-num)',
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--orange)',
            opacity: 0.45,
            flexShrink: 0,
            lineHeight: 1,
            minWidth: '36px',
            textAlign: 'center',
            transform: 'translateY(-3px)',
          }}
        >
          {String(pillarIdx).padStart(2, '0')}
        </span>
        <div style={{ flex: 1, minWidth: 0 }} className="ig-inline-input">
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey={pillarKey}
            value={(watch as (k: string) => string)(pillarKey)}
            onChange={val => (setValue as (k: string, v: string) => void)(pillarKey, val)}
            getFullResponses={getValues}
            placeholder="Pillar name…"
          />
        </div>
        <span
          style={{
            fontSize: '10px',
            color: 'var(--dimmer)',
            flexShrink: 0,
            marginLeft: 'auto',
            marginRight: '4px',
          }}
        >
          4 ideas
        </span>
      </summary>

      <div style={{ padding: '4px 10px 10px' }}>
        {[1, 2, 3, 4].map(ideaIdx => (
          <IdeaAccordion
            key={ideaIdx}
            pillarIdx={pillarIdx}
            ideaIdx={ideaIdx}
            userId={userId}
            pillarName={(watch as (k: string) => string)(pillarKey)}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
          />
        ))}
      </div>
    </details>
  )
}

/* ─── Idea Accordion ─── */
function IdeaAccordion({
  pillarIdx,
  ideaIdx,
  userId,
  pillarName,
  watch,
  setValue,
  getValues,
}: {
  pillarIdx: number
  ideaIdx: number
  userId: string | null
  pillarName: string
  watch: ReturnType<typeof useForm>['watch']
  setValue: ReturnType<typeof useForm>['setValue']
  getValues: ReturnType<typeof useForm>['getValues']
}) {
  const ideaKey = `ct_ig_p${pillarIdx}i${ideaIdx}`
  const ideaLabel = ['A', 'B', 'C', 'D'][ideaIdx - 1]
  const [angleCount, setAngleCount] = useState(4)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const ideaValue = (watch as (k: string) => string)(ideaKey)

  useEffect(() => {
    if (ideaValue?.trim() && aiError) setAiError(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaValue])

  async function generateAngles() {
    setAiError(null)
    const idea = (watch as (k: string) => string)(ideaKey)
    if (!idea?.trim()) {
      setAiError('Add an idea title first, then generate angles for it.')
      return
    }
    setAiLoading(true)
    setAiSuggestions([])
    try {
      const ctx = pillarName ? ` (pillar: "${pillarName}")` : ''
      const prompt =
        'You are a social media content strategist. Generate EXACTLY 10 specific content angles for this idea: "' +
        idea.trim() + '"' + ctx +
        '. Each angle should be a punchy hook or take under 10 words — specific enough to film. ' +
        'Output ONLY a numbered list 1 through 10, one per line, no headers, no explanations.'
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 600 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text = data.text || ''
      const lines = text.split('\n')
        .filter((l: string) => /^\d+[\.\)]/.test(l.trim()))
        .map((l: string) => l.replace(/^\d+[\.\)]\s*/, '').trim())
      if (!lines.length) throw new Error('No angles generated')
      setAiSuggestions(lines)
    } catch {
      setAiError('Could not generate angles — try again.')
    } finally {
      setAiLoading(false)
    }
  }

  function addAngle(text: string) {
    for (let a = 1; a <= angleCount; a++) {
      const key = `ct_ig_p${pillarIdx}i${ideaIdx}a${a}`
      const current = (watch as (k: string) => string)(key)
      if (!current?.trim()) {
        ;(setValue as (k: string, v: string) => void)(key, text)
        if (userId) saveField(userId, MODULE_SLUG, key, text)
        return
      }
    }
    // All slots full — add a new one
    const newIdx = angleCount + 1
    setAngleCount(newIdx)
    const key = `ct_ig_p${pillarIdx}i${ideaIdx}a${newIdx}`
    ;(setValue as (k: string, v: string) => void)(key, text)
    if (userId) saveField(userId, MODULE_SLUG, key, text)
  }

  return (
    <details
      className="ig-iacc"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '5px',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          padding: '8px 11px',
          cursor: 'pointer',
          listStyle: 'none',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--orange)',
            flexShrink: 0,
            minWidth: '13px',
          }}
        >
          {ideaLabel}
        </span>
        <div style={{ flex: 1, minWidth: 0 }} className="ig-inline-input">
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey={ideaKey}
            value={(watch as (k: string) => string)(ideaKey)}
            onChange={val => (setValue as (k: string, v: string) => void)(ideaKey, val)}
            getFullResponses={getValues}
            placeholder={`Idea ${ideaLabel}…`}
          />
        </div>
        <span
          style={{
            fontSize: '10px',
            color: 'var(--dimmer)',
            flexShrink: 0,
            marginLeft: 'auto',
            marginRight: '4px',
          }}
        >
          4 angles
        </span>
      </summary>

      <div
        style={{
          padding: '6px 10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {Array.from({ length: angleCount }, (_, i) => i + 1).map(angleIdx => {
          const angleKey = `ct_ig_p${pillarIdx}i${ideaIdx}a${angleIdx}`
          return (
            <WorkshopInput
              key={angleIdx}
              moduleSlug={MODULE_SLUG}
              fieldKey={angleKey}
              value={(watch as (k: string) => string)(angleKey)}
              onChange={val => (setValue as (k: string, v: string) => void)(angleKey, val)}
              getFullResponses={getValues}
              placeholder={`Angle ${angleIdx}…`}
            />
          )
        })}
        <button
          type="button"
          onClick={() => setAngleCount(prev => prev + 1)}
          style={{
            fontSize: '11px',
            color: 'var(--dimmer)',
            background: 'none',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          + Add angle
        </button>

        {/* AI angle generation */}
        <button
          type="button"
          onClick={e => { e.preventDefault(); setAiOpen(!aiOpen) }}
          className="ig-gen-btn"
        >
          ✦ Generate angles with AI
        </button>

        {aiOpen && (
          <div
            style={{
              border: '1px solid var(--orange-border)',
              background: 'var(--orange-tint)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginTop: '6px',
            }}
          >
            <button
              type="button"
              onClick={generateAngles}
              disabled={aiLoading}
              style={{
                width: '100%',
                fontSize: '12px',
                padding: '7px',
                marginBottom: '6px',
                background: 'var(--orange)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: aiLoading ? 'wait' : 'pointer',
                fontFamily: 'var(--font)',
                opacity: aiLoading ? 0.6 : 1,
              }}
            >
              {aiLoading ? 'Generating…' : 'Generate 10 Angles →'}
            </button>

            {aiError && (
              <div style={{ fontSize: '11px', color: '#e53e3e', padding: '3px 0', lineHeight: 1.5 }}>
                {aiError}
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <>
                <div style={{ fontSize: '11px', color: 'var(--dim)', marginBottom: '6px' }}>
                  Click <strong>+ Add</strong> to drop into the next empty angle:
                </div>
                {aiSuggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="ig-ai-idea"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '7px 10px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.45, flex: 1 }}>{s}</span>
                    <button
                      type="button"
                      onClick={() => addAngle(s)}
                      style={{
                        flexShrink: 0,
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--orange)',
                        border: '1px solid var(--orange-border)',
                        background: 'transparent',
                        borderRadius: '6px',
                        padding: '4px 9px',
                        cursor: 'pointer',
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
