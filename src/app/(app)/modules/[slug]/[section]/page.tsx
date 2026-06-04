import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import { SectionNavBar } from '@/components/workshop/SectionNavBar'
import type { ModuleSlug } from '@/types/database'

interface SectionPageProps {
  params: Promise<{ slug: string; section: string }>
}

function SectionSkeleton() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '40vh',
      color: 'var(--dimmer)',
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: '2px solid var(--border2)',
        borderTopColor: 'var(--orange)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }} />
    </div>
  )
}

// Static component registry — each entry maps a "slug/section" key to a lazy-loaded component.
// Plans 02-05 add entries here when creating section components.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Brand Foundation sections — Plan 02
  'brand-foundation/overview':        dynamic(() => import('@/components/sections/brand-foundation/overview'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/brand-journey':   dynamic(() => import('@/components/sections/brand-foundation/brand-journey'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/avatar':          dynamic(() => import('@/components/sections/brand-foundation/avatar'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/core-mission':    dynamic(() => import('@/components/sections/brand-foundation/core-mission'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/core-values':     dynamic(() => import('@/components/sections/brand-foundation/core-values'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/content-pillars': dynamic(() => import('@/components/sections/brand-foundation/content-pillars'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/origin-story':    dynamic(() => import('@/components/sections/brand-foundation/origin-story'), { loading: () => <SectionSkeleton /> }),
  'brand-foundation/brand-vision':    dynamic(() => import('@/components/sections/brand-foundation/brand-vision'), { loading: () => <SectionSkeleton /> }),

  // Visual World sections — Plan 03
  'visual-world/overview':         dynamic(() => import('@/components/sections/visual-world/overview'), { loading: () => <SectionSkeleton /> }),
  'visual-world/creator-analysis': dynamic(() => import('@/components/sections/visual-world/creator-analysis'), { loading: () => <SectionSkeleton /> }),
  'visual-world/mood-board':        dynamic(() => import('@/components/sections/visual-world/mood-board'), { loading: () => <SectionSkeleton /> }),
  'visual-world/color-palette':    dynamic(() => import('@/components/sections/visual-world/color-palette'), { loading: () => <SectionSkeleton /> }),
  'visual-world/typography':       dynamic(() => import('@/components/sections/visual-world/typography'), { loading: () => <SectionSkeleton /> }),
  'visual-world/shot-system':      dynamic(() => import('@/components/sections/visual-world/shot-system'), { loading: () => <SectionSkeleton /> }),


  // Content sections — Plan 04
  'content/overview':           dynamic(() => import('@/components/sections/content/overview'), { loading: () => <SectionSkeleton /> }),
  'content/content-strategy':   dynamic(() => import('@/components/sections/content/content-strategy'), { loading: () => <SectionSkeleton /> }),
  'content/sustainability':     dynamic(() => import('@/components/sections/content/sustainability'), { loading: () => <SectionSkeleton /> }),
  'content/batching':           dynamic(() => import('@/components/sections/content/batching'), { loading: () => <SectionSkeleton /> }),
  'content/formats':            dynamic(() => import('@/components/sections/content/formats'), { loading: () => <SectionSkeleton /> }),
  'content/content-system':     dynamic(() => import('@/components/sections/content/content-system'), { loading: () => <SectionSkeleton /> }),
'content/idea-generation':    dynamic(() => import('@/components/sections/content/idea-generation'), { loading: () => <SectionSkeleton /> }),
  'content/storytelling':       dynamic(() => import('@/components/sections/content/storytelling'), { loading: () => <SectionSkeleton /> }),
  'content/starter-kit':        dynamic(() => import('@/components/sections/content/starter-kit'), { loading: () => <SectionSkeleton /> }),
  'content/cinematic-content':  dynamic(() => import('@/components/sections/content/cinematic-content'), { loading: () => <SectionSkeleton /> }),

  // Launch sections — Plan 05
  'launch/overview':        dynamic(() => import('@/components/sections/launch/overview'), { loading: () => <SectionSkeleton /> }),
  'launch/funnel':          dynamic(() => import('@/components/sections/launch/funnel'), { loading: () => <SectionSkeleton /> }),
  'launch/manychat':        dynamic(() => import('@/components/sections/launch/manychat'), { loading: () => <SectionSkeleton /> }),
  'launch/lead-magnet':     dynamic(() => import('@/components/sections/launch/lead-magnet'), { loading: () => <SectionSkeleton /> }),
  'launch/bio':             dynamic(() => import('@/components/sections/launch/bio'), { loading: () => <SectionSkeleton /> }),
  'launch/launch-content':  dynamic(() => import('@/components/sections/launch/launch-content'), { loading: () => <SectionSkeleton /> }),
  'launch/goals':           dynamic(() => import('@/components/sections/launch/goals'), { loading: () => <SectionSkeleton /> }),
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
        <SectionNavBar
          moduleSlug={slug as ModuleSlug}
          currentSectionSlug={section}
        />
      )}
    </>
  )
}
