'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { WorkshopInput } from '@/components/workshop/WorkshopInput'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'
import { stripMarkdown } from '@/lib/stripMarkdown'

const MODULE_SLUG = 'brand-foundation' as const
const SECTION_INDEX = 2
const SECTION_DEF = MODULE_SECTIONS['brand-foundation']![SECTION_INDEX]
const MAX_AVATARS = 5

export default function Avatar() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [expandedAvatar, setExpandedAvatar] = useState<number | null>(null)
  const [avImages, setAvImages] = useState<Record<number, string>>({})
  const [copiedNum, setCopiedNum] = useState<number | null>(null)
  const [avatarCount, setAvatarCount] = useState(2)

  // Pre-create refs for up to 5 avatars (hooks must be unconditional)
  const fileRef1 = useRef<HTMLInputElement>(null)
  const fileRef2 = useRef<HTMLInputElement>(null)
  const fileRef3 = useRef<HTMLInputElement>(null)
  const fileRef4 = useRef<HTMLInputElement>(null)
  const fileRef5 = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileInputRefs: Record<number, React.RefObject<any>> = {
    1: fileRef1, 2: fileRef2, 3: fileRef3, 4: fileRef4, 5: fileRef5,
  }

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
            if (typeof val === 'string')
              (setValue as (k: string, v: string) => void)(key, val)
          })
          // Load images and detect how many avatars have data
          const imgs: Record<number, string> = {}
          let maxNum = 2
          for (let n = 1; n <= MAX_AVATARS; n++) {
            if (saved[`bf_av${n}_image`]) imgs[n] = saved[`bf_av${n}_image`]
            if (
              n > 2 &&
              (saved[`bf_av${n}_situation`] ||
                saved[`bf_av${n}_statement`] ||
                saved[`bf_av${n}_name`] ||
                saved[`bf_av${n}_who`])
            ) {
              maxNum = n
            }
          }
          setAvImages(imgs)
          if (maxNum > 2) setAvatarCount(maxNum)
        },
      )
    return () => {
      cancelled = true
    }
  }, [user, setValue])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleGenerateAvatar(num: number) {
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
        'Age: ' + age + ' | Gender: ' + gender + ' | Occupation: ' + occ + ' | Income: ' + income + '\n' +
        'Who they are: ' + who + '\nWhat they look like: ' + look + '\nTheir story: ' + story + '\n' +
        'Goals & Desires: ' + goals + '\nPassions & Hobbies: ' + passions + '\n' +
        'Situation: ' + situation + '\nStruggle: ' + struggle + '\nTried: ' + tried +
        '\nDesired: ' + desired + '\nFears: ' + fears + '\nCreator is ahead because: ' + conn + '\n\n' +
        'Be specific, vivid, and real. One paragraph only. No preamble. No markdown. No asterisks.'
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 600 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const raw: string = stripMarkdown(data.text || '')
      const nameMatch = raw.match(/NAME:\s*([^\n]+)/i)
      const avatarName = nameMatch ? nameMatch[1].trim() : ''
      const statement = raw.replace(/NAME:\s*[^\n]+\n?/i, '').trim()
      ;(setValue as (k: string, v: string) => void)(targetKey, statement)
      if (user) saveField(user.id, MODULE_SLUG, targetKey, statement)
      if (avatarName) {
        const nameKey = `bf_av${num}_name`
        ;(setValue as (k: string, v: string) => void)(nameKey, avatarName)
        if (user) saveField(user.id, MODULE_SLUG, nameKey, avatarName)
      }
    } catch {
      // silent
    } finally {
      setIsGenerating(null)
    }
  }

  function buildImagePrompt(num: number): string {
    const p = `bf_av${num}_`
    const all = getValues() as Record<string, string>
    const age = all[`${p}age`] || ''
    const occ = all[`${p}occupation`] || ''
    const look = all[`${p}look`] || ''
    const who = all[`${p}who`] || ''
    const passions = all[`${p}passions`] || ''
    const situation = all[`${p}situation`] || ''
    return [
      'Photorealistic portrait photo, 1:1 square ratio.',
      (age || occ) && `Subject: ${[age, occ].filter(Boolean).join(', ')}.`,
      look && `Physical appearance: ${look}`,
      who && `Character and vibe: ${who}`,
      passions && `Passions and lifestyle: ${passions}`,
      situation && `Current life context: ${situation}`,
      'Cinematic lighting, editorial photography, professional quality, clean neutral background.',
    ].filter(Boolean).join(' ')
  }

  async function handleImageUpload(num: number, file: File) {
    const img = new window.Image()
    img.onload = () => {
      const maxSize = 600
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize)
          width = maxSize
        } else {
          width = Math.round((width / height) * maxSize)
          height = maxSize
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      setAvImages((prev) => ({ ...prev, [num]: base64 }))
      if (user) saveField(user.id, MODULE_SLUG, `bf_av${num}_image`, base64)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  async function handleCopyPrompt(num: number) {
    const prompt = buildImagePrompt(num)
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedNum(num)
      setTimeout(
        () => setCopiedNum((prev) => (prev === num ? null : prev)),
        2000,
      )
    } catch {
      /* silent */
    }
  }

  function renderAvatar(num: number) {
    const avatarLabel =
      num === 1 ? 'Primary Avatar' : num === 2 ? 'Secondary Avatar' : `Avatar ${num}`
    const numStr = String(num).padStart(2, '0')
    const avImage = avImages[num] || ''
    const isExp = expandedAvatar === num
    const genKey = `bf_av${num}_statement`
    const isGen = isGenerating === genKey
    const w = watch as (k: string) => string

    return (
      <div
        key={num}
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
          onClick={() => setExpandedAvatar(isExp ? null : num)}
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
            {numStr}
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
              {avatarLabel}
            </div>
            {w(`bf_av${num}_name`) ? (
              <>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginTop: '1px',
                  }}
                >
                  {w(`bf_av${num}_name`)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--dim)' }}>
                  {[w(`bf_av${num}_age`), w(`bf_av${num}_occupation`)]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: num === 1 ? 'var(--text)' : 'var(--dim)',
                }}
              >
                Click to expand
              </div>
            )}
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
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: `1.5px solid ${avImage ? 'var(--orange)' : 'var(--border2)'}`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg)',
                flexShrink: 0,
              }}
            >
              {avImage ? (
                <img
                  src={avImage}
                  alt={`Avatar ${num}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
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
              )}
            </div>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--dimmer)',
                transition: 'transform .15s',
                transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          </div>
        </button>

        {isExp && (
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
                  fieldKey={`bf_av${num}_age`}
                  value={w(`bf_av${num}_age`)}
                  onChange={(val) =>
                    (setValue as (k: string, v: string) => void)(
                      `bf_av${num}_age`,
                      val,
                    )
                  }
                  getFullResponses={getValues}
                  label="Age range"
                  placeholder="e.g. 25–35"
                />
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_av${num}_gender`}
                  value={w(`bf_av${num}_gender`)}
                  onChange={(val) =>
                    (setValue as (k: string, v: string) => void)(
                      `bf_av${num}_gender`,
                      val,
                    )
                  }
                  getFullResponses={getValues}
                  label="Gender (if relevant)"
                  placeholder="e.g. Any / Primarily women"
                />
              </div>
              <div>
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_av${num}_occupation`}
                  value={w(`bf_av${num}_occupation`)}
                  onChange={(val) =>
                    (setValue as (k: string, v: string) => void)(
                      `bf_av${num}_occupation`,
                      val,
                    )
                  }
                  getFullResponses={getValues}
                  label="Occupation / Industry"
                  placeholder="e.g. Freelance designer"
                />
                <WorkshopInput
                  moduleSlug={MODULE_SLUG}
                  fieldKey={`bf_av${num}_income`}
                  value={w(`bf_av${num}_income`)}
                  onChange={(val) =>
                    (setValue as (k: string, v: string) => void)(
                      `bf_av${num}_income`,
                      val,
                    )
                  }
                  getFullResponses={getValues}
                  label="Income level"
                  placeholder="e.g. $30K–$80K/yr"
                />
              </div>
            </div>

            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_situation`}
              value={w(`bf_av${num}_situation`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_situation`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What is their current situation?"
              placeholder="Describe their day-to-day life and where they're at right now..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_who`}
              value={w(`bf_av${num}_who`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_who`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="Who are they?"
              placeholder="Their identity — how they see themselves, their values, their world..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_look`}
              value={w(`bf_av${num}_look`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_look`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What do they look like?"
              placeholder="Physical appearance, style, vibe — paint a picture..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_story`}
              value={w(`bf_av${num}_story`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_story`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What's their story?"
              placeholder="Background, life stage, key experiences that shaped them..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_goals`}
              value={w(`bf_av${num}_goals`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_goals`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What are their goals, dreams, and desires?"
              placeholder="Short-term and long-term — what does winning look like for them?"
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_passions`}
              value={w(`bf_av${num}_passions`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_passions`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What are their passions and hobbies?"
              placeholder="What do they love, follow, and spend time on outside of work?"
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_struggle`}
              value={w(`bf_av${num}_struggle`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_struggle`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What are they struggling with most?"
              placeholder="The specific problem that keeps them up at night..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_tried`}
              value={w(`bf_av${num}_tried`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_tried`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="What have they already tried?"
              placeholder="Previous courses, strategies, approaches..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_desired`}
              value={w(`bf_av${num}_desired`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_desired`,
                  val,
                )
              }
              getFullResponses={getValues}
              rows={2}
              label="Their desired outcome"
              placeholder="Their dream result in specific, tangible terms..."
            />
            <WorkshopTextarea
              moduleSlug={MODULE_SLUG}
              fieldKey={`bf_av${num}_fears`}
              value={w(`bf_av${num}_fears`)}
              onChange={(val) =>
                (setValue as (k: string, v: string) => void)(
                  `bf_av${num}_fears`,
                  val,
                )
              }
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
                fieldKey={`bf_av${num}_platforms`}
                value={w(`bf_av${num}_platforms`)}
                onChange={(val) =>
                  (setValue as (k: string, v: string) => void)(
                    `bf_av${num}_platforms`,
                    val,
                  )
                }
                getFullResponses={getValues}
                label="Most active platforms"
                placeholder="Instagram, TikTok, YouTube..."
              />
              <WorkshopInput
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_av${num}_connection`}
                value={w(`bf_av${num}_connection`)}
                onChange={(val) =>
                  (setValue as (k: string, v: string) => void)(
                    `bf_av${num}_connection`,
                    val,
                  )
                }
                getFullResponses={getValues}
                label="How are you 2–3 steps ahead?"
                placeholder="What did you figure out they haven't?"
              />
            </div>

            {/* AI Generate */}
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.2rem',
                marginBottom: '0.5rem',
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
                AI — Generate My Avatar
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--dim)',
                  marginBottom: '10px',
                  lineHeight: 1.6,
                }}
              >
                Fill in the fields above, then click Generate.
              </div>
              <div style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleGenerateAvatar(num)}
                  disabled={isGen}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    cursor: isGen ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--orange-border)',
                    background: 'var(--orange-tint)',
                    color: 'var(--orange-dark)',
                    fontFamily: 'var(--font)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    opacity: isGen ? 0.5 : 1,
                  }}
                >
                  {isGen ? 'Generating...' : '✦ Generate Avatar'}
                </button>
              </div>
              <WorkshopTextarea
                moduleSlug={MODULE_SLUG}
                fieldKey={`bf_av${num}_statement`}
                value={w(`bf_av${num}_statement`)}
                onChange={(val) =>
                  (setValue as (k: string, v: string) => void)(
                    `bf_av${num}_statement`,
                    val,
                  )
                }
                getFullResponses={getValues}
                rows={5}
                placeholder="Generated avatar statement — edit freely..."
              />
            </div>

            {/* Avatar Image Upload */}
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.2rem',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--orange)',
                  marginBottom: '10px',
                }}
              >
                Avatar Image
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--dim)',
                  lineHeight: 1.6,
                  marginBottom: '12px',
                }}
              >
                Paste this prompt into Midjourney, ChatGPT, or your preferred
                image generator — then upload the result below.
              </div>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '10px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--dim)',
                    lineHeight: 1.6,
                    paddingRight: '70px',
                  }}
                >
                  {buildImagePrompt(num)}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(num)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid var(--border2)',
                    background:
                      copiedNum === num ? 'var(--orange-tint)' : 'var(--card)',
                    color:
                      copiedNum === num ? 'var(--orange)' : 'var(--dimmer)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedNum === num ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <input
                ref={fileInputRefs[num]}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(num, f)
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRefs[num]?.current?.click()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border2)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {avImage ? '↑ Replace Image' : '↑ Upload Image'}
                </button>
                {avImage && (
                  <img
                    src={avImage}
                    alt="Avatar preview"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--orange)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
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

      {Array.from({ length: avatarCount }, (_, i) => i + 1).map((num) =>
        renderAvatar(num),
      )}

      {avatarCount < MAX_AVATARS && (
        <button
          type="button"
          onClick={() => {
            const next = avatarCount + 1
            setAvatarCount(next)
            setExpandedAvatar(next)
          }}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border2)',
            background: 'transparent',
            color: 'var(--dimmer)',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--orange)'
            e.currentTarget.style.color = 'var(--orange)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border2)'
            e.currentTarget.style.color = 'var(--dimmer)'
          }}
        >
          + Add Avatar {avatarCount + 1}
        </button>
      )}
    </SectionWrapper>
  )
}
