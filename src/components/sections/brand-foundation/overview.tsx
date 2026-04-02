import Link from 'next/link'

export default function BrandFoundationOverview() {
  return (
    <section>
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
        FSCreative — Module 01
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
        Brand Foundation
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        Your Brand Foundation is the strategic bedrock of your entire brand.
        Everything you build — your visual identity, your content, your business
        — flows from this. Don&apos;t rush it. The creators who do this work are the
        ones who build brands that last.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '.75rem 1.25rem',
            textAlign: 'center' as const,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
            }}
          >
            7
          </div>
          <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '2px' }}>
            Workshops
          </div>
        </div>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '.75rem 1.25rem',
            textAlign: 'center' as const,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-num)',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
            }}
          >
            8
          </div>
          <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '2px' }}>
            Deliverables
          </div>
        </div>
      </div>

      <h2
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--dimmer)',
          marginBottom: '1rem',
        }}
      >
        Module Roadmap
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          marginBottom: '2rem',
        }}
      >
        {[
          { num: '01', slug: 'brand-journey', title: 'Brand Journey', sub: 'Where you\'re going and what you need to do to get there' },
          { num: '02', slug: 'avatar', title: 'Avatar Profile', sub: 'Know exactly who you\'re building for' },
          { num: '03', slug: 'core-mission', title: 'Core Mission', sub: 'Why you do what you do' },
          { num: '04', slug: 'core-values', title: 'Core Values', sub: 'The principles that guide everything' },
          { num: '05', slug: 'content-pillars', title: 'Content Pillars', sub: 'Always know what to talk about' },
          { num: '06', slug: 'origin-story', title: 'Origin Story', sub: 'The journey that makes you relatable' },
          { num: '07', slug: 'brand-vision', title: 'Brand Vision', sub: 'Where your brand is going in 3 years' },
        ].map(card => (
          <Link
            key={card.slug}
            href={`/modules/brand-foundation/${card.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.1rem',
                cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-num)',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--orange)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                {card.num}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                {card.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.4 }}>
                {card.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link
          href="/modules/brand-foundation/brand-journey"
          style={{
            display: 'inline-block',
            background: 'var(--orange)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Begin Workshop 1 →
        </Link>
      </div>
    </section>
  )
}
