import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import type { ModuleSlug } from '@/types/database'

interface SectionPageProps {
  params: Promise<{ slug: string; section: string }>
}

// Registry mapping slug/section to lazy-loaded component paths.
// Uses next/dynamic for code splitting — each section component is loaded on demand.
// Plans 02-05 only need to create src/components/sections/{slug}/{section-slug}.tsx
// without modifying this file.
function getSectionComponent(slug: string, section: string) {
  return dynamic(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => import(`@/components/sections/${slug}/${section}`) as Promise<any>,
    {
      loading: () => (
        <div style={{ padding: '2rem', color: 'var(--dim)' }}>
          Loading section...
        </div>
      ),
    }
  )
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug, section } = await params

  // Validate slug exists
  const mod = MODULES.find(m => m.slug === slug)
  if (!mod) notFound()

  // Validate section exists for this module
  const sections = MODULE_SECTIONS[slug as ModuleSlug]
  if (!sections?.find(s => s.slug === section)) notFound()

  // Load section component dynamically
  const Component = getSectionComponent(slug, section)

  return <Component />
}
