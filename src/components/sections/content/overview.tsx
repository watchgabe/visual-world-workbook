import Link from 'next/link'
import { ModuleOverview } from '@/components/workshop/ModuleOverview'

export default function ContentOverview() {
  return (
    <ModuleOverview
      moduleSlug="content"
      moduleNumber="03"
      title="Create Your Content™"
      description="How to create content that looks premium, builds trust, and gets customers. Each section teaches you the framework, then gives you an exercise to apply it. By the end you'll have a complete personalized content playbook. The creators who win aren't the most talented. They're the most consistent. They understand three things: how to look premium, how to build trust, and how to get customers. This workbook covers all three."
      stats={[
        { num: 10, label: 'PARTS' },
        { num: 24, label: 'EXERCISES' },
      ]}
      roadmap={[
        { num: '01', slug: 'content-strategy', title: 'Content Strategy', sub: 'The framework behind effective content' },
        { num: '02', slug: 'sustainability', title: 'Sustainability', sub: 'Build a system that keeps you consistent' },
        { num: '03', slug: 'sustainability', title: 'Batching System', sub: 'Protect your maker time and create in bulk' },
        { num: '04', slug: 'formats', title: 'Formats', sub: 'Short-form, carousels, and long-form' },
        { num: '05', slug: 'content-system', title: 'Content System', sub: 'The Waterfall Method — one piece, everywhere' },
        { num: '06', slug: 'trust-and-money', title: 'Trust & Money', sub: 'Turn attention into subscribers and buyers' },
        { num: '07', slug: 'trust-and-money', title: 'Idea Generation', sub: 'Turn one topic into dozens of content ideas' },
        { num: '08', slug: 'trust-and-money', title: 'Storytelling', sub: 'Capture attention and build belief' },
        { num: '09', slug: 'content-system', title: 'Starter Kit', sub: 'The gear that gives you professional results' },
        { num: '10', slug: 'cinematic-content', title: 'Cinematic Content', sub: 'Shots, angles, B-roll, and premium visuals' },
      ]}
      footer={
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--dimmer)', flexShrink: 0 }}>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          <span style={{ fontSize: '12.5px', color: 'var(--dim)' }}>
            Prefer pen &amp; paper? Print the full workbook and complete it by hand.
          </span>
          <Link
            href="/modules/content/print"
            style={{
              marginLeft: 'auto',
              fontSize: '11.5px',
              padding: '6px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Print Full Workbook
          </Link>
        </div>
      }
    />
  )
}
