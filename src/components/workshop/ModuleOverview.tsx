'use client'

import Link from 'next/link'
import { MODULE_SECTIONS } from '@/lib/modules'
import { useProgress } from '@/context/ProgressContext'
import type { ModuleSlug } from '@/types/database'

interface RoadmapCard {
  num: string
  slug: string
  title: string
  sub: string
}

interface StatCard {
  num: number
  label: string
}

interface ModuleOverviewProps {
  moduleSlug: ModuleSlug
  moduleNumber: string
  title: string
  description: string
  stats: [StatCard, StatCard]
  roadmap: RoadmapCard[]
}

export function ModuleOverview({
  moduleSlug,
  moduleNumber,
  title,
  description,
  stats,
  roadmap,
}: ModuleOverviewProps) {
  const { moduleProgress } = useProgress()
  const sections = MODULE_SECTIONS[moduleSlug] ?? []

  const workshopCount = sections.filter(s => s.fields.length > 0).length
  const progress = moduleProgress[moduleSlug] ?? 0
  const completed = progress === 100 ? workshopCount : Math.floor((progress / 100) * workshopCount)

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
        FSCreative&#8482; — Module {moduleNumber}
      </div>
      <h1
        style={{
          fontFamily: 'var(--font)',
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 700,
          letterSpacing: '-.02em',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--dim)',
          lineHeight: 1.8,
          marginBottom: '1.5rem',
        }}
      >
        {description}
      </p>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {[
          stats[0],
          stats[1],
          { num: completed, label: 'COMPLETED' },
        ].map(card => (
          <div
            key={card.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              textAlign: 'center' as const,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-num)',
                fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
                fontWeight: 900,
                color: 'var(--text)',
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              {card.num}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '.08em',
                color: 'var(--dim)',
              }}
            >
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Module Roadmap */}
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
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridAutoRows: '1fr',
          gap: '8px',
          marginBottom: '2rem',
        }}
      >
        {roadmap.map(card => (
          <Link
            key={card.slug}
            href={`/modules/${moduleSlug}/${card.slug}`}
            style={{ textDecoration: 'none', display: 'flex' }}
          >
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.1rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                flex: 1,
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--orange)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
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
          href={`/modules/${moduleSlug}/${roadmap[0].slug}`}
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
