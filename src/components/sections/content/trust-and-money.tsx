'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 5
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function TrustAndMoney() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  // AI generation state — for idea generation (Workshop 7)
  const [isGenerating, setIsGenerating] = useState<string | null>(null) // tracks which idea is being generated (e.g. "1_1" = pillar 1, idea 1)
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
      {/* ─── WORKSHOP 6: TRUST & MONEY ─── */}
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
        Workshop 6
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
        How to turn content into customers
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Content doesn&apos;t sell. Trust sells. Your content is the mechanism for building trust at
        scale. Every piece either deposits into or withdraws from your trust account with your
        audience.
      </p>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The four trust pillars
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '.85rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .5rem' }}><strong style={{ color: 'var(--text)' }}>1. Authority:</strong> You know what you&apos;re talking about. Build it through frameworks, case studies, and specific results — contextual credibility, not general credentials.</p>
        <p style={{ margin: '0 0 .5rem' }}><strong style={{ color: 'var(--text)' }}>2. Relatability:</strong> You&apos;ve been where they are. Share your origin story, failures, and the messy middle. Let them see themselves in you.</p>
        <p style={{ margin: '0 0 .5rem' }}><strong style={{ color: 'var(--text)' }}>3. Admiration:</strong> They want to be where you are. Share wins, transformations, and results. Show what&apos;s possible.</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--text)' }}>4. Unconditional Value:</strong> You give without expectation. Your free content is so good that people feel guilty not buying from you.</p>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Share the knowledge. Sell the execution.
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        Give away everything you know for free. Charge for the implementation. When people go to
        act on what you&apos;ve taught them, they realize execution is overwhelming. That&apos;s
        exactly where your offer comes in. The knowledge is free. The execution is what you sell.
      </div>
      <div
        style={{
          background: 'var(--surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--text)',
          fontWeight: 500,
          lineHeight: 1.7,
        }}
      >
        Free Content → builds awareness + trust → Lead Magnet → captures email, delivers quick win → Low-Ticket ($10–$100) → removes barrier to entry → Mid-Ticket ($500–$5K) → committed buyers → High-Ticket ($10K+) → done-with-you or done-for-you
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The CTA strategy
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Awareness content:</strong> &ldquo;Follow for more&rdquo; or &ldquo;Save this&rdquo;</li>
          <li><strong style={{ color: 'var(--text)' }}>Trust-building content:</strong> &ldquo;Download my free [lead magnet]&rdquo;</li>
          <li><strong style={{ color: 'var(--text)' }}>Authority content:</strong> &ldquo;Join the [community/program]&rdquo;</li>
          <li><strong style={{ color: 'var(--text)' }}>Conversion content:</strong> &ldquo;Apply to work with me&rdquo;</li>
        </ul>
      </div>

      {/* Exercise 23-24 */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
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
          Exercises 23–24 — Offer stack + funnel
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>
          Free content:
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_free"
          value={watch('ct_tm_free')}
          onChange={val => setValue('ct_tm_free', val)}
          getFullResponses={getValues}
          placeholder="e.g. Weekly content tips on Instagram + YouTube"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
          Lead magnet:
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_lead"
          value={watch('ct_tm_lead')}
          onChange={val => setValue('ct_tm_lead', val)}
          getFullResponses={getValues}
          placeholder="e.g. Content Elevation Score quiz — free, captures email"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
          Low-ticket ($10–$100):
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_low"
          value={watch('ct_tm_low')}
          onChange={val => setValue('ct_tm_low', val)}
          getFullResponses={getValues}
          placeholder="e.g. This workbook at $29"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
          Mid-ticket ($500–$5,000):
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_mid"
          value={watch('ct_tm_mid')}
          onChange={val => setValue('ct_tm_mid', val)}
          getFullResponses={getValues}
          placeholder="e.g. Brand Launch Sprint&#8482;"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
          High-ticket ($10,000+):
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_high"
          value={watch('ct_tm_high')}
          onChange={val => setValue('ct_tm_high', val)}
          getFullResponses={getValues}
          placeholder="e.g. Done-for-you premium brand build"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
          Conversion mechanism:
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_conv"
          value={watch('ct_tm_conv')}
          onChange={val => setValue('ct_tm_conv', val)}
          getFullResponses={getValues}
          placeholder="e.g. Sales call / checkout page / DM funnel"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 3px' }}>
          CTA strategy by funnel stage:
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_tm_cta_strat"
          value={watch('ct_tm_cta_strat')}
          onChange={val => setValue('ct_tm_cta_strat', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder={'Awareness: \nTrust-building: \nConversion:'}
        />
      </div>

      {/* ─── WORKSHOP 7: IDEA GENERATION ─── */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginTop: '4rem',
          marginBottom: '.5rem',
        }}
      >
        Workshop 7
      </div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '1rem',
          color: 'var(--text)',
        }}
      >
        Idea Generation
      </h2>
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

      {/* ─── WORKSHOP 8: STORYTELLING ─── */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginTop: '4rem',
          marginBottom: '.5rem',
        }}
      >
        Workshop 8
      </div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '1rem',
          color: 'var(--text)',
        }}
      >
        Storytelling
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        You have 2–3 seconds on short-form, 15–20 on long-form. If you don&apos;t capture attention
        in that window, you&apos;ve lost them forever — and they&apos;ll never see the valuable part.
      </p>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The 4C&apos;s intro (long-form)
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Call Out:</strong> Who is this for? Make it explicit. &quot;If you&apos;re a creator who&apos;s been posting for months without results, this is for you.&quot;</li>
          <li><strong style={{ color: 'var(--text)' }}>Credibility:</strong> Why should they listen to you on this specific topic? Contextual credibility — not general credentials.</li>
          <li><strong style={{ color: 'var(--text)' }}>Compass:</strong> Give them the roadmap. &quot;In this video I&apos;m going to show you the three things making your content look amateur and exactly how to fix them.&quot; Tell them exactly what they&apos;ll learn in this piece.</li>
          <li><strong style={{ color: 'var(--text)' }}>Core Learning:</strong> Give a valuable insight in the first 60 seconds. If they learn something immediately, they&apos;ll assume the rest is just as valuable.</li>
        </ul>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The 3-Step Hook Formula
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.1rem' }}>
        {[
          { num: '01', name: 'Context Lean', desc: 'Establish the topic. Get them leaning in. Just enough context to understand why they should care.' },
          { num: '02', name: 'Scroll Stop', desc: 'Hit them with a contrasting word — But. However. Yet. The pattern interrupt. A sudden gear shift that makes the brain pay attention.' },
          { num: '03', name: 'Contrarian Snapback', desc: 'Go the opposite direction. Challenge their assumption. Create a curiosity gap. Make them need to know what\'s next.' },
        ].map(({ num, name, desc }) => (
          <div
            key={num}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '32px',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                flexShrink: 0,
                opacity: 0.5,
              }}
            >
              {num}
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: 'var(--orange)',
                  marginBottom: '3px',
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--text)',
          fontWeight: 500,
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}
      >
        &ldquo;Most creators spend hours on content that gets zero engagement... BUT it&apos;s not
        because their content is bad. It&apos;s because they&apos;re solving the wrong problem.&rdquo;
      </div>

      <div
        style={{
          padding: '.75rem 1rem',
          background: 'var(--surface)',
          borderLeft: '3px solid var(--orange)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.6,
        }}
      >
        Visual hooks are 100× more powerful than spoken hooks alone. Motion + text on screen +
        spoken word = three simultaneous pattern interrupts.{' '}
        <strong style={{ color: 'var(--text)' }}>Rule:</strong>{' '}
        3–5 words max on screen, bold sans-serif, high contrast, first 2 seconds.
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The Five-Part Story Framework
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        Every great piece of content follows a structure. The hook (using your 3-step formula) grabs attention. The problem sets
        the stakes. The journey is the messy middle most creators skip. The lesson is your expertise
        made actionable. The CTA tells them what&apos;s next. Build one complete story below.
      </div>

      {/* Story Builder */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.25rem',
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
          Story Builder — 4 C&apos;s + Hook Formula + Five-Part Framework
        </div>
        <div
          style={{
            marginBottom: '1rem',
            padding: '.75rem 1rem',
            background: 'var(--orange-tint)',
            borderLeft: '3px solid var(--orange)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontSize: '12.5px',
            color: 'var(--dim)',
            lineHeight: 1.6,
          }}
        >
          Start with your 4 C&apos;s intro (Call Out, Credibility, Compass, Core Learning), then
          build your full story using the 3-step hook and five-part framework below.
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>
          Content idea (what&apos;s this piece about?):
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_idea"
          value={watch('ct_story_idea')}
          onChange={val => setValue('ct_story_idea', val)}
          getFullResponses={getValues}
          placeholder="e.g. Why most creators never make money from content"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '12px 0 3px' }}>
          ① Hook — Write your full hook (context lean → scroll stop → contrarian angle):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_hook"
          value={watch('ct_story_hook')}
          onChange={val => setValue('ct_story_hook', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="e.g. Most creators spend hours on content that gets zero engagement... BUT it's not because their content is bad. It's because they're solving the wrong problem."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ② Problem — Set the stakes (specific and relatable conflict):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_prob"
          value={watch('ct_story_prob')}
          onChange={val => setValue('ct_story_prob', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="What's the problem they recognize? Make it specific and painful..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ③ Journey — The messy middle (low points, mistakes, real struggle — don&apos;t skip this):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_journey"
          value={watch('ct_story_journey')}
          onChange={val => setValue('ct_story_journey', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder="What did you go through to find the answer? The struggle is what makes it real..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ④ Lesson — Actionable takeaway (the insight tied to your expertise):
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_lesson"
          value={watch('ct_story_lesson')}
          onChange={val => setValue('ct_story_lesson', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="What's the one thing they should walk away knowing or doing?"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 3px' }}>
          ⑤ CTA — What do they do next?
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="ct_story_cta"
          value={watch('ct_story_cta')}
          onChange={val => setValue('ct_story_cta', val)}
          getFullResponses={getValues}
          placeholder="Save this. Follow for more. Book a call. Download the guide..."
        />
      </div>
    </SectionWrapper>
  )
}
