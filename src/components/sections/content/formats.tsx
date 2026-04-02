import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 3
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function ContentFormats() {
  return (
    <div>
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
        Workshop 4
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
        Formats that stop the scroll
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Different formats serve different purposes. Short-form builds awareness. Carousels build
        authority. Long-form builds trust and drives conversions. Use all three — but understand
        what each one is for.
      </p>

      {/* Short-form */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Short-form content (reels, TikTok, shorts)
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
        <p style={{ margin: '0 0 .75rem' }}>
          Purpose: awareness, trust-building, top of funnel. Length: 15–90 seconds. Goal: stop the
          scroll, deliver one clear insight, drive to next step. One idea per video — never try to
          cover everything.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Quick Insight:</strong> One valuable idea in 30–60 seconds. No fluff. Pure value.</li>
          <li><strong style={{ color: 'var(--text)' }}>Contrarian Take:</strong> Challenge a common belief. Creates engagement and positions you as a thinker.</li>
          <li><strong style={{ color: 'var(--text)' }}>Before/After:</strong> Show a transformation. Visual proof of your expertise.</li>
          <li><strong style={{ color: 'var(--text)' }}>Process Reveal:</strong> Behind-the-scenes of how you do something. Builds trust through transparency.</li>
          <li><strong style={{ color: 'var(--text)' }}>Story Clip:</strong> A self-contained moment from a longer story. Creates curiosity for more.</li>
        </ul>
      </div>

      {/* Example short-form reel */}
      <div
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          background: 'var(--orange-tint)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '10px',
          }}
        >
          Example — Short-Form Reel
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: '0 0 8px' }}>
          This reel works because it immediately strikes a nerve with anyone who&apos;s felt stuck
          in the same situation. The hook is personal and vulnerable — it leads with a real struggle
          rather than a polished take.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>
          The transformation is authentic. Sharing something you genuinely struggled with builds
          relatability fast — people trust you more when you admit the hard part, not just the
          result. Vulnerability + a clear before/after = one of the highest-performing short-form
          formats.
        </p>
      </div>

      {/* Carousels */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Carousels: the 10-slide structure
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
        <ul style={{ paddingLeft: '1.1rem', margin: '0 0 .75rem' }}>
          <li><strong style={{ color: 'var(--text)' }}>Slide 1 — Hook Slide:</strong> Your thumbnail. Bold headline, clear value proposition, visual that creates curiosity. If slide 1 doesn&apos;t stop the scroll, no one sees slide 2.</li>
          <li><strong style={{ color: 'var(--text)' }}>Slide 2 — Promise Slide:</strong> Tell them exactly what they&apos;ll get. Sets expectations and gives them a reason to keep swiping.</li>
          <li><strong style={{ color: 'var(--text)' }}>Slides 3–8 — Value Slides:</strong> One idea per slide. Clean, simple, scannable. Bold text for main point, supporting text for context. Don&apos;t crowd.</li>
          <li><strong style={{ color: 'var(--text)' }}>Slide 9 — Summary Slide:</strong> Recap key points. This is for people who swiped to the end first.</li>
          <li><strong style={{ color: 'var(--text)' }}>Slide 10 — CTA Slide:</strong> Tell them what to do next. One CTA only — save, share, follow, or link in bio.</li>
        </ul>
        <p style={{ margin: '0 0 .75rem' }}>
          Carousel rules: consistent color palette across all slides, consistent typography,
          breathing room on every slide, one idea per slide, strong contrast.
        </p>
        <p
          style={{
            margin: 0,
            paddingTop: '.6rem',
            paddingBottom: '.6rem',
            paddingLeft: '.8rem',
            paddingRight: '.8rem',
            background: 'rgba(241,96,27,.08)',
            borderLeft: '3px solid var(--orange)',
            borderRadius: '0 6px 6px 0',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: 'var(--orange)' }}>2026 note:</strong> Carousels are crushing
          right now. They consistently out-perform single images and reels for reach, saves, and
          shares — the algorithm rewards people who swipe all the way through.
        </p>
      </div>

      {/* Example carousel */}
      <div
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          background: 'var(--orange-tint)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '10px',
          }}
        >
          Example — Carousel Post
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: '0 0 8px' }}>
          This post is purely informative — it teaches something valuable and gets plenty of views
          because the content delivers on the hook&apos;s promise across every slide.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, margin: 0 }}>
          Notice the CTA: it asks people to <em>comment</em> to receive more information. This is
          intentional — comments are one of the strongest engagement signals, and using a
          comment-gated CTA trains the algorithm to push your content further while simultaneously
          growing your DM conversations.
        </p>
      </div>

      {/* Long-form */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Long-form content (YouTube, podcasts)
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
        <p style={{ margin: '0 0 .75rem' }}>
          Purpose: trust-building, authority, conversion. Long-form is where conversion happens —
          the more time someone spends with you, the more likely they are to buy. Open with your
          strongest insight. Use B-roll to break up talking head every 60–90 seconds. Vary shot
          setups (close-up, medium, wide). Music under voiceover sections only.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Deep Dive:</strong> One topic explored thoroughly. Your positioning video.</li>
          <li><strong style={{ color: 'var(--text)' }}>Framework Video:</strong> Teach a complete system. Positions you as someone with a proven method.</li>
          <li><strong style={{ color: 'var(--text)' }}>Case Study:</strong> Before, process, after. Pure credibility.</li>
          <li><strong style={{ color: 'var(--text)' }}>Contrarian Argument:</strong> Take a position that goes against industry norms.</li>
          <li><strong style={{ color: 'var(--text)' }}>Story Video:</strong> Cinematic, narrative-driven. Builds emotional connection.</li>
        </ul>
      </div>
    </div>
  )
}
