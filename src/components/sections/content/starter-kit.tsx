import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 9
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

const GEAR_ITEMS = [
  { cat: 'Camera — Entry', name: 'Sony ZV-E10', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398233/1_wcavt8.jpg', desc: 'Interchangeable lens, excellent autofocus, flip screen for solo filming. The best value entry point for serious content — gets out of your way and delivers.' },
  { cat: 'Camera — Step Up', name: 'Sony A6700', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398233/2_tbpu8r.jpg', desc: 'A6700 is the step up with better performance and AI-assisted autofocus. This is my favorite compact camera — punches well above its price.' },
  { cat: 'Lens — Vlogging (Ultra Wide)', name: 'Viltrox 9mm f/2.8', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398233/3_snh2ma.jpg', desc: 'This is more of a vlogging setup. Ultra wide captures your entire environment and works great for handheld or on-the-go content. Excellent for travel, lifestyle, and immersive B-roll.' },
  { cat: 'Lens — Step Up', name: 'Sigma 10-18mm f/2.8', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398234/4_qtjvrz.jpg', desc: 'The sharpest ultra-wide for Sony APS-C. Versatile enough for talking head, lifestyle, and B-roll — covers almost every situation. If you want a dedicated B-roll lens, pair it with the 18–50mm.' },
  { cat: 'Audio', name: 'DJI Mic 3', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398234/5_jevbu2.jpg', desc: 'The DJI Mic 3 is amazing because you can use it directly with your phone — no adapter needed. It lets you shoot from anywhere: you can be right up against the camera or step a hundred feet away and you\u2019re still getting crystal clear audio. The wireless range makes it perfect for run-and-gun.' },
  { cat: 'Lighting', name: 'Elgato Key Light or Godox SL60W', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398238/6_lmfdxr.jpg', desc: 'Key Light for desk setups. Godox SL60W for larger spaces and more flexibility. Lighting is the single biggest upgrade you can make to your image quality — start here before anything else.' },
  { cat: 'Stabilization', name: 'K&F Travel Tripod', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398238/7_e03xvu.jpg', desc: 'Really, any tripod will do — but the K&F travel tripod is lightweight, compact, and solid. Great for studio setups and on-the-go filming. Bring it everywhere.' },
  { cat: 'Editing', name: 'Adobe Premiere Pro', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398238/8_fiseql.jpg', desc: 'The industry standard for video editing. Powerful timeline, excellent color tools, seamless integration with After Effects and Photoshop. Available through Adobe Creative Cloud.' },
  { cat: 'ND Filter (Variable)', name: 'Variable ND Filter', img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774398239/9_y166lo.jpg', desc: 'A neutral density filter reduces the amount of light entering your lens without changing color. Essential outdoors — it lets you maintain your cinematic shutter speed (double your frame rate) in bright light without blowing out your exposure. \u201CVariable\u201D means you can adjust the stop reduction with a twist of the ring. Get one sized for your lens diameter.' },
]

const UPGRADE_STEPS = [
  { num: '01', title: 'Start with your phone', desc: 'iPhone 14 Pro or newer shoots Cinematic Mode and ProRes \u2014 a legitimate production setup. Your phone is not an excuse. Most creators who wait until they have \u201Cbetter gear\u201D never start. Start now.' },
  { num: '02', title: 'Audio first \u2014 always', desc: 'Bad audio kills content immediately. Viewers will forgive shaky handheld footage before they forgive muffled or echo-y sound. The DJI Mic 3 works directly with your phone \u2014 no adapter needed, wireless range, and it sounds professional from day one.' },
  { num: '03', title: 'Lighting second', desc: 'A single key light transforms how your content looks. It\u2019s the highest-leverage visual upgrade you can make \u2014 more impact than a camera body upgrade at a fraction of the cost. The Elgato Key Light for desk setups, Godox SL60W for larger spaces.' },
  { num: '04', title: 'Camera body', desc: 'Once audio and lighting are handled, an interchangeable-lens camera is your next move. The <strong style="color:var(--text)">Sony ZV-E10</strong> is the most accessible entry point \u2014 excellent autofocus, flip screen, and it gets out of your way. If budget allows, go straight to the <strong style="color:var(--text)">Sony A6700</strong> \u2014 AI-assisted autofocus, better low-light, and more headroom to grow into.' },
  { num: '05', title: 'Better glass + ND filter', desc: 'A better lens outperforms a more expensive camera body every time. The Sigma 10-18mm f/2.8 is the sharpest ultra-wide for Sony APS-C \u2014 covers talking head, lifestyle, and B-roll. Add the 18-50mm for close-up and storytelling shots. Also add a <strong style="color:var(--text)">variable ND filter</strong> here \u2014 it lets you maintain cinematic shutter speed (2\u00D7 your frame rate) in bright outdoor light. Essential if you ever shoot outside.' },
  { num: '06', title: 'Step up the body', desc: 'If you started on the ZV-E10, the Sony A6700 is the natural step-up \u2014 AI-assisted autofocus, better low-light, and noticeably more professional output. By the time you\u2019re ready for this, you\u2019ll already be producing polished content and you\u2019ll actually feel the difference in your workflow.' },
  { num: '07', title: 'Finishing touches', desc: 'A solid travel tripod for stable wide and establishing shots, Adobe Premiere Pro for a professional editing workflow, and a quality monitor for accurate color grading. These are the details that separate a polished setup from an amateur one \u2014 but they\u2019re only worth it after the fundamentals are locked in.' },
]

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
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        You don&apos;t need to spend thousands of dollars to create premium content. Everything you
        need to get started is already in your pocket.
      </p>

      {/* iPhone hero panel */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1724925341278"
          alt="iPhone"
          style={{
            width: '120px',
            height: 'auto',
            borderRadius: '8px',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        <div>
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
      </div>

      {/* .ins block */}
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

      {/* Gear grid — 2 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '7px',
          marginBottom: '1.1rem',
        }}
      >
        {GEAR_ITEMS.map(({ cat, name, img, desc }) => (
          <div
            key={name}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '11px',
              background: 'var(--surface)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={name}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'contain',
                background: '#0a0a0a',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            />
            <div style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--orange)', marginBottom: '3px' }}>
              {cat}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
              {name}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--dim)', lineHeight: 1.6 }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        How to upgrade — in the right order
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.7,
        }}
      >
        Most creators do this backwards — they buy a new camera body before they&apos;ve sorted
        audio and lighting. Here&apos;s the order that actually moves the needle:
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {UPGRADE_STEPS.map(({ num, title, desc }) => (
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
              <div
                style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.65 }}
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
