'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'launch' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function LaunchFunnel() {
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
          fontFamily: 'var(--font-num)',
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-.01em',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        Your Funnel
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Most creators think they have an audience problem. They think they need more followers. But
        the real problem is they have no system to capture the attention they&apos;re already
        generating. This module fixes that.
      </p>

      {/* Call-out */}
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
          Once it&apos;s built, it runs automatically. You create content. Content drives people
          into the funnel. The funnel converts them into buyers.{' '}
          <strong>You wake up to sales.</strong>
        </p>
      </div>

      {/* The Five Stages */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The Five Stages
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.25rem' }}>
        {[
          {
            num: '01',
            title: 'Content — Awareness',
            desc: 'Every piece of content has one job: drive people to the next stage. Your CTA should point to your lead magnet. Not your offer. Not your website. Your lead magnet. Asking someone who just discovered you to buy something is like proposing on a first date.',
          },
          {
            num: '02',
            title: 'Lead Magnet — Capture',
            desc: 'A free resource that delivers one specific outcome in exchange for an email address. This is where you convert a follower (who you don\'t own) into an email subscriber (who you do). Email has 40x higher ROI than social media and converts at 3–5x the rate.',
          },
          {
            num: '03',
            title: 'Newsletter — Relationship',
            desc: 'Not a promotional email. Pure value delivery. Every newsletter should make your subscriber feel like they\'re getting more than they paid for. Give so much value that people feel guilty not buying from you.',
          },
          {
            num: '04',
            title: 'Offer — Conversion',
            desc: 'After someone has consumed your content, downloaded your lead magnet, and read your newsletter — they trust you. Now you can make an offer. By this stage, the sale should feel obvious.',
          },
          {
            num: '05',
            title: 'Customer — Retention',
            desc: 'The sale is not the end. A customer who gets results becomes a testimonial. A testimonial becomes social proof. Social proof drives more people into the top of your funnel. Deliver so much value that your customers become your best marketers.',
          },
        ].map(({ num, title, desc }) => (
          <div
            key={num}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '.9rem 1rem',
              background: 'var(--surface)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '36px',
                fontWeight: 900,
                color: 'var(--orange)',
                opacity: 0.25,
                lineHeight: 1,
              }}
            >
              {num}
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: 'var(--orange)',
                  marginBottom: '3px',
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel Map */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Your Funnel Map
      </h2>
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
          Document Your Complete Funnel
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
              Content platform(s)
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_platforms"
              value={watch('la_funnel_platforms')}
              onChange={val => setValue('la_funnel_platforms', val)}
              getFullResponses={getValues}
              placeholder="Instagram, YouTube, TikTok..."
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
              Lead magnet name
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_lead_magnet"
              value={watch('la_funnel_lead_magnet')}
              onChange={val => setValue('la_funnel_lead_magnet', val)}
              getFullResponses={getValues}
              placeholder="The [Timeframe] [Format] to [Outcome]..."
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
              Email platform
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_email_platform"
              value={watch('la_funnel_email_platform')}
              onChange={val => setValue('la_funnel_email_platform', val)}
              getFullResponses={getValues}
              placeholder="Kit, Flodesk, Beehiiv, Mailchimp..."
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
              Newsletter frequency{' '}
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--orange)', opacity: 0.8 }}>
                — 2x/week recommended
              </span>
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_newsletter_freq"
              value={watch('la_funnel_newsletter_freq')}
              onChange={val => setValue('la_funnel_newsletter_freq', val)}
              getFullResponses={getValues}
              placeholder="Weekly, bi-weekly..."
            />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
              Content CTA
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_cta"
              value={watch('la_funnel_cta')}
              onChange={val => setValue('la_funnel_cta', val)}
              getFullResponses={getValues}
              placeholder="[Benefit] — [lead magnet name] is free. Link in bio."
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
              Primary offer
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_offer"
              value={watch('la_funnel_offer')}
              onChange={val => setValue('la_funnel_offer', val)}
              getFullResponses={getValues}
              placeholder="Your paid product or service..."
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
              Offer price point
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_price"
              value={watch('la_funnel_price')}
              onChange={val => setValue('la_funnel_price', val)}
              getFullResponses={getValues}
              placeholder="$97, $500/mo, $5,000..."
            />

            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
              Conversion mechanism
            </div>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_funnel_conversion"
              value={watch('la_funnel_conversion')}
              onChange={val => setValue('la_funnel_conversion', val)}
              getFullResponses={getValues}
              placeholder="Sales call, checkout page, DM..."
            />
          </div>
        </div>
      </div>

      {/* Funnel Audit */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Funnel Audit
      </h2>
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
          Where Are You Now?
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Do I have a lead magnet?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_funnel_has_lm"
          value={watch('la_funnel_has_lm')}
          onChange={val => setValue('la_funnel_has_lm', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: "Yes — it's working well", value: "Yes — it's working well" },
            { label: "Yes — but not converting", value: "Yes — but not converting" },
            { label: "No — I need to create one", value: "No — I need to create one" },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Do I have an email list?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_funnel_has_email"
          value={watch('la_funnel_has_email')}
          onChange={val => setValue('la_funnel_has_email', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: "Yes — actively growing", value: "Yes — actively growing" },
            { label: "Yes — but not emailing them", value: "Yes — but not emailing them" },
            { label: "No — I need to start one", value: "No — I need to start one" },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Do I have a clear offer?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_funnel_has_offer"
          value={watch('la_funnel_has_offer')}
          onChange={val => setValue('la_funnel_has_offer', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: "Yes — clearly defined and priced", value: "Yes — clearly defined and priced" },
            { label: "Somewhat — unclear or inconsistent", value: "Somewhat — unclear or inconsistent" },
            { label: "No — I need to define it", value: "No — I need to define it" },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Where is my funnel broken?
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="la_funnel_broken"
          value={watch('la_funnel_broken')}
          onChange={val => setValue('la_funnel_broken', val)}
          getFullResponses={getValues}
          rows={2}
          placeholder="Be honest. This is your starting point."
        />
      </div>
    </SectionWrapper>
  )
}
