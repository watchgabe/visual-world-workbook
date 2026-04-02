import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 0
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function ContentOverview() {
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
        FSCreative&#8482; — Module 03
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
        Create Your Content&#8482;
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        How to create content that looks premium, builds trust, and gets customers.
        Each section teaches you the framework, then gives you an exercise to apply
        it. By the end you&apos;ll have a complete personalized content playbook.
        The creators who win aren&apos;t the most talented. They&apos;re the most
        consistent. They understand three things: how to look premium, how to build
        trust, and how to get customers. This workbook covers all three.
      </p>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { num: '10', label: 'Parts' },
          { num: '24', label: 'Exercises' },
        ].map(({ num, label }) => (
          <div
            key={label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '.75rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '80px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
              }}
            >
              {num}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '4px' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '1.75rem 0 .75rem',
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
          { num: '01', title: 'Content Strategy', sub: 'The framework behind effective content', href: '/modules/content/content-strategy' },
          { num: '02', title: 'Sustainability', sub: 'Build a system that keeps you consistent', href: '/modules/content/sustainability' },
          { num: '03', title: 'Formats', sub: 'Short-form, carousels, and long-form', href: '/modules/content/formats' },
          { num: '04', title: 'Content System', sub: 'The Waterfall Method — one piece, everywhere', href: '/modules/content/content-system' },
          { num: '05', title: 'Trust & Money', sub: 'Turn attention into subscribers and buyers', href: '/modules/content/trust-and-money' },
        ].map((card) => (
          <a
            key={card.num}
            href={card.href}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 0.15s',
            }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--orange)'
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                opacity: 0.5,
                marginBottom: '6px',
              }}
            >
              {card.num}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '3px',
              }}
            >
              {card.title}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dim)', lineHeight: 1.5 }}>
              {card.sub}
            </div>
          </a>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--dimmer)', flexShrink: 0 }}
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        <span style={{ fontSize: '12.5px', color: 'var(--dim)' }}>
          Prefer pen &amp; paper? Print the full workbook and complete it by hand.
        </span>
      </div>
    </div>
  )
}
