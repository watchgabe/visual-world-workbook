import Link from 'next/link'

export default function WelcomePage() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
      {/* Header */}
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
        Welcome &#8212; Start Here
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
        The Brand Launch Playbook&#8482;
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--dim)',
          lineHeight: 1.75,
          marginBottom: '1.5rem',
        }}
      >
        This workbook is a complete system for building a premium personal brand &#8212; from identity to content to funnel to launch. Every module builds on the last. By the time you reach your Playbook, you&#8217;ll have a fully documented brand strategy you can execute immediately and refine indefinitely.
      </p>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--dim)',
          lineHeight: 1.75,
          marginBottom: '1.5rem',
          marginTop: '-.75rem',
        }}
      >
        Work through each module in order. The value is in the work.
      </p>

      {/* Module overview section */}
      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          margin: '2rem 0 .75rem',
        }}
      >
        What You&#8217;re Building in Each Module
      </h2>

      {/* Module overview cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
        {/* Module 01 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            background: 'var(--card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
              flexShrink: 0,
              width: '32px',
            }}
          >
            01
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
              Brand Foundation
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5 }}>
              Define who you are, who you serve, and what you stand for. Your avatar, mission, values, content pillars, and origin story. The foundation everything else is built on.
            </div>
          </div>
        </div>

        {/* Module 02 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            background: 'var(--card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
              flexShrink: 0,
              width: '32px',
            }}
          >
            02
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
              Define Your Visual World
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5 }}>
              Build the aesthetic that makes you instantly recognizable. Creator analysis, mood board, color palette, typography, shot system, and your complete Visual World document.
            </div>
          </div>
        </div>

        {/* Module 03 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            background: 'var(--card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
              flexShrink: 0,
              width: '32px',
            }}
          >
            03
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
              Create Your Content
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5 }}>
              Install the system that turns your ideas into consistent, premium content. Content strategy, formats, storytelling, waterfall repurposing, and your creator starter kit.
            </div>
          </div>
        </div>

        {/* Module 04 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            background: 'var(--card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
              flexShrink: 0,
              width: '32px',
            }}
          >
            04
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
              Launch
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5 }}>
              Build the infrastructure that converts attention into subscribers and buyers. Bio optimization, lead magnet, ManyChat, email funnel, launch content, and 90-day goals.
            </div>
          </div>
        </div>

        {/* Module 05 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            background: 'var(--card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
              flexShrink: 0,
              width: '32px',
            }}
          >
            05
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
              Your Brand Playbook
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5 }}>
              Every answer in one document. Your complete brand strategy, visual identity, content system, and launch plan &#8212; assembled automatically as you work through the book.
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--border)',
          margin: '2rem 0',
        }}
      />



      {/* FSCreative CTA */}
      <div
        style={{
          background: 'var(--orange-tint)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--orange-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.14em',
            color: 'var(--orange)',
            marginBottom: '6px',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          FSCreative&#8482;
        </div>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '6px',
            lineHeight: 1.3,
          }}
        >
          You already have the business. Now get the brand that matches it.
        </div>
        <div
          style={{
            fontSize: '13px',
            color: 'var(--dim)',
            lineHeight: 1.65,
            marginBottom: '14px',
          }}
        >
          FSCreative is a 60-day done-with-you build. I install the strategy, visual identity, content system, and funnel around your existing offer. Frictionless OS&#8482; is the operating system inside.
        </div>
        <a
          href="https://fscreative.live"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--orange)',
            borderRadius: '100px',
            background: 'transparent',
            color: 'var(--orange)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Book a Strategy Call &#8594;
        </a>
      </div>

      {/* Begin Module 01 CTA */}
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <Link
          href="/modules/brand-foundation"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 24px',
            background: 'var(--orange)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Begin Module 01 &#8594;
        </Link>
      </div>
    </div>
  )
}
