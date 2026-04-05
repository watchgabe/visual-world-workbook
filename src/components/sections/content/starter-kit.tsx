import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 9
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function StarterKit() {
  return (
    <div>
      {/* ─── WORKSHOP 9: CREATOR STARTER KIT ─── */}
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
        Workshop 9
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
        The Creator Starter Kit
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        You don&apos;t need to spend thousands of dollars to create premium content. Everything you
        need to get started is already in your pocket.
      </p>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--orange)',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            marginBottom: '4px',
          }}
        >
          Start Here
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          The ultimate starter kit is your phone.
        </div>
        <div style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65 }}>
          iPhone 14 Pro or newer shoots Cinematic Mode and ProRes — a legitimate production setup.
          You can literally pick up your phone and do everything you need from a creator
          perspective. Pair it with good lighting and the DJI Mic 3 and you&apos;re ready to
          publish. Below are the upgrades for when you&apos;re ready to level up your setup.
        </div>
      </div>

      <div
        style={{
          borderLeft: '3px solid var(--orange)',
          padding: '11px 15px',
          background: 'var(--orange-tint)',
          marginBottom: '1.1rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--orange-dark)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          Upgrade order when you have budget:{' '}
          <strong style={{ fontWeight: 700 }}>
            Audio first. Lighting second. Lens third. Camera body last.
          </strong>{' '}
          Most people do this backwards — they buy a new camera body before they&apos;ve sorted
          audio and lighting. Viewers will forgive bad visuals before they forgive bad audio. The
          body matters least.
        </p>
      </div>

      {/* Gear grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { cat: 'Camera — Entry', name: 'Sony ZV-E10', desc: 'Interchangeable lens, excellent autofocus, flip screen for solo filming. The best value entry point for serious content — gets out of your way and delivers.' },
          { cat: 'Camera — Step Up', name: 'Sony A6700', desc: 'Better performance and AI-assisted autofocus. The step up — punches well above its price.' },
          { cat: 'Lens — Vlogging (Ultra Wide)', name: 'Viltrox 9mm f/2.8', desc: 'Ultra wide captures your entire environment. Works great for handheld or on-the-go content. Excellent for travel, lifestyle, and immersive B-roll.' },
          { cat: 'Lens — Step Up', name: 'Sigma 10-18mm f/2.8', desc: 'The sharpest ultra-wide for Sony APS-C. Versatile enough for talking head, lifestyle, and B-roll — covers almost every situation.' },
          { cat: 'Audio', name: 'DJI Mic 3', desc: 'Use it directly with your phone — no adapter needed. Wireless range makes it perfect for run-and-gun. Crystal clear audio from day one.' },
          { cat: 'Lighting', name: 'Elgato Key Light or Godox SL60W', desc: 'Key Light for desk setups. Godox SL60W for larger spaces and more flexibility. The single biggest upgrade to your image quality.' },
          { cat: 'Stabilization', name: 'K&F Travel Tripod', desc: 'Lightweight, compact, and solid. Great for studio setups and on-the-go filming. Bring it everywhere.' },
          { cat: 'Editing', name: 'Adobe Premiere Pro', desc: 'The industry standard for video editing. Powerful timeline, excellent color tools, seamless integration with After Effects and Photoshop.' },
          { cat: 'ND Filter (Variable)', name: 'Variable ND Filter', desc: 'Reduces light entering your lens without changing color. Essential outdoors — lets you maintain cinematic shutter speed in bright light.' },
        ].map(({ cat, name, desc }) => (
          <div
            key={name}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--orange)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                marginBottom: '4px',
              }}
            >
              {cat}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.5 }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        How to upgrade — in the right order
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {[
          { num: '01', title: 'Start with your phone', desc: 'iPhone 14 Pro or newer shoots Cinematic Mode and ProRes — a legitimate production setup. Your phone is not an excuse. Most creators who wait until they have "better gear" never start. Start now.' },
          { num: '02', title: 'Audio first — always', desc: 'Bad audio kills content immediately. Viewers will forgive shaky handheld footage before they forgive muffled or echo-y sound. The DJI Mic 3 works directly with your phone — no adapter needed, wireless range, and it sounds professional from day one.' },
          { num: '03', title: 'Lighting second', desc: 'A single key light transforms how your content looks. It\'s the highest-leverage visual upgrade you can make — more impact than a camera body upgrade at a fraction of the cost.' },
          { num: '04', title: 'Camera body', desc: 'Once audio and lighting are handled, an interchangeable-lens camera is your next move. The Sony ZV-E10 is the most accessible entry point — excellent autofocus, flip screen, and it gets out of your way. If budget allows, go straight to the Sony A6700.' },
          { num: '05', title: 'Better glass + ND filter', desc: 'A better lens outperforms a more expensive camera body every time. The Sigma 10-18mm f/2.8 is the sharpest ultra-wide for Sony APS-C. Add a variable ND filter — essential if you ever shoot outside.' },
          { num: '06', title: 'Step up the body', desc: 'If you started on the ZV-E10, the Sony A6700 is the natural step-up — AI-assisted autofocus, better low-light, and noticeably more professional output.' },
          { num: '07', title: 'Finishing touches', desc: 'A solid travel tripod for stable wide and establishing shots, Adobe Premiere Pro for a professional editing workflow, and a quality monitor for accurate color grading.' },
        ].map(({ num, title, desc }) => (
          <div
            key={num}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                flexShrink: 0,
                opacity: 0.45,
                minWidth: '32px',
              }}
            >
              {num}
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: 'var(--orange)',
                  marginBottom: '3px',
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
