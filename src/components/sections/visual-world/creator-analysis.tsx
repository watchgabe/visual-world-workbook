'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'visual-world' as const
const SECTION_INDEX = 1
const SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]

interface CreatorAnalysis {
  setting: string
  mood: string
  lighting: string
  col1: string
  col2: string
  col3: string
  niche: string
  p1: string
  p2: string
  p3: string
  gap: string
}

interface CreatorNotes {
  strengths: string
  impressions: string
  weaknesses: string
  limitations: string
  content: string
  steal: string
  avoid: string
  gap: string
}

interface CreatorLinks {
  ig: string
  yt: string
  web: string
  other: string
}

interface CreatorProfile {
  fullName: string
  bio: string
  followers: string
  postsCount: string
  avgLikes: string
  freq: string
  picUrl: string
  thumbUrls: string[]
}

interface Creator {
  id: string
  handle: string
  bio: string
  analyzed: boolean
  analysis: CreatorAnalysis | null
  profile: CreatorProfile | null
  notes: string
  detailedNotes: CreatorNotes
  links: CreatorLinks
}

export default function CreatorAnalysis() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(
      SECTION_DEF.fields.map(f => [f.key, ''])
    ),
  })

  const [creators, setCreators] = useState<Creator[]>([])
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analyzeErrors, setAnalyzeErrors] = useState<Record<string, string>>({})
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  // Load saved data on mount
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
          if (key !== 'vw_ca_creators') {
            if (typeof val === 'string') (setValue as (k: string, v: string) => void)(key, val)
          }
        })
        const savedCreators = saved['vw_ca_creators']
        if (savedCreators) {
          try {
            const parsed = JSON.parse(savedCreators) as Creator[]
            // Backfill new fields for old saved creators
            setCreators(parsed.map(c => ({
              ...c,
              profile: c.profile || null,
              detailedNotes: c.detailedNotes || { strengths: '', impressions: '', weaknesses: '', limitations: '', content: '', steal: '', avoid: '', gap: '' },
              links: c.links || { ig: c.handle ? `@${c.handle}` : '', yt: '', web: '', other: '' },
            })))
          } catch { /* ignore parse errors */ }
        }
      })
    return () => { cancelled = true }
  }, [user, setValue])

  // Sync creators to react-hook-form for auto-save
  useEffect(() => {
    ;(setValue as (k: string, v: string) => void)('vw_ca_creators', JSON.stringify(creators))
  }, [creators, setValue])

  const emptyNotes: CreatorNotes = { strengths: '', impressions: '', weaknesses: '', limitations: '', content: '', steal: '', avoid: '', gap: '' }
  const emptyLinks: CreatorLinks = { ig: '', yt: '', web: '', other: '' }

  function addCreator() {
    setCreators(prev => [...prev, {
      id: Date.now().toString(),
      handle: '',
      bio: '',
      analyzed: false,
      analysis: null,
      profile: null,
      notes: '',
      detailedNotes: { ...emptyNotes },
      links: { ...emptyLinks },
    }])
  }

  function removeCreator(id: string) {
    setCreators(prev => prev.filter(c => c.id !== id))
    setAnalyzeErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function updateCreator(id: string, field: keyof Creator, value: string | CreatorNotes | CreatorLinks) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  function fmtNum(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
  }

  async function analyzeCreator(id: string) {
    const creator = creators.find(c => c.id === id)
    if (!creator || !creator.handle.trim()) return
    setAnalyzingId(id)
    setAnalyzeErrors(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })

    let profile: CreatorProfile | null = null
    let fetchedBio = creator.bio

    try {
      // Step 1: Fetch Instagram profile + feed
      const [profileRes, feedRes] = await Promise.all([
        fetch('/api/instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'profile', handle: creator.handle }),
        }),
        fetch('/api/instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'feed', handle: creator.handle }),
        }),
      ])

      const profileData = await profileRes.json()
      const feedData = await feedRes.json()

      // Parse profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let u: any = profileData.data || profileData.user || profileData
      if (u?.data?.user) u = u.data.user
      else if (u?.data?.full_name || u?.data?.follower_count) u = u.data
      else if (u?.user) u = u.user
      else if (u?.graphql?.user) u = u.graphql.user

      const fullName = u?.full_name || u?.fullName || u?.name || ''
      const bio = u?.biography || u?.bio || u?.description || ''
      const followers = u?.follower_count || u?.followers_count || u?.followers || u?.edge_followed_by?.count || u?.counts?.followed_by || 0
      const postsCount = u?.media_count || u?.posts_count || u?.mediaCount || u?.edge_owner_to_timeline_media?.count || u?.counts?.media || 0
      const picUrl = u?.profile_pic_url_hd || u?.profile_pic_url || u?.profile_image || u?.hd_profile_pic_url_info?.url || ''

      // Parse feed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rawPosts: any[] = feedData.posts || feedData.data || feedData.items || feedData.medias || feedData.feed || []
      if (rawPosts && !Array.isArray(rawPosts) && (rawPosts as Record<string, unknown>).data) rawPosts = (rawPosts as Record<string, unknown>).data as typeof rawPosts
      if (rawPosts && !Array.isArray(rawPosts) && (rawPosts as Record<string, unknown>).items) rawPosts = (rawPosts as Record<string, unknown>).items as typeof rawPosts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = Array.isArray(rawPosts) ? rawPosts.map((item: any) => item.node || item.media || item) : []

      let totalLikes = 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts.slice(0, 12).forEach((p: any) => {
        totalLikes += p.like_count || p.likes_count || p.likeCount || p.edge_media_preview_like?.count || p.likes?.count || 0
      })
      const avgLikes = posts.length ? Math.round(totalLikes / Math.min(posts.length, 12)) : 0

      let freq = '-'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dates = posts.slice(0, 12).map((p: any) => p.taken_at || p.taken_at_timestamp || p.timestamp || p.created_at).filter(Boolean)
      if (dates.length >= 2) {
        const span = (Math.max(...dates) - Math.min(...dates)) / (7 * 24 * 3600)
        if (span > 0) freq = (dates.length / span).toFixed(1)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const thumbUrls = posts.slice(0, 12).map((p: any) =>
        p.display_url || p.image_url || p.thumbnail_url || p.media_url ||
        p.thumbnail_resources?.[3]?.src || p.thumbnail_resources?.[2]?.src ||
        p.image_versions2?.candidates?.[0]?.url || ''
      ).filter(Boolean)

      profile = {
        fullName,
        bio,
        followers: followers ? fmtNum(Number(followers)) : '-',
        postsCount: postsCount ? String(postsCount) : '-',
        avgLikes: avgLikes ? fmtNum(avgLikes) : '-',
        freq: freq + '/wk',
        picUrl,
        thumbUrls,
      }

      if (bio) fetchedBio = bio

      // Update profile immediately so user sees it while AI runs
      setCreators(prev => prev.map(c => c.id === id ? { ...c, profile, bio: fetchedBio } : c))
    } catch {
      // Instagram unavailable — continue with AI only
    }

    try {
      // Step 2: AI analysis
      const handle = creator.handle.replace(/^@/, '')
      const prompt = `Analyze Instagram creator @${handle}${fetchedBio ? ` (${fetchedBio})` : ''}. Return ONLY valid JSON with no markdown: {"setting":"one of: calm and minimal, creative and eclectic, professional and polished, luxurious and elevated, energetic and dynamic, raw and authentic","mood":"emotional tone - one short phrase","lighting":"one of: warm golden natural, bright even studio, high contrast dramatic, soft diffused","col1":"primary color name","col2":"secondary color name","col3":"accent color name","niche":"content niche in 3-5 words","p1":"specific visual premium factor 1","p2":"specific visual premium factor 2","p3":"specific visual premium factor 3","gap":"one sentence on what you could own that they do not"}`
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 600 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let analysis: CreatorAnalysis
      try {
        let raw = (data.text || '').trim()
        raw = raw.replace(/```json|```/g, '').trim()
        const jsonStart = raw.indexOf('{')
        const jsonEnd = raw.lastIndexOf('}')
        if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found')
        raw = raw.slice(jsonStart, jsonEnd + 1)
        analysis = JSON.parse(raw)
      } catch {
        throw new Error('AI returned invalid JSON — try again')
      }
      setCreators(prev => prev.map(c => {
        if (c.id !== id) return c
        const links = { ...c.links }
        if (!links.ig) links.ig = `@${c.handle.replace(/^@/, '')}`
        return { ...c, analyzed: true, analysis, profile: profile || c.profile, links }
      }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      setAnalyzeErrors(prev => ({ ...prev, [id]: msg }))
    } finally {
      setAnalyzingId(null)
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
        Workshop 1
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
        Creator Analysis
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        Before you build your own visual world, you need to develop your eye. Study premium creators
        in your space and reverse-engineer their visual decisions. You&apos;re not copying them — you&apos;re
        training yourself to recognize intentional visual choices.
      </p>

      {/* Instruction box */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          marginBottom: '1.5rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        The goal is to find <strong style={{ color: 'var(--text)' }}>your gap</strong>. After
        studying premium creators, you&apos;ll have a clear picture of what&apos;s already being done —
        and where the opportunity is for you to be different.
      </div>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 8px',
        }}
      >
        Creator Analysis Framework
      </h2>
      <p style={{ fontSize: '13.5px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Study 3–5 premium creators in your niche. For each creator, analyze their visual choices —
        color palette, lighting, framing, typography, and overall aesthetic. After studying them,
        answer the synthesis questions below to find your visual gap.
      </p>

      {/* Creator Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        {creators.map((creator, idx) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            index={idx}
            isAnalyzing={analyzingId === creator.id}
            analyzeError={analyzeErrors[creator.id]}
            expanded={expandedCards[creator.id] !== false}
            onToggle={() => setExpandedCards(prev => ({ ...prev, [creator.id]: prev[creator.id] === false }))}
            onUpdate={updateCreator}
            onRemove={removeCreator}
            onAnalyze={analyzeCreator}
          />
        ))}

        {/* Add Creator button */}
        <button
          type="button"
          onClick={addCreator}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--dim)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color .15s, color .15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orange)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--orange)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--dim)'
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
          Add Creator
        </button>
      </div>

      {/* Synthesis section */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '1rem',
          }}
        >
          Creator Analysis — Synthesis
        </div>

        {/* Q1 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What visual patterns appear across multiple premium creators?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_patterns"
            value={watch('vw_ca_patterns')}
            onChange={val => setValue('vw_ca_patterns', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="What are they all doing that clearly works?"
          />
        </div>

        {/* Q2 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What is everyone doing that you want to do differently?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_different"
            value={watch('vw_ca_different')}
            onChange={val => setValue('vw_ca_different', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="Where does the whole space look the same?"
          />
        </div>

        {/* Q3 */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            What is no one doing that you could own?
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_own"
            value={watch('vw_ca_own')}
            onChange={val => setValue('vw_ca_own', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="Your visual white space — what's unclaimed?"
          />
        </div>

        {/* Q4: Gap Statement */}
        <div>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: '6px',
              lineHeight: 1.4,
            }}
          >
            Your gap statement — how you&apos;ll be visually different from everyone in your space:
          </div>
          <WorkshopTextarea
            moduleSlug={MODULE_SLUG}
            fieldKey="vw_ca_gap"
            value={watch('vw_ca_gap')}
            onChange={val => setValue('vw_ca_gap', val)}
            getFullResponses={getValues}
            rows={2}
            placeholder="My visual identity will stand apart because..."
          />
        </div>
      </div>
    </SectionWrapper>
  )
}

// ---------------------------------------------------------------------------
// CreatorCard sub-component
// ---------------------------------------------------------------------------

interface CreatorCardProps {
  creator: Creator
  index: number
  isAnalyzing: boolean
  analyzeError: string | undefined
  expanded: boolean
  onToggle: () => void
  onUpdate: (id: string, field: keyof Creator, value: string | CreatorNotes | CreatorLinks) => void
  onRemove: (id: string) => void
  onAnalyze: (id: string) => void
}

function CreatorCard({ creator, index, isAnalyzing, analyzeError, expanded, onToggle, onUpdate, onRemove, onAnalyze }: CreatorCardProps) {
  const hasAnalysis = creator.analyzed && creator.analysis

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Card header — click to toggle */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--surface)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--orange-tint, rgba(255,130,50,.1))',
              border: '1px solid var(--orange-border, rgba(255,130,50,.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--orange)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {creator.profile?.picUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(creator.profile.picUrl)}&w=60&h=60&fit=cover&mask=circle`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              creator.handle ? creator.handle.charAt(0).toUpperCase() : (index + 1).toString()
            )}
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', lineHeight: 1, marginBottom: '2px' }}>
              Creator {index + 1}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {creator.profile?.fullName || (creator.handle ? `@${creator.handle}` : 'Add Instagram handle to analyze')}
            </div>
            {creator.profile?.fullName && creator.handle && (
              <div style={{ fontSize: '10.5px', color: 'var(--dimmer)', marginTop: '1px' }}>
                @{creator.handle}{creator.profile.followers !== '-' ? ` · ${creator.profile.followers} followers` : ''}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span
            style={{
              color: 'var(--dimmer)',
              fontSize: '12px',
              transition: 'transform .2s',
              display: 'inline-block',
              transform: expanded ? 'none' : 'rotate(-90deg)',
            }}
          >
            ▼
          </span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(creator.id) }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--dimmer)',
              fontSize: '18px',
              padding: '2px 6px',
              lineHeight: 1,
            }}
            title="Remove creator"
          >
            ×
          </button>
        </div>
      </div>

      {expanded && <>
      {/* Handle + Bio + Analyze */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Handle row */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                padding: '0 6px 0 12px',
                fontSize: '14px',
                color: 'var(--dimmer)',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              @
            </span>
            <input
              type="text"
              value={creator.handle}
              onChange={e => onUpdate(creator.id, 'handle', e.target.value)}
              placeholder="username"
              style={{
                border: 'none',
                background: 'transparent',
                paddingLeft: 0,
                flex: 1,
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                padding: '8px 12px 8px 0',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => onAnalyze(creator.id)}
            disabled={isAnalyzing || !creator.handle.trim()}
            style={{
              padding: '8px 14px',
              background: isAnalyzing ? 'var(--surface)' : 'var(--orange)',
              border: '1px solid var(--orange)',
              borderRadius: 'var(--radius-md)',
              color: isAnalyzing ? 'var(--dimmer)' : '#fff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isAnalyzing || !creator.handle.trim() ? 'not-allowed' : 'pointer',
              opacity: !creator.handle.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap',
              transition: 'background .15s',
            }}
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {/* Error display */}
        {analyzeError && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#e53e3e',
              background: 'rgba(229,62,62,.08)',
              border: '1px solid rgba(229,62,62,.2)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
            }}
          >
            {analyzeError}
          </div>
        )}
      </div>

      {/* Profile card — shown when profile is loaded */}
      {creator.profile && (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Profile top: avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 700, color: 'var(--dimmer)', overflow: 'hidden',
            }}>
              {creator.profile.picUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://images.weserv.nl/?url=${encodeURIComponent(creator.profile.picUrl)}&w=88&h=88&fit=cover&mask=circle`}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                (creator.profile.fullName || creator.handle).charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                {creator.profile.fullName || `@${creator.handle}`}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--dimmer)', marginTop: '1px' }}>
                @{creator.handle}{creator.analysis?.niche ? ` · ${creator.analysis.niche}` : ''}
              </div>
              {creator.profile.bio && (
                <div style={{ fontSize: '12px', color: 'var(--dim)', marginTop: '3px', lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {creator.profile.bio}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', padding: '0 14px 12px' }}>
            {[
              { num: creator.profile.followers, label: 'Followers' },
              { num: creator.profile.postsCount, label: 'Posts' },
              { num: creator.profile.avgLikes, label: 'Avg Likes' },
              { num: creator.profile.freq, label: 'Posts/Wk' },
            ].map(({ num, label }) => (
              <div key={label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: '8px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-num)', fontSize: '20px', fontWeight: 900, lineHeight: 1, color: 'var(--text)' }}>
                  {num}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--dimmer)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '2px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Thumbnail grid */}
          {creator.profile.thumbUrls.length > 0 && (
            <div style={{ padding: '0 14px 12px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--dimmer)', marginBottom: '6px' }}>
                Recent posts
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3px' }}>
                {creator.profile.thumbUrls.map((url, i) => (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: '3px', overflow: 'hidden', background: 'var(--surface)',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover`}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis results — shown when analyzed */}
      {hasAnalysis && creator.analysis && (
        <div
          style={{
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--orange)',
              marginBottom: '8px',
            }}
          >
            AI Visual Analysis
          </div>

          {/* 2×2 grid: Setting, Mood, Lighting, Color Palette */}
          <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
            {[
              { label: 'Setting', value: creator.analysis.setting },
              { label: 'Mood', value: creator.analysis.mood },
              { label: 'Lighting', value: creator.analysis.lighting },
              { label: 'Color Palette', value: [creator.analysis.col1, creator.analysis.col2, creator.analysis.col3].filter(Boolean).join(', ') },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--dimmer)', marginBottom: '3px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.5 }}>
                  {value}
                </div>
              </div>
            ))}

            {/* Full-width: What makes them look premium */}
            <div
              style={{
                gridColumn: '1 / -1',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--dimmer)', marginBottom: '3px' }}>
                What makes them look premium
              </div>
              <div>
                {[creator.analysis.p1, creator.analysis.p2, creator.analysis.p3].filter(Boolean).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.45, marginBottom: '3px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginTop: '5px', display: 'inline-block' }} />
                    {p}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Links + Notes — shown after analysis */}
      {hasAnalysis && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text)', marginBottom: '10px' }}>
            Your Notes
          </div>

          {/* Links */}
          <div style={{ marginBottom: '12px' }}>
            {([
              { key: 'ig' as const, label: 'Instagram' },
              { key: 'yt' as const, label: 'YouTube' },
              { key: 'web' as const, label: 'Website' },
              { key: 'other' as const, label: 'Other' },
            ]).map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--dimmer)', width: '70px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
                <input
                  type="text"
                  value={creator.links?.[key] ?? ''}
                  onChange={e => {
                    const updated = { ...(creator.links || { ig: '', yt: '', web: '', other: '' }), [key]: e.target.value }
                    onUpdate(creator.id, 'links', updated )
                  }}
                  placeholder={key === 'ig' ? '@handle' : key === 'yt' ? 'channel or URL' : key === 'web' ? 'URL' : 'TikTok, podcast...'}
                  style={{
                    flex: 1,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>

          {/* 8 Note blocks in 2-column grid */}
          <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {([
              { key: 'strengths' as const, title: 'Strengths', prompt: 'What do they do really well? What makes people follow them?' },
              { key: 'impressions' as const, title: 'First Impressions', prompt: 'What stands out immediately? What is your gut reaction?' },
              { key: 'weaknesses' as const, title: 'Weaknesses', prompt: 'What could they do better? What holds them back?' },
              { key: 'limitations' as const, title: 'Limitations', prompt: 'What are they doing that you cannot or do not want to do?' },
              { key: 'content' as const, title: 'Content Analysis', prompt: 'What types of content do they post? What performs best?' },
              { key: 'steal' as const, title: 'What Can I Steal?', prompt: 'What could you borrow or adapt for your own brand?' },
              { key: 'avoid' as const, title: 'What Should I Avoid?', prompt: 'What vibe or approach do you want to stay away from?' },
              { key: 'gap' as const, title: 'My Gap Statement', prompt: 'How will your visual identity be different from this creator?' },
            ]).map(({ key, title, prompt }) => (
              <div
                key={key}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '10px', color: 'var(--dimmer)', marginBottom: '6px', lineHeight: 1.4 }}>{prompt}</div>
                <textarea
                  value={creator.detailedNotes?.[key] ?? ''}
                  onChange={e => {
                    const updated = { ...(creator.detailedNotes || { strengths: '', impressions: '', weaknesses: '', limitations: '', content: '', steal: '', avoid: '', gap: '' }), [key]: e.target.value }
                    onUpdate(creator.id, 'detailedNotes', updated )
                  }}
                  placeholder="Your notes..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    color: 'var(--text)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                    minHeight: '70px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      </>}
    </div>
  )
}
