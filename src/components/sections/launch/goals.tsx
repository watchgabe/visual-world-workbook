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
const SECTION_INDEX = 6
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

// Calendar day definitions from old HTML
const CALENDAR_DAYS = [
  { num: '01', title: 'The Tease', sub: 'Build anticipation. Create curiosity.' },
  { num: '02', title: 'The Why', sub: 'The honest story behind the decision.' },
  { num: '03', title: 'The Before/After', sub: 'Show the transformation. Visual proof.' },
  { num: '04', title: 'The Announcement', sub: 'Official relaunch. New brand. Same mission.' },
  { num: '05', title: 'Premium Content #1', sub: 'Let the new brand speak for itself. Pure value.' },
  { num: '06', title: 'Premium Content #2', sub: 'Continue building trust. Show your expertise.' },
  { num: '07', title: 'Premium Content #3 + Offer CTA', sub: 'End launch week with your strongest content. Close with a clear offer.' },
] as const

export default function LaunchGoals() {
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

  function setDate() {
    const d = new Date()
    d.setDate(d.getDate() + 90)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const formatted = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
    ;(setValue as (k: string, v: string) => void)('la_goal_review_date', formatted)
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
        Workshop 6
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
        90-Day Goals
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your launch is not the finish line — it&apos;s the starting line. The creators who build
        lasting brands are not the most talented. They&apos;re the most consistent. Set your 90-day
        goals now, before the momentum fades.
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
          Specific goals create specific outcomes. Vague goals create vague results. Write your
          goals as if the 90 days have already passed — what will have happened?
        </p>
      </div>

      {/* Launch Week Calendar */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Your Launch Week Calendar
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
        {CALENDAR_DAYS.map((day, i) => {
          const idx = i + 1
          const platformKey = `la_cal${idx}_platform` as const
          const typeKey = `la_cal${idx}_type` as const
          const hookKey = `la_cal${idx}_hook` as const
          const dateKey = `la_cal${idx}_date` as const
          const doneKey = `la_cal${idx}_done` as const

          return (
            <div
              key={day.num}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              {/* Day header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'var(--surface)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-num)',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: 'var(--orange)',
                    lineHeight: 1,
                  }}
                >
                  {day.num}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {day.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dimmer)' }}>{day.sub}</div>
                </div>
              </div>

              {/* Day body */}
              <div style={{ padding: '.85rem 1rem', background: 'var(--card)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                      Platform
                    </div>
                    <WorkshopInput
                      moduleSlug={MODULE_SLUG}
                      fieldKey={platformKey}
                      value={watch(platformKey)}
                      onChange={val => setValue(platformKey, val)}
                      getFullResponses={getValues}
                      placeholder="Instagram, TikTok..."
                    />
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
                      {idx <= 4 ? 'Content type' : 'Topic'}
                    </div>
                    <WorkshopInput
                      moduleSlug={MODULE_SLUG}
                      fieldKey={typeKey}
                      value={watch(typeKey)}
                      onChange={val => setValue(typeKey, val)}
                      getFullResponses={getValues}
                      placeholder={idx <= 4 ? 'Reel, carousel, story...' : 'Your content pillar topic...'}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                      Hook
                    </div>
                    <WorkshopInput
                      moduleSlug={MODULE_SLUG}
                      fieldKey={hookKey}
                      value={watch(hookKey)}
                      onChange={val => setValue(hookKey, val)}
                      getFullResponses={getValues}
                      placeholder="Your hook..."
                    />
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
                      Schedule for
                    </div>
                    <WorkshopInput
                      moduleSlug={MODULE_SLUG}
                      fieldKey={dateKey}
                      value={watch(dateKey)}
                      onChange={val => setValue(dateKey, val)}
                      getFullResponses={getValues}
                      placeholder="e.g. Mon March 24, 7am"
                    />
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
                  Caption written + content created?
                </div>
                <OptionSelector
                  moduleSlug={MODULE_SLUG}
                  fieldKey={doneKey}
                  value={watch(doneKey)}
                  onChange={val => setValue(doneKey, val)}
                  getFullResponses={getValues}
                  columns={2}
                  options={[
                    { label: 'Caption written', value: 'Caption written' },
                    { label: 'Content filmed', value: 'Content filmed' },
                  ]}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* 90-Day Goals Grid */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Your 90-Day Goals
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '1.25rem',
        }}
      >
        {/* Content Goals */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '.85rem',
          }}
        >
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--orange)',
              marginBottom: '6px',
            }}
          >
            Content Goals
          </div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
            Posts per week
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_content_freq"
            value={watch('la_goal_content_freq')}
            onChange={val => setValue('la_goal_content_freq', val)}
            getFullResponses={getValues}
            placeholder="e.g. 5x/week"
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            Platforms
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_content_platforms"
            value={watch('la_goal_content_platforms')}
            onChange={val => setValue('la_goal_content_platforms', val)}
            getFullResponses={getValues}
            placeholder="Instagram, TikTok, YouTube..."
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            My 90-day content goal
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_content"
            value={watch('la_goal_content')}
            onChange={val => setValue('la_goal_content', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="By [date], I will have published [X] pieces across [platforms] consistently."
          />
        </div>

        {/* Audience Goals */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '.85rem',
          }}
        >
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--orange)',
              marginBottom: '6px',
            }}
          >
            Audience Goals
          </div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
            Follower goal (primary platform)
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_followers"
            value={watch('la_goal_followers')}
            onChange={val => setValue('la_goal_followers', val)}
            getFullResponses={getValues}
            placeholder="Current: X → Target: Y"
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            Email list goal
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_email"
            value={watch('la_goal_email')}
            onChange={val => setValue('la_goal_email', val)}
            getFullResponses={getValues}
            placeholder="Current: X → Target: Y"
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            My 90-day audience goal
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_audience"
            value={watch('la_goal_audience')}
            onChange={val => setValue('la_goal_audience', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="By [date], I will have grown my [platform] from [current] to [target] and my email list from [current] to [target]."
          />
        </div>

        {/* Revenue Goals */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '.85rem',
          }}
        >
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--orange)',
              marginBottom: '6px',
            }}
          >
            Revenue Goals
          </div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
            Primary offer + price
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_offer"
            value={watch('la_goal_offer')}
            onChange={val => setValue('la_goal_offer', val)}
            getFullResponses={getValues}
            placeholder="e.g. 1:1 coaching at $2,000"
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            Sales target
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_sales"
            value={watch('la_goal_sales')}
            onChange={val => setValue('la_goal_sales', val)}
            getFullResponses={getValues}
            placeholder="e.g. 5 clients = $10,000"
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            My 90-day revenue goal
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_revenue"
            value={watch('la_goal_revenue')}
            onChange={val => setValue('la_goal_revenue', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="By [date], I will have generated $[amount] through [offer] by selling [X] units/clients."
          />
        </div>

        {/* System Goals */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '.85rem',
          }}
        >
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--orange)',
              marginBottom: '6px',
            }}
          >
            System Goals
          </div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
            The one system that moves the needle most
          </div>
          <WorkshopInput
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_system_priority"
            value={watch('la_goal_system_priority')}
            onChange={val => setValue('la_goal_system_priority', val)}
            getFullResponses={getValues}
            placeholder="ManyChat, welcome sequence, content batch system..."
          />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', margin: '8px 0 4px' }}>
            My 90-day system goal
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="la_goal_system"
            value={watch('la_goal_system')}
            onChange={val => setValue('la_goal_system', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="By [date], I will have built [system] that [what it does for my business]."
          />
        </div>
      </div>

      {/* 90-Day Review Date */}
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
          90-Day Review Date
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dimmer)', marginBottom: '8px', lineHeight: 1.5 }}>
          Set a calendar reminder for 90 days from today. On that day, you&apos;ll review content,
          audience, revenue, and system progress against these goals.
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          My 90-day review date
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <WorkshopInput
              moduleSlug={MODULE_SLUG}
              fieldKey="la_goal_review_date"
              value={watch('la_goal_review_date')}
              onChange={val => setValue('la_goal_review_date', val)}
              getFullResponses={getValues}
              placeholder="e.g. June 21, 2026"
            />
          </div>
          <button
            type="button"
            onClick={setDate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--orange)',
              background: 'var(--orange-tint)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--orange-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Set My Date (90 Days)
          </button>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Who is my accountability partner?
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_goal_accountability"
          value={watch('la_goal_accountability')}
          onChange={val => setValue('la_goal_accountability', val)}
          getFullResponses={getValues}
          placeholder="Share your goals with someone who will hold you to them."
        />
      </div>
    </SectionWrapper>
  )
}
