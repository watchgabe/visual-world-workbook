import { MODULE_SECTIONS } from '@/lib/modules'

const MODULE_SLUG = 'launch' as const
const SECTION_INDEX = 2
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function LaunchManychat() {
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
        Workshop 3
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
        ManyChat &amp; Newsletter
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        ManyChat and email are the two most powerful platforms for automating your funnel. Together,
        they turn your content into a 24/7 lead generation machine — converting followers into
        subscribers and subscribers into buyers, without you manually following up with anyone.
      </p>

      {/* ManyChat section */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        ManyChat — Comment Triggers
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.1rem',
        }}
      >
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
          ManyChat connects to your Instagram (and Facebook) and watches for specific keywords in
          your comments. When someone comments your trigger word — like &ldquo;GUIDE&rdquo; or
          &ldquo;FREE&rdquo; — ManyChat instantly fires an automated DM to that person.
        </p>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          That DM contains your lead magnet link. They click it, enter their email, and they&apos;re
          added to your list.{' '}
          <strong>Comment-triggered DMs convert at 70–75%</strong> — versus 50–55% for a standard
          landing page. They feel personal, keep people inside the app, and capture leads whether
          you&apos;re awake or asleep.
        </p>
      </div>

      {/* How the Flow Works */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        How the Flow Works
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.25rem' }}>
        {[
          {
            num: '01',
            title: 'You post with a keyword CTA',
            desc: 'Your caption ends with: "Comment GUIDE and I\'ll DM it to you." This single line turns every post into an active lead generator. The keyword can be anything — a word, a number, even a phrase like "SAUSAGES" if that fits the bit.',
          },
          {
            num: '02',
            title: 'ManyChat detects the keyword',
            desc: "The moment someone comments your keyword, ManyChat fires automatically. It posts a short public reply to their comment and sends them a DM — no manual work, no missed leads, no delays.",
          },
          {
            num: '03',
            title: 'DM delivers the lead magnet',
            desc: "The DM contains your lead magnet link with a tap-to-get button. They click, land on a simple form, and enter their email. At this point they're in your system and no longer just a follower you don't own.",
          },
          {
            num: '04',
            title: 'Email captured in Kit or your platform',
            desc: "ManyChat connects directly to Kit (formerly ConvertKit), Flodesk, Beehiiv, and most major email platforms. The moment someone opts in, their email is automatically added to your list and your welcome sequence fires immediately.",
          },
          {
            num: '05',
            title: 'Welcome sequence runs automatically',
            desc: 'A 7–10 email sequence delivers your best content, tells your story, builds real trust, and introduces your offer — all on autopilot over the first two weeks. You set it up once. It runs forever.',
          },
        ].map(({ num, title, desc }) => (
          <div
            key={num}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '.9rem 1rem',
              background: 'var(--surface)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: '36px',
                fontWeight: 900,
                color: 'var(--orange)',
                opacity: 0.25,
                lineHeight: 1,
              }}
            >
              {num}
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: 'var(--orange)',
                  marginBottom: '3px',
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--dim)', lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The Welcome Sequence */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        The Welcome Sequence
      </h2>
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
          Your welcome sequence is the most read email series you will ever send. Open rates run
          50–60% higher than regular newsletters — because people just opted in and they&apos;re at
          peak interest. This is the window where trust is built fastest. Use it.
        </p>
      </div>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.1rem',
        }}
      >
        {[
          {
            label: 'Email 1 (Immediately)',
            text: 'Deliver the lead magnet. Confirm what they signed up for. Be warm and direct — not salesy.',
          },
          {
            label: 'Email 2 (Day 2)',
            text: 'Your origin story. The relatable struggle that brought you here. Make them feel like they know you.',
          },
          {
            label: 'Email 3 (Day 4)',
            text: 'Your single best free teaching piece — a framework or insight so good they can\'t believe it\'s free.',
          },
          {
            label: 'Email 4 (Day 7)',
            text: 'A client or student result. Social proof. A soft, natural mention of your offer.',
          },
          {
            label: 'Emails 5–10 (optional)',
            text: 'Additional frameworks, case studies, objection handling, or a direct offer sequence — based on how aggressive you want your funnel to be.',
          },
        ].map(({ label, text }) => (
          <p key={label} style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '9px' }}>
            <strong>{label}:</strong> {text}
          </p>
        ))}
      </div>

      {/* Why These Two Platforms */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '1.75rem 0 8px' }}>
        Why These Two Platforms
      </h2>
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
          Social media is rented land. Every follower you have lives on a platform that can change
          its algorithm, ban your account, or disappear entirely. ManyChat converts that rented
          attention into owned contacts. Email is where the relationship deepens into real trust —
          and real trust is what drives sales. Together, ManyChat and email are the infrastructure
          that makes your content work for you long after you&apos;ve posted it.
        </p>
      </div>
    </div>
  )
}
