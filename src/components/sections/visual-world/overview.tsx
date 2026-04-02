export default function VisualWorldOverview() {
  return (
    <div style={{ maxWidth: '720px' }}>
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
        FSCreative™ — Module 02
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
        Define Your Visual World™
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        You can watch 10 seconds of a Wes Anderson film and know it&apos;s Wes Anderson. You can
        watch Christopher Nolan and immediately feel the weight of his world — the lighting, the
        atmosphere, the gravity. Your brand should work the same way. This module is about building
        that world: a visual identity so consistent and intentional that someone knows it&apos;s you
        before they see your face or read your name.
      </p>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { num: '5', label: 'Workshops' },
          { num: '5', label: 'Elements' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 18px',
              minWidth: '80px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--orange)',
                lineHeight: 1,
                marginBottom: '2px',
              }}
            >
              {item.num}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--dim)', fontWeight: 500 }}>
              {item.label}
            </div>
          </div>
        ))}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
        {[
          { num: '01', title: 'Creator Analysis', sub: 'Study what premium looks like in your space' },
          { num: '02', title: 'Mood Board', sub: 'Gather your visual inspiration' },
          { num: '03', title: 'Color Palette', sub: 'Build your visual language' },
          { num: '04', title: 'Typography', sub: 'Define your typographic voice' },
          { num: '05', title: 'Your Perspective', sub: 'Setting, mood, design details, and your visual narrative' },
        ].map(item => (
          <div
            key={item.num}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--orange)',
                minWidth: '32px',
              }}
            >
              {item.num}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--dim)' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
