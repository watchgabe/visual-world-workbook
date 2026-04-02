import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'launch' as const
const SECTION_INDEX = 0
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function LaunchOverview() {
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
        FSCreative&#8482; — Module 04
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
        Launch&#8482;
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        Now it&apos;s time to build the infrastructure that turns attention into subscribers and
        subscribers into buyers — then announce your brand to the world with clarity and momentum.
        You don&apos;t own your audience. Every follower you have lives on a platform that can
        change its algorithm, ban your account, or disappear entirely. This module is how you fix
        that.
      </p>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { num: '7', label: 'Workshops' },
          { num: '7', label: 'Deliverables' },
        ].map(({ num, label }) => (
          <div
            key={label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '40px',
                fontWeight: 900,
                lineHeight: 1,
                color: 'var(--text)',
                letterSpacing: '-.5px',
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--dimmer)',
                marginTop: '4px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}
            >
              {label}
            </div>
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
          { num: '01', title: 'Bio Optimization', sub: 'Turn your profile into a conversion tool', href: '/modules/launch/bio' },
          { num: '02', title: 'Your Funnel', sub: 'Map the path from attention to customer', href: '/modules/launch/funnel' },
          { num: '03', title: 'ManyChat & Newsletter', sub: 'Build the infrastructure you actually own', href: '/modules/launch/manychat' },
          { num: '04', title: 'Lead Magnet', sub: 'Create the offer that earns the opt-in', href: '/modules/launch/lead-magnet' },
          { num: '05', title: 'Launch Content', sub: 'Three pinned videos that build your brand 24/7', href: '/modules/launch/launch-content' },
          { num: '06', title: '90-Day Goals', sub: 'Set and track your 90-day growth targets', href: '/modules/launch/goals' },
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
        <a
          href="/modules/launch/bio"
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12.5px',
            cursor: 'pointer',
            background: 'var(--orange)',
            color: '#fff',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--orange)',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Begin Workshop 1 →
        </a>
      </div>
    </div>
  )
}
