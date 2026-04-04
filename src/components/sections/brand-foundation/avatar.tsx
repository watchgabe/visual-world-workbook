'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 2
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

export default function Avatar() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [expandedAvatar, setExpandedAvatar] = useState<1 | 2 | null>(null)
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map((f) => [f.key, '']),
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
      .then(
        ({ data }: { data: { responses: Record<string, string> } | null }) => {
          if (cancelled || !data?.responses) return
          const saved = data.responses as Record<string, string>
          Object.entries(saved).forEach(([key, val]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof val === 'string')
              (setValue as (k: string, v: string) => void)(key, val)
          })
        },
      )
    return () => {
      cancelled = true
    }
  }, [user, setValue])

  async function handleGenerateAvatar(num: 1 | 2) {
    const prefix = `bf_av${num}_`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const all = getValues() as Record<string, any>
    const situation: string = all[`${prefix}situation`] || ''
    const struggle: string = all[`${prefix}struggle`] || ''
    if (!situation.trim() && !struggle.trim()) return
    const targetKey = `${prefix}statement`
    setIsGenerating(targetKey)
    try {
      const age: string = all[`${prefix}age`] || ''
      const gender: string = all[`${prefix}gender`] || ''
      const occ: string = all[`${prefix}occupation`] || ''
      const income: string = all[`${prefix}income`] || ''
      const who: string = all[`${prefix}who`] || ''
      const look: string = all[`${prefix}look`] || ''
      const story: string = all[`${prefix}story`] || ''
      const goals: string = all[`${prefix}goals`] || ''
      const passions: string = all[`${prefix}passions`] || ''
      const tried: string = all[`${prefix}tried`] || ''
      const desired: string = all[`${prefix}desired`] || ''
      const fears: string = all[`${prefix}fears`] || ''
      const conn: string = all[`${prefix}connection`] || ''
      const prompt =
        'You are a personal brand strategist. Do TWO things:\n\n' +
        '1. Give this avatar a realistic first name that fits their demographic perfectly (format: "NAME: [name]")\n\n' +
        '2. Write a compelling avatar statement using exactly this structure — one flowing paragraph:\n' +
        '"[Name] is [who they are + what they look like + their story]. They love [passions/hobbies]. They\'re currently [situation]. They\'ve tried [previous attempts] but nothing has fully worked. What they really want is [goals/desired outcome]. The thing holding them back most is [fears/obstacles]. They trust creators who [connection]."\n\n' +
        'Avatar data:\n' +
        'Age: ' +
        age +
        ' | Gender: ' +
        gender +
        ' | Occupation: ' +
        occ +
        ' | Income: ' +
        income +
        '\n' +
        'Who they are: ' +
        who +
        '\nWhat they look like: ' +
        look +
        '\nTheir story: ' +
        story +
        '\n' +
        'Goals & Desires: ' +
        goals +
        '\nPassions & Hobbies: ' +
        passions +
        '\n' +
        'Situation: ' +
        situation +
        '\nStruggle: ' +
        struggle +
        '\nTried: ' +
        tried +
        '\nDesired: ' +
        desired +
        '\nFears: ' +
        fears +
        '\nCreator is ahead because: ' +
        conn +
        '\n\n' +
        'Be specific, vivid, and real. One paragraph only. No preamble. No markdown. No asterisks.'
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 600 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      // Strip the NAME: line — use the statement portion only
      const text: string = data.text || ''
      const statement = text.replace(/NAME:\s*[^\n]+\n?/i, '').trim()
      ;(setValue as (k: string, v: string) => void)(targetKey, statement)
      if (user) saveField(user.id, MODULE_SLUG, targetKey, statement)
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
        Workshop 2
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
        Define Your Avatar
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.25rem',
        }}
      >
        You are no longer speaking to a niche — you are speaking to one exact
        person, your perfect dream customer. This is how you build true trust
        and relatability, because you&apos;re speaking to one person who feels
        like they&apos;ve been talking to you the whole time. If you don&apos;t
        know who that one person is, your content will never land. Speaking to
        everyone means you&apos;re actually speaking to no one.
      </p>

      <div
        style={{
          background: 'var(--orange-tint)',
          border: '1px solid var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.2rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.13em',
            color: 'var(--orange)',
            marginBottom: '0.5rem',
          }}
        >
          ★ Bonus Tip
        </div>
        <div
          style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.75 }}
        >
          <strong>
            If you&apos;re unsure where to start, use two past versions of
            yourself.
          </strong>{' '}
          Maybe 5 years ago and 2 years ago. Speak from experience and explain:
          <br />
          <br />
          + How the old version of you could become the current version faster
          <br />
          + The struggles and pain points you could have avoided
          <br />+ Your future goals and how you plan to get there
        </div>
      </div>

      {/* Primary Avatar */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setExpandedAvatar(expandedAvatar === 1 ? null : 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '1.25rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--orange)',
              opacity: 0.5,
              lineHeight: 1,
            }}
          >
            01
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
              }}
            >
              Primary Avatar
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              Click to expand
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1.5px solid var(--border2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--dimmer)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--dimmer)',
                transition: 'transform .15s',
                transform:
                  expandedAvatar === 1 ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          </div>
        </button>

        {expandedAvatar === 1 && (
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <div
              className="grid-form"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '1rem',
              }}
            >
              <div>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av1_age"
                  value={watch('bf_av1_age')}
                  onChange={(val) => setValue('bf_av1_age', val)}
                  getFullResponses={getValues}
                  label="Age range"
                  placeholder="e.g. 25–35"
                />
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av1_gender"
                  value={watch('bf_av1_gender')}
                  onChange={(val) => setValue('bf_av1_gender', val)}
                  getFullResponses={getValues}
                  label="Gender (if relevant)"
                  placeholder="e.g. Any / Primarily women"
                />
              </div>
              <div>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av1_occupation"
                  value={watch('bf_av1_occupation')}
                  onChange={(val) => setValue('bf_av1_occupation', val)}
                  getFullResponses={getValues}
                  label="Occupation / Industry"
                  placeholder="e.g. Freelance designer"
                />
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av1_income"
                  value={watch('bf_av1_income')}
                  onChange={(val) => setValue('bf_av1_income', val)}
                  getFullResponses={getValues}
                  label="Income level"
                  placeholder="e.g. $30K–$80K/yr"
                />
              </div>
            </div>

            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_situation"
              value={watch('bf_av1_situation')}
              onChange={(val) => setValue('bf_av1_situation', val)}
              getFullResponses={getValues}
              rows={2}
              label="What is their current situation?"
              placeholder="Describe their day-to-day life and where they're at right now..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_who"
              value={watch('bf_av1_who')}
              onChange={(val) => setValue('bf_av1_who', val)}
              getFullResponses={getValues}
              rows={2}
              label="Who are they?"
              placeholder="Their identity — how they see themselves, their values, their world..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_look"
              value={watch('bf_av1_look')}
              onChange={(val) => setValue('bf_av1_look', val)}
              getFullResponses={getValues}
              rows={2}
              label="What do they look like?"
              placeholder="Physical appearance, style, vibe — paint a picture..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_story"
              value={watch('bf_av1_story')}
              onChange={(val) => setValue('bf_av1_story', val)}
              getFullResponses={getValues}
              rows={2}
              label="What's their story?"
              placeholder="Background, life stage, key experiences that shaped them..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_goals"
              value={watch('bf_av1_goals')}
              onChange={(val) => setValue('bf_av1_goals', val)}
              getFullResponses={getValues}
              rows={2}
              label="What are their goals, dreams, and desires?"
              placeholder="Short-term and long-term — what does winning look like for them?"
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_passions"
              value={watch('bf_av1_passions')}
              onChange={(val) => setValue('bf_av1_passions', val)}
              getFullResponses={getValues}
              rows={2}
              label="What are their passions and hobbies?"
              placeholder="What do they love, follow, and spend time on outside of work?"
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_struggle"
              value={watch('bf_av1_struggle')}
              onChange={(val) => setValue('bf_av1_struggle', val)}
              getFullResponses={getValues}
              rows={2}
              label="What are they struggling with most?"
              placeholder="The specific problem that keeps them up at night..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_tried"
              value={watch('bf_av1_tried')}
              onChange={(val) => setValue('bf_av1_tried', val)}
              getFullResponses={getValues}
              rows={2}
              label="What have they already tried?"
              placeholder="Previous courses, strategies, approaches..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_desired"
              value={watch('bf_av1_desired')}
              onChange={(val) => setValue('bf_av1_desired', val)}
              getFullResponses={getValues}
              rows={2}
              label="Their desired outcome"
              placeholder="Their dream result in specific, tangible terms..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_fears"
              value={watch('bf_av1_fears')}
              onChange={(val) => setValue('bf_av1_fears', val)}
              getFullResponses={getValues}
              rows={2}
              label="What fears and objections do they have?"
              placeholder="Fear of failure, looking stupid, wasting money..."
            />

            <div
              className="grid-form"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '0.5rem',
              }}
            >
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="bf_av1_platforms"
                value={watch('bf_av1_platforms')}
                onChange={(val) => setValue('bf_av1_platforms', val)}
                getFullResponses={getValues}
                label="Most active platforms"
                placeholder="Instagram, TikTok, YouTube..."
              />
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="bf_av1_connection"
                value={watch('bf_av1_connection')}
                onChange={(val) => setValue('bf_av1_connection', val)}
                getFullResponses={getValues}
                label="How are you 2–3 steps ahead?"
                placeholder="What did you figure out they haven't?"
              />
            </div>

            <div style={{ marginBottom: '6px' }}>
              <button
                type="button"
                onClick={() => handleGenerateAvatar(1)}
                disabled={isGenerating === 'bf_av1_statement'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color:
                    isGenerating === 'bf_av1_statement'
                      ? 'var(--dimmer)'
                      : 'var(--orange)',
                  background: 'var(--orange-tint)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--orange-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor:
                    isGenerating === 'bf_av1_statement'
                      ? 'not-allowed'
                      : 'pointer',
                  fontFamily: 'var(--font)',
                  opacity: isGenerating === 'bf_av1_statement' ? 0.6 : 1,
                }}
              >
                {isGenerating === 'bf_av1_statement'
                  ? 'Generating...'
                  : '✦ Generate Avatar'}
              </button>
            </div>
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av1_statement"
              value={watch('bf_av1_statement')}
              onChange={(val) => setValue('bf_av1_statement', val)}
              getFullResponses={getValues}
              rows={5}
              label="Avatar Statement"
              placeholder="Generated avatar statement — edit freely..."
            />
          </div>
        )}
      </div>

      {/* Secondary Avatar */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setExpandedAvatar(expandedAvatar === 2 ? null : 2)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '1.25rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--orange)',
              opacity: 0.5,
              lineHeight: 1,
            }}
          >
            02
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
              }}
            >
              Secondary Avatar
            </div>
            <div
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dim)' }}
            >
              Click to expand
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1.5px solid var(--border2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--dimmer)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--dimmer)',
                transition: 'transform .15s',
                transform:
                  expandedAvatar === 2 ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          </div>
        </button>

        {expandedAvatar === 2 && (
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <div
              className="grid-form"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '1rem',
              }}
            >
              <div>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av2_age"
                  value={watch('bf_av2_age')}
                  onChange={(val) => setValue('bf_av2_age', val)}
                  getFullResponses={getValues}
                  label="Age range"
                  placeholder="e.g. 35–50"
                />
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av2_gender"
                  value={watch('bf_av2_gender')}
                  onChange={(val) => setValue('bf_av2_gender', val)}
                  getFullResponses={getValues}
                  label="Gender (if relevant)"
                  placeholder="e.g. Any / Primarily men"
                />
              </div>
              <div>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av2_occupation"
                  value={watch('bf_av2_occupation')}
                  onChange={(val) => setValue('bf_av2_occupation', val)}
                  getFullResponses={getValues}
                  label="Occupation / Industry"
                  placeholder="e.g. Corporate professional"
                />
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey="bf_av2_income"
                  value={watch('bf_av2_income')}
                  onChange={(val) => setValue('bf_av2_income', val)}
                  getFullResponses={getValues}
                  label="Income level"
                  placeholder="e.g. $80K–$150K/yr"
                />
              </div>
            </div>

            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_situation"
              value={watch('bf_av2_situation')}
              onChange={(val) => setValue('bf_av2_situation', val)}
              getFullResponses={getValues}
              rows={2}
              label="What is their current situation?"
              placeholder="Describe their day-to-day life and where they're at right now..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_who"
              value={watch('bf_av2_who')}
              onChange={(val) => setValue('bf_av2_who', val)}
              getFullResponses={getValues}
              rows={2}
              label="Who are they?"
              placeholder="Their identity — how they see themselves, their values, their world..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_look"
              value={watch('bf_av2_look')}
              onChange={(val) => setValue('bf_av2_look', val)}
              getFullResponses={getValues}
              rows={2}
              label="What do they look like?"
              placeholder="Physical appearance, style, vibe — paint a picture..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_story"
              value={watch('bf_av2_story')}
              onChange={(val) => setValue('bf_av2_story', val)}
              getFullResponses={getValues}
              rows={2}
              label="What's their story?"
              placeholder="Background, life stage, key experiences that shaped them..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_goals"
              value={watch('bf_av2_goals')}
              onChange={(val) => setValue('bf_av2_goals', val)}
              getFullResponses={getValues}
              rows={2}
              label="What are their goals, dreams, and desires?"
              placeholder="Short-term and long-term — what does winning look like for them?"
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_passions"
              value={watch('bf_av2_passions')}
              onChange={(val) => setValue('bf_av2_passions', val)}
              getFullResponses={getValues}
              rows={2}
              label="What are their passions and hobbies?"
              placeholder="What do they love, follow, and spend time on outside of work?"
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_struggle"
              value={watch('bf_av2_struggle')}
              onChange={(val) => setValue('bf_av2_struggle', val)}
              getFullResponses={getValues}
              rows={2}
              label="What are they struggling with most?"
              placeholder="The specific problem that keeps them up at night..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_tried"
              value={watch('bf_av2_tried')}
              onChange={(val) => setValue('bf_av2_tried', val)}
              getFullResponses={getValues}
              rows={2}
              label="What have they already tried?"
              placeholder="Previous courses, strategies, approaches..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_desired"
              value={watch('bf_av2_desired')}
              onChange={(val) => setValue('bf_av2_desired', val)}
              getFullResponses={getValues}
              rows={2}
              label="Their desired outcome"
              placeholder="Their dream result in specific, tangible terms..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_fears"
              value={watch('bf_av2_fears')}
              onChange={(val) => setValue('bf_av2_fears', val)}
              getFullResponses={getValues}
              rows={2}
              label="What fears and objections do they have?"
              placeholder="Fear of failure, looking stupid, wasting money..."
            />

            <div
              className="grid-form"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '0.5rem',
              }}
            >
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="bf_av2_platforms"
                value={watch('bf_av2_platforms')}
                onChange={(val) => setValue('bf_av2_platforms', val)}
                getFullResponses={getValues}
                label="Most active platforms"
                placeholder="Instagram, LinkedIn, YouTube..."
              />
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey="bf_av2_connection"
                value={watch('bf_av2_connection')}
                onChange={(val) => setValue('bf_av2_connection', val)}
                getFullResponses={getValues}
                label="How are you 2–3 steps ahead?"
                placeholder="What did you figure out they haven't?"
              />
            </div>

            <div style={{ marginBottom: '6px' }}>
              <button
                type="button"
                onClick={() => handleGenerateAvatar(2)}
                disabled={isGenerating === 'bf_av2_statement'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color:
                    isGenerating === 'bf_av2_statement'
                      ? 'var(--dimmer)'
                      : 'var(--orange)',
                  background: 'var(--orange-tint)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--orange-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor:
                    isGenerating === 'bf_av2_statement'
                      ? 'not-allowed'
                      : 'pointer',
                  fontFamily: 'var(--font)',
                  opacity: isGenerating === 'bf_av2_statement' ? 0.6 : 1,
                }}
              >
                {isGenerating === 'bf_av2_statement'
                  ? 'Generating...'
                  : '✦ Generate Avatar 2'}
              </button>
            </div>
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey="bf_av2_statement"
              value={watch('bf_av2_statement')}
              onChange={(val) => setValue('bf_av2_statement', val)}
              getFullResponses={getValues}
              rows={5}
              label="Avatar 2 Statement"
              placeholder="Write your secondary avatar statement here — edit freely..."
            />
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
