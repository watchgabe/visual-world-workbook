'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { ModuleSlug } from '@/types/database'

function SectionSkeleton() {
  return (
    <div style={{ padding: '2rem 0', color: 'var(--dimmer)', fontSize: '13px' }}>
      Loading section...
    </div>
  )
}

const PRINT_SECTIONS: Record<string, Array<{ title: string; component: React.ComponentType }>> = {
  content: [
    { title: 'Strategy', component: dynamic(() => import('@/components/sections/content/content-strategy'), { loading: () => <SectionSkeleton /> }) },
    { title: 'Sustainability', component: dynamic(() => import('@/components/sections/content/sustainability'), { loading: () => <SectionSkeleton /> }) },
    { title: 'Formats', component: dynamic(() => import('@/components/sections/content/formats'), { loading: () => <SectionSkeleton /> }) },
    { title: 'Content System', component: dynamic(() => import('@/components/sections/content/content-system'), { loading: () => <SectionSkeleton /> }) },
    { title: 'Trust & Money', component: dynamic(() => import('@/components/sections/content/trust-and-money'), { loading: () => <SectionSkeleton /> }) },
    { title: 'Cinematic Content', component: dynamic(() => import('@/components/sections/content/cinematic-content'), { loading: () => <SectionSkeleton /> }) },
    { title: 'Content Blueprint', component: dynamic(() => import('@/components/sections/content/content-blueprint'), { loading: () => <SectionSkeleton /> }) },
  ],
}

export default function PrintPage() {
  const params = useParams()
  const slug = params.slug as ModuleSlug

  const sections = PRINT_SECTIONS[slug]

  useEffect(() => {
    if (!sections) return
    // Auto-print once all sections have rendered
    const timer = setTimeout(() => {
      window.print()
      window.history.back()
    }, 1500)
    return () => clearTimeout(timer)
  }, [sections])

  if (!sections) {
    return (
      <div style={{ padding: '2rem', color: 'var(--dim)' }}>
        Print view is not available for this module.
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          body::before, nav, .topbar, .sidebar, [data-section-nav], .print-no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .print-section { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      <div style={{ paddingTop: '1rem' }}>
        {sections.map((section, i) => (
          <div key={i} className="print-section" style={{ marginBottom: '2rem' }}>
            <section.component />
          </div>
        ))}
      </div>
    </>
  )
}
