'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'launch' as const
const SECTION_INDEX = 3
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function LaunchLeadMagnet() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
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
          if (typeof val === 'string') (setValue as (k: string, v: string) => void)(key, val)
        })
      })
    return () => { cancelled = true }
  }, [user, setValue])

  async function handleGenerateLeadMagnet() {
    const name = getValues('la_lm_name')
    const topic = getValues('la_lm_topic')
    if (!name.trim() && !topic.trim()) return
    setIsGenerating('la_lm_outline')
    try {
      const bigWin = getValues('la_lm_big_win')
      const format = getValues('la_lm_format')
      const bridge = getValues('la_lm_offer_bridge')
      const prompt =
        'You are a personal brand strategist. Create a complete lead magnet outline based on these inputs.\n\nName: ' +
        name +
        '\nTopic/problem it solves: ' +
        topic +
        '\nBig win: ' +
        bigWin +
        '\nFormat: ' +
        format +
        '\nConnection to offer: ' +
        bridge +
        '\n\nProvide:\n1. A refined, punchy name using the formula (if improvement needed)\n2. The introduction/hook section (2-3 sentences that sell them on reading)\n3. Each of the 3-5 sections with a title and 2-3 bullet points of specific, actionable content\n4. A closing CTA section\n5. One shareability tip\n\nBe specific and immediately actionable. No filler. Write as if you are the expert teaching this.'
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 800 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text = data.text || ''
      ;(setValue as (k: string, v: string) => void)('la_lm_outline', text)
      if (user) saveField(user.id, MODULE_SLUG, 'la_lm_outline', text)
    } catch {
      // silent error
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
        Workshop 3
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
        Lead Magnet Creation
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your lead magnet is the bridge between your social media audience and your email list.
        It&apos;s a free resource that delivers one specific outcome in exchange for an email
        address. It sets the tone for everything that follows.
      </p>

      <div
        style={{
          borderLeft: '3px solid var(--orange)',
          padding: '11px 15px',
          background: 'var(--orange-tint)',
          marginBottom: '1.25rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--orange-dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          A great lead magnet does three things:{' '}
          <strong>attracts the right people</strong>, delivers a quick win, and creates desire for
          more. Your lead magnet should deliver ONE specific outcome in 10–20 minutes.
        </p>
      </div>

      {/* Naming Formula */}
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
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--orange)',
            marginBottom: '.75rem',
          }}
        >
          The Naming Formula
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          &ldquo;The [Timeframe] [Format] to [Specific Outcome] Without [Common Objection]&rdquo;
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          My lead magnet name
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_name"
          value={watch('la_lm_name')}
          onChange={val => setValue('la_lm_name', val)}
          getFullResponses={getValues}
          placeholder="e.g. The 10-Minute Brand Audit Checklist to Look Premium Without Expensive Gear"
        />
      </div>

      {/* Lead Magnet Strategy */}
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
            textTransform: 'uppercase',
            letterSpacing: '.13em',
            color: 'var(--orange)',
            marginBottom: '.75rem',
          }}
        >
          Lead Magnet Strategy
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
          Topic — what specific problem does it solve?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.5 }}>
          Must align with one content pillar and lead naturally into your paid offer.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_topic"
          value={watch('la_lm_topic')}
          onChange={val => setValue('la_lm_topic', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="The specific problem your avatar has right now that this solves..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          How it connects to your paid offer
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_offer_bridge"
          value={watch('la_lm_offer_bridge')}
          onChange={val => setValue('la_lm_offer_bridge', val)}
          getFullResponses={getValues}
          placeholder="After getting the quick win here, the natural next step is..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Format
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_format"
          value={watch('la_lm_format')}
          onChange={val => setValue('la_lm_format', val)}
          getFullResponses={getValues}
          columns={3}
          options={[
            { label: 'Checklist', value: 'Checklist' },
            { label: 'Template', value: 'Template' },
            { label: 'Swipe File', value: 'Swipe File' },
            { label: 'Mini-Course', value: 'Mini-Course' },
            { label: 'Resource List', value: 'Resource List' },
            { label: 'Other', value: 'Other' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          The one big win it delivers
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_big_win"
          value={watch('la_lm_big_win')}
          onChange={val => setValue('la_lm_big_win', val)}
          getFullResponses={getValues}
          placeholder="After consuming this, they will be able to..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          The 3–5 sections or steps
        </div>
        <div style={{ marginBottom: '6px' }}>
          <button
            type="button"
            onClick={handleGenerateLeadMagnet}
            disabled={isGenerating === 'la_lm_outline'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: isGenerating === 'la_lm_outline' ? 'var(--dimmer)' : 'var(--orange)',
              background: 'var(--orange-tint)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--orange-border)',
              borderRadius: 'var(--radius-md)',
              cursor: isGenerating === 'la_lm_outline' ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
              opacity: isGenerating === 'la_lm_outline' ? 0.6 : 1,
            }}
          >
            {isGenerating === 'la_lm_outline' ? 'Generating...' : '✦ Generate Outline'}
          </button>
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_outline"
          value={watch('la_lm_outline')}
          onChange={val => setValue('la_lm_outline', val)}
          getFullResponses={getValues}
          rows={3}
          placeholder={'1. \n2. \n3. \n4. \n5.'}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          CTA at the end (what do they do next?)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_cta"
          value={watch('la_lm_cta')}
          onChange={val => setValue('la_lm_cta', val)}
          getFullResponses={getValues}
          placeholder="Book a call, download another resource, apply for the offer..."
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Creation tool
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_tool"
          value={watch('la_lm_tool')}
          onChange={val => setValue('la_lm_tool', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Notion', value: 'Notion' },
            { label: 'Canva', value: 'Canva' },
            { label: 'Google Docs', value: 'Google Docs' },
            { label: 'Loom + Notion', value: 'Loom + Notion' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Delivery method
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_lm_delivery"
          value={watch('la_lm_delivery')}
          onChange={val => setValue('la_lm_delivery', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'ManyChat DM link', value: 'ManyChat DM link' },
            { label: 'Automated email', value: 'Automated email' },
            { label: 'Thank-you page', value: 'Thank-you page' },
            { label: 'Notion page', value: 'Notion page' },
          ]}
        />
      </div>
    </SectionWrapper>
  )
}
