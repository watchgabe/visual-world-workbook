'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { OptionSelector } from '@/components/workshop/OptionSelector'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'launch' as const
const SECTION_INDEX = 4
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function LaunchBio() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [bioResult, setBioResult] = useState<string>('')
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries([
      ...SECTION_DEF.fields.map(f => [f.key, '']),
      // Cross-section fields needed for bio AI prompt (from funnel and lead-magnet sections)
      ['la_funnel_cta', ''],
      ['la_lm_name', ''],
    ]),
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

  async function handleGenerateBio() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const all = getValues() as Record<string, any>
    const line1: string = all['la_bio_line1'] || ''
    const line2: string = all['la_bio_line2'] || ''
    if (!line1.trim() && !line2.trim()) return
    setIsGenerating('bio')
    try {
      const line3: string = all['la_bio_line3'] || ''
      const line4: string = all['la_bio_line4'] || ''
      const funnelCta: string = all['la_funnel_cta'] || ''
      const lmName: string = all['la_lm_name'] || ''
      const prompt =
        'You are a personal brand strategist. Write a punchy, premium Instagram bio using the 4-line formula, then write platform-specific versions.\n\nLine 1 draft: ' +
        line1 +
        '\nLine 2 draft: ' +
        line2 +
        '\nLine 3 draft: ' +
        line3 +
        '\nLine 4 draft: ' +
        line4 +
        '\nFunnel CTA: ' +
        funnelCta +
        '\nLead magnet: ' +
        lmName +
        '\n\nProvide:\n1. Polished 4-line Instagram bio (under 150 chars total)\n2. LinkedIn headline version (under 220 chars)\n3. TikTok version (under 80 chars)\n4. One sentence explaining what makes this bio premium vs generic\n\nBe specific. No buzzwords. Every word earns its place.'
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 600 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBioResult(data.text || '')
    } catch {
      // silent error
    } finally {
      setIsGenerating(null)
    }
  }

  const responses = watch()

  // Bio preview computed from live values
  const bioLines = [
    watch('la_bio_line1'),
    watch('la_bio_line2'),
    watch('la_bio_line3'),
    watch('la_bio_line4'),
  ].filter(Boolean)

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
        Bio Optimization
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Your profile is the first thing people see when your content lands in front of them. It has
        about two seconds to answer one question: &ldquo;Is this person for me?&rdquo; There are
        five elements that determine whether they follow, click, or leave. Every one of them matters.
      </p>

      {/* #1 — Link in Bio */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        #1 — Link in Bio
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
          The old approach was a Linktree with multiple links. The new approach is a{' '}
          <strong>single link</strong> that directs viewers exactly where you want them to go.
          Multiple options create friction. One clear destination creates action.
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          Your link should point directly to your lead magnet landing page — not your website, not
          a menu of options. The goal of every piece of content is to move someone from follower to
          email subscriber. Make that the only door.
        </p>
      </div>
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
          Your Link in Bio
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          My single link (lead magnet landing page)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_link"
          value={watch('la_bio_link')}
          onChange={val => setValue('la_bio_link', val)}
          getFullResponses={getValues}
          placeholder="e.g. yoursite.com/free-guide or a direct landing page URL"
        />
      </div>

      {/* #2 — Username */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        #2 — Username
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
          The old approach was a random handle. The new approach is either your{' '}
          <strong>real name</strong> (if it&apos;s available) or your{' '}
          <strong>exact business name</strong>. Your username is searchable — make it work for you.
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          Random handles with underscores, numbers, or clever wordplay are harder to find and harder
          to remember. If your name is taken, add your niche after it:{' '}
          <em>@yourname.brand</em> or <em>@yournamecreates</em>.
        </p>
      </div>
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
          Your Username
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          My handle (across platforms)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_username"
          value={watch('la_bio_username')}
          onChange={val => setValue('la_bio_username', val)}
          getFullResponses={getValues}
          placeholder="e.g. @yourname, @yourbrandname or @yournameofficial"
        />
      </div>

      {/* #3 — Tagline */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        #3 — Tagline (Name Field)
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
          The old approach was just your name in the name field. The new approach is your name
          followed by your occupation, a niche keyword, or a 1–2 word answer that clearly
          communicates what you do. This field is <strong>searchable</strong> — treat it like a
          headline, not a label.
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          Example: <em>Gabe | Cinematics | Personal Branding</em>
        </p>
      </div>
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
          Your Tagline (Instagram / TikTok Name Field)
        </div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Name field tagline
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_ig_name"
          value={watch('la_bio_ig_name')}
          onChange={val => setValue('la_bio_ig_name', val)}
          getFullResponses={getValues}
          placeholder="e.g. Your Name | Niche Keyword | What You Do"
        />
      </div>

      {/* #4 — Profile Picture */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        #4 — Profile Picture
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
          Your profile picture is displayed at thumbnail size. It needs to work at 50px. That means:{' '}
          <strong>close-up face, single person, high contrast background, professional quality.</strong>{' '}
          Far-away shots, group photos, and blurry images lose immediately at small sizes.
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          Your face is your brand. People follow people. A clean, clear headshot builds more trust
          in a thumbnail than any logo ever will.
        </p>
      </div>
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
          Profile Picture Audit
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Is my face clearly visible at thumbnail size?
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_pfp_visibility"
          value={watch('la_bio_pfp_visibility')}
          onChange={val => setValue('la_bio_pfp_visibility', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Yes — clear and close-up', value: 'Yes — clear and close-up' },
            { label: 'No — needs to be reshot', value: 'No — needs to be reshot' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Background
        </div>
        <OptionSelector
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_pfp_bg"
          value={watch('la_bio_pfp_bg')}
          onChange={val => setValue('la_bio_pfp_bg', val)}
          getFullResponses={getValues}
          columns={2}
          options={[
            { label: 'Solid / high contrast — good', value: 'Solid / high contrast — good' },
            { label: 'Busy / cluttered — needs work', value: 'Busy / cluttered — needs work' },
          ]}
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Notes on what needs to change
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_pfp_notes"
          value={watch('la_bio_pfp_notes')}
          onChange={val => setValue('la_bio_pfp_notes', val)}
          getFullResponses={getValues}
          placeholder="e.g. Reshoot against a clean background, crop tighter..."
        />
      </div>

      {/* #5 — The Bio */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        #5 — The Bio
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
          The old approach was messy with no structure. The new approach follows a simple{' '}
          <strong>4-line structure</strong> that answers every question a new visitor has before
          they even have to ask it.
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '6px' }}>
          <strong>Line 1:</strong> What do you do/sell and who you help
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '6px' }}>
          <strong>Line 2:</strong> How do people work with you / buy from you
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '6px' }}>
          <strong>Line 3:</strong> Some sort of credibility
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          <strong>Line 4:</strong> CTA
        </p>
      </div>
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
          Build Your Bio
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
          Line 1 — What you do/sell and who you help
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_line1"
          value={watch('la_bio_line1')}
          onChange={val => setValue('la_bio_line1', val)}
          getFullResponses={getValues}
          placeholder="e.g. Helping creators build premium personal brands"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Line 2 — How people work with you or buy from you
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_line2"
          value={watch('la_bio_line2')}
          onChange={val => setValue('la_bio_line2', val)}
          getFullResponses={getValues}
          placeholder="e.g. 1:1 coaching · online course · done-for-you"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Line 3 — Credibility (result, credential, or social proof)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_line3"
          value={watch('la_bio_line3')}
          onChange={val => setValue('la_bio_line3', val)}
          getFullResponses={getValues}
          placeholder="e.g. 50K+ creators · $1M+ revenue generated · Featured in Forbes"
        />

        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '10px 0 6px' }}>
          Line 4 — CTA (what to do next)
        </div>
        <WorkshopInput
          moduleSlug={MODULE_SLUG}
          fieldKey="la_bio_line4"
          value={watch('la_bio_line4')}
          onChange={val => setValue('la_bio_line4', val)}
          getFullResponses={getValues}
          placeholder="e.g. Free guide ↓ Link below"
        />

        {/* Bio preview */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--dimmer)',
              marginBottom: '.5rem',
            }}
          >
            Bio Preview
          </div>
          <div
            style={{
              fontSize: '13px',
              color: bioLines.length ? 'var(--dim)' : 'var(--dimmer)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              fontStyle: bioLines.length ? 'normal' : 'italic',
            }}
          >
            {bioLines.length ? bioLines.join('\n') : 'Your bio will appear here as you type...'}
          </div>
        </div>

        {/* AI Generate bio */}
        <div style={{ marginTop: '1rem' }}>
          <button
            type="button"
            onClick={handleGenerateBio}
            disabled={isGenerating === 'bio'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: isGenerating === 'bio' ? 'var(--dimmer)' : 'var(--orange)',
              background: 'var(--orange-tint)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--orange-border)',
              borderRadius: 'var(--radius-md)',
              cursor: isGenerating === 'bio' ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
              opacity: isGenerating === 'bio' ? 0.6 : 1,
            }}
          >
            {isGenerating === 'bio' ? 'Generating...' : '✦ Generate'}
          </button>
        </div>

        {/* AI result display area */}
        {bioResult && (
          <div
            style={{
              marginTop: '1rem',
              background: 'var(--surface)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.1rem',
              fontSize: '13px',
              color: 'var(--text)',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                color: 'var(--orange)',
                marginBottom: '.5rem',
              }}
            >
              AI Generated Bio Versions
            </div>
            {bioResult}
          </div>
        )}
      </div>
    </SectionWrapper>
  )
}
