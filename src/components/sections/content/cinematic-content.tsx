import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'content' as const
const SECTION_INDEX = 10
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

const shotTypes = [
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_9_gu23ww.png',
    alt: 'Wide',
    num: '1. Wide',
    desc: 'Full body visible, environment prominent. Establishes location and sense of place. Use for intros, lifestyle, and showing your world.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_8_rsz1az.png',
    alt: 'Medium',
    num: '2. Medium',
    desc: 'Waist to head. The standard creator shot — professional, conversational, and present. Your go-to for talking head content.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_7_jdzo8x.png',
    alt: 'Tight / Close-Up',
    num: '3. Tight / Close-Up',
    desc: 'Face or detail only. Creates intimacy and intensity. Use to drive a point home or capture B-roll details — hands, product, process.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_6_hvszxa.png',
    alt: 'Top-Down',
    num: '4. Top-Down',
    desc: 'Camera directly overhead, looking straight down. Unique and shareable. The go-to for workspace B-roll, flat lays, and process reveals.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_5_nzw12h.png',
    alt: 'Low Angle',
    num: '5. Low Angle',
    desc: 'Camera below eye level, looking up. Makes the subject feel powerful, dominant, larger than life. Use intentionally for authority and cinematic B-roll.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986593/image_4_vvr6yl.png',
    alt: 'High Angle',
    num: '6. High Angle',
    desc: 'Camera above eye level, angled down at the subject. Shows both person and environment together. Creates context, scale, and a sense of the subject within their world. Use for workspace reveals, lifestyle moments, and cinematic B-roll.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_3_qgeojn.png',
    alt: 'Drone / Aerial',
    num: '7. Drone / Aerial',
    desc: 'Camera way above — drone or elevated wide perspective. Reveals scale, environment, and geography. Instantly cinematic. Use for location establishing shots, travel content, and any moment that needs to feel massive.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_1_wzwhjx.png',
    alt: 'Ground Level',
    num: '8. Ground Level',
    desc: 'Camera at or near the floor, shooting up and across. More extreme than a low angle — the viewer is in the environment, not above it. Creates raw intensity and a gritty, documentary feel.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1773986589/image_ffjurg.png',
    alt: 'POV',
    num: '9. POV (Point of View)',
    desc: 'First-person perspective. The camera shows what the subject sees — immersive, intimate, and engaging. Pulls the viewer into the experience. Use for walks, routines, processes, and moments you want the audience to feel they\'re living.',
  },
  {
    img: 'https://res.cloudinary.com/dy0kchxh8/image/upload/v1774324534/Sequence_12.00_00_05_15.Still001_gd04sj.jpg',
    alt: 'Reverse POV',
    num: '10. Reverse POV',
    desc: 'Camera faces back at the subject from the perspective of what they\'re looking at. Instead of showing the view, you see the person experiencing it. Creates a powerful sense of reaction, emotion, and presence.',
  },
]

const brollRules = [
  { num: '1', text: <><strong>Film A-roll first</strong> — get your talking head done. Then go back and capture B-roll to cover key moments in your script.</> },
  { num: '2', text: <><strong>Shoot B-roll at 60fps</strong> — slowed to 50% in post, even simple shots look cinematic. Easiest production value upgrade.</> },
  { num: '3', text: <><strong>Hold every B-roll shot for 10+ seconds</strong> — you&apos;ll use 3–5 seconds in editing but you need options on both ends.</> },
  { num: '4', text: <><strong>Capture every subject from 3 angles</strong> — wide, close, and overhead. Gives you editing options and keeps visual pace moving.</> },
  { num: '5', text: <><strong>Build a B-roll library</strong> — batch capture on filming day and save. Over time you&apos;ll have a library to pull from for any piece of content.</> },
]

export default function CinematicContent() {
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
        Workshop 10
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
        Tips for Cinematic Content
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        <strong>Our goal is to make your everyday look premium.</strong> People judge your content before they even watch it. If it looks cheap, generic, or inconsistent, they&apos;ll assume your offer is too. You don&apos;t need expensive gear — you need intentional decisions. Here&apos;s exactly what those decisions are.
      </p>

      {/* ─── CAMERA SETTINGS ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Camera settings that matter
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Frame rate:</strong> 24fps for the cinematic &ldquo;movie look.&rdquo; 60fps or 120fps only when you plan to slow down footage for B-roll.</li>
          <li><strong style={{ color: 'var(--text)' }}>Shutter speed:</strong> Always double your frame rate. 24fps = 1/50. 60fps = 1/120. This keeps motion blur natural and cinematic.</li>
          <li><strong style={{ color: 'var(--text)' }}>Aperture:</strong> f1.8–f2.8 for talking head content — gives you background blur and cinematic depth. Lower f-stop = more blur.</li>
        </ul>
      </div>

      {/* ─── LIGHTING ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Lighting: setting the emotion
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          Lighting sets the emotion before the viewer even understands the story. Always film facing your light source — window in front of you, not behind. For studio setups: key light at 45 degrees from your face, fill light on the opposite side to soften shadows, optional hair/back light to separate you from the background.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Warm golden natural light</strong> — comfort, trust, approachability</li>
          <li><strong style={{ color: 'var(--text)' }}>Bright even studio light</strong> — clarity, professionalism, focus</li>
          <li><strong style={{ color: 'var(--text)' }}>High contrast dramatic light</strong> — energy, urgency, power</li>
          <li><strong style={{ color: 'var(--text)' }}>Soft diffused light</strong> — thoughtfulness, depth, calm</li>
        </ul>
      </div>

      {/* ─── COMPOSITION ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Composition: the foundation of premium visuals
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          <strong style={{ color: 'var(--text)' }}>Rule of thirds:</strong> Divide your frame into nine sections. Place your subject on one of the four intersection points — not dead center. Leave breathing room in the direction you&apos;re facing. This immediately makes a shot feel more cinematic.
        </p>
        <p style={{ margin: '0 0 .75rem' }}>
          <strong style={{ color: 'var(--text)' }}>Depth — the biggest difference between basic and cinematic:</strong> Always think in three planes. Foreground (closest to camera, slightly out of focus), middle ground (your subject — sharp), background (the environment, slightly out of focus). Place an object slightly in front of the lens. This creates depth and makes your content feel expensive without expensive gear.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: 'var(--text)' }}>Leading lines:</strong> Stairs, railings, building edges, pathways — position yourself so these lines lead the eye through the frame toward you.
        </p>
      </div>

      {/* ─── COLOR GRADING ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Color grading: for emotion, not trends
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          Color is emotion. Before someone listens to what you&apos;re saying, they feel your content. Your grade should reinforce your visual world — not follow what&apos;s trending. A consistent grade that&apos;s slightly off is better than a perfect grade that changes every video.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Warm tones</strong> (oranges, yellows, warm whites) — energy, success, approachability</li>
          <li><strong style={{ color: 'var(--text)' }}>Cool tones</strong> (blues, grays, cool whites) — authority, clarity, professionalism</li>
          <li><strong style={{ color: 'var(--text)' }}>Desaturated / film-like</strong> (muted colors) — raw, honest, authentic</li>
          <li><strong style={{ color: 'var(--text)' }}>High contrast</strong> (deep blacks, bright highlights) — cinematic, premium, dramatic</li>
        </ul>
      </div>

      {/* ─── SHOTS & ANGLES ─── */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          marginTop: '3rem',
          marginBottom: '.5rem',
        }}
      >
        Workshop 10
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
        Cinematic shots, angles, and B-roll
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1rem' }}>
        Every shot you choose communicates something before you say a word. A close-up creates intimacy. A wide shot creates context. A low angle creates power. Understanding the full vocabulary of shots gives you the ability to say exactly what you mean visually.
      </p>

      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Shots &amp; Angles
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.7, marginBottom: '1rem' }}>
        Every shot you choose communicates something before you say a word. Height is power. Distance is intimacy. Use these deliberately — never accidentally.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '12px',
          marginBottom: '1.5rem',
        }}
      >
        {shotTypes.map(({ img, alt, num, desc }) => (
          <div
            key={num}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <img
              src={img}
              alt={alt}
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{ padding: '.75rem .85rem' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--dim)', lineHeight: 1.65 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── CREATIVE FRAMING ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Creative framing techniques
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          Creative framing turns an ordinary location into a cinematic one. Instead of placing your subject in an open frame, use the environment itself to frame them.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Shoot through objects:</strong> Place something between the camera and subject — a plant, glass, candle, furniture. Keep it slightly out of focus in the foreground. This creates depth and makes the shot feel expensive immediately.</li>
          <li><strong style={{ color: 'var(--text)' }}>Frame within a frame:</strong> Use doorframes, windows, archways, or open books to create a natural frame around your subject. Guides the viewer&apos;s eye exactly where you want it.</li>
          <li><strong style={{ color: 'var(--text)' }}>Leading lines:</strong> Stairs, hallways, bookshelves, table edges — position yourself so lines in the environment lead toward you and draw the eye through the frame.</li>
          <li><strong style={{ color: 'var(--text)' }}>Shoot through foliage:</strong> Plants, leaves, or branches slightly out of focus in the foreground. This single technique makes your content look 10x more cinematic instantly.</li>
          <li><strong style={{ color: 'var(--text)' }}>Reflections:</strong> Mirrors, windows, puddles, glass surfaces. Reflections add a second layer to the composition and create unexpected, visually interesting frames.</li>
          <li><strong style={{ color: 'var(--text)' }}>Negative space:</strong> Intentionally leave large areas of empty space. Counterintuitive but powerful — creates breathing room, draws attention to your subject, communicates confidence in your composition.</li>
        </ul>
      </div>

      {/* ─── CAMERA MOVEMENT ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Camera movement
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          Static shots are safe. Movement creates energy, emotion, and cinematic feel. Every move should have a purpose.
        </p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Push in (dolly in):</strong> Camera moves toward subject. Creates intensity and emphasis. Use on key moments — a big statement, emotional beat, or reveal.</li>
          <li><strong style={{ color: 'var(--text)' }}>Pull out (dolly out):</strong> Camera moves away. Creates isolation or scale. Powerful as an ending shot.</li>
          <li><strong style={{ color: 'var(--text)' }}>Pan:</strong> Camera rotates left or right on fixed axis. Use to reveal something new in the frame or follow a moving subject.</li>
          <li><strong style={{ color: 'var(--text)' }}>Tilt:</strong> Camera rotates up or down. Use for reveals — tilt up to reveal a standing subject, tilt down to reveal a detail.</li>
          <li><strong style={{ color: 'var(--text)' }}>Tracking shot:</strong> Camera moves alongside a moving subject. Creates energy and dynamism. Great for walking shots and lifestyle B-roll.</li>
          <li><strong style={{ color: 'var(--text)' }}>Handheld:</strong> Camera held without stabilization. Creates a raw, documentary, in-the-moment feel. Use sparingly and intentionally.</li>
        </ul>
      </div>

      {/* ─── B-ROLL ─── */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        B-roll: the most underused tool in content
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          fontSize: '13px',
          color: 'var(--dim)',
          lineHeight: 1.7,
        }}
      >
        <p style={{ margin: '0 0 .75rem' }}>
          B-roll is any footage that isn&apos;t your main talking head — the visual layer that runs over your voiceover and story moments. Most creators skip B-roll entirely. This is one of the biggest production mistakes you can make, because B-roll is what makes the difference between content that feels like a recording and content that feels like a production.
        </p>
        <p style={{ margin: '0 0 .75rem' }}>
          B-roll does three things simultaneously: it gives your viewer&apos;s eyes something new (holds attention), it visually reinforces the story you&apos;re telling with your voice, and it makes editing easier because you can cut between A-roll and B-roll to trim dead air without the viewer noticing.
        </p>
        <p style={{ margin: '0 0 .75rem' }}><strong style={{ color: 'var(--text)' }}>Types of B-roll to capture:</strong></p>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>Process B-roll:</strong> Hands typing, writing, reviewing work on screen. Shows you working — builds credibility through action.</li>
          <li><strong style={{ color: 'var(--text)' }}>Detail / macro shots:</strong> Close-ups of objects — coffee cup, book spine, camera lens, keyboard keys. These detail shots give editors visual variety and make content feel textured.</li>
          <li><strong style={{ color: 'var(--text)' }}>Environment B-roll:</strong> Wide and medium shots of your workspace or a location you&apos;re referencing. Establishes context and visual world.</li>
          <li><strong style={{ color: 'var(--text)' }}>Reaction B-roll:</strong> Candid shots of you thinking, reviewing, looking at a screen. Feels authentic and documentary-style.</li>
          <li><strong style={{ color: 'var(--text)' }}>Product / gear B-roll:</strong> Slow, deliberate shots of tools you use. At 60fps slowed to 50%, even simple gear shots look cinematic.</li>
          <li><strong style={{ color: 'var(--text)' }}>Lifestyle B-roll:</strong> Coffee being made, walking through a space, opening a notebook. These &ldquo;slice of life&rdquo; shots humanize you and make content feel personal.</li>
        </ul>
      </div>

      {/* B-roll rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
        {brollRules.map(({ num, text }) => (
          <div
            key={num}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '24px',
                fontWeight: 900,
                color: 'var(--orange)',
                lineHeight: 1,
                flexShrink: 0,
                opacity: 0.5,
                minWidth: '24px',
              }}
            >
              {num}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--dim)', lineHeight: 1.6, paddingTop: '3px' }}>
              {text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
