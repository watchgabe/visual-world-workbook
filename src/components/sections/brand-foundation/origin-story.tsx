'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const CLOCK_ICON = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const CHECK_ICON = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function TimerButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [secs, setSecs] = useState(600)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => () => stop(), [stop])

  function handleClick() {
    if (status === 'running') {
      stop()
      setStatus('idle')
      setSecs(600)
      return
    }
    if (status === 'done') {
      setStatus('idle')
      setSecs(600)
      return
    }
    setStatus('running')
    setSecs(600)
    intervalRef.current = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) {
          stop()
          setStatus('done')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const m = Math.floor(secs / 60)
  const s = secs % 60
  const label =
    status === 'done' ? 'Done!' :
    status === 'running' ? `${m}:${s < 10 ? '0' : ''}${s}` :
    '10 min'

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: '0.65rem',
        right: '0.65rem',
        zIndex: 2,
        background: status === 'running' ? 'var(--orange-tint)' : status === 'done' ? 'var(--green-bg)' : 'var(--surface)',
        border: `1px solid ${status === 'running' ? 'var(--orange-border)' : status === 'done' ? 'var(--green-border)' : 'var(--border2)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '4px 8px',
        cursor: 'pointer',
        fontSize: '10px',
        color: status === 'running' ? 'var(--orange)' : status === 'done' ? 'var(--green-text)' : 'var(--dimmer)',
        fontFamily: 'var(--font)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.15s',
      }}
    >
      {status === 'done' ? CHECK_ICON : CLOCK_ICON}
      {label}
    </button>
  )
}

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 6
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]

const STORY_PARTS = [
  {
    part: 'Part 1',
    title: 'Where You Started',
    subtitle: 'The Relatable Struggle',
    fieldKey: 'bf_story1',
    placeholder: "What was your situation before everything changed? What pain were you experiencing? Why were you stuck?",
  },
  {
    part: 'Part 2',
    title: 'The Turning Point',
    subtitle: 'The Catalyst',
    fieldKey: 'bf_story2',
    placeholder: "What made you decide to change? What was the aha moment? What risk did you take?",
  },
  {
    part: 'Part 3',
    title: 'The Journey',
    subtitle: 'The Believable Steps',
    fieldKey: 'bf_story3',
    placeholder: "What obstacles did you overcome? What failures? What almost made you quit?",
  },
  {
    part: 'Part 4',
    title: 'Where You Are Now',
    subtitle: 'The Transformation',
    fieldKey: 'bf_story4',
    placeholder: "What's different now? What results have you achieved? What's the lesson for your avatar?",
  },
]

export default function OriginStory() {
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
      .maybeSingle()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const saved = data.responses as Record<string, string>
        Object.entries(saved).forEach(([key, val]) => {
          if (typeof val === "string") (setValue as (k: string, v: string) => void)(key, val)
        })
      })
    return () => { cancelled = true }
  }, [user, setValue])

  async function handleGenerateOriginStory() {
    const story1 = getValues('bf_story1')
    const story2 = getValues('bf_story2')
    if (!story1.trim() && !story2.trim()) return
    setIsGenerating('bf_origin_story')
    try {
      const story3 = getValues('bf_story3')
      const story4 = getValues('bf_story4')
      const prompt =
        'You are a personal brand storyteller. Your job is to piece together what the creator has written into a cohesive, flowing origin story \u2014 NOT to invent, assume, or fill in any gaps.\n\nCRITICAL RULES:\n- Use ONLY what is explicitly written. Do not assume any details not provided.\n- If something is vague or incomplete, write it as-is or use [???] as a placeholder \u2014 e.g. "I moved to [???]" or "I started working with [???]"\n- Never guess locations, names, dates, outcomes, or emotions that were not stated.\n- Your role is to connect the dots they gave you \u2014 not add new ones.\n\nWrite a compelling, authentic 3-5 paragraph story in first person. Lead with the struggle. End with a lesson or invitation for the reader. Warm, direct, relatable voice. No fluff, no hype, no preamble.\n\nPart 1 \u2014 The Struggle: ' +
        story1 +
        '\nPart 2 \u2014 The Turning Point: ' +
        story2 +
        '\nPart 3 \u2014 The Journey: ' +
        story3 +
        '\nPart 4 \u2014 The Transformation: ' +
        story4
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 800 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text = data.text || ''
      ;(setValue as (k: string, v: string) => void)('bf_origin_story', text)
      if (user) saveField(user.id, MODULE_SLUG, 'bf_origin_story', text)
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
        Origin Story
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '.5rem',
        }}
      >
        Your origin story is what makes you human. People don&apos;t connect with your
        success — they connect with your struggle. Your 80% honest story is more
        powerful than a 100% polished one. Don&apos;t sanitize it.
      </p>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        For each part, be as in-depth as possible. Hit the 10-minute timer, let the
        thoughts flow, and don&apos;t filter yourself — just write everything down.
        We&apos;ll whittle it down into the final story after.
      </p>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        The Four-Part Story Arc
      </h2>

      <div
        className="grid-form"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '1.5rem',
        }}
      >
        {STORY_PARTS.map(({ part, title, subtitle, fieldKey, placeholder }, i) => (
          <div
            key={fieldKey}
            className="story-part"
            data-n={i + 1}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '2px',
              }}
            >
              {part}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '0.65rem',
              }}
            >
              {title}
              <br />
              <small style={{ fontWeight: 400, fontSize: '11px', color: 'var(--dimmer)' }}>
                {subtitle}
              </small>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <WorkshopTextarea
                moduleSlug={MODULE_SLUG}
                fieldKey={fieldKey}
                value={watch(fieldKey as keyof ReturnType<typeof watch>)}
                onChange={val => setValue(fieldKey as keyof ReturnType<typeof watch>, val)}
                getFullResponses={getValues}
                rows={6}
                placeholder={placeholder}
              />
            </div>
            <TimerButton />
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.2rem',
          marginBottom: '1.1rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--orange)',
            marginBottom: '12px',
          }}
        >
          AI — Write My Origin Story
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '10px', lineHeight: 1.6 }}>
          Fill in all four parts above, then click Generate. The AI will piece together
          exactly what you wrote — it won&apos;t fill in gaps or assume anything. If
          something is unclear it will flag it with [???] for you to fill in.
        </div>
        <div style={{ marginBottom: '12px' }}>
          <button
            type="button"
            onClick={handleGenerateOriginStory}
            disabled={isGenerating === 'bf_origin_story'}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              cursor: isGenerating === 'bf_origin_story' ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--orange-border)',
              background: 'var(--orange-tint)',
              color: 'var(--orange-dark)',
              fontFamily: 'var(--font)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              opacity: isGenerating === 'bf_origin_story' ? 0.5 : 1,
            }}
          >
            {isGenerating === 'bf_origin_story' ? 'Writing your origin story...' : '✦ Write My Origin Story'}
          </button>
        </div>
        <div style={{ fontSize: '13.5px', color: 'var(--text)', marginBottom: '5px', lineHeight: 1.5 }}>
          Your Complete Origin Story
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dim)', marginBottom: '8px' }}>
          Use the AI output as a starting point and refine in your own voice.
        </div>
        <WorkshopTextarea
          moduleSlug={MODULE_SLUG}
          fieldKey="bf_origin_story"
          value={watch('bf_origin_story')}
          onChange={val => setValue('bf_origin_story', val)}
          getFullResponses={getValues}
          rows={8}
          placeholder="Write or paste your complete origin story here..."
        />
      </div>
    </SectionWrapper>
  )
}
