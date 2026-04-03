'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 4
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

const VALUES_COUNT = 6

// Audit categories
const AUDIT_CATEGORIES = [
  {
    id: 'vc',
    label: 'Values Check',
    scoreId: 'vcScore',
    items: [
      { key: 'bf_audit_vc1', question: 'My stated core values are clearly visible in my content and how I show up online.' },
      { key: 'bf_audit_vc2', question: 'I make decisions in my brand work that reflect my values, even when it costs me reach or revenue.' },
      { key: 'bf_audit_vc3', question: 'My audience could describe my values based on what they see from me — without me ever naming them.' },
    ],
  },
  {
    id: 'pc',
    label: 'Principles Check',
    scoreId: 'pcScore',
    items: [
      { key: 'bf_audit_pc1', question: 'My content creation principles (how, when, and why I create) are consistent and intentional.' },
      { key: 'bf_audit_pc2', question: 'I hold myself to the same standards I teach or advocate for in my niche.' },
      { key: 'bf_audit_pc3', question: 'The way I operate my brand (collaboration, communication, quality) aligns with my stated principles.' },
    ],
  },
  {
    id: 'cq',
    label: 'Content Questions',
    scoreId: 'cqScore',
    items: [
      { key: 'bf_audit_cq1', question: 'My content topics directly reflect the values and principles I have identified for my brand.' },
      { key: 'bf_audit_cq2', question: 'I regularly create content that challenges my audience to think or act in alignment with the values I stand for.' },
      { key: 'bf_audit_cq3', question: 'Looking at my last 10 posts, a stranger could identify my core values from the themes alone.' },
    ],
  },
  {
    id: 'ts',
    label: 'Tough Situations',
    scoreId: 'tsScore',
    items: [
      { key: 'bf_audit_ts1', question: 'When a trending topic conflicts with my values, I hold my ground rather than chase engagement.' },
      { key: 'bf_audit_ts2', question: 'I have navigated criticism or controversy in a way that stayed true to my brand values.' },
      { key: 'bf_audit_ts3', question: 'Under pressure (launch season, burnout, controversy), my content and decisions still reflect who I say I am.' },
    ],
  },
] as const

const SCORE_OPTIONS = [0, 2, 4] as const
const CATEGORY_MAX = 10 // displayed max per category (matching old app)

export default function CoreValues() {
  const { user } = useAuth()
  const [auditOpen, setAuditOpen] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

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
          if (typeof val === "string") (setValue as (k: string, v: string) => void)(key, val)
        })
      })
    return () => { cancelled = true }
  }, [user, setValue])

  // responses typed as Record<string, string> via cast for dynamic key access
  const responses = watch() as Record<string, string>

  // Watch audit fields for auto-save (immediate on selection)
  // Read via responses (already typed as Record<string, string>)
  const auditValues = AUDIT_CATEGORIES.flatMap(cat => cat.items.map(item => responses[item.key] ?? ''))

  useEffect(() => {
    if (!user) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const allResponses = getValues() as Record<string, string>
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any)
        .from('blp_responses')
        .upsert(
          { user_id: user.id, module_slug: MODULE_SLUG, responses: allResponses },
          { onConflict: 'user_id,module_slug' }
        )
        .then(() => {/* silent save */})
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ...auditValues])

  // Compute category scores via responses (Record<string, string> — dynamic key safe)
  const vcScore = ['vc1', 'vc2', 'vc3'].reduce((sum, k) => sum + (Number(responses[`bf_audit_${k}`]) || 0), 0)
  const pcScore = ['pc1', 'pc2', 'pc3'].reduce((sum, k) => sum + (Number(responses[`bf_audit_${k}`]) || 0), 0)
  const cqScore = ['cq1', 'cq2', 'cq3'].reduce((sum, k) => sum + (Number(responses[`bf_audit_${k}`]) || 0), 0)
  const tsScore = ['ts1', 'ts2', 'ts3'].reduce((sum, k) => sum + (Number(responses[`bf_audit_${k}`]) || 0), 0)
  const totalScore = vcScore + pcScore + cqScore + tsScore

  const categoryScores = { vc: vcScore, pc: pcScore, cq: cqScore, ts: tsScore }

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
        Workshop 4
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
        Core Values
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '.5rem',
        }}
      >
        Your Avatar tells you <em>who</em> you&apos;re speaking to. Your Core Mission tells
        you <em>why</em> you&apos;re creating. Your Core Values tell you{' '}
        <em>how</em> you show up.
      </p>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        Core values are the guiding principles that shape the way you create,
        communicate, and connect. They&apos;re the guardrails that keep your brand
        authentic and aligned, no matter what trends come and go. With them, you
        build consistency, trust, and integrity in your personal brand.
      </p>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '0.85rem',
          }}
        >
          Ask Yourself These Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '7px' }}>
          {[
            'What principles guide my creativity and decision-making?',
            'What qualities do I want my brand to always reflect?',
            "What do I stand for, even if it's not popular or trendy?",
            'What do I want people to feel when they interact with my content?',
            'What traits do I admire most in the creators, brands, or mentors I look up to?',
            'What do I refuse to compromise on in my work or lifestyle?',
            "When I'm at my best, what values am I living out?",
          ].map((q, i) => (
            <div
              key={i}
              style={{
                fontSize: '13px',
                color: 'var(--dim)',
                paddingLeft: '14px',
                position: 'relative' as const,
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  position: 'absolute' as const,
                  left: 0,
                  color: 'var(--orange)',
                  fontWeight: 700,
                }}
              >
                →
              </span>
              {q}
            </div>
          ))}
        </div>
      </div>

      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--dimmer)',
          marginBottom: '1rem',
        }}
      >
        Your Values{' '}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 400,
            color: 'var(--dimmer)',
            textTransform: 'none',
            letterSpacing: 0,
          }}
        >
          (aim for 6)
        </span>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '1.5rem' }}>
        {Array.from({ length: VALUES_COUNT }, (_, i) => i + 1).map(n => (
          <div
            key={n}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '1.3rem',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                flexShrink: 0,
                paddingTop: '6px',
              }}
            >
              {n}
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <div style={{ flex: '0 0 160px' }}>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_val${n}_name`}
                  value={watch(`bf_val${n}_name` as keyof ReturnType<typeof watch>)}
                  onChange={val => setValue(`bf_val${n}_name` as keyof ReturnType<typeof watch>, val)}
                  getFullResponses={getValues}
                  placeholder="Value name"
                />
              </div>
              <div style={{ flex: 1 }}>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_val${n}_practice`}
                  value={watch(`bf_val${n}_practice` as keyof ReturnType<typeof watch>)}
                  onChange={val => setValue(`bf_val${n}_practice` as keyof ReturnType<typeof watch>, val)}
                  getFullResponses={getValues}
                  placeholder="short description of what it means to you..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--dimmer)',
            marginBottom: '0.85rem',
          }}
        >
          Example — Mine
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
          {[
            ['Adventure', 'seeking the unknown, creatively and physically'],
            ['Ownership', 'taking control of your path and results'],
            ['Authenticity', 'showing the real story, not just the highlight reel'],
            ['Craft', 'commitment to intentional, high-quality work'],
            ['Freedom', 'designing life and business on your own terms'],
            ['Clarity', 'cutting through the noise with structure and purpose'],
          ].map(([name, desc]) => (
            <div key={name} style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>{name}</strong> — {desc}
            </div>
          ))}
        </div>
      </div>

      {/* Values Audit */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '1.75rem',
        }}
      >
        {/* Audit header / toggle */}
        <button
          onClick={() => setAuditOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'var(--card)',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left' as const,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '3px',
              }}
            >
              Self-Assessment
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              Values Audit
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--dim)',
                marginTop: '2px',
              }}
            >
              Score how well your brand currently lives your values — 4 categories, 12 questions
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              gap: '2px',
              flexShrink: 0,
              marginLeft: '1rem',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '1.75rem',
                fontWeight: 900,
                color: totalScore > 0 ? 'var(--orange)' : 'var(--dimmer)',
                lineHeight: 1,
              }}
            >
              {totalScore}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--dimmer)' }}>/40</div>
            <div
              style={{
                fontSize: '18px',
                color: 'var(--dimmer)',
                marginTop: '4px',
                transform: auditOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              ▾
            </div>
          </div>
        </button>

        {/* Audit body */}
        {auditOpen && (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {/* Category cards */}
            {AUDIT_CATEGORIES.map(cat => {
              const catScore = categoryScores[cat.id as keyof typeof categoryScores]
              return (
                <div
                  key={cat.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}
                >
                  {/* Category header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--orange)' }}>
                      {catScore}/{CATEGORY_MAX}
                    </div>
                  </div>

                  {/* Questions */}
                  <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                    {cat.items.map(item => {
                      const currentVal = String(responses[item.key] || '')
                      return (
                        <div key={item.key} style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                          <div style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.6 }}>
                            {item.question}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' as const }}>
                            {SCORE_OPTIONS.map(pts => (
                              <button
                                key={pts}
                                onClick={() => (setValue as (k: string, v: string) => void)(item.key, String(pts))}
                                style={{
                                  padding: '4px 14px',
                                  borderRadius: '4px',
                                  border: '1px solid',
                                  borderColor: currentVal === String(pts) ? 'var(--orange)' : 'var(--border)',
                                  background: currentVal === String(pts) ? 'var(--orange)' : 'transparent',
                                  color: currentVal === String(pts) ? '#fff' : 'var(--dim)',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                title={pts === 0 ? 'Not at all' : pts === 2 ? 'Sometimes' : 'Consistently'}
                              >
                                {pts}
                              </button>
                            ))}
                            <div style={{ fontSize: '11px', color: 'var(--dimmer)', marginLeft: '4px' }}>
                              0 = Not at all &nbsp;·&nbsp; 2 = Sometimes &nbsp;·&nbsp; 4 = Consistently
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* SVG Bar Chart Summary */}
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--card)',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dimmer)', marginBottom: '1rem' }}>
                Your Score Summary
              </div>

              <svg
                width="100%"
                viewBox="0 0 400 120"
                style={{ display: 'block', overflow: 'visible' }}
                aria-label="Values Audit score chart"
              >
                {AUDIT_CATEGORIES.map((cat, idx) => {
                  const catScore = categoryScores[cat.id as keyof typeof categoryScores]
                  const barMaxWidth = 270
                  const barWidth = Math.min(catScore / CATEGORY_MAX, 1) * barMaxWidth
                  const y = idx * 28
                  return (
                    <g key={cat.id}>
                      {/* Label */}
                      <text
                        x={0}
                        y={y + 14}
                        fontSize={11}
                        fill="var(--dim)"
                        fontWeight={600}
                      >
                        {cat.label}
                      </text>
                      {/* Bar background */}
                      <rect
                        x={120}
                        y={y + 4}
                        width={barMaxWidth}
                        height={14}
                        rx={4}
                        fill="var(--border)"
                      />
                      {/* Bar fill */}
                      <rect
                        x={120}
                        y={y + 4}
                        width={barWidth}
                        height={14}
                        rx={4}
                        fill="var(--orange)"
                        style={{ transition: 'width 0.3s ease' }}
                      />
                      {/* Score label */}
                      <text
                        x={400}
                        y={y + 14}
                        fontSize={11}
                        fill="var(--orange)"
                        fontWeight={700}
                        textAnchor="end"
                      >
                        {catScore}/{CATEGORY_MAX}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-num)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--orange)',
                    lineHeight: 1,
                  }}
                >
                  {totalScore}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--dimmer)' }}>/40</span>
                <span style={{ fontSize: '12px', color: 'var(--dim)', marginLeft: '8px' }}>
                  {totalScore >= 32 ? 'Strong alignment — your values show up in your brand.' :
                   totalScore >= 20 ? 'Good foundation — some areas to strengthen.' :
                   totalScore >= 8 ? 'Room to grow — focus on consistency first.' :
                   'Just starting — your values audit score will rise as you build.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
