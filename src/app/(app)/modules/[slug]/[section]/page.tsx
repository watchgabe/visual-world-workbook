// dynamic is imported when Plans 02-05 populate the registry below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import { SectionNavBar } from '@/components/workshop/SectionNavBar'
import type { ModuleSlug } from '@/types/database'

interface SectionPageProps {
  params: Promise<{ slug: string; section: string }>
}

// Static component registry — each entry maps a "slug/section" key to a lazy-loaded component.
// Plans 02-05 add entries here when creating section components.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Brand Foundation sections — Plan 02
  'brand-foundation/overview':        dynamic(() => import('@/components/sections/brand-foundation/overview')),
  'brand-foundation/brand-journey':   dynamic(() => import('@/components/sections/brand-foundation/brand-journey')),
  'brand-foundation/avatar':          dynamic(() => import('@/components/sections/brand-foundation/avatar')),
  'brand-foundation/core-mission':    dynamic(() => import('@/components/sections/brand-foundation/core-mission')),
  'brand-foundation/core-values':     dynamic(() => import('@/components/sections/brand-foundation/core-values')),
  'brand-foundation/content-pillars': dynamic(() => import('@/components/sections/brand-foundation/content-pillars')),
  'brand-foundation/origin-story':    dynamic(() => import('@/components/sections/brand-foundation/origin-story')),
  'brand-foundation/brand-vision':    dynamic(() => import('@/components/sections/brand-foundation/brand-vision')),

  // Visual World sections — Plan 03
  'visual-world/overview':         dynamic(() => import('@/components/sections/visual-world/overview')),
  'visual-world/creator-analysis': dynamic(() => import('@/components/sections/visual-world/creator-analysis')),
  'visual-world/color-palette':    dynamic(() => import('@/components/sections/visual-world/color-palette')),
  'visual-world/typography':       dynamic(() => import('@/components/sections/visual-world/typography')),
  'visual-world/shot-system':      dynamic(() => import('@/components/sections/visual-world/shot-system')),
  'visual-world/visual-world-doc': dynamic(() => import('@/components/sections/visual-world/visual-world-doc')),

  // Content sections — Plan 04
  'content/overview':          dynamic(() => import('@/components/sections/content/overview')),
  'content/content-strategy':  dynamic(() => import('@/components/sections/content/content-strategy')),
  'content/sustainability':    dynamic(() => import('@/components/sections/content/sustainability')),
  'content/formats':           dynamic(() => import('@/components/sections/content/formats')),
  'content/content-system':    dynamic(() => import('@/components/sections/content/content-system')),
  'content/trust-and-money':      dynamic(() => import('@/components/sections/content/trust-and-money')),
  'content/cinematic-content':    dynamic(() => import('@/components/sections/content/cinematic-content')),
  'content/content-blueprint':    dynamic(() => import('@/components/sections/content/content-blueprint')),

  // Launch sections — Plan 05
  'launch/overview':        dynamic(() => import('@/components/sections/launch/overview')),
  'launch/funnel':          dynamic(() => import('@/components/sections/launch/funnel')),
  'launch/manychat':        dynamic(() => import('@/components/sections/launch/manychat')),
  'launch/lead-magnet':     dynamic(() => import('@/components/sections/launch/lead-magnet')),
  'launch/bio':             dynamic(() => import('@/components/sections/launch/bio')),
  'launch/launch-content':  dynamic(() => import('@/components/sections/launch/launch-content')),
  'launch/goals':           dynamic(() => import('@/components/sections/launch/goals')),
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug, section } = await params

  // Validate slug exists
  const mod = MODULES.find(m => m.slug === slug)
  if (!mod) notFound()

  // Validate section exists for this module
  const sections = MODULE_SECTIONS[slug as ModuleSlug]
  if (!sections?.find(s => s.slug === section)) notFound()

  // Look up component in registry
  const key = `${slug}/${section}`
  const Component = SECTION_REGISTRY[key]
  if (!Component) notFound()

  return (
    <>
      <Component />
      {section !== 'overview' && (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem 3rem' }}>
          <SectionNavBar
            moduleSlug={slug as ModuleSlug}
            currentSectionSlug={section}
          />
        </div>
      )}
    </>
  )
}
