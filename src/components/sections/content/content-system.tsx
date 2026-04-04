import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 4
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function ContentSystem() {
  return (
    <div>
      {/* ─── WORKSHOP 5: THE WATERFALL METHOD ─── */}
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
        Workshop 5
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
        The Waterfall Method
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        One piece of content. Every platform. Zero extra thinking. The Waterfall Method turns your
        best idea into a week of content — originally popularized by GaryVee, refined here into a
        practical system built for creators who don&apos;t have time to start from scratch every day.
      </p>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.5rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: 'var(--text)' }}>The core idea:</strong> Create one high-value
        pillar piece, then let everything else flow from it. You&apos;re not creating 20 pieces of
        content — you&apos;re creating one great piece and letting the system multiply it. Same
        thinking. Maximum leverage.
      </div>

      <h2
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.12em',
          color: 'var(--orange)',
          paddingTop: '.65rem',
          paddingBottom: '.65rem',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          margin: '1.5rem 0 1.75rem',
        }}
      >
        The Playbook
      </h2>

      {/* Step 1 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '.75rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-num)',
            fontSize: '32px',
            fontWeight: 900,
            color: 'var(--orange)',
            lineHeight: 1,
            flexShrink: 0,
            opacity: 0.5,
            minWidth: '36px',
          }}
        >
          01
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--orange)',
              marginBottom: '4px',
            }}
          >
            Identify Your Pillar Content
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '.65rem' }}>
            Your pillar is the foundation — high-value, long-form, packed with insight. If your
            audience could only consume one piece of your content this week, this is it.
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '.3rem' }}>
            Examples:
          </div>
          <ul style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.8, margin: '0 0 .65rem', paddingLeft: '1.1rem' }}>
            <li>A YouTube long-form video (12+ minutes, deep insights)</li>
            <li>A newsletter issue that teaches a complete framework</li>
            <li>A long-form LinkedIn post sharing a detailed strategy</li>
            <li>A podcast episode featuring expert discussion</li>
          </ul>
          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--dim)',
              lineHeight: 1.65,
              margin: 0,
              borderLeft: '2px solid var(--orange)',
              paddingLeft: '.6rem',
              fontStyle: 'italic',
            }}
          >
            Your pillar should be evergreen — repurposing it over time still delivers value.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '.75rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-num)',
            fontSize: '32px',
            fontWeight: 900,
            color: 'var(--orange)',
            lineHeight: 1,
            flexShrink: 0,
            opacity: 0.5,
            minWidth: '36px',
          }}
        >
          02
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--orange)',
              marginBottom: '4px',
            }}
          >
            Extract Micro-Content
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '.65rem' }}>
            Once you have your pillar, mine it for the gold inside. Break it into small, standalone
            pieces that work on their own.
          </div>
          <ul style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.8, margin: 0, paddingLeft: '1.1rem' }}>
            <li>Pull 30–60 second clips from long-form video or podcast</li>
            <li>Extract standout quotes for tweets or LinkedIn posts</li>
            <li>Summarize key takeaways into a text-based post</li>
            <li>Find your most contrarian or provocative take — that&apos;s your hook</li>
          </ul>
        </div>
      </div>

      {/* Step 3 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '.75rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-num)',
            fontSize: '32px',
            fontWeight: 900,
            color: 'var(--orange)',
            lineHeight: 1,
            flexShrink: 0,
            opacity: 0.5,
            minWidth: '36px',
          }}
        >
          03
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--orange)',
              marginBottom: '4px',
            }}
          >
            Format for Each Platform
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '.65rem' }}>
            Each platform has its own language. Your content should feel native — not copy-pasted —
            while carrying the same core message.
          </div>
          <ul style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.8, margin: 0, paddingLeft: '1.1rem' }}>
            <li><strong style={{ color: 'var(--text)' }}>YouTube Shorts / TikTok / Reels:</strong> 30–120 second clips from your pillar</li>
            <li><strong style={{ color: 'var(--text)' }}>Twitter/X:</strong> Thread breaking down your core insight (5–10 tweets)</li>
            <li><strong style={{ color: 'var(--text)' }}>LinkedIn:</strong> Written post or carousel adapting the core idea</li>
            <li><strong style={{ color: 'var(--text)' }}>Instagram Stories:</strong> Quick takeaways with strong visuals</li>
            <li><strong style={{ color: 'var(--text)' }}>Email Newsletter:</strong> Expanded version, sent 4–6 weeks later</li>
          </ul>
        </div>
      </div>

      {/* Step 4 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-num)',
            fontSize: '32px',
            fontWeight: 900,
            color: 'var(--orange)',
            lineHeight: 1,
            flexShrink: 0,
            opacity: 0.5,
            minWidth: '36px',
          }}
        >
          04
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--orange)',
              marginBottom: '4px',
            }}
          >
            Distribute Strategically
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65, marginBottom: '.65rem' }}>
            Systematize the release so distribution runs on autopilot. The waterfall process:
          </div>
          <ol style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.8, margin: '0 0 1rem', paddingLeft: '1.1rem' }}>
            <li>Post your pillar first (YouTube, podcast, long-form)</li>
            <li>Within 24–48 hours, schedule micro-content across secondary platforms</li>
            <li>Engage in the first hour — reply to every comment. The algorithm rewards it.</li>
            <li>Repurpose winners — find your highest-performing content and expand on it</li>
          </ol>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--text)',
              marginBottom: '.6rem',
            }}
          >
            Sample weekly calendar
          </div>
          <div
            className="grid-form"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5,1fr)',
              gap: '6px',
            }}
          >
            {[
              { day: 'Mon', action: 'Pillar goes live' },
              { day: 'Tue', action: 'Thread + LinkedIn' },
              { day: 'Wed', action: 'Carousel + Short' },
              { day: 'Thu', action: 'Reel + LinkedIn 2' },
              { day: 'Fri', action: 'Newsletter + engage' },
            ].map(({ day, action }) => (
              <div
                key={day}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 6px',
                  textAlign: 'center',
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
                  {day}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--dim)', lineHeight: 1.4 }}>
                  {action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '.75rem 1rem',
          background: 'var(--surface)',
          borderLeft: '3px solid var(--orange)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--text)' }}>Why this works:</strong> You don&apos;t waste
        content. Your audience sees the same message multiple times in different formats. You stay
        top of mind. Repetition reinforces brand associations. One pillar piece — done right —
        fuels an entire week of content without a single new idea.
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          padding: '1.25rem 1rem',
          background: 'var(--orange-tint)',
          border: '1px solid var(--orange-border)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            color: 'var(--orange)',
            marginBottom: '.5rem',
          }}
        >
          Action Step
        </div>
        <p
          style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Commit to running the waterfall for your next 5 pieces of pillar content. Put the
          distribution schedule on your calendar and treat it like a show — not a one-off.
          Consistency is the only thing that compounds.
        </p>
      </div>

      {/* ─── WORKSHOP 9: CREATOR STARTER KIT ─── */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginTop: '4rem',
          marginBottom: '.5rem',
        }}
      >
        Workshop 9
      </div>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '1rem',
          color: 'var(--text)',
        }}
      >
        The Creator Starter Kit
      </h2>
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
          padding: '.75rem 1rem',
          background: 'var(--surface)',
          borderLeft: '3px solid var(--orange)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.6,
        }}
      >
        Upgrade order when you have budget:{' '}
        <strong style={{ color: 'var(--text)' }}>
          Audio first. Lighting second. Lens third. Camera body last.
        </strong>{' '}
        Most people do this backwards — they buy a new camera body before they&apos;ve sorted
        audio and lighting. Viewers will forgive bad visuals before they forgive bad audio. The
        body matters least.
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
