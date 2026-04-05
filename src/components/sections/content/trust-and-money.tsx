'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 6
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function TrustAndMoney() {
  const { user } = useAuth()
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
          border: '1px solid var(--orange-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '.9rem 1.2rem',
          background: 'var(--orange-tint)',
          marginBottom: '1.1rem',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--orange-dark)', lineHeight: 1.75, margin: 0 }}>
          Free Content → builds awareness + trust → Lead Magnet → captures email, delivers quick win → Low-Ticket ($10–$100) → removes barrier to entry → Mid-Ticket ($500–$5K) → committed buyers → High-Ticket ($10K+) → done-with-you or done-for-you
        </p>
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
    </SectionWrapper>
  )
}
